class ObjectModel {
  final int idObject;
  final String title;
  final String? description;

  ObjectModel({
    required this.idObject,
    required this.title,
    this.description,
  });

  factory ObjectModel.fromJson(Map<String, dynamic> json) => ObjectModel(
    idObject: json['idObject'],
    title: json['title'],
    description: json['description'],
  );
}
