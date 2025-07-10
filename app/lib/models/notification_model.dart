class NotificationModel {
  final int idNotification;
  final String? title;
  final String? description;
  final String? advise;
  final int? idPerson;
  final int? idObject;
  final bool isRead;
  final String notificationType;
  final int? idComment;
  final int? idTriggeringPerson;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Related objects
  final Person? person;
  final PlantObject? object;
  final Person? triggeringPerson;

  NotificationModel({
    required this.idNotification,
    this.title,
    this.description,
    this.advise,
    this.idPerson,
    this.idObject,
    required this.isRead,
    required this.notificationType,
    this.idComment,
    this.idTriggeringPerson,
    required this.createdAt,
    required this.updatedAt,
    this.person,
    this.object,
    this.triggeringPerson,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      idNotification: json['idNotification'] ?? 0,
      title: json['title'],
      description: json['description'],
      advise: json['advise'],
      idPerson: json['idPerson'],
      idObject: json['idObject'],
      isRead: json['isRead'] ?? false,
      notificationType: json['notificationType'] ?? 'plant_care',
      idComment: json['idComment'],
      idTriggeringPerson: json['idTriggeringPerson'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      person: json['person'] != null ? Person.fromJson(json['person']) : null,
      object: json['object'] != null ? PlantObject.fromJson(json['object']) : null,
      triggeringPerson: json['triggeringPerson'] != null 
        ? Person.fromJson(json['triggeringPerson']) 
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idNotification': idNotification,
      'title': title,
      'description': description,
      'advise': advise,
      'idPerson': idPerson,
      'idObject': idObject,
      'isRead': isRead,
      'notificationType': notificationType,
      'idComment': idComment,
      'idTriggeringPerson': idTriggeringPerson,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      if (person != null) 'person': person!.toJson(),
      if (object != null) 'object': object!.toJson(),
      if (triggeringPerson != null) 'triggeringPerson': triggeringPerson!.toJson(),
    };
  }

  NotificationModel copyWith({
    int? idNotification,
    String? title,
    String? description,
    String? advise,
    int? idPerson,
    int? idObject,
    bool? isRead,
    String? notificationType,
    int? idComment,
    int? idTriggeringPerson,
    DateTime? createdAt,
    DateTime? updatedAt,
    Person? person,
    PlantObject? object,
    Person? triggeringPerson,
  }) {
    return NotificationModel(
      idNotification: idNotification ?? this.idNotification,
      title: title ?? this.title,
      description: description ?? this.description,
      advise: advise ?? this.advise,
      idPerson: idPerson ?? this.idPerson,
      idObject: idObject ?? this.idObject,
      isRead: isRead ?? this.isRead,
      notificationType: notificationType ?? this.notificationType,
      idComment: idComment ?? this.idComment,
      idTriggeringPerson: idTriggeringPerson ?? this.idTriggeringPerson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      person: person ?? this.person,
      object: object ?? this.object,
      triggeringPerson: triggeringPerson ?? this.triggeringPerson,
    );
  }

  // Helper getters
  bool get isPlantNotification => notificationType == 'plant_care';
  bool get isSocialNotification => ['comment_like', 'comment_mention', 'comment_reply'].contains(notificationType);
  bool get isLikeNotification => notificationType == 'comment_like';
  bool get isMentionNotification => notificationType == 'comment_mention';
  bool get isReplyNotification => notificationType == 'comment_reply';

  String get notificationIcon {
    switch (notificationType) {
      case 'comment_like':
        return '❤️';
      case 'comment_mention':
        return '@';
      case 'comment_reply':
        return '💬';
      case 'plant_care':
      default:
        return '🌱';
    }
  }

  String get triggeringPersonDisplayName {
    if (triggeringPerson == null) return 'Utilisateur inconnu';
    
    if (triggeringPerson!.firstname != null && triggeringPerson!.surname != null) {
      return '${triggeringPerson!.firstname} ${triggeringPerson!.surname}';
    }
    
    return triggeringPerson!.email.split('@')[0];
  }
}

// Helper classes (you may already have these)
class Person {
  final int idPerson;
  final String email;
  final String? firstname;
  final String? surname;

  Person({
    required this.idPerson,
    required this.email,
    this.firstname,
    this.surname,
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      idPerson: json['idPerson'] ?? 0,
      email: json['email'] ?? '',
      firstname: json['firstname'],
      surname: json['surname'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idPerson': idPerson,
      'email': email,
      'firstname': firstname,
      'surname': surname,
    };
  }
}

class PlantObject {
  final int idObject;
  final String? title;

  PlantObject({
    required this.idObject,
    this.title,
  });

  factory PlantObject.fromJson(Map<String, dynamic> json) {
    return PlantObject(
      idObject: json['idObject'] ?? 0,
      title: json['title'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idObject': idObject,
      'title': title,
    };
  }
} 