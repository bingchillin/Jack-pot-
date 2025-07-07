import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
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

    return await this.commentRepository.save(comment);
  }

  // Timeline: Get all posts (comments with no parent)
  async getTimeline(includeDeleted: boolean = false): Promise<Comment[]> {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.person', 'person')
      .select([
        'comment.idComment',
        'comment.content',
        'comment.idPerson',
        'comment.parentCommentId',
        'comment.isDeleted',
        'comment.deletedAt',
        'comment.createdAt',
        'comment.updatedAt',
        'person.email',
        'person.firstname',
        'person.surname'
      ])
      .where('comment.parentCommentId IS NULL')
      .orderBy('comment.createdAt', 'DESC');

    if (!includeDeleted) {
      queryBuilder.andWhere('comment.isDeleted = :isDeleted', { isDeleted: false });
    }

    return await queryBuilder.getMany();
  }

  // Post detail: Get original post + all its comments
  async getPostWithComments(postId: number, includeDeleted: boolean = false): Promise<Comment[]> {
    const whereConditions = includeDeleted 
      ? [
          { idComment: postId }, // The original post
          { parentComment: { idComment: postId } } // All comments on that post
        ]
      : [
          { idComment: postId, isDeleted: false },
          { parentComment: { idComment: postId }, isDeleted: false }
        ];

    const comments = await this.commentRepository.find({
      where: whereConditions,
      relations: ['parentComment'],
      order: { createdAt: 'ASC' },
    });
    
    if (comments.length === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Ensure the original post is first, then all comments
    const originalPost = comments.find(c => c.idComment === postId);
    const replies = comments.filter(c => c.idComment !== postId);
    
    return originalPost ? [originalPost, ...replies] : comments;
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
}