class Avatar {
  final int idAvatar;
  final String title;
  final String description;
  final int idPlantType;
  final String advise;
  final String pathPicture;
  final dynamic typeP;
  final dynamic stateP;
  final DateTime createdAt;
  final DateTime updatedAt;

  Avatar({
    required this.idAvatar,
    required this.title,
    required this.description,
    required this.idPlantType,
    required this.advise,
    required this.pathPicture,
    this.typeP,
    this.stateP,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Avatar.fromJson(Map<String, dynamic> json) {
    return Avatar(
      idAvatar: json['idAvatar'],
      title: json['title'],
      description: json['description'],
      idPlantType: json['idPlantType'],
      advise: json['advise'],
      pathPicture: json['pathPicture'],
      typeP: json['type_p'],
      stateP: json['state_p'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
