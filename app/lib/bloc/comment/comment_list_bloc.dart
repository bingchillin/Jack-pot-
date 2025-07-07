import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'package:equatable/equatable.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'package:flutter/material.dart';

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
  final GlobalKey<NavigatorState> navigatorKey;
  CommentListBloc({required this.commentService, required this.token, required this.navigatorKey}) : super(CommentListInitial()) {
    on<LoadComments>(_onLoadComments);
    on<RefreshComments>(_onLoadComments);
  }

  Future<void> _onLoadComments(CommentListEvent event, Emitter<CommentListState> emit) async {
    emit(CommentListLoading());
    try {
      // Récupère le userId depuis le provider (via le contexte global)
      String? userId;
      if (navigatorKey.currentContext != null) {
        final authProvider = Provider.of<AuthProvider>(navigatorKey.currentContext!, listen: false);
        userId = authProvider.userId;
      }
      final comments = await commentService.fetchMainComments(token, userId: userId);
      emit(CommentListLoaded(comments));
    } catch (e) {
      emit(CommentListError(e.toString()));
    }
  }

  Future<String?> _getUserIdFromToken(String? token) async {
    // Si tu as déjà le userId dans le provider, tu peux l'utiliser directement ici
    // Sinon, décode le JWT ou adapte selon ton système d'auth
    // Pour l'instant, retourne null si non dispo
    return null;
  }
} 