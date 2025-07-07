import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'package:equatable/equatable.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';

// Events
abstract class CommentDetailEvent extends Equatable {
  const CommentDetailEvent();
  @override
  List<Object?> get props => [];
}

class LoadCommentDetail extends CommentDetailEvent {
  final int commentId;
  const LoadCommentDetail(this.commentId);
  @override
  List<Object?> get props => [commentId];
}

class RefreshCommentDetail extends CommentDetailEvent {
  final int commentId;
  const RefreshCommentDetail(this.commentId);
  @override
  List<Object?> get props => [commentId];
}

// States
abstract class CommentDetailState extends Equatable {
  const CommentDetailState();
  @override
  List<Object?> get props => [];
}

class CommentDetailInitial extends CommentDetailState {}
class CommentDetailLoading extends CommentDetailState {}
class CommentDetailLoaded extends CommentDetailState {
  final Comment parentComment;
  final List<Comment> replies;
  const CommentDetailLoaded(this.parentComment, this.replies);
  @override
  List<Object?> get props => [parentComment, replies];
}
class CommentDetailError extends CommentDetailState {
  final String message;
  const CommentDetailError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class CommentDetailBloc extends Bloc<CommentDetailEvent, CommentDetailState> {
  final CommentService commentService;
  final String? token;
  final GlobalKey<NavigatorState> navigatorKey;
  
  CommentDetailBloc({required this.commentService, required this.token, required this.navigatorKey}) 
      : super(CommentDetailInitial()) {
    on<LoadCommentDetail>(_onLoadCommentDetail);
    on<RefreshCommentDetail>(_onLoadCommentDetail);
  }

  Future<void> _onLoadCommentDetail(CommentDetailEvent event, Emitter<CommentDetailState> emit) async {
    emit(CommentDetailLoading());
    try {
      int commentId;
      if (event is LoadCommentDetail) {
        commentId = event.commentId;
      } else if (event is RefreshCommentDetail) {
        commentId = event.commentId;
      } else {
        emit(CommentDetailError('Événement non reconnu'));
        return;
      }
      // Récupérer le userId depuis le provider (si possible)
      String? userId;
      if (navigatorKey.currentContext != null) {
        final authProvider = Provider.of<AuthProvider>(navigatorKey.currentContext!, listen: false);
        userId = authProvider.userId;
      }
      // Appel unique à l'API enrichie
      final comments = await commentService.fetchPostWithComments(commentId, token, userId: userId);
      // parent = celui dont parentCommentId == null
      final parentComment = comments.firstWhere((c) => c.parentCommentId == null, orElse: () => comments.first);
      
      final replies = comments.where((c) => c.parentCommentId == parentComment.idComment).toList();
      emit(CommentDetailLoaded(parentComment, replies));
    } catch (e) {
      emit(CommentDetailError(e.toString()));
    }
  }
} 