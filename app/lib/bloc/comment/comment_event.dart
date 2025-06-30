import 'package:equatable/equatable.dart';

abstract class CommentEvent extends Equatable {
  const CommentEvent();

  @override
  List<Object?> get props => [];
}

class LoadComments extends CommentEvent {
  const LoadComments();
}

class CreateComment extends CommentEvent {
  final String content;
  final int? parentCommentId;

  const CreateComment({
    required this.content,
    this.parentCommentId,
  });

  @override
  List<Object?> get props => [content, parentCommentId];
}

class UpdateComment extends CommentEvent {
  final int commentId;
  final String content;

  const UpdateComment({
    required this.commentId,
    required this.content,
  });

  @override
  List<Object> get props => [commentId, content];
}

class ToggleLike extends CommentEvent {
  final int commentId;

  const ToggleLike(this.commentId);

  @override
  List<Object> get props => [commentId];
}

class DeleteComment extends CommentEvent {
  final int commentId;

  const DeleteComment(this.commentId);

  @override
  List<Object> get props => [commentId];
}

class LoadReplies extends CommentEvent {
  final int commentId;

  const LoadReplies(this.commentId);

  @override
  List<Object> get props => [commentId];
} 