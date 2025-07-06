import 'package:equatable/equatable.dart';

abstract class CommentRepliesEvent extends Equatable {
  const CommentRepliesEvent();

  @override
  List<Object?> get props => [];
}

class LoadReplies extends CommentRepliesEvent {
  final int commentId;

  const LoadReplies(this.commentId);

  @override
  List<Object?> get props => [commentId];
}

class RefreshReplies extends CommentRepliesEvent {
  final int commentId;

  const RefreshReplies(this.commentId);

  @override
  List<Object?> get props => [commentId];
} 