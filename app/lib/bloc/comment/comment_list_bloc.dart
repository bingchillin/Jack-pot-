import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class CommentListEvent extends Equatable {
  const CommentListEvent();
  @override
  List<Object?> get props => [];
}

class LoadComments extends CommentListEvent {}
class RefreshComments extends CommentListEvent {}

// States
abstract class CommentListState extends Equatable {
  const CommentListState();
  @override
  List<Object?> get props => [];
}

class CommentListInitial extends CommentListState {}
class CommentListLoading extends CommentListState {}
class CommentListLoaded extends CommentListState {
  final List<Comment> comments;
  const CommentListLoaded(this.comments);
  @override
  List<Object?> get props => [comments];
}
class CommentListError extends CommentListState {
  final String message;
  const CommentListError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class CommentListBloc extends Bloc<CommentListEvent, CommentListState> {
  final CommentService commentService;
  final String? token;
  CommentListBloc({required this.commentService, required this.token}) : super(CommentListInitial()) {
    on<LoadComments>(_onLoadComments);
    on<RefreshComments>(_onLoadComments);
  }

  Future<void> _onLoadComments(CommentListEvent event, Emitter<CommentListState> emit) async {
    emit(CommentListLoading());
    try {
      final comments = await commentService.fetchMainComments(token);
      emit(CommentListLoaded(comments));
    } catch (e) {
      emit(CommentListError(e.toString()));
    }
  }
} 