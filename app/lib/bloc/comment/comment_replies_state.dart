import 'package:equatable/equatable.dart';
import '../../models/comment_model.dart';

abstract class CommentRepliesState extends Equatable {
  const CommentRepliesState();

  @override
  List<Object?> get props => [];
}

class CommentRepliesInitial extends CommentRepliesState {}

class CommentRepliesLoading extends CommentRepliesState {
  final int commentId;

  const CommentRepliesLoading(this.commentId);

  @override
  List<Object?> get props => [commentId];
}

class CommentRepliesLoaded extends CommentRepliesState {
  final int commentId;
  final List<Comment> replies;

  const CommentRepliesLoaded(this.commentId, this.replies);

  @override
  List<Object?> get props => [commentId, replies];
}

class CommentRepliesError extends CommentRepliesState {
  final int commentId;
  final String message;

  const CommentRepliesError(this.commentId, this.message);

  @override
  List<Object?> get props => [commentId, message];
} 