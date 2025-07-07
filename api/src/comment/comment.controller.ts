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
  import { Comment } from './entities/comment.entity';
  
  @ApiTags('comments')
  @Controller('comments')
  export class CommentController {
    constructor(private readonly commentService: CommentService) {}
  
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
    @ApiResponse({
      status: 200,
      description: 'Return timeline of posts.',
      type: [Comment],
    })
    async getTimeline(
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
    ): Promise<Comment[]> {
      return await this.commentService.getTimeline(includeDeleted || false);
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
    @ApiResponse({
      status: 200,
      description: 'Return the post with all its comments as a flat array.',
      type: [Comment],
    })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    async getPostWithComments(
      @Param('id', ParseIntPipe) id: number,
      @Query('includeDeleted', new ParseBoolPipe({ optional: true })) includeDeleted?: boolean,
    ): Promise<Comment[]> {
      return await this.commentService.getPostWithComments(id, includeDeleted || false);
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
  }