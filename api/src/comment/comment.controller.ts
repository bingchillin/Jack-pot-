import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau commentaire' })
  @ApiResponse({ status: 201, description: 'Commentaire créé avec succès', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Commentaire parent non trouvé' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.create(createCommentDto, req.user.idPerson);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer tous les commentaires principaux' })
  @ApiQuery({ name: 'parentCommentId', required: false, description: 'ID du commentaire parent pour récupérer les réponses' })
  @ApiResponse({ status: 200, description: 'Liste des commentaires', type: [CommentResponseDto] })
  findAll(@Query('parentCommentId') parentCommentId?: string, @Request() req?: any) {
    const userId = req?.user?.idPerson;
    const parentId = parentCommentId ? parseInt(parentCommentId) : undefined;
    return this.commentService.findAll(userId, parentId);
  }

  @Get('replies/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les réponses d\'un commentaire' })
  @ApiResponse({ status: 200, description: 'Liste des réponses', type: [CommentResponseDto] })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  getReplies(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.idPerson;
    return this.commentService.getReplies(+id, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer un commentaire par son ID' })
  @ApiResponse({ status: 200, description: 'Commentaire trouvé', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  findOne(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.idPerson;
    return this.commentService.findOne(+id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire modifié avec succès', type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req) {
    return this.commentService.update(+id, updateCommentDto, req.user.idPerson);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  remove(@Param('id') id: string, @Request() req) {
    return this.commentService.remove(+id, req.user.idPerson);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liker/Unliker un commentaire' })
  @ApiResponse({ status: 200, description: 'Like/Unlike effectué avec succès', schema: { type: 'object', properties: { liked: { type: 'boolean' } } } })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  @HttpCode(200)
  likeComment(@Param('id') id: string, @Request() req) {
    return this.commentService.likeComment(+id, req.user.idPerson);
  }
} 