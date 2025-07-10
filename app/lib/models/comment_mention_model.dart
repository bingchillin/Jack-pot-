// Import du modèle Person existant
import 'comment_model.dart';

class CommentMention {
  final int idMention;
  final int idComment;
  final int idPersonMentioned;
  final Person mentionedPerson;
  final int idPersonMentioner;
  final Person mentionerPerson;
  final int positionStart;
  final int positionEnd;
  final DateTime createdAt;

  CommentMention({
    required this.idMention,
    required this.idComment,
    required this.idPersonMentioned,
    required this.mentionedPerson,
    required this.idPersonMentioner,
    required this.mentionerPerson,
    required this.positionStart,
    required this.positionEnd,
    required this.createdAt,
  });

  factory CommentMention.fromJson(Map<String, dynamic> json) {
    return CommentMention(
      idMention: json['idMention'],
      idComment: json['idComment'],
      idPersonMentioned: json['idPersonMentioned'],
      mentionedPerson: Person.fromJson(json['mentionedPerson']),
      idPersonMentioner: json['idPersonMentioner'],
      mentionerPerson: Person.fromJson(json['mentionerPerson']),
      positionStart: json['positionStart'],
      positionEnd: json['positionEnd'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idMention': idMention,
      'idComment': idComment,
      'idPersonMentioned': idPersonMentioned,
      'mentionedPerson': mentionedPerson.toJson(),
      'idPersonMentioner': idPersonMentioner,
      'mentionerPerson': mentionerPerson.toJson(),
      'positionStart': positionStart,
      'positionEnd': positionEnd,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  CommentMention copyWith({
    int? idMention,
    int? idComment,
    int? idPersonMentioned,
    Person? mentionedPerson,
    int? idPersonMentioner,
    Person? mentionerPerson,
    int? positionStart,
    int? positionEnd,
    DateTime? createdAt,
  }) {
    return CommentMention(
      idMention: idMention ?? this.idMention,
      idComment: idComment ?? this.idComment,
      idPersonMentioned: idPersonMentioned ?? this.idPersonMentioned,
      mentionedPerson: mentionedPerson ?? this.mentionedPerson,
      idPersonMentioner: idPersonMentioner ?? this.idPersonMentioner,
      mentionerPerson: mentionerPerson ?? this.mentionerPerson,
      positionStart: positionStart ?? this.positionStart,
      positionEnd: positionEnd ?? this.positionEnd,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

// Modèle pour les utilisateurs dans les suggestions de mention
class MentionUser {
  final int idPerson;
  final String firstname;
  final String surname;
  final String email;
  final String? username; // Pour l'affichage @username

  MentionUser({
    required this.idPerson,
    required this.firstname,
    required this.surname,
    required this.email,
    this.username,
  });

  factory MentionUser.fromJson(Map<String, dynamic> json) {
    return MentionUser(
      idPerson: json['idPerson'],
      firstname: json['firstname'] ?? '',
      surname: json['surname'] ?? '',
      email: json['email'] ?? '',
      username: json['username'], // Peut être null
    );
  }

  factory MentionUser.fromPerson(Person person) {
    return MentionUser(
      idPerson: person.idPerson,
      firstname: person.firstname,
      surname: person.surname,
      email: person.email,
      username: _generateUsername(person),
    );
  }

  String get displayName => '$firstname $surname'.trim();
  
  String get mentionText => username ?? _generateUsername(this);

  // Génère un username basé sur le nom/email si pas défini
  static String _generateUsername(dynamic person) {
    final firstname = person.firstname?.toLowerCase() ?? '';
    final surname = person.surname?.toLowerCase() ?? '';
    
    if (firstname.isNotEmpty && surname.isNotEmpty) {
      return '${firstname}_${surname}';
    } else if (firstname.isNotEmpty) {
      return firstname;
    } else if (surname.isNotEmpty) {
      return surname;
    } else {
      // Fallback sur l'email
      final email = person.email ?? '';
      final emailParts = email.split('@');
      return emailParts.isNotEmpty ? emailParts[0] : 'user${person.idPerson}';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'idPerson': idPerson,
      'firstname': firstname,
      'surname': surname,
      'email': email,
      'username': username,
    };
  }
}

