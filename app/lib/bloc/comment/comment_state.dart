import 'package:equatable/equatable.dart';
import '../../models/comment_model.dart';

abstract class CommentState extends Equatable {
  const CommentState();

  @override
  List<Object?> get props => [];
}

class CommentInitial extends CommentState {}

class CommentLoading extends CommentState {}

class CommentLoaded extends CommentState {
  final List<Comment> comments;
  final Map<int, List<Comment>> replies;

  const CommentLoaded({
    required this.comments,
    required this.replies,
  });

  @override
  List<Object?> get props => [comments, replies];

  CommentLoaded copyWith({
    List<Comment>? comments,
    Map<int, List<Comment>>? replies,
  }) {
    return CommentLoaded(
      comments: comments ?? this.comments,
      replies: replies ?? this.replies,
    );
  }
}

class CommentError extends CommentState {
  final String message;

  const CommentError(this.message);

  @override
  List<Object> get props => [message];
}

class CommentCreating extends CommentState {}

class CommentCreated extends CommentState {
  final Comment comment;

  const CommentCreated(this.comment);

  @override
  List<Object> get props => [comment];
}

class CommentLiking extends CommentState {
  final int commentId;

  const CommentLiking(this.commentId);

  @override
  List<Object> get props => [commentId];
}

class CommentLiked extends CommentState {
  final int commentId;
  final bool isLiked;

  const CommentLiked({
    required this.commentId,
    required this.isLiked,
  });

  @override
  List<Object> get props => [commentId, isLiked];
} 