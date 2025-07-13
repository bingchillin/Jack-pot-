import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/comment_model.dart';
import '../../services/comment_service.dart';
import '../../services/thread_builder_service.dart';
import '../../ui/widgets/twitter_feed_toggle.dart';
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
  final String? requestId;
  const LoadMainComments({this.userId, this.requestId});
  @override
  List<Object?> get props => [userId, requestId];
}

class LoadFriendsComments extends CommentEvent {
  final int userId;
  final String? requestId;
  const LoadFriendsComments(this.userId, {this.requestId});
  @override
  List<Object?> get props => [userId, requestId];
}

class LoadCommentDetail extends CommentEvent {
  final int commentId;
  final String? userId;
  final String requestId;
  const LoadCommentDetail(this.commentId, {this.userId, required this.requestId});
  @override
  List<Object?> get props => [commentId, userId, requestId];
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

class SetCurrentFeedType extends CommentEvent {
  final FeedType feedType;
  const SetCurrentFeedType(this.feedType);
  @override
  List<Object?> get props => [feedType];
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
  
  // Request tracking pour éviter les race conditions
  String? _currentMainRequestId;
  String? _currentFriendsRequestId;
  String? _currentDetailRequestId;
  
  // Track current feed type pour éviter les mauvais affichages
  FeedType? _currentFeedType;
  
  // Cache pour les feeds principaux (pas pour les threads)
  List<Comment> _mainComments = [];
  List<Comment> _friendsComments = [];
  List<Comment> _currentThreadHierarchy = [];
  
  // Getters pour accéder au cache
  List<Comment> get mainComments => _mainComments;
  List<Comment> get friendsComments => _friendsComments;
  
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
    on<SetCurrentFeedType>(_onSetCurrentFeedType);
  }
  
  Future<void> _onLoadMainComments(LoadMainComments event, Emitter<CommentState> emit) async {
    final requestId = event.requestId ?? DateTime.now().millisecondsSinceEpoch.toString();
    _currentMainRequestId = requestId;
    _currentFeedType = FeedType.forYou;
    
    emit(CommentLoading());
    
    try {
      // Utiliser la méthode avec filtrage des utilisateurs bloqués (toujours frais)
      final comments = await commentService.fetchMainCommentsWithoutBlocked(
        token, 
        userId: event.userId,
      );
      
      // Vérifier si cette requête est toujours la plus récente
      if (_currentMainRequestId == requestId) {
        // Mettre à jour le cache
        _mainComments = comments;
        // Seulement émettre si on est toujours sur le feed "Pour toi"
        if (_currentFeedType == FeedType.forYou) {
          emit(CommentMainLoaded(comments));
          print('Debug: Emitted main comments for ForYou feed - ${comments.length} comments');
        } else {
          print('Debug: Main comments loaded but current feed is $_currentFeedType, not emitting');
        }
      } else {
        // Si ce n'est pas la requête la plus récente, ignorer complètement
        print('Debug: Ignoring outdated main comments request $requestId (current: $_currentMainRequestId)');
      }
    } catch (e) {
      // Seulement traiter l'erreur si c'est la requête la plus récente
      if (_currentMainRequestId == requestId) {
        print('Debug: Error in main comments request $requestId: $e');
        // Seulement traiter l'erreur si on est sur le bon feed
        if (_currentFeedType == FeedType.forYou) {
          emit(CommentError(e.toString()));
        } else {
          print('Debug: Error in main comments but current feed is $_currentFeedType, not emitting');
        }
      } else {
        print('Debug: Ignoring error from outdated main comments request $requestId');
      }
    }
  }
  
  Future<void> _onLoadFriendsComments(LoadFriendsComments event, Emitter<CommentState> emit) async {
    final requestId = event.requestId ?? DateTime.now().millisecondsSinceEpoch.toString();
    _currentFriendsRequestId = requestId;
    _currentFeedType = FeedType.friends;
    
    emit(CommentLoading());
    
    try {
      if (token == null || token!.isEmpty) {
        throw Exception('Token requis pour charger les commentaires des amis');
      }
      
      final comments = await commentService.fetchFriendsComments(token!, event.userId);
      
      // Vérifier si cette requête est toujours la plus récente
      if (_currentFriendsRequestId == requestId) {
        // Mettre à jour le cache
        _friendsComments = comments;
        // Seulement émettre si on est toujours sur le feed "Amis"
        if (_currentFeedType == FeedType.friends) {
          emit(CommentMainLoaded(comments));
          print('Debug: Emitted friends comments for Friends feed - ${comments.length} comments');
        } else {
          print('Debug: Friends comments loaded but current feed is $_currentFeedType, not emitting');
        }
      } else {
        // Si ce n'est pas la requête la plus récente, ignorer complètement
        print('Debug: Ignoring outdated friends comments request $requestId (current: $_currentFriendsRequestId)');
      }
    } catch (e) {
      // Seulement traiter l'erreur si c'est la requête la plus récente
      if (_currentFriendsRequestId == requestId) {
        print('Debug: Error in friends comments request $requestId: $e');
        // Seulement traiter l'erreur si on est sur le bon feed
        emit(CommentError(e.toString()));
      } else {
        print('Debug: Ignoring error from outdated friends comments request $requestId');
      }
    }
  }
  
  Future<void> _onLoadCommentDetail(LoadCommentDetail event, Emitter<CommentState> emit) async {
    final reqId = event.requestId;
    _currentDetailRequestId = reqId;
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
      
      // No cache update
      
      // Émettre l'état avec la hiérarchie
      if (_currentDetailRequestId == reqId) {
        _currentThreadHierarchy = threadHierarchy;
        emit(CommentThreadLoaded(threadHierarchy));
      } else {
        print('Debug: Ignoring outdated thread response');
      }
    } catch (e) {
      if (_currentDetailRequestId == reqId) {
        emit(CommentError(e.toString()));
      }
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
        print('Debug: Updating main comments list with ${_mainComments.length} comments');
        emit(CommentMainLoaded(_mainComments));
      }
    } catch (e) {
      print('Debug: Error in like comment: $e');
      emit(CommentError(e.toString()));
    }
  }
  
  Future<void> _onCreateComment(CreateComment event, Emitter<CommentState> emit) async {
    try {
      if (token == null || token!.isEmpty) {
        throw Exception('Authentication token required to create comment');
      }
      
      // Don't send tag if this is a reply (tags are only for main posts)
      final tagToSend = event.parentCommentId != null ? null : event.tag;
      
      final newComment = await commentService.createComment(
        content: event.content,
        imageUrl: event.imageUrl,
        tag: tagToSend,
        parentCommentId: event.parentCommentId,
        token: token!,
        userId: event.userId,
      );
      
      // Twitter-style instant updates: Add to cache immediately
      if (event.parentCommentId == null) {
        // New post - add to main feed cache
        _mainComments.insert(0, newComment);
        // Also add to friends cache if it's the current user
        if (_currentFeedType == FeedType.friends) {
          _friendsComments.insert(0, newComment);
        }
      } else {
        // Reply - update parent comment's reply count in main feed cache
        _updateParentReplyCount(event.parentCommentId!, 1);
        
        // Also add to thread hierarchy if we're in thread view
        if (_currentThreadHierarchy.isNotEmpty) {
          _currentThreadHierarchy = ThreadBuilderService.addCommentToHierarchy(
            _currentThreadHierarchy,
            newComment,
          );
        }
      }
      
      // Emit success first
      emit(CommentCreated(newComment));
      
      // Then immediately emit updated state (Twitter-style instant update)
      if (event.parentCommentId == null) {
        // For new posts, emit the appropriate feed
        if (_currentFeedType == FeedType.friends) {
          emit(CommentMainLoaded(_friendsComments));
        } else {
          emit(CommentMainLoaded(_mainComments));
        }
      } else {
        // For replies, we need to be more careful about which state to emit
        if (_currentThreadHierarchy.isNotEmpty) {
          // If we're in thread view, emit updated thread
          emit(CommentThreadLoaded(_currentThreadHierarchy));
        } else {
          // If we're in main feed view, emit the current feed with updated reply counts
          if (_currentFeedType == FeedType.friends) {
            emit(CommentMainLoaded(_friendsComments));
          } else {
            emit(CommentMainLoaded(_mainComments));
          }
        }
      }
    } catch (e) {
      print('Debug: Error creating comment: $e');
      emit(CommentError('Failed to create comment: ${e.toString()}'));
    }
  }

  void _onEmitMainCommentsState(EmitMainCommentsState event, Emitter<CommentState> emit) {
    // Émettre l'état principal basé sur le cache actuel
    if (_currentFeedType == FeedType.friends && _friendsComments.isNotEmpty) {
      emit(CommentMainLoaded(_friendsComments));
      print('Debug: Emitted cached friends comments - ${_friendsComments.length} comments');
    } else if (_currentFeedType == FeedType.forYou && _mainComments.isNotEmpty) {
      emit(CommentMainLoaded(_mainComments));
      print('Debug: Emitted cached main comments - ${_mainComments.length} comments');
    } else {
      // Fallback to main comments if no specific feed type or empty cache
      if (_mainComments.isNotEmpty) {
        emit(CommentMainLoaded(_mainComments));
        print('Debug: Fallback - emitted main comments');
      } else {
        print('Debug: No cache available for current feed type $_currentFeedType');
      }
    }
  }

  Future<void> _onDeleteComment(DeleteComment event, Emitter<CommentState> emit) async {
    try {
      await commentService.deleteComment(event.commentId, token!);
      
      // Find the comment to get its parent ID before deletion
      Comment? deletedComment;
      for (var comment in _mainComments) {
        if (comment.idComment == event.commentId) {
          deletedComment = comment;
          break;
        }
      }
      
      // Supprimer du cache local
      _mainComments.removeWhere((comment) => comment.idComment == event.commentId);
      _friendsComments.removeWhere((comment) => comment.idComment == event.commentId);
      
      // If it was a reply, decrease parent's reply count
      if (deletedComment?.parentCommentId != null) {
        _updateParentReplyCount(deletedComment!.parentCommentId!, -1);
      }
      
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
      add(LoadCommentDetail(_currentThreadHierarchy.first.idComment, userId: event.userId, requestId: DateTime.now().millisecondsSinceEpoch.toString()));
    } else {
      add(LoadMainComments(userId: event.userId));
    }
  }
  
  void _updateCommentInCache(int commentId, bool isLiked, int likeCount) {
    // Mettre à jour dans la liste principale
    bool found = false;
    for (int i = 0; i < _mainComments.length; i++) {
      if (_mainComments[i].idComment == commentId) {
        _mainComments[i] = _mainComments[i].copyWith(
          isLikedByCurrentUser: isLiked,
          likeCount: likeCount,
        );
        found = true;
        print('Debug: Updated comment $commentId in main cache - liked: $isLiked, count: $likeCount');
        break;
      }
    }
    
    if (!found) {
      print('Debug: Comment $commentId not found in main cache (${_mainComments.length} comments)');
    }
  }
  
  void _updateParentReplyCount(int parentCommentId, int increment) {
    // Update reply count in main comments cache
    bool foundInMain = false;
    for (int i = 0; i < _mainComments.length; i++) {
      if (_mainComments[i].idComment == parentCommentId) {
        _mainComments[i] = _mainComments[i].copyWith(
          replyCount: _mainComments[i].replyCount + increment,
        );
        foundInMain = true;
        print('Debug: Updated reply count for comment $parentCommentId in main cache: ${_mainComments[i].replyCount}');
        break;
      }
    }
    
    // Update reply count in friends comments cache
    bool foundInFriends = false;
    for (int i = 0; i < _friendsComments.length; i++) {
      if (_friendsComments[i].idComment == parentCommentId) {
        _friendsComments[i] = _friendsComments[i].copyWith(
          replyCount: _friendsComments[i].replyCount + increment,
        );
        foundInFriends = true;
        print('Debug: Updated reply count for comment $parentCommentId in friends cache: ${_friendsComments[i].replyCount}');
        break;
      }
    }
    
    if (!foundInMain && !foundInFriends) {
      print('Debug: Parent comment $parentCommentId not found in any cache for reply count update');
    }
  }

  void _onSetCurrentFeedType(SetCurrentFeedType event, Emitter<CommentState> emit) {
    _currentFeedType = event.feedType;
    print('DEBUG: CommentBloc - Current feed type set to: ${event.feedType}');
  }
} 