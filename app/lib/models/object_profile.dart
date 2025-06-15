import 'object_model.dart';
import 'plant_type.dart';

class ObjectProfile {
  final int idObjectProfile;
  final String title;
  final String description;
  final int? state;
  final bool? isAutomatic;
  final bool? isWillWatering;
  final ObjectModel object;
  final PlantType plantType;

  ObjectProfile({
    required this.idObjectProfile,
    required this.title,
    required this.description,
    this.state,
    this.isAutomatic,
    this.isWillWatering,
    required this.object,
    required this.plantType,
  });

  factory ObjectProfile.fromJson(Map<String, dynamic> json) => ObjectProfile(
    idObjectProfile: json['idObjectProfile'],
    title: json['title'],
    description: json['description'],
    state: json['state'],
    isAutomatic: json['isAutomatic'],
    isWillWatering: json['isWillWatering'],
    object: ObjectModel.fromJson(json['object']),
    plantType: PlantType.fromJson(json['plantType']),
  );


  ObjectProfile copyWith({
    int? idObjectProfile,
    String? title,
    String? description,
    int? state,
    bool? isAutomatic,
    bool? isWillWatering,
    ObjectModel? object,
    PlantType? plantType,
  }) {
    return ObjectProfile(
      idObjectProfile: idObjectProfile ?? this.idObjectProfile,
      title: title ?? this.title,
      description: description ?? this.description,
      state: state ?? this.state,
      isAutomatic: isAutomatic ?? this.isAutomatic,
      isWillWatering: isWillWatering ?? this.isWillWatering,
      object: object ?? this.object,
      plantType: plantType ?? this.plantType,
    );
  }

}

String getStateText(int? state) {
  switch (state) {
    case 0: return "Parfait pour moi";
    case 1: return "Je vais très bien";
    case 2: return "Je vais bien";
    case 3: return "Je suis ok";
    case 4: return "Je me sens moyen";
    case 5: return "Critique ! URGENT !";
    default: return "État inconnu";
  }
}