import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    ParseBoolPipe,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
  } from '@nestjs/swagger';
  import { CommentService } from './comment.service';
  import { CreateCommentDto } from './dto/create-comment.dto';
  import { UpdateCommentDto } from './dto/update-comment.dto';
  import { CreateCommentFlagDto } from './dto/create-comment-flag.dto';
  import { ToggleLikeDto } from './dto/toggle-like.dto';
  import { Comment } from './entities/comment.entity';
  import { CommentFlag } from './entities/comment-flag.entity';
  import { CommentMention } from './entities/comment-mention.entity';
  import { MentionService } from './mention.service';
  import { Person } from '../person/entities/person.entity';
  
  @ApiTags('comments')
  @Controller('comments')
  export class CommentController {
    constructor(
      private readonly commentService: CommentService,
      private readonly mentionService: MentionService,
    ) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new post or comment' })
    @ApiResponse({
      status: 201,
      description: 'The post/comment has been successfully created.',
      type: Comment,
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 404, description: 'Parent comment not found.' })
    async create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
      return await this.commentService.create(createCommentDto);
    }
  
    @Get('timeline')
    @ApiOperation({ summary: 'Get timeline (posts only - with no parent comments)' })
    @ApiQuery({
      name: 'includeDeleted',
      required: false,
      type: Boolean,
      description: 'Include deleted posts in the results',
      example: false,
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: Number,
      description: 'Current user id for like status',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return timeline of posts.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            idComment: { type: 'number' },
            content: { type: 'string' },
            idPerson: { type: 'number' },
            parentCommentId: { type: 'number', nullable: true },
            isDeleted: { type: 'boolean' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            person: {
              type: 'object',
              properties: {
                idPerson: { type: 'number' },
                email: { type: 'string' },
                firstname: { type: 'string' },
                surname: { type: 'string' },
              },
            },
            replyCount: { type: 'number' },
            likeCount: { type: 'number' },
            isLikedByCurrentUser: { type: 'boolean' },
          },
        },
      },
    })
    async getTimeline(
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
      @Query('userId') userId?: string,
    ): Promise<any[]> {
      return await this.commentService.getTimeline(includeDeleted || false, userId ? Number(userId) : undefined);
    }
  
    @Get('parent/:id')
    @ApiOperation({ summary: 'Get a single parent comment by ID' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the parent comment',
      example: 1,
    })
    @ApiQuery({
      name: 'includeDeleted',
      required: false,
      type: Boolean,
      description: 'Include deleted content in the results',
      example: false,
    })
    @ApiResponse({
      status: 200,
      description: 'Return the parent comment.',
      type: Comment,
    })
    @ApiResponse({ status: 404, description: 'Parent comment not found.' })
    async getParentComment(
      @Param('id', ParseIntPipe) id: number,
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
    ): Promise<Comment> {
      return await this.commentService.getParentComment(id, includeDeleted || false);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a single post or comment by ID' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the post/comment',
      example: 1,
    })
    @ApiQuery({
      name: 'includeDeleted',
      required: false,
      type: Boolean,
      description: 'Include deleted content in the results',
      example: false,
    })
    @ApiResponse({
      status: 200,
      description: 'Return the post/comment.',
      type: Comment,
    })
    @ApiResponse({ status: 404, description: 'Post/comment not found.' })
    async findOne(
      @Param('id', ParseIntPipe) id: number,
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
    ): Promise<Comment> {
      return await this.commentService.findOne(id, includeDeleted || false);
    }
  
    @Get(':id/withComments')
    @ApiOperation({ summary: 'Get post with all its comments (Twitter-style detail view)' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the post',
      example: 1,
    })
    @ApiQuery({
      name: 'includeDeleted',
      required: false,
      type: Boolean,
      description: 'Include deleted content in the results',
      example: false,
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: Number,
      description: 'Current user id for like status',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return the post with all its comments as a flat array.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            idComment: { type: 'number' },
            content: { type: 'string' },
            idPerson: { type: 'number' },
            parentCommentId: { type: 'number', nullable: true },
            isDeleted: { type: 'boolean' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            person: {
              type: 'object',
              properties: {
                idPerson: { type: 'number' },
                email: { type: 'string' },
                firstname: { type: 'string' },
                surname: { type: 'string' },
              },
            },
            likeCount: { type: 'number' },
            isLikedByCurrentUser: { type: 'boolean' },
          },
        },
      },
    })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    async getPostWithComments(
      @Param('id', ParseIntPipe) id: number,
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
      @Query('userId') userId?: string,
    ): Promise<any[]> {
      return await this.commentService.getPostWithComments(id, includeDeleted || false, userId ? Number(userId) : undefined);
    }
  
    @Get('getCommentsByParentId/:parentId')
    @ApiOperation({ summary: 'Get all comments for a specific parent (lazy loading)' })
    @ApiParam({
      name: 'parentId',
      type: Number,
      description: 'The ID of the parent comment/post',
      example: 1,
    })
    @ApiQuery({
      name: 'includeDeleted',
      required: false,
      type: Boolean,
      description: 'Include deleted comments in the results',
      example: false,
    })
    @ApiResponse({
      status: 200,
      description: 'Return all comments for the specified parent.',
      type: [Comment],
    })
    @ApiResponse({ status: 404, description: 'Parent not found.' })
    async getCommentsByParentId(
      @Param('parentId', ParseIntPipe) parentId: number,
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
    ): Promise<Comment[]> {
      return await this.commentService.getCommentsByParentId(parentId, includeDeleted || false);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a post or comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the post/comment to update',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'The post/comment has been successfully updated.',
      type: Comment,
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 404, description: 'Post/comment not found.' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCommentDto: UpdateCommentDto,
    ): Promise<Comment> {
      return await this.commentService.update(id, updateCommentDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Soft delete a post or comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the post/comment to delete',
      example: 1,
    })
    @ApiResponse({
      status: 204,
      description: 'The post/comment has been successfully deleted.',
    })
    @ApiResponse({ status: 404, description: 'Post/comment not found.' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
      await this.commentService.remove(id);
    }
  
    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore a soft-deleted post or comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the post/comment to restore',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'The post/comment has been successfully restored.',
      type: Comment,
    })
    @ApiResponse({ status: 400, description: 'Post/comment is not deleted.' })
    @ApiResponse({ status: 404, description: 'Post/comment not found.' })
    async restore(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
      return await this.commentService.restore(id);
    }
  
    // ========== LIKE SYSTEM ENDPOINTS ==========
  
    @Post(':id/like')
    @ApiOperation({ summary: 'Toggle like on a comment/post' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment/post to like/unlike',
      example: 1,
    })
      @ApiResponse({
    status: 200,
    description: 'Like has been toggled successfully.',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean', example: true },
        likeCount: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment/post not found.' })
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleLikeDto: ToggleLikeDto,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return await this.commentService.toggleLike(id, toggleLikeDto.idPerson);
  }
  
    @Get(':id/likes/count')
    @ApiOperation({ summary: 'Get like count for a comment/post' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment/post',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return the like count.',
      schema: {
        type: 'object',
        properties: {
          likeCount: { type: 'number', example: 5 },
        },
      },
    })
    @ApiResponse({ status: 404, description: 'Comment/post not found.' })
    async getLikeCount(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<{ likeCount: number }> {
      const count = await this.commentService.getLikeCount(id);
      return { likeCount: count };
    }
  
    @Get(':id/likes/me/:userId')
    @ApiOperation({ summary: 'Check if a user has liked a comment/post' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment/post',
      example: 1,
    })
    @ApiParam({
      name: 'userId',
      type: Number,
      description: 'The ID of the user',
      example: 1,
    })
      @ApiResponse({
    status: 200,
    description: 'Return whether the user has liked this comment/post.',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment/post not found.' })
  async isLikedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ liked: boolean }> {
    const liked = await this.commentService.isLikedByUser(id, userId);
    return { liked };
  }
  
    @Get(':id/likes')
    @ApiOperation({ summary: 'Get all users who liked a comment/post' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment/post',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return all users who liked this comment/post.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            idPerson: { type: 'number', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    })
    @ApiResponse({ status: 404, description: 'Comment/post not found.' })
    async getLikers(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
      return await this.commentService.getLikers(id);
    }

    // ========== FLAG SYSTEM ENDPOINTS ==========

    @Post(':id/flag')
    @ApiOperation({ summary: 'Flag a comment as inappropriate' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment to flag',
      example: 1,
    })
    @ApiResponse({
      status: 201,
      description: 'Comment has been flagged successfully.',
      schema: {
        type: 'object',
        properties: {
          flagged: { type: 'boolean', example: true },
          flagCount: { type: 'number', example: 1 },
        },
      },
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Already flagged or invalid data.' })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    async flagComment(
      @Param('id', ParseIntPipe) id: number,
      @Body() createCommentFlagDto: Omit<CreateCommentFlagDto, 'idComment'>,
    ): Promise<{ flagged: boolean; flagCount: number }> {
      const flagDto = { ...createCommentFlagDto, idComment: id };
      return await this.commentService.flagComment(flagDto);
    }

    @Get(':id/flags/count')
    @ApiOperation({ summary: 'Get flag count for a comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return the flag count.',
      schema: {
        type: 'object',
        properties: {
          flagCount: { type: 'number', example: 3 },
        },
      },
    })
    async getFlagCount(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<{ flagCount: number }> {
      const count = await this.commentService.getFlagCount(id);
      return { flagCount: count };
    }

    @Get(':id/flags/me/:userId')
    @ApiOperation({ summary: 'Check if a user has flagged a comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment',
      example: 1,
    })
    @ApiParam({
      name: 'userId',
      type: Number,
      description: 'The ID of the user',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return whether the user has flagged this comment.',
      schema: {
        type: 'object',
        properties: {
          flagged: { type: 'boolean', example: false },
        },
      },
    })
    async isFlaggedByUser(
      @Param('id', ParseIntPipe) id: number,
      @Param('userId', ParseIntPipe) userId: number,
    ): Promise<{ flagged: boolean }> {
      const flagged = await this.commentService.isFlaggedByUser(id, userId);
      return { flagged };
    }

    @Get(':id/flags')
    @ApiOperation({ summary: 'Get all flags for a comment (admin only)' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return all flags for this comment.',
      type: [CommentFlag],
    })
    async getCommentFlags(@Param('id', ParseIntPipe) id: number): Promise<CommentFlag[]> {
      return await this.commentService.getCommentFlags(id);
    }

    @Get('moderation/flagged')
    @ApiOperation({ summary: 'Get all flagged comments (admin only)' })
    @ApiResponse({
      status: 200,
      description: 'Return all flagged comments.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            idComment: { type: 'number' },
            content: { type: 'string' },
            imageUrl: { type: 'string' },
            tag: { type: 'string' },
            flagCount: { type: 'number' },
            person: {
              type: 'object',
              properties: {
                idPerson: { type: 'number' },
                email: { type: 'string' },
                firstname: { type: 'string' },
                surname: { type: 'string' },
              },
            },
          },
        },
      },
    })
    async getFlaggedComments(): Promise<any[]> {
      return await this.commentService.getFlaggedComments();
    }

    @Delete('flags/:flagId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a flag (admin only or own flag)' })
    @ApiParam({
      name: 'flagId',
      type: Number,
      description: 'The ID of the flag to remove',
      example: 1,
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: Number,
      description: 'User ID if removing own flag',
      example: 1,
    })
    @ApiResponse({
      status: 204,
      description: 'Flag has been successfully removed.',
    })
    @ApiResponse({ status: 404, description: 'Flag not found.' })
    async removeFlag(
      @Param('flagId', ParseIntPipe) flagId: number,
      @Query('userId') userId?: string,
    ): Promise<void> {
      await this.commentService.removeFlag(flagId, userId ? Number(userId) : undefined);
    }

    // ============================================================================
    // MENTION ENDPOINTS
    // ============================================================================

    @Get(':id/mentions')
    @ApiOperation({ summary: 'Get all mentions for a comment' })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'The ID of the comment',
      example: 1,
    })
    @ApiResponse({
      status: 200,
      description: 'Return all mentions for the comment.',
      type: [CommentMention],
    })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    async getCommentMentions(@Param('id', ParseIntPipe) id: number): Promise<CommentMention[]> {
      return await this.mentionService.getCommentMentions(id);
    }

    @Get('users/search')
    @ApiOperation({ summary: 'Search users for mention autocomplete' })
    @ApiQuery({
      name: 'q',
      type: String,
      description: 'Search query (minimum 2 characters)',
      example: 'john',
    })
    @ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Maximum number of results',
      example: 10,
    })
    @ApiResponse({
      status: 200,
      description: 'Return users matching the search query.',
      type: [Person],
    })
    async searchUsersForMention(
      @Query('q') query: string,
      @Query('limit') limit?: string,
    ): Promise<Person[]> {
      return await this.mentionService.searchUsersForMention(
        query,
        limit ? Number(limit) : 10,
      );
    }
  }