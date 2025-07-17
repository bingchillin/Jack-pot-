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
    phGroundSensor: json['phGroundSensor'] != null ? double.tryParse(json['phGroundSensor'].toString()) : null,
    conductivityElectriqueFertilitySensor: json['conductivityElectriqueFertilitySensor'] != null ? double.tryParse(json['conductivityElectriqueFertilitySensor'].toString()) : null,
    lightSensor: json['lightSensor'] != null ? double.tryParse(json['lightSensor'].toString()) : null,
    temperatureSensorGround: json['temperatureSensorGround'] != null ? double.tryParse(json['temperatureSensorGround'].toString()) : null,
    temperatureSensorExtern: json['temperatureSensorExtern'] != null ? double.tryParse(json['temperatureSensorExtern'].toString()) : null,
    humidityAirSensor: json['humidityAirSensor'] != null ? double.tryParse(json['humidityAirSensor'].toString()) : null,
    humidityGroundSensor: json['humidityGroundSensor'] != null ? double.tryParse(json['humidityGroundSensor'].toString()) : null,
    expositionTimeSun: json['expositionTimeSun'] != null ? double.tryParse(json['expositionTimeSun'].toString()) : null,
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
