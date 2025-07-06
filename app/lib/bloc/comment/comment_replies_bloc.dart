import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'comment_replies_event.dart';
import 'comment_replies_state.dart';

class CommentRepliesBloc extends Bloc<CommentRepliesEvent, CommentRepliesState> {
  final CommentService commentService;
  final String? token;

  CommentRepliesBloc({
    required this.commentService,
    required this.token,
  }) : super(CommentRepliesInitial()) {
    on<LoadReplies>(_onLoadReplies);
    on<RefreshReplies>(_onRefreshReplies);
  }

  Future<void> _onLoadReplies(LoadReplies event, Emitter<CommentRepliesState> emit) async {
    // Si on est déjà en train de charger ou si on a déjà les réponses, ne rien faire
    if (state is CommentRepliesLoading && (state as CommentRepliesLoading).commentId == event.commentId) {
      return;
    }

    if (state is CommentRepliesLoaded && (state as CommentRepliesLoaded).commentId == event.commentId) {
      return;
    }

    emit(CommentRepliesLoading(event.commentId));

    try {
      final replies = await commentService.fetchReplies(event.commentId, token);
      emit(CommentRepliesLoaded(event.commentId, replies));
    } catch (e) {
      emit(CommentRepliesError(event.commentId, e.toString()));
    }
  }

  Future<void> _onRefreshReplies(RefreshReplies event, Emitter<CommentRepliesState> emit) async {
    emit(CommentRepliesLoading(event.commentId));

    try {
      final replies = await commentService.fetchReplies(event.commentId, token);
      emit(CommentRepliesLoaded(event.commentId, replies));
    } catch (e) {
      emit(CommentRepliesError(event.commentId, e.toString()));
    }
  }
} 