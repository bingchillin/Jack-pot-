enum ContactStatus {
  pending('pending'),
  accepted('accepted'),
  rejected('rejected'),
  blocked('blocked');

  const ContactStatus(this.value);
  final String value;

  static ContactStatus fromString(String value) {
    switch (value) {
      case 'pending':
        return ContactStatus.pending;
      case 'accepted':
        return ContactStatus.accepted;
      case 'rejected':
        return ContactStatus.rejected;
      case 'blocked':
        return ContactStatus.blocked;
      default:
        throw ArgumentError('Unknown ContactStatus: $value');
    }
  }
}

class ContactUser {
  final int id;
  final String email;
  final String firstname;
  final String surname;

  ContactUser({
    required this.id,
    required this.email,
    required this.firstname,
    required this.surname,
  });

  factory ContactUser.fromJson(Map<String, dynamic> json) {
    return ContactUser(
      id: json['id'],
      email: json['email'],
      firstname: json['firstname'],
      surname: json['surname'],
    );
  }

  String get displayName => '$firstname $surname'.trim();
}

class Contact {
  final int id;
  final int requesterId;
  final int receiverId;
  final ContactStatus status;
  final int? blockedBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final ContactUser? requester;
  final ContactUser? receiver;

  Contact({
    required this.id,
    required this.requesterId,
    required this.receiverId,
    required this.status,
    this.blockedBy,
    required this.createdAt,
    required this.updatedAt,
    this.requester,
    this.receiver,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'],
      requesterId: json['requesterId'],
      receiverId: json['receiverId'],
      status: ContactStatus.fromString(json['status']),
      blockedBy: json['blockedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      requester: json['requester'] != null 
          ? ContactUser.fromJson(json['requester']) 
          : null,
      receiver: json['receiver'] != null 
          ? ContactUser.fromJson(json['receiver']) 
          : null,
    );
  }

  Contact copyWith({
    int? id,
    int? requesterId,
    int? receiverId,
    ContactStatus? status,
    int? blockedBy,
    DateTime? createdAt,
    DateTime? updatedAt,
    ContactUser? requester,
    ContactUser? receiver,
  }) {
    return Contact(
      id: id ?? this.id,
      requesterId: requesterId ?? this.requesterId,
      receiverId: receiverId ?? this.receiverId,
      status: status ?? this.status,
      blockedBy: blockedBy ?? this.blockedBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      requester: requester ?? this.requester,
      receiver: receiver ?? this.receiver,
    );
  }

  // Helper methods
  bool get isPending => status == ContactStatus.pending;
  bool get isAccepted => status == ContactStatus.accepted;
  bool get isRejected => status == ContactStatus.rejected;
  bool get isBlocked => status == ContactStatus.blocked;

  // Get the other user in the relationship
  ContactUser? getOtherUser(int currentUserId) {
    if (requesterId == currentUserId) {
      return receiver;
    } else if (receiverId == currentUserId) {
      return requester;
    }
    return null;
  }

  // Check if current user is the requester
  bool isRequesterCurrentUser(int currentUserId) {
    return requesterId == currentUserId;
  }
} 