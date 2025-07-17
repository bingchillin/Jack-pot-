class Avatar {
  final int idAvatar;
  final String? title;
  final String? description;
  final int idPlantType;
  final String? advise;
  final String pathPicture;
  final int? typeP;
  final int? stateP;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Avatar({
    required this.idAvatar,
    this.title,
    this.description,
    required this.idPlantType,
    this.advise,
    required this.pathPicture,
    this.typeP,
    this.stateP,
    this.createdAt,
    this.updatedAt,
  });

  factory Avatar.fromJson(Map<String, dynamic> json) {
    return Avatar(
      idAvatar: json['idAvatar'],
      title: json['title'],
      description: json['description'],
      idPlantType: json['idPlantType'],
      advise: json['advise'],
      pathPicture: json['pathPicture'],
      typeP: json['type_p'] is int ? json['type_p'] : int.tryParse(json['type_p'].toString()) ?? 0,
      stateP: json['state_p'] is int ? json['state_p'] : int.tryParse(json['state_p'].toString()) ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
