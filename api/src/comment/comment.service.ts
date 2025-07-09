import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    console.log('Backend - Creating comment with data:', createCommentDto);
    console.log('Backend - ImageUrl received:', createCommentDto.imageUrl);
    
    const { parentCommentId, ...commentData } = createCommentDto;

    // If parentCommentId is provided, verify the parent comment exists
    if (parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { idComment: parentCommentId, isDeleted: false },
      });
      
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentCommentId} not found`);
      }
    }

    const comment = this.commentRepository.create({
      ...commentData,
      parentComment: parentCommentId ? { idComment: parentCommentId } : null,
    });

    console.log('Backend - Comment before save:', comment);
    const savedComment = await this.commentRepository.save(comment);
    console.log('Backend - Comment after save:', savedComment);
    
    return savedComment;
  }

  // Timeline: Get all posts (comments with no parent)
  async getTimeline(includeDeleted: boolean = false, currentUserId?: number): Promise<any[]> {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.person', 'person')
      .select([
        'comment.idComment',
        'comment.content',
        'comment.imageUrl',
        'comment.idPerson',
        'comment.parentCommentId',
        'comment.isDeleted',
        'comment.deletedAt',
        'comment.createdAt',
        'comment.updatedAt',
        'person.idPerson',
        'person.email',
        'person.firstname',
        'person.surname'
      ])
      .where('comment.parentCommentId IS NULL')
      .orderBy('comment.createdAt', 'DESC');

    if (!includeDeleted) {
      queryBuilder.andWhere('comment.isDeleted = :isDeleted', { isDeleted: false });
    }

    const comments = await queryBuilder.getMany();

    // Pour chaque commentaire parent, compter les réponses directes
    const commentIds = comments.map(c => c.idComment);
    const replyCounts = await this.commentRepository
      .createQueryBuilder('reply')
      .select('reply.parentCommentId', 'parentCommentId')
      .addSelect('COUNT(*)', 'count')
      .where('reply.parentCommentId IN (:...ids)', { ids: commentIds })
      .andWhere('reply.isDeleted = false')
      .groupBy('reply.parentCommentId')
      .getRawMany();
    const replyCountMap = Object.fromEntries(replyCounts.map(r => [Number(r.parentCommentId), Number(r.count)]));

    // Pour chaque commentaire parent, compter les likes
    const likeCounts = await this.commentLikeRepository
      .createQueryBuilder('like')
      .select('like.idComment', 'idComment')
      .addSelect('COUNT(*)', 'count')
      .where('like.idComment IN (:...ids)', { ids: commentIds })
      .groupBy('like.idComment')
      .getRawMany();
    const likeCountMap = Object.fromEntries(likeCounts.map(l => [Number(l.idComment), Number(l.count)]));

    // Ajouter replyCount, likeCount et isLikedByCurrentUser à chaque commentaire
    let likedMap: Record<number, boolean> = {};
    if (currentUserId) {
      const liked = await this.commentLikeRepository
        .createQueryBuilder('like')
        .select('like.idComment', 'idComment')
        .where('like.idComment IN (:...ids)', { ids: commentIds })
        .andWhere('like.idPerson = :userId', { userId: currentUserId })
        .getRawMany();
      likedMap = Object.fromEntries(liked.map(l => [Number(l.idComment), true]));
    }
    const result = comments.map(comment => {
      console.log(`Backend - Comment ${comment.idComment}: imageUrl = "${comment.imageUrl}"`);
      return {
        ...comment,
        replyCount: replyCountMap[comment.idComment] || 0,
        likeCount: likeCountMap[comment.idComment] || 0,
        isLikedByCurrentUser: likedMap[comment.idComment] || false,
      };
    });
    
    return result;
  }

  // Post detail: Get original post + all its comments (including nested replies)
  async getPostWithComments(postId: number, includeDeleted: boolean = false, currentUserId?: number): Promise<any[]> {
    // First, get the original post to verify it exists
    const originalPost = await this.commentRepository.findOne({
      where: includeDeleted 
        ? { idComment: postId }
        : { idComment: postId, isDeleted: false },
      relations: ['person'],
    });
    
    if (!originalPost) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Get all comments in the thread recursively
    const allComments = await this.getAllCommentsInThread(postId, includeDeleted);
    
    // Add the original post at the beginning
    const comments = [originalPost, ...allComments];
    
    if (comments.length === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Pour chaque commentaire, compter les likes
    const commentIds = comments.map(c => c.idComment);
    const likeCounts = await this.commentLikeRepository
      .createQueryBuilder('like')
      .select('like.idComment', 'idComment')
      .addSelect('COUNT(*)', 'count')
      .where('like.idComment IN (:...ids)', { ids: commentIds })
      .groupBy('like.idComment')
      .getRawMany();
    const likeCountMap = Object.fromEntries(likeCounts.map(l => [Number(l.idComment), Number(l.count)]));

    // Pour chaque commentaire, savoir si liké par l'utilisateur courant
    let likedMap: Record<number, boolean> = {};
    if (currentUserId) {
      const liked = await this.commentLikeRepository
        .createQueryBuilder('like')
        .select('like.idComment', 'idComment')
        .where('like.idComment IN (:...ids)', { ids: commentIds })
        .andWhere('like.idPerson = :userId', { userId: currentUserId })
        .getRawMany();
      likedMap = Object.fromEntries(liked.map(l => [Number(l.idComment), true]));
    }

    // Retourne les commentaires enrichis
    return comments.map(comment => ({
      ...comment,
      likeCount: likeCountMap[comment.idComment] || 0,
      isLikedByCurrentUser: likedMap[comment.idComment] || false,
    }));
  }

  // Get all comments in a thread recursively (for nested replies)
  async getAllCommentsInThread(rootCommentId: number, includeDeleted: boolean = false): Promise<Comment[]> {
    const allComments: Comment[] = [];
    const processedIds = new Set<number>();
    
    const collectCommentsRecursively = async (parentId: number) => {
      const whereCondition = includeDeleted 
        ? { parentComment: { idComment: parentId } }
        : { parentComment: { idComment: parentId }, isDeleted: false };

      const directReplies = await this.commentRepository.find({
        where: whereCondition,
        relations: ['parentComment', 'person'],
        select: {
          person: {
            idPerson: true,
            email: true,
            firstname: true,
            surname: true,
          },
        },
        order: { createdAt: 'ASC' },
      });

      for (const reply of directReplies) {
        if (!processedIds.has(reply.idComment)) {
          processedIds.add(reply.idComment);
          allComments.push(reply);
          
          // Recursively get replies to this reply
          await collectCommentsRecursively(reply.idComment);
        }
      }
    };

    await collectCommentsRecursively(rootCommentId);
    return allComments;
  }

  // Get all comments for a specific parent (useful for lazy loading)
  async getCommentsByParentId(parentId: number, includeDeleted: boolean = false): Promise<Comment[]> {
    const whereCondition = includeDeleted 
      ? { parentComment: { idComment: parentId } }
      : { parentComment: { idComment: parentId }, isDeleted: false };

    return await this.commentRepository.find({
      where: whereCondition,
      relations: ['parentComment', 'person'],
      select: {
        person: {
          idPerson: true,
          email: true,
          firstname: true,
          surname: true,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number, includeDeleted: boolean = false): Promise<Comment> {
    const whereCondition = includeDeleted 
      ? { idComment: id } 
      : { idComment: id, isDeleted: false };

    const comment = await this.commentRepository.findOne({
      where: whereCondition,
      relations: ['parentComment'],
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    
    // Prevent updating deleted comments unless explicitly restoring them
    if (comment.isDeleted && updateCommentDto.isDeleted !== false) {
      throw new BadRequestException('Cannot update a deleted comment');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await this.commentRepository.save(comment);
  }

  async restore(id: number): Promise<Comment> {
    const comment = await this.findOne(id, true);
    if (!comment.isDeleted) {
      throw new BadRequestException('Comment is not deleted');
    }
    
    comment.isDeleted = false;
    comment.deletedAt = null;
    return await this.commentRepository.save(comment);
  }

  // Get a single parent comment (comment with no parent)
  async getParentComment(commentId: number, includeDeleted: boolean = false): Promise<Comment> {
    const whereCondition = includeDeleted 
      ? { idComment: commentId, parentComment: null } 
      : { idComment: commentId, parentComment: null, isDeleted: false };

    const comment = await this.commentRepository.findOne({
      where: whereCondition,
      relations: ['person'],
      select: {
        person: {
          idPerson: true,
          email: true,
          firstname: true,
          surname: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Parent comment with ID ${commentId} not found`);
    }

    return comment;
  }

  // LIKE SYSTEM METHODS
  
  /**
   * Toggle like on a comment - like if not liked, unlike if already liked
   */
  async toggleLike(commentId: number, personId: number): Promise<{ liked: boolean; likeCount: number }> {
    // Verify comment exists
    const comment = await this.findOne(commentId);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Check if user already liked this comment
    const existingLike = await this.commentLikeRepository.findOne({
      where: {
        idComment: commentId,
        idPerson: personId,
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await this.commentLikeRepository.remove(existingLike);
      const likeCount = await this.getLikeCount(commentId);
      return { liked: false, likeCount };
    } else {
      // Like - create new like
      const newLike = this.commentLikeRepository.create({
        idComment: commentId,
        idPerson: personId,
      });
      await this.commentLikeRepository.save(newLike);
      const likeCount = await this.getLikeCount(commentId);
      return { liked: true, likeCount };
    }
  }

  /**
   * Get the number of likes for a comment
   */
  async getLikeCount(commentId: number): Promise<number> {
    return await this.commentLikeRepository.count({
      where: { idComment: commentId },
    });
  }

  /**
   * Check if a user has liked a specific comment
   */
  async isLikedByUser(commentId: number, personId: number): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: {
        idComment: commentId,
        idPerson: personId,
      },
    });
    return !!like;
  }

  /**
   * Get all users who liked a comment
   */
  async getLikers(commentId: number): Promise<CommentLike[]> {
    return await this.commentLikeRepository.find({
      where: { idComment: commentId },
      relations: ['person'],
      select: {
        person: {
          idPerson: true,
          email: true,
          firstname: true,
          surname: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get comments with like statistics for a specific user
   */
  async getCommentsWithLikeStats(commentIds: number[], currentUserId?: number): Promise<any[]> {
    const comments = await this.commentRepository.find({
      where: commentIds.map(id => ({ idComment: id })),
      relations: ['person'],
      select: {
        person: {
          email: true,
          firstname: true,
          surname: true,
        },
      },
    });

    const result = [];
    for (const comment of comments) {
      const likeCount = await this.getLikeCount(comment.idComment);
      const isLikedByCurrentUser = currentUserId 
        ? await this.isLikedByUser(comment.idComment, currentUserId)
        : false;

      result.push({
        ...comment,
        likeCount,
        isLikedByCurrentUser,
      });
    }

    return result;
  }
}