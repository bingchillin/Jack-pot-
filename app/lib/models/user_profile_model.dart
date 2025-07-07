class UserProfile {
  final int idPerson;
  final String email;
  final String firstname;
  final String surname;
  final String? numberPhone;
  final String? address;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  UserProfile({
    required this.idPerson,
    required this.email,
    required this.firstname,
    required this.surname,
    this.numberPhone,
    this.address,
    this.createdAt,
    this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      idPerson: json['idPerson'],
      email: json['email'] ?? '',
      firstname: json['firstname'] ?? '',
      surname: json['surname'] ?? '',
      numberPhone: json['numberPhone'],
      address: json['address'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }
} 