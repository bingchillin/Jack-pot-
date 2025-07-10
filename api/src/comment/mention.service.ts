import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentMention } from './entities/comment-mention.entity';
import { Person } from '../person/entities/person.entity';
import { Comment } from './entities/comment.entity';

export interface MentionData {
  username: string;
  positionStart: number;
  positionEnd: number;
}

export interface ProcessedMention {
  idPersonMentioned: number;
  positionStart: number;
  positionEnd: number;
}

@Injectable()
export class MentionService {
  constructor(
    @InjectRepository(CommentMention)
    private commentMentionRepository: Repository<CommentMention>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  /**
   * Extract mentions from comment text using regex
   * Format: @username
   */
  extractMentionsFromText(text: string): MentionData[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions: MentionData[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        username: match[1],
        positionStart: match.index,
        positionEnd: match.index + match[0].length,
      });
    }

    return mentions;
  }

  /**
   * Process mentions: validate users exist and return processed data
   */
  async processMentions(mentions: MentionData[]): Promise<ProcessedMention[]> {
    const processedMentions: ProcessedMention[] = [];

    for (const mention of mentions) {
      // Find user by username (assuming email is used as username for now)
      // TODO: Add a proper username field to Person entity
      const person = await this.personRepository.findOne({
        where: { email: mention.username + '@example.com' }, // Temporary solution
      });

      if (person) {
        processedMentions.push({
          idPersonMentioned: person.idPerson,
          positionStart: mention.positionStart,
          positionEnd: mention.positionEnd,
        });
      }
      // Silently ignore mentions of non-existent users
    }

    return processedMentions;
  }

  /**
   * Save mentions to database
   */
  async saveMentions(
    commentId: number,
    mentionerId: number,
    processedMentions: ProcessedMention[],
  ): Promise<CommentMention[]> {
    const savedMentions: CommentMention[] = [];

    for (const mention of processedMentions) {
      // Check if mention already exists (prevent duplicates)
      const existingMention = await this.commentMentionRepository.findOne({
        where: {
          idComment: commentId,
          idPersonMentioned: mention.idPersonMentioned,
        },
      });

      if (!existingMention) {
        const newMention = this.commentMentionRepository.create({
          idComment: commentId,
          idPersonMentioned: mention.idPersonMentioned,
          idPersonMentioner: mentionerId,
          positionStart: mention.positionStart,
          positionEnd: mention.positionEnd,
        });

        const savedMention = await this.commentMentionRepository.save(newMention);
        savedMentions.push(savedMention);
      }
    }

    return savedMentions;
  }

  /**
   * Get all mentions for a comment
   */
  async getCommentMentions(commentId: number): Promise<CommentMention[]> {
    return await this.commentMentionRepository.find({
      where: { idComment: commentId },
      relations: ['mentionedPerson', 'mentionerPerson'],
      order: { positionStart: 'ASC' },
    });
  }

  /**
   * Get all mentions received by a user
   */
  async getUserMentions(userId: number, limit: number = 50): Promise<CommentMention[]> {
    return await this.commentMentionRepository.find({
      where: { idPersonMentioned: userId },
      relations: ['comment', 'comment.person', 'mentionerPerson'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search users for mention autocomplete
   * This searches by firstname, surname, and email
   */
  async searchUsersForMention(query: string, limit: number = 10): Promise<Person[]> {
    if (query.length < 2) {
      return [];
    }

    return await this.personRepository
      .createQueryBuilder('person')
      .where(
        'LOWER(person.firstname) LIKE LOWER(:query) OR LOWER(person.surname) LIKE LOWER(:query) OR LOWER(person.email) LIKE LOWER(:query)',
        { query: `%${query}%` }
      )
      .limit(limit)
      .getMany();
  }

  /**
   * Complete mention processing workflow
   */
  async processMentionsForComment(
    commentText: string,
    commentId: number,
    mentionerId: number,
  ): Promise<CommentMention[]> {
    // Extract mentions from text
    const extractedMentions = this.extractMentionsFromText(commentText);
    
    if (extractedMentions.length === 0) {
      return [];
    }

    // Process and validate mentions
    const processedMentions = await this.processMentions(extractedMentions);
    
    if (processedMentions.length === 0) {
      return [];
    }

    // Save mentions to database
    return await this.saveMentions(commentId, mentionerId, processedMentions);
  }

  /**
   * Delete all mentions for a comment (when comment is deleted)
   */
  async deleteMentionsForComment(commentId: number): Promise<void> {
    await this.commentMentionRepository.delete({ idComment: commentId });
  }
} 