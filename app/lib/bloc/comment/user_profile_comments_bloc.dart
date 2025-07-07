import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class UserProfileCommentsEvent extends Equatable {
  const UserProfileCommentsEvent();
  @override
  List<Object?> get props => [];
}
class LoadUserProfileComments extends UserProfileCommentsEvent {
  final int userId;
  final String? currentUserId;
  const LoadUserProfileComments(this.userId, {this.currentUserId});
  @override
  List<Object?> get props => [userId, currentUserId];
}
class RefreshUserProfileComments extends UserProfileCommentsEvent {
  final int userId;
  final String? currentUserId;
  const RefreshUserProfileComments(this.userId, {this.currentUserId});
  @override
  List<Object?> get props => [userId, currentUserId];
}

// States
abstract class UserProfileCommentsState extends Equatable {
  const UserProfileCommentsState();
  @override
  List<Object?> get props => [];
}
class UserProfileCommentsInitial extends UserProfileCommentsState {}
class UserProfileCommentsLoading extends UserProfileCommentsState {}
class UserProfileCommentsLoaded extends UserProfileCommentsState {
  final List<Comment> comments;
  const UserProfileCommentsLoaded(this.comments);
  @override
  List<Object?> get props => [comments];
}
class UserProfileCommentsError extends UserProfileCommentsState {
  final String message;
  const UserProfileCommentsError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class UserProfileCommentsBloc extends Bloc<UserProfileCommentsEvent, UserProfileCommentsState> {
  final CommentService commentService;
  final String? token;
  UserProfileCommentsBloc({required this.commentService, required this.token}) : super(UserProfileCommentsInitial()) {
    on<LoadUserProfileComments>(_onLoad);
    on<RefreshUserProfileComments>(_onLoad);
  }

  Future<void> _onLoad(UserProfileCommentsEvent event, Emitter<UserProfileCommentsState> emit) async {
    if (event is LoadUserProfileComments || event is RefreshUserProfileComments) {
      emit(UserProfileCommentsLoading());
      try {
        final userId = (event as dynamic).userId;
        final currentUserId = (event as dynamic).currentUserId;
        final comments = await commentService.fetchUserMainComments(userId, token, currentUserId: currentUserId);
        emit(UserProfileCommentsLoaded(comments));
      } catch (e) {
        emit(UserProfileCommentsError(e.toString()));
      }
    }
  }
} 