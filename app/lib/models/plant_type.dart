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
  
  // pH range
  final double? phMin;
  final double? phMax;
  
  // Conductivity range
  final double? conductivityElectriqueFertilityMin;
  final double? conductivityElectriqueFertilityMax;
  
  // Temperature ranges
  final double? temperatureSensorGroundMin;
  final double? temperatureSensorGroundMax;
  final double? temperatureSensorExternMin;
  final double? temperatureSensorExternMax;
  
  // Humidity ranges
  final double? humidityAirSensorMin;
  final double? humidityAirSensorMax;
  final double? humidityGroundSensorMin;
  final double? humidityGroundSensorMax;
  
  // Light range
  final double? lightSensorMin;
  final double? lightSensorMax;
  
  // Sun exposure range
  final double? expositionTimeSunMin;
  final double? expositionTimeSunMax;
  
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
    this.phMin,
    this.phMax,
    this.conductivityElectriqueFertilityMin,
    this.conductivityElectriqueFertilityMax,
    this.temperatureSensorGroundMin,
    this.temperatureSensorGroundMax,
    this.temperatureSensorExternMin,
    this.temperatureSensorExternMax,
    this.humidityAirSensorMin,
    this.humidityAirSensorMax,
    this.humidityGroundSensorMin,
    this.humidityGroundSensorMax,
    this.lightSensorMin,
    this.lightSensorMax,
    this.expositionTimeSunMin,
    this.expositionTimeSunMax,
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
      
      // pH range
      phMin: json['phMin'] != null ? double.tryParse(json['phMin'].toString()) : null,
      phMax: json['phMax'] != null ? double.tryParse(json['phMax'].toString()) : null,
      
      // Conductivity range
      conductivityElectriqueFertilityMin: json['conductivityElectriqueFertilityMin'] != null ? double.tryParse(json['conductivityElectriqueFertilityMin'].toString()) : null,
      conductivityElectriqueFertilityMax: json['conductivityElectriqueFertilityMax'] != null ? double.tryParse(json['conductivityElectriqueFertilityMax'].toString()) : null,
      
      // Temperature ranges
      temperatureSensorGroundMin: json['temperatureSensorGroundMin'] != null ? double.tryParse(json['temperatureSensorGroundMin'].toString()) : null,
      temperatureSensorGroundMax: json['temperatureSensorGroundMax'] != null ? double.tryParse(json['temperatureSensorGroundMax'].toString()) : null,
      temperatureSensorExternMin: json['temperatureSensorExternMin'] != null ? double.tryParse(json['temperatureSensorExternMin'].toString()) : null,
      temperatureSensorExternMax: json['temperatureSensorExternMax'] != null ? double.tryParse(json['temperatureSensorExternMax'].toString()) : null,
      
      // Humidity ranges
      humidityAirSensorMin: json['humidityAirSensorMin'] != null ? double.tryParse(json['humidityAirSensorMin'].toString()) : null,
      humidityAirSensorMax: json['humidityAirSensorMax'] != null ? double.tryParse(json['humidityAirSensorMax'].toString()) : null,
      humidityGroundSensorMin: json['humidityGroundSensorMin'] != null ? double.tryParse(json['humidityGroundSensorMin'].toString()) : null,
      humidityGroundSensorMax: json['humidityGroundSensorMax'] != null ? double.tryParse(json['humidityGroundSensorMax'].toString()) : null,
      
      // Light range
      lightSensorMin: json['lightSensorMin'] != null ? double.tryParse(json['lightSensorMin'].toString()) : null,
      lightSensorMax: json['lightSensorMax'] != null ? double.tryParse(json['lightSensorMax'].toString()) : null,
      
      // Sun exposure range
      expositionTimeSunMin: json['expositionTimeSunMin'] != null ? double.tryParse(json['expositionTimeSunMin'].toString()) : null,
      expositionTimeSunMax: json['expositionTimeSunMax'] != null ? double.tryParse(json['expositionTimeSunMax'].toString()) : null,
      
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
