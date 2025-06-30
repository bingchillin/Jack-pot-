import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'comment_event.dart';
import 'comment_state.dart';

class CommentBloc extends Bloc<CommentEvent, CommentState> {
  final CommentService commentService;
  final String? token;

  CommentBloc({
    required this.commentService,
    required this.token,
  }) : super(CommentInitial()) {
    on<LoadComments>(_onLoadComments);
    on<CreateComment>(_onCreateComment);
    on<UpdateComment>(_onUpdateComment);
    on<ToggleLike>(_onToggleLike);
    on<DeleteComment>(_onDeleteComment);
    on<LoadReplies>(_onLoadReplies);
  }

  Future<void> _onLoadComments(LoadComments event, Emitter<CommentState> emit) async {
    emit(CommentLoading());
    try {
      final comments = await commentService.fetchMainComments(token);
      emit(CommentLoaded(
        comments: comments,
        replies: {},
      ));
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }

  Future<void> _onCreateComment(CreateComment event, Emitter<CommentState> emit) async {
    if (token == null || token!.isEmpty) {
      emit(CommentError('Authentification requise pour créer un commentaire'));
      return;
    }
    
    emit(CommentCreating());
    try {
      final newComment = await commentService.createComment(
        content: event.content,
        parentCommentId: event.parentCommentId,
        token: token!,
      );

      if (state is CommentLoaded) {
        final currentState = state as CommentLoaded;
        List<Comment> updatedComments = List.from(currentState.comments);
        
        if (event.parentCommentId == null) {
          // Nouveau commentaire principal
          updatedComments.insert(0, newComment);
        } else {
          // Nouvelle réponse
          Map<int, List<Comment>> updatedReplies = Map.from(currentState.replies);
          final replies = updatedReplies[event.parentCommentId] ?? [];
          replies.add(newComment);
          updatedReplies[event.parentCommentId!] = replies;
          
          emit(currentState.copyWith(replies: updatedReplies));
          return;
        }

        emit(currentState.copyWith(comments: updatedComments));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }

  Future<void> _onUpdateComment(UpdateComment event, Emitter<CommentState> emit) async {
    if (token == null || token!.isEmpty) {
      emit(CommentError('Authentification requise pour modifier un commentaire'));
      return;
    }
    
    try {
      final updatedComment = await commentService.updateComment(
        commentId: event.commentId,
        content: event.content,
        token: token!,
      );

      if (state is CommentLoaded) {
        final currentState = state as CommentLoaded;
        final updatedComments = currentState.comments.map((comment) {
          if (comment.idComment == event.commentId) {
            return updatedComment;
          }
          return comment;
        }).toList();

        emit(currentState.copyWith(comments: updatedComments));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }

  Future<void> _onToggleLike(ToggleLike event, Emitter<CommentState> emit) async {
    if (token == null || token!.isEmpty) {
      emit(CommentError('Authentification requise pour liker un commentaire'));
      return;
    }
    
    emit(CommentLiking(event.commentId));
    try {
      final isLiked = await commentService.toggleLike(event.commentId, token!);
      
      if (state is CommentLoaded) {
        final currentState = state as CommentLoaded;
        final updatedComments = currentState.comments.map((comment) {
          if (comment.idComment == event.commentId) {
            return comment.copyWith(
              likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1,
              isLikedByCurrentUser: isLiked,
            );
          }
          return comment;
        }).toList();

        emit(currentState.copyWith(comments: updatedComments));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }

  Future<void> _onDeleteComment(DeleteComment event, Emitter<CommentState> emit) async {
    if (token == null || token!.isEmpty) {
      emit(CommentError('Authentification requise pour supprimer un commentaire'));
      return;
    }
    
    try {
      await commentService.deleteComment(event.commentId, token!);
      
      if (state is CommentLoaded) {
        final currentState = state as CommentLoaded;
        final updatedComments = currentState.comments
            .where((comment) => comment.idComment != event.commentId)
            .toList();

        emit(currentState.copyWith(comments: updatedComments));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }

  Future<void> _onLoadReplies(LoadReplies event, Emitter<CommentState> emit) async {
    try {
      final replies = await commentService.fetchReplies(event.commentId, token);
      
      if (state is CommentLoaded) {
        final currentState = state as CommentLoaded;
        final updatedReplies = Map<int, List<Comment>>.from(currentState.replies);
        updatedReplies[event.commentId] = replies;

        emit(currentState.copyWith(replies: updatedReplies));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
} 