import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import '../../services/thread_builder_service.dart';
import 'package:equatable/equatable.dart';

// ============================================================================
// EVENTS
// ============================================================================

abstract class CommentEvent extends Equatable {
  const CommentEvent();
  @override
  List<Object?> get props => [];
}

class LoadMainComments extends CommentEvent {
  final String? userId;
  const LoadMainComments({this.userId});
  @override
  List<Object?> get props => [userId];
}

class LoadFriendsComments extends CommentEvent {
  final int userId;
  const LoadFriendsComments(this.userId);
  @override
  List<Object?> get props => [userId];
}

class LoadCommentDetail extends CommentEvent {
  final int commentId;
  final String? userId;
  const LoadCommentDetail(this.commentId, {this.userId});
  @override
  List<Object?> get props => [commentId, userId];
}

class LikeComment extends CommentEvent {
  final int commentId;
  final String userId;
  const LikeComment(this.commentId, this.userId);
  @override
  List<Object?> get props => [commentId, userId];
}

class CreateComment extends CommentEvent {
  final String content;
  final String? imageUrl;
  final int? parentCommentId;
  final String userId;
  const CreateComment(this.content, {this.imageUrl, this.parentCommentId, required this.userId});
  @override
  List<Object?> get props => [content, imageUrl, parentCommentId, userId];
}

class RefreshComments extends CommentEvent {
  final String? userId;
  const RefreshComments({this.userId});
  @override
  List<Object?> get props => [userId];
}

class EmitMainCommentsState extends CommentEvent {
  const EmitMainCommentsState();
}

// ============================================================================
// STATES
// ============================================================================

abstract class CommentState extends Equatable {
  const CommentState();
  @override
  List<Object?> get props => [];
}

class CommentInitial extends CommentState {}

class CommentLoading extends CommentState {}

class CommentMainLoaded extends CommentState {
  final List<Comment> comments;
  const CommentMainLoaded(this.comments);
  @override
  List<Object?> get props => [comments];
}

class CommentThreadLoaded extends CommentState {
  final List<Comment> threadHierarchy;
  const CommentThreadLoaded(this.threadHierarchy);
  @override
  List<Object?> get props => [threadHierarchy];
}

class CommentLikeUpdated extends CommentState {
  final int commentId;
  final bool isLiked;
  final int likeCount;
  const CommentLikeUpdated(this.commentId, this.isLiked, this.likeCount);
  @override
  List<Object?> get props => [commentId, isLiked, likeCount];
}

class CommentCreated extends CommentState {
  final Comment comment;
  const CommentCreated(this.comment);
  @override
  List<Object?> get props => [comment];
}

class CommentError extends CommentState {
  final String message;
  const CommentError(this.message);
  @override
  List<Object?> get props => [message];
}

// ============================================================================
// BLOC
// ============================================================================

class CommentBloc extends Bloc<CommentEvent, CommentState> {
  final CommentService commentService;
  final String? token;
  
  // Cache local pour synchronisation
  List<Comment> _mainComments = [];
  List<Comment> _currentThreadHierarchy = [];
  
  // Getters pour accéder au cache
  List<Comment> get mainComments => _mainComments;
  List<Comment> get currentThreadHierarchy => _currentThreadHierarchy;
  
  CommentBloc({
    required this.commentService,
    required this.token,
  }) : super(CommentInitial()) {
    on<LoadMainComments>(_onLoadMainComments);
    on<LoadFriendsComments>(_onLoadFriendsComments);
    on<LoadCommentDetail>(_onLoadCommentDetail);
    on<LikeComment>(_onLikeComment);
    on<CreateComment>(_onCreateComment);
    on<RefreshComments>(_onRefreshComments);
    on<EmitMainCommentsState>(_onEmitMainCommentsState);
  }
  
  Future<void> _onLoadMainComments(LoadMainComments event, Emitter<CommentState> emit) async {
    emit(CommentLoading());
    try {
      // Utiliser la méthode avec filtrage des utilisateurs bloqués (toujours frais)
      final comments = await commentService.fetchMainCommentsWithoutBlocked(
        token, 
        userId: event.userId,
      );
      _mainComments = comments;
      emit(CommentMainLoaded(comments));
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onLoadFriendsComments(LoadFriendsComments event, Emitter<CommentState> emit) async {
    emit(CommentLoading());
    try {
      if (token == null || token!.isEmpty) {
        throw Exception('Token requis pour charger les commentaires des amis');
      }
      
      final comments = await commentService.fetchFriendsComments(token!, event.userId);
      _mainComments = comments; // Mettre à jour le cache avec les commentaires des amis
      emit(CommentMainLoaded(comments));
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onLoadCommentDetail(LoadCommentDetail event, Emitter<CommentState> emit) async {
    emit(CommentLoading());
    try {
      // Récupérer tous les commentaires (parent + réponses)
      final flatComments = await commentService.fetchPostWithComments(
        event.commentId, 
        token, 
        userId: event.userId
      );
      
      // Construire la hiérarchie de threading
      final threadHierarchy = ThreadBuilderService.buildThreadHierarchy(flatComments);
      
      // Mettre à jour le cache
      _currentThreadHierarchy = threadHierarchy;
      
      // Émettre l'état avec la hiérarchie
      emit(CommentThreadLoaded(threadHierarchy));
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onLikeComment(LikeComment event, Emitter<CommentState> emit) async {
    try {
      final result = await commentService.toggleLike(event.commentId, token!, event.userId);
      
      // Mettre à jour le cache local
      _updateCommentInCache(event.commentId, result['liked'], result['likeCount']);
      
      // Émettre l'état mis à jour
      emit(CommentLikeUpdated(event.commentId, result['liked'], result['likeCount']));
      
      // Re-émettre l'état approprié avec les données mises à jour
      if (_currentThreadHierarchy.isNotEmpty) {
        // Trouver le commentaire existant dans la hiérarchie
        final existingComment = ThreadBuilderService.findCommentInHierarchy(
          _currentThreadHierarchy, 
          event.commentId
        );
        
        if (existingComment != null) {
          // Mettre à jour seulement les propriétés de like
          final updatedComment = existingComment.copyWith(
            isLikedByCurrentUser: result['liked'],
            likeCount: result['likeCount'],
          );
          
          // Mettre à jour la hiérarchie
          _currentThreadHierarchy = ThreadBuilderService.updateCommentInHierarchy(
            _currentThreadHierarchy, 
            updatedComment
          );
          
          emit(CommentThreadLoaded(_currentThreadHierarchy));
        }
      } else {
        // Mettre à jour la liste principale
        emit(CommentMainLoaded(_mainComments));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onCreateComment(CreateComment event, Emitter<CommentState> emit) async {
    try {
      final comment = await commentService.createComment(
        content: event.content,
        imageUrl: event.imageUrl,
        parentCommentId: event.parentCommentId,
        token: token!,
        userId: event.userId,
      );
      
      // Ajouter au cache local
      if (event.parentCommentId == null) {
        _mainComments.insert(0, comment);
      } else if (_currentThreadHierarchy.isNotEmpty) {
        // Ajouter à la hiérarchie de threading
        _currentThreadHierarchy = ThreadBuilderService.addCommentToHierarchy(
          _currentThreadHierarchy,
          comment,
        );
      }
      
      emit(CommentCreated(comment));
      
      // Re-émettre l'état approprié
      if (event.parentCommentId == null) {
        emit(CommentMainLoaded(_mainComments));
      } else if (_currentThreadHierarchy.isNotEmpty) {
        emit(CommentThreadLoaded(_currentThreadHierarchy));
      }
    } catch (e) {
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onRefreshComments(RefreshComments event, Emitter<CommentState> emit) async {
    // Forcer le rechargement avec le filtrage des utilisateurs bloqués
    if (_currentThreadHierarchy.isNotEmpty) {
      add(LoadCommentDetail(_currentThreadHierarchy.first.idComment, userId: event.userId));
    } else {
      add(LoadMainComments(userId: event.userId));
    }
  }
  
  void _onEmitMainCommentsState(EmitMainCommentsState event, Emitter<CommentState> emit) {
    if (_mainComments.isNotEmpty) {
      emit(CommentMainLoaded(_mainComments));
    }
  }
  
  void _updateCommentInCache(int commentId, bool isLiked, int likeCount) {
    // Mettre à jour dans la liste principale
    for (int i = 0; i < _mainComments.length; i++) {
      if (_mainComments[i].idComment == commentId) {
        _mainComments[i] = _mainComments[i].copyWith(
          isLikedByCurrentUser: isLiked,
          likeCount: likeCount,
        );
        break;
      }
    }
    
    // La mise à jour de la hiérarchie est gérée dans _onLikeComment
  }
} 