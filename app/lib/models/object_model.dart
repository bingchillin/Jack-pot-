class ObjectModel {
  final int idObject;
  final String title;

  ObjectModel({
    required this.idObject,
    required this.title
  });

  factory ObjectModel.fromJson(Map<String, dynamic> json) => ObjectModel(
    idObject: json['idObject'],
    title: json['title'],
  );
}
