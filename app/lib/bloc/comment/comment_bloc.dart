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
    on<EmitMainCommentsState>(_onEmitMainCommentsState);
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
      
      // Émettre toujours CommentLikeUpdated pour une mise à jour immédiate de l'UI
      emit(CommentLikeUpdated(event.commentId, result['liked'], result['likeCount']));
      
      // Just emit the like update, let UI handle refresh if needed
    } catch (e) {
      print('Debug: Error in like comment: $e');
      emit(CommentError(e.toString()));
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
      print('Debug: No cache available for current feed type $_currentFeedType');
    }
  }
} 