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
  final String? tag;
  final int? parentCommentId;
  final String userId;
  const CreateComment(this.content, {this.imageUrl, this.tag, this.parentCommentId, required this.userId});
  @override
  List<Object?> get props => [content, imageUrl, tag, parentCommentId, userId];
}

class DeleteComment extends CommentEvent {
  final int commentId;
  const DeleteComment(this.commentId);
  @override
  List<Object?> get props => [commentId];
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

class CommentDeleted extends CommentState {
  final int commentId;
  const CommentDeleted(this.commentId);
  @override
  List<Object?> get props => [commentId];
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
  List<Comment> _friendsComments = [];
  List<Comment> _currentThreadHierarchy = [];
  
  // Getters pour accéder au cache
  List<Comment> get mainComments => _mainComments;
  List<Comment> get friendsComments => _friendsComments;
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
    on<DeleteComment>(_onDeleteComment);
    on<RefreshComments>(_onRefreshComments);
    on<EmitMainCommentsState>(_onEmitMainCommentsState);
  }
  
  Future<void> _onLoadMainComments(LoadMainComments event, Emitter<CommentState> emit) async {
    // Si on a déjà des commentaires en cache, les afficher immédiatement
    if (_mainComments.isNotEmpty) {
      emit(CommentMainLoaded(_mainComments));
    } else {
      emit(CommentLoading());
    }
    
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
    // Si on a déjà des commentaires d'amis en cache, les afficher immédiatement
    if (_friendsComments.isNotEmpty) {
      emit(CommentMainLoaded(_friendsComments));
    } else {
      emit(CommentLoading());
    }
    
    try {
      if (token == null || token!.isEmpty) {
        throw Exception('Token requis pour charger les commentaires des amis');
      }
      
      final comments = await commentService.fetchFriendsComments(token!, event.userId);
      _friendsComments = comments; // Mettre à jour le cache des amis
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
      
      // Émettre toujours CommentLikeUpdated pour une mise à jour immédiate de l'UI
      emit(CommentLikeUpdated(event.commentId, result['liked'], result['likeCount']));
      
      // Re-émettre l'état approprié avec les données mises à jour
      if (_currentThreadHierarchy.isNotEmpty) {
        // Mode thread - mettre à jour la hiérarchie
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
        } else {
          // Comment not found in hierarchy, fallback to main list
          emit(CommentMainLoaded(_mainComments));
        }
      } else {
        // Mode timeline - émettre la liste mise à jour
        // Déterminer quelle liste afficher basée sur le dernier état
        final currentState = state;
        if (currentState is CommentMainLoaded) {
          // Vérifier si le commentaire est dans la liste des amis
          final isInFriends = _friendsComments.any((c) => c.idComment == event.commentId);
          if (isInFriends) {
            print('Debug: Updating friends comments list with ${_friendsComments.length} comments');
            emit(CommentMainLoaded(_friendsComments));
          } else {
            print('Debug: Updating main comments list with ${_mainComments.length} comments');
            emit(CommentMainLoaded(_mainComments));
          }
        } else {
          // Fallback vers la liste principale
          print('Debug: Fallback to main comments list with ${_mainComments.length} comments');
          emit(CommentMainLoaded(_mainComments));
        }
      }
    } catch (e) {
      print('Debug: Error in like comment: $e');
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onCreateComment(CreateComment event, Emitter<CommentState> emit) async {
    try {
      // Don't send tag if this is a reply (tags are only for main posts)
      final tagToSend = event.parentCommentId != null ? null : event.tag;
      
      final comment = await commentService.createComment(
        content: event.content,
        imageUrl: event.imageUrl,
        tag: tagToSend,
        parentCommentId: event.parentCommentId,
        token: token!,
        userId: event.userId,
      );
      
      // Ajouter au cache local
      if (event.parentCommentId == null) {
        _mainComments.insert(0, comment);
        // Si l'utilisateur est dans la liste des amis, ajouter aussi au cache des amis
        // (pour simplifier, on l'ajoute toujours - il sera filtré côté serveur lors du prochain refresh)
        _friendsComments.insert(0, comment);
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

  Future<void> _onDeleteComment(DeleteComment event, Emitter<CommentState> emit) async {
    try {
      await commentService.deleteComment(event.commentId, token!);
      
      // Supprimer du cache local
      _mainComments.removeWhere((comment) => comment.idComment == event.commentId);
      _friendsComments.removeWhere((comment) => comment.idComment == event.commentId);
      
      // Supprimer de la hiérarchie de threading si elle existe
      if (_currentThreadHierarchy.isNotEmpty) {
        _currentThreadHierarchy = ThreadBuilderService.removeCommentFromHierarchy(
          _currentThreadHierarchy,
          event.commentId,
        );
      }
      
      emit(CommentDeleted(event.commentId));
      
      // Re-émettre l'état approprié
      if (_currentThreadHierarchy.isNotEmpty) {
        emit(CommentThreadLoaded(_currentThreadHierarchy));
      } else {
        emit(CommentMainLoaded(_mainComments));
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
    bool foundInMain = false;
    for (int i = 0; i < _mainComments.length; i++) {
      if (_mainComments[i].idComment == commentId) {
        _mainComments[i] = _mainComments[i].copyWith(
          isLikedByCurrentUser: isLiked,
          likeCount: likeCount,
        );
        foundInMain = true;
        print('Debug: Updated comment $commentId in main cache - liked: $isLiked, count: $likeCount');
        break;
      }
    }
    
    // Mettre à jour dans la liste des amis
    bool foundInFriends = false;
    for (int i = 0; i < _friendsComments.length; i++) {
      if (_friendsComments[i].idComment == commentId) {
        _friendsComments[i] = _friendsComments[i].copyWith(
          isLikedByCurrentUser: isLiked,
          likeCount: likeCount,
        );
        foundInFriends = true;
        print('Debug: Updated comment $commentId in friends cache - liked: $isLiked, count: $likeCount');
        break;
      }
    }
    
    if (!foundInMain && !foundInFriends) {
      print('Debug: Comment $commentId not found in any cache (main: ${_mainComments.length}, friends: ${_friendsComments.length})');
    }
    
    // La mise à jour de la hiérarchie est gérée dans _onLikeComment
  }
} 