import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Person } from '../person/entities/person.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number): Promise<CommentResponseDto> {
    // Vérifier que l'utilisateur existe
    const person = await this.personRepository.findOne({ where: { idPerson: userId } });
    if (!person) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { idComment: createCommentDto.parentCommentId, isDeleted: false }
      });
      if (!parentComment) {
        throw new NotFoundException('Commentaire parent non trouvé');
      }
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      idPerson: userId,
      parentCommentId: createCommentDto.parentCommentId,
    });

    const savedComment = await this.commentRepository.save(comment);
    // Recharge avec toutes les relations nécessaires
    const savedCommentWithRelations = await this.commentRepository.findOne({
      where: { idComment: savedComment.idComment },
      relations: ['person', 'likes', 'replies'],
    });
    return this.formatCommentResponse(savedCommentWithRelations, userId);
  }

  async findAll(userId?: number, parentCommentId?: number): Promise<CommentResponseDto[]> {
    const query = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.person', 'person')
      .leftJoinAndSelect('comment.likes', 'likes')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.isDeleted = :isDeleted', { isDeleted: false });

    if (parentCommentId !== undefined) {
      query.andWhere('comment.parentCommentId = :parentCommentId', { parentCommentId });
    } else {
      query.andWhere('comment.parentCommentId IS NULL');
    }

    const comments = await query
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return Promise.all(comments.map(comment => this.formatCommentResponse(comment, userId)));
  }

  async findOne(id: number, userId?: number): Promise<CommentResponseDto> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.person', 'person')
      .leftJoinAndSelect('comment.likes', 'likes')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.person', 'replyPerson')
      .leftJoinAndSelect('replies.likes', 'replyLikes')
      .where('comment.idComment = :id', { id })
      .andWhere('comment.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('replies.createdAt', 'ASC')
      .getOne();

    if (!comment) {
      throw new NotFoundException('Commentaire non trouvé');
    }

    return this.formatCommentResponse(comment, userId);
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { idComment: id, isDeleted: false },
      relations: ['person', 'likes', 'replies']
    });

    if (!comment) {
      throw new NotFoundException('Commentaire non trouvé');
    }

    if (comment.idPerson !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce commentaire');
    }

    Object.assign(comment, updateCommentDto);
    const updatedComment = await this.commentRepository.save(comment);
    return this.formatCommentResponse(updatedComment, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { idComment: id, isDeleted: false }
    });

    if (!comment) {
      throw new NotFoundException('Commentaire non trouvé');
    }

    if (comment.idPerson !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce commentaire');
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await this.commentRepository.save(comment);
  }

  async likeComment(commentId: number, userId: number): Promise<{ liked: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { idComment: commentId, isDeleted: false }
    });

    if (!comment) {
      throw new NotFoundException('Commentaire non trouvé');
    }

    const existingLike = await this.commentLikeRepository.findOne({
      where: { idComment: commentId, idPerson: userId }
    });

    if (existingLike) {
      // Unlike
      await this.commentLikeRepository.remove(existingLike);
      return { liked: false };
    } else {
      // Like
      const like = this.commentLikeRepository.create({
        idComment: commentId,
        idPerson: userId
      });
      await this.commentLikeRepository.save(like);
      return { liked: true };
    }
  }

  async getReplies(commentId: number, userId?: number): Promise<CommentResponseDto[]> {
    const replies = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.person', 'person')
      .leftJoinAndSelect('comment.likes', 'likes')
      .where('comment.parentCommentId = :commentId', { commentId })
      .andWhere('comment.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    return Promise.all(replies.map(reply => this.formatCommentResponse(reply, userId)));
  }

  private async formatCommentResponse(comment: Comment, userId?: number): Promise<CommentResponseDto> {
    // Compter les likes
    const likeCount = comment.likes?.length || 0;

    // Compter les réponses
    const replyCount = comment.replies?.filter(reply => !reply.isDeleted).length || 0;

    // Vérifier si l'utilisateur actuel a liké ce commentaire
    const isLikedByCurrentUser = userId ? 
      comment.likes?.some(like => like.idPerson === userId) || false : 
      false;

    // Formater les réponses récursivement
    const formattedReplies = comment.replies ? 
      await Promise.all(
        comment.replies
          .filter(reply => !reply.isDeleted)
          .map(reply => this.formatCommentResponse(reply, userId))
      ) : 
      [];

    return {
      idComment: comment.idComment,
      content: comment.content,
      idPerson: comment.idPerson,
      person: {
        idPerson: comment.person.idPerson,
        firstname: comment.person.firstname,
        surname: comment.person.surname,
        email: comment.person.email,
      },
      parentCommentId: comment.parentCommentId,
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likeCount,
      replyCount,
      isLikedByCurrentUser,
      replies: formattedReplies,
    };
  }
} 