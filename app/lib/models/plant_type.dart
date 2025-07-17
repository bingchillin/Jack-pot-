import 'avatar.dart';

class PlantType {
  final int idPlantType;
  final String title;
  final String? description;
  final String? advise;
  final String? scientistName;
  final String? familyName;
  final String? typeName;
  final String? expositionType;
  final String? groundType;
  final double? phGroundSensor;
  final double? conductivityElectriqueFertilitySensor;
  final double? lightSensor;
  final double? temperatureSensorGround;
  final double? temperatureSensorExtern;
  final double? humidityAirSensor;
  final double? humidityGroundSensor;
  final double? expositionTimeSun;
  final String? pathPicture;

  final List<Avatar> avatars;


  PlantType({
    required this.idPlantType,
    required this.title,
    this.description,
    this.advise,
    this.scientistName,
    this.familyName,
    this.typeName,
    this.expositionType,
    this.groundType,
    this.phGroundSensor,
    this.conductivityElectriqueFertilitySensor,
    this.lightSensor,
    this.temperatureSensorGround,
    this.temperatureSensorExtern,
    this.humidityAirSensor,
    this.humidityGroundSensor,
    this.expositionTimeSun,
    this.pathPicture,

    required this.avatars,
  });

  factory PlantType.fromJson(Map<String, dynamic> json) {
    return PlantType(
    idPlantType: json['idPlantType'],
    title: json['title'],
    description: json['description'],
    advise: json['advise'],
    scientistName: json['scientistName'],
    familyName: json['familyName'],
    typeName: json['typeName'],
    expositionType: json['expositionType'],
    groundType: json['groundType'],
    phGroundSensor: double.tryParse(json['phGroundSensor'] ?? ''),
    conductivityElectriqueFertilitySensor:
    double.tryParse(json['conductivityElectriqueFertilitySensor'] ?? ''),
    lightSensor: double.tryParse(json['lightSensor'] ?? ''),
    temperatureSensorGround: double.tryParse(json['temperatureSensorGround'] ?? ''),
    temperatureSensorExtern: double.tryParse(json['temperatureSensorExtern'] ?? ''),
    humidityAirSensor: double.tryParse(json['humidityAirSensor'] ?? ''),
    humidityGroundSensor: double.tryParse(json['humidityGroundSensor'] ?? ''),
    expositionTimeSun: double.tryParse(json['expositionTimeSun'] ?? ''),
    pathPicture: json['pathPicture'],
    avatars: (json['avatars'] as List<dynamic>?)
        ?.map((avatarJson) {
          return Avatar.fromJson(avatarJson);
        })
        .toList() ??
        [],
    );
  }
}
