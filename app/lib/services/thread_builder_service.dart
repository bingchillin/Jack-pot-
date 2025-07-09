import '../models/comment_model.dart';

class ThreadBuilderService {
  static const int maxThreadDepth = 4; // Niveaux 0, 1, 2, 3

  /// Construit une hiérarchie de commentaires à partir d'une liste plate
  static List<Comment> buildThreadHierarchy(List<Comment> flatComments) {
    if (flatComments.isEmpty) return [];

    // Créer une map pour accès rapide aux commentaires par ID
    Map<int, Comment> commentMap = {};
    for (Comment comment in flatComments) {
      commentMap[comment.idComment] = comment;
    }

    // Identifier les commentaires racines
    List<Comment> rootComments = flatComments
        .where((comment) => comment.parentCommentId == null)
        .toList();

    // Construire la hiérarchie pour chaque commentaire racine
    List<Comment> hierarchy = [];
    for (Comment rootComment in rootComments) {
      Comment hierarchicalComment = _buildCommentWithChildren(
        rootComment,
        flatComments,
        commentMap,
        0,
      );
      hierarchy.add(hierarchicalComment);
    }

    return hierarchy;
  }

  /// Construit récursivement un commentaire avec ses enfants
  static Comment _buildCommentWithChildren(
    Comment comment,
    List<Comment> allComments,
    Map<int, Comment> commentMap,
    int currentLevel,
  ) {
    // Limiter la profondeur
    if (currentLevel >= maxThreadDepth) {
      return comment.copyWith(level: currentLevel, children: []);
    }

    // Trouver les enfants directs
    List<Comment> directChildren = allComments
        .where((c) => c.parentCommentId == comment.idComment)
        .toList();

    // Trier les enfants par date de création
    directChildren.sort((a, b) => a.createdAt.compareTo(b.createdAt));

    // Construire récursivement les enfants avec leurs sous-enfants
    List<Comment> hierarchicalChildren = [];
    for (Comment child in directChildren) {
      Comment hierarchicalChild = _buildCommentWithChildren(
        child,
        allComments,
        commentMap,
        currentLevel + 1,
      );
      hierarchicalChildren.add(hierarchicalChild);
    }

    // Retourner le commentaire avec ses enfants hiérarchiques
    return comment.copyWith(
      level: currentLevel,
      children: hierarchicalChildren,
    );
  }

  /// Met à jour un commentaire dans la hiérarchie
  static List<Comment> updateCommentInHierarchy(
    List<Comment> hierarchy,
    Comment updatedComment,
  ) {
    return hierarchy.map((comment) {
      if (comment.idComment == updatedComment.idComment) {
        return updatedComment.copyWith(
          level: comment.level,
          children: comment.children,
        );
      } else if (comment.hasChildren) {
        return comment.copyWith(
          children: updateCommentInHierarchy(comment.children, updatedComment),
        );
      }
      return comment;
    }).toList();
  }

  /// Trouve un commentaire dans la hiérarchie par son ID
  static Comment? findCommentInHierarchy(
    List<Comment> hierarchy,
    int commentId,
  ) {
    for (Comment comment in hierarchy) {
      if (comment.idComment == commentId) {
        return comment;
      }
      if (comment.hasChildren) {
        Comment? found = findCommentInHierarchy(comment.children, commentId);
        if (found != null) return found;
      }
    }
    return null;
  }

  /// Ajoute un nouveau commentaire dans la hiérarchie
  static List<Comment> addCommentToHierarchy(
    List<Comment> hierarchy,
    Comment newComment,
  ) {
    if (newComment.parentCommentId == null) {
      // Commentaire racine
      return [...hierarchy, newComment.copyWith(level: 0, children: [])];
    }

    // Trouver le parent et ajouter l'enfant
    return hierarchy.map((comment) {
      if (comment.idComment == newComment.parentCommentId) {
        List<Comment> updatedChildren = [
          ...comment.children,
          newComment.copyWith(level: comment.level + 1, children: [])
        ];
        return comment.copyWith(children: updatedChildren);
      } else if (comment.hasChildren) {
        return comment.copyWith(
          children: addCommentToHierarchy(comment.children, newComment),
        );
      }
      return comment;
    }).toList();
  }

  /// Supprime un commentaire de la hiérarchie par son ID
  static List<Comment> removeCommentFromHierarchy(
    List<Comment> hierarchy,
    int commentId,
  ) {
    List<Comment> filteredHierarchy = [];
    
    for (Comment comment in hierarchy) {
      if (comment.idComment == commentId) {
        // Ignorer ce commentaire (le supprimer)
        continue;
      } else if (comment.hasChildren) {
        // Supprimer récursivement dans les enfants
        List<Comment> updatedChildren = removeCommentFromHierarchy(comment.children, commentId);
        filteredHierarchy.add(comment.copyWith(children: updatedChildren));
      } else {
        // Garder le commentaire tel quel
        filteredHierarchy.add(comment);
      }
    }
    
    return filteredHierarchy;
  }

  /// Obtient tous les commentaires de la hiérarchie dans l'ordre d'affichage
  static List<Comment> flattenHierarchy(List<Comment> hierarchy) {
    List<Comment> flattened = [];
    for (Comment comment in hierarchy) {
      flattened.add(comment);
      if (comment.hasChildren) {
        flattened.addAll(flattenHierarchy(comment.children));
      }
    }
    return flattened;
  }

  /// Compte le nombre total de commentaires dans la hiérarchie
  static int countTotalComments(List<Comment> hierarchy) {
    int count = 0;
    for (Comment comment in hierarchy) {
      count += 1;
      if (comment.hasChildren) {
        count += countTotalComments(comment.children);
      }
    }
    return count;
  }

  /// Obtient le niveau maximum dans la hiérarchie
  static int getMaxLevel(List<Comment> hierarchy) {
    int maxLevel = 0;
    for (Comment comment in hierarchy) {
      if (comment.level > maxLevel) {
        maxLevel = comment.level;
      }
      if (comment.hasChildren) {
        int childMaxLevel = getMaxLevel(comment.children);
        if (childMaxLevel > maxLevel) {
          maxLevel = childMaxLevel;
        }
      }
    }
    return maxLevel;
  }
} 