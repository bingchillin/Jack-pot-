class Comment {
  final int idComment;
  final String content;
  final int idPerson;
  final Person person;
  final int? parentCommentId;
  final bool isDeleted;
  final DateTime? deletedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int likeCount;
  final int replyCount;
  final bool isLikedByCurrentUser;
  final List<Comment> replies;

  Comment({
    required this.idComment,
    required this.content,
    required this.idPerson,
    required this.person,
    this.parentCommentId,
    required this.isDeleted,
    this.deletedAt,
    required this.createdAt,
    required this.updatedAt,
    this.likeCount = 0,
    this.replyCount = 0,
    this.isLikedByCurrentUser = false,
    this.replies = const [],
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    // Créer un objet Person par défaut si les informations ne sont pas disponibles
    Person person;
    if (json['person'] != null) {
      person = Person.fromJson(json['person']);
    } else {
      // Créer un objet Person par défaut avec les informations disponibles
      person = Person(
        idPerson: json['idPerson'],
        firstname: 'Utilisateur',
        surname: json['idPerson'].toString(),
        email: '',
      );
    }

    return Comment(
      idComment: json['idComment'],
      content: json['content'],
      idPerson: json['idPerson'],
      person: person,
      parentCommentId: json['parentCommentId'] is int
          ? json['parentCommentId']
          : (json['parentComment'] != null && json['parentComment']['idComment'] is int
              ? json['parentComment']['idComment']
              : null),
      isDeleted: json['isDeleted'] ?? false,
      deletedAt: json['deletedAt'] != null ? DateTime.parse(json['deletedAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      likeCount: 0, // Non disponible dans l'API
      replyCount: json['replyCount'] ?? 0,
      isLikedByCurrentUser: false, // Non disponible dans l'API
      replies: [], // Les réponses sont chargées séparément
    );
  }

  Comment copyWith({
    int? idComment,
    String? content,
    int? idPerson,
    Person? person,
    int? parentCommentId,
    bool? isDeleted,
    DateTime? deletedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? likeCount,
    int? replyCount,
    bool? isLikedByCurrentUser,
    List<Comment>? replies,
  }) {
    return Comment(
      idComment: idComment ?? this.idComment,
      content: content ?? this.content,
      idPerson: idPerson ?? this.idPerson,
      person: person ?? this.person,
      parentCommentId: parentCommentId ?? this.parentCommentId,
      isDeleted: isDeleted ?? this.isDeleted,
      deletedAt: deletedAt ?? this.deletedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      likeCount: likeCount ?? this.likeCount,
      replyCount: replyCount ?? this.replyCount,
      isLikedByCurrentUser: isLikedByCurrentUser ?? this.isLikedByCurrentUser,
      replies: replies ?? this.replies,
    );
  }
}

class Person {
  final int idPerson;
  final String firstname;
  final String surname;
  final String email;

  Person({
    required this.idPerson,
    required this.firstname,
    required this.surname,
    required this.email,
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      idPerson: json['idPerson'],
      firstname: json['firstname'] ?? '',
      surname: json['surname'] ?? '',
      email: json['email'] ?? '',
    );
  }

  String get displayName => '$firstname $surname'.trim();
} 