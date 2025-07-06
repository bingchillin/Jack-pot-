import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class CommentItemEvent extends Equatable {
  const CommentItemEvent();
  @override
  List<Object?> get props => [];
}
class LikeComment extends CommentItemEvent {}
class EditComment extends CommentItemEvent {
  final String content;
  const EditComment(this.content);
  @override
  List<Object?> get props => [content];
}
class DeleteComment extends CommentItemEvent {}

// States
abstract class CommentItemState extends Equatable {
  const CommentItemState();
  @override
  List<Object?> get props => [];
}
class CommentItemInitial extends CommentItemState {
  final Comment comment;
  const CommentItemInitial(this.comment);
  @override
  List<Object?> get props => [comment];
}
class CommentItemLiking extends CommentItemState {}
class CommentItemLiked extends CommentItemState {
  final Comment comment;
  const CommentItemLiked(this.comment);
  @override
  List<Object?> get props => [comment];
}
class CommentItemEditing extends CommentItemState {}
class CommentItemEdited extends CommentItemState {
  final Comment comment;
  const CommentItemEdited(this.comment);
  @override
  List<Object?> get props => [comment];
}
class CommentItemDeleting extends CommentItemState {}
class CommentItemDeleted extends CommentItemState {}
class CommentItemError extends CommentItemState {
  final String message;
  const CommentItemError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class CommentItemBloc extends Bloc<CommentItemEvent, CommentItemState> {
  final CommentService commentService;
  final String? token;
  Comment comment;
  CommentItemBloc({required this.commentService, required this.token, required this.comment}) : super(CommentItemInitial(comment)) {
    on<LikeComment>(_onLikeComment);
    on<EditComment>(_onEditComment);
    on<DeleteComment>(_onDeleteComment);
  }

  Future<void> _onLikeComment(LikeComment event, Emitter<CommentItemState> emit) async {
    emit(CommentItemLiking());
    try {
      final isLiked = await commentService.toggleLike(comment.idComment, token!);
      final updatedComment = comment.copyWith(
        likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1,
        isLikedByCurrentUser: isLiked,
      );
      comment = updatedComment;
      emit(CommentItemLiked(updatedComment));
    } catch (e) {
      emit(CommentItemError(e.toString()));
    }
  }

  Future<void> _onEditComment(EditComment event, Emitter<CommentItemState> emit) async {
    emit(CommentItemEditing());
    try {
      final updatedComment = await commentService.updateComment(
        commentId: comment.idComment,
        content: event.content,
        token: token!,
      );
      comment = updatedComment;
      emit(CommentItemEdited(updatedComment));
    } catch (e) {
      emit(CommentItemError(e.toString()));
    }
  }

  Future<void> _onDeleteComment(DeleteComment event, Emitter<CommentItemState> emit) async {
    emit(CommentItemDeleting());
    try {
      await commentService.deleteComment(comment.idComment, token!);
      emit(CommentItemDeleted());
    } catch (e) {
      emit(CommentItemError(e.toString()));
    }
  }
} 