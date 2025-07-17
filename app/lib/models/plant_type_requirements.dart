class PlantTypeRequirements {
  final int idPlantType;
  final String title;
  final String? description;
  final String? advise;
  final String? familyName;
  final String? expositionType;
  
  // pH sensor data
  final double? phMin;
  final double? phMax;
  
  // Electrical conductivity (fertility) sensor data
  final double? conductivityElectriqueFertilityMin;
  final double? conductivityElectriqueFertilityMax;
  
  // Ground temperature sensor data
  final double? temperatureSensorGroundMin;
  final double? temperatureSensorGroundMax;
  
  // External temperature sensor data
  final double? temperatureSensorExternMin;
  final double? temperatureSensorExternMax;
  
  // Air humidity sensor data
  final double? humidityAirSensorMin;
  final double? humidityAirSensorMax;
  
  // Ground humidity sensor data
  final double? humidityGroundSensorMin;
  final double? humidityGroundSensorMax;
  
  // Light sensor data
  final double? lightSensorMin;
  final double? lightSensorMax;
  
  // Sun exposure time data
  final double? expositionTimeSunMin;
  final double? expositionTimeSunMax;

  PlantTypeRequirements({
    required this.idPlantType,
    required this.title,
    this.description,
    this.advise,
    this.familyName,
    this.expositionType,
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
  });

  factory PlantTypeRequirements.fromJson(Map<String, dynamic> json) {
    return PlantTypeRequirements(
      idPlantType: json['id_plant_type'] ?? json['idPlantType'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      advise: json['advise'],
      familyName: json['family_name'],
      expositionType: json['exposition_type'],
      phMin: json['ph_min']?.toDouble(),
      phMax: json['ph_max']?.toDouble(),
      conductivityElectriqueFertilityMin: json['conductivity_electrique_fertility_min']?.toDouble(),
      conductivityElectriqueFertilityMax: json['conductivity_electrique_fertility_max']?.toDouble(),
      temperatureSensorGroundMin: json['temperature_sensor_ground_min']?.toDouble(),
      temperatureSensorGroundMax: json['temperature_sensor_ground_max']?.toDouble(),
      temperatureSensorExternMin: json['temperature_sensor_extern_min']?.toDouble(),
      temperatureSensorExternMax: json['temperature_sensor_extern_max']?.toDouble(),
      humidityAirSensorMin: json['humidity_air_sensor_min']?.toDouble(),
      humidityAirSensorMax: json['humidity_air_sensor_max']?.toDouble(),
      humidityGroundSensorMin: json['humidity_ground_sensor_min']?.toDouble(),
      humidityGroundSensorMax: json['humidity_ground_sensor_max']?.toDouble(),
      lightSensorMin: json['light_sensor_min']?.toDouble(),
      lightSensorMax: json['light_sensor_max']?.toDouble(),
      expositionTimeSunMin: json['exposition_time_sun_min']?.toDouble(),
      expositionTimeSunMax: json['exposition_time_sun_max']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_plant_type': idPlantType,
      'title': title,
      'description': description,
      'advise': advise,
      'family_name': familyName,
      'exposition_type': expositionType,
      'ph_min': phMin,
      'ph_max': phMax,
      'conductivity_electrique_fertility_min': conductivityElectriqueFertilityMin,
      'conductivity_electrique_fertility_max': conductivityElectriqueFertilityMax,
      'temperature_sensor_ground_min': temperatureSensorGroundMin,
      'temperature_sensor_ground_max': temperatureSensorGroundMax,
      'temperature_sensor_extern_min': temperatureSensorExternMin,
      'temperature_sensor_extern_max': temperatureSensorExternMax,
      'humidity_air_sensor_min': humidityAirSensorMin,
      'humidity_air_sensor_max': humidityAirSensorMax,
      'humidity_ground_sensor_min': humidityGroundSensorMin,
      'humidity_ground_sensor_max': humidityGroundSensorMax,
      'light_sensor_min': lightSensorMin,
      'light_sensor_max': lightSensorMax,
      'exposition_time_sun_min': expositionTimeSunMin,
      'exposition_time_sun_max': expositionTimeSunMax,
    };
  }

  /// Calculate score for a sensor reading based on plant-specific optimal ranges
  int calculateSensorScore(String sensorType, double reading) {
    switch (sensorType.toLowerCase()) {
      case 'moisture':
      case 'humidity_ground':
        return _calculateRangeScore(reading, humidityGroundSensorMin, humidityGroundSensorMax, sensorType);
      case 'temperature':
      case 'temperature_ground':
        return _calculateRangeScore(reading, temperatureSensorGroundMin, temperatureSensorGroundMax, sensorType);
      case 'temperature_extern':
        return _calculateRangeScore(reading, temperatureSensorExternMin, temperatureSensorExternMax, sensorType);
      case 'light':
        return _calculateRangeScore(reading, lightSensorMin, lightSensorMax, sensorType);
      case 'ph':
        return _calculateRangeScore(reading, phMin, phMax, sensorType);
      case 'humidity_air':
        return _calculateRangeScore(reading, humidityAirSensorMin, humidityAirSensorMax, sensorType);
      case 'conductivity':
        return _calculateRangeScore(reading, conductivityElectriqueFertilityMin, conductivityElectriqueFertilityMax, sensorType);
      case 'exposition_time':
        return _calculateRangeScore(reading, expositionTimeSunMin, expositionTimeSunMax, sensorType);
      default:
        return 0;
    }
  }

  /// Calculate score based on how close a reading is to the optimal range
  /// Uses a more sophisticated algorithm that considers plant-specific tolerances
  int _calculateRangeScore(double reading, double? min, double? max, String sensorType) {
    if (min == null || max == null) {
      // No optimal range defined, return default score
      return _calculateDefaultScore(reading, sensorType);
    }

    // Check if reading is within optimal range
    if (reading >= min && reading <= max) {
      return 10; // Perfect - in optimal range
    }

    // Calculate distance from optimal range
    double distance;
    if (reading < min) {
      distance = min - reading;
    } else {
      distance = reading - max;
    }

    // Calculate range width
    double range = max - min;
    
    // Define tolerance zones based on sensor type and plant requirements
    double criticalZone = range * 0.3; // 30% of optimal range
    double poorZone = range * 0.6;     // 60% of optimal range
    double acceptableZone = range * 1.0; // 100% of optimal range
    double goodZone = range * 0.5;     // 50% of optimal range

    // Score based on distance from optimal range
    if (distance <= goodZone) {
      return 8; // Good - within 50% of optimal range
    } else if (distance <= acceptableZone) {
      return 6; // Acceptable - within 100% of optimal range
    } else if (distance <= poorZone) {
      return 4; // Poor - within 160% of optimal range
    } else if (distance <= criticalZone) {
      return 2; // Critical - within 130% of optimal range
    } else {
      return 0; // Very critical - far from optimal range
    }
  }

  /// Calculate default score when no optimal range is defined
  /// Uses generic ranges that work for most plants
  int _calculateDefaultScore(double reading, String sensorType) {
    switch (sensorType.toLowerCase()) {
      case 'moisture':
      case 'humidity_ground':
        if (reading >= 60 && reading <= 80) return 10;
        if (reading >= 50 && reading <= 90) return 8;
        if (reading >= 40 && reading <= 95) return 6;
        if (reading >= 30 && reading <= 100) return 4;
        return 2;
      case 'temperature':
      case 'temperature_ground':
        if (reading >= 18 && reading <= 26) return 10;
        if (reading >= 15 && reading <= 30) return 8;
        if (reading >= 10 && reading <= 35) return 6;
        if (reading >= 5 && reading <= 40) return 4;
        return 2;
      case 'temperature_extern':
        if (reading >= 18 && reading <= 26) return 10;
        if (reading >= 15 && reading <= 30) return 8;
        if (reading >= 10 && reading <= 35) return 6;
        if (reading >= 5 && reading <= 40) return 4;
        return 2;
      case 'light':
        if (reading >= 50 && reading <= 80) return 10;
        if (reading >= 30 && reading <= 90) return 8;
        if (reading >= 20 && reading <= 95) return 6;
        if (reading >= 10 && reading <= 100) return 4;
        return 2;
      case 'ph':
        if (reading >= 6.0 && reading <= 7.0) return 10;
        if (reading >= 5.5 && reading <= 7.5) return 8;
        if (reading >= 5.0 && reading <= 8.0) return 6;
        if (reading >= 4.5 && reading <= 8.5) return 4;
        return 2;
      case 'humidity_air':
        if (reading >= 40 && reading <= 70) return 10;
        if (reading >= 30 && reading <= 80) return 8;
        if (reading >= 20 && reading <= 90) return 6;
        if (reading >= 10 && reading <= 100) return 4;
        return 2;
      case 'conductivity':
        if (reading >= 750 && reading <= 1200) return 10;
        if (reading >= 500 && reading <= 1500) return 8;
        if (reading >= 300 && reading <= 2000) return 6;
        if (reading >= 100 && reading <= 2500) return 4;
        return 2;
      case 'exposition_time':
        if (reading >= 4 && reading <= 8) return 10;
        if (reading >= 2 && reading <= 10) return 8;
        if (reading >= 1 && reading <= 12) return 6;
        if (reading >= 0 && reading <= 14) return 4;
        return 2;
      default:
        return 5; // Default middle score
    }
  }

  /// Get a description of the optimal conditions for this plant type
  String getOptimalConditionsDescription() {
    List<String> conditions = [];
    
    if (phMin != null && phMax != null) {
      conditions.add('pH: ${phMin!.toStringAsFixed(1)}-${phMax!.toStringAsFixed(1)}');
    }
    
    if (temperatureSensorGroundMin != null && temperatureSensorGroundMax != null) {
      conditions.add('Ground Temperature: ${temperatureSensorGroundMin!.toStringAsFixed(1)}-${temperatureSensorGroundMax!.toStringAsFixed(1)}°C');
    }
    
    if (temperatureSensorExternMin != null && temperatureSensorExternMax != null) {
      conditions.add('Air Temperature: ${temperatureSensorExternMin!.toStringAsFixed(1)}-${temperatureSensorExternMax!.toStringAsFixed(1)}°C');
    }
    
    if (humidityGroundSensorMin != null && humidityGroundSensorMax != null) {
      conditions.add('Ground Humidity: ${humidityGroundSensorMin!.toStringAsFixed(0)}-${humidityGroundSensorMax!.toStringAsFixed(0)}%');
    }
    
    if (humidityAirSensorMin != null && humidityAirSensorMax != null) {
      conditions.add('Air Humidity: ${humidityAirSensorMin!.toStringAsFixed(0)}-${humidityAirSensorMax!.toStringAsFixed(0)}%');
    }
    
    if (lightSensorMin != null && lightSensorMax != null) {
      conditions.add('Light: ${lightSensorMin!.toStringAsFixed(0)}-${lightSensorMax!.toStringAsFixed(0)} lux');
    }
    
    if (expositionTimeSunMin != null && expositionTimeSunMax != null) {
      conditions.add('Sun Exposure: ${expositionTimeSunMin!.toStringAsFixed(1)}-${expositionTimeSunMax!.toStringAsFixed(1)} hours');
    }
    
    if (conditions.isEmpty) {
      return 'Optimal conditions not specified for this plant type.';
    }
    
    return conditions.join(', ');
  }

  /// Check if this plant type has any requirements defined
  bool get hasAnyRequirements {
    return phMin != null || phMax != null ||
           temperatureSensorGroundMin != null || temperatureSensorGroundMax != null ||
           temperatureSensorExternMin != null || temperatureSensorExternMax != null ||
           humidityAirSensorMin != null || humidityAirSensorMax != null ||
           humidityGroundSensorMin != null || humidityGroundSensorMax != null ||
           lightSensorMin != null || lightSensorMax != null ||
           expositionTimeSunMin != null || expositionTimeSunMax != null ||
           conductivityElectriqueFertilityMin != null || conductivityElectriqueFertilityMax != null;
  }

  /// Check if this plant type has complete requirements defined (all sensors)
  bool get hasCompleteRequirements {
    return phMin != null && phMax != null &&
           temperatureSensorGroundMin != null && temperatureSensorGroundMax != null &&
           temperatureSensorExternMin != null && temperatureSensorExternMax != null &&
           humidityAirSensorMin != null && humidityAirSensorMax != null &&
           humidityGroundSensorMin != null && humidityGroundSensorMax != null &&
           lightSensorMin != null && lightSensorMax != null &&
           expositionTimeSunMin != null && expositionTimeSunMax != null &&
           conductivityElectriqueFertilityMin != null && conductivityElectriqueFertilityMax != null;
  }

  /// Get the number of sensors that have requirements defined
  int get definedSensorCount {
    int count = 0;
    if (phMin != null && phMax != null) count++;
    if (temperatureSensorGroundMin != null && temperatureSensorGroundMax != null) count++;
    if (temperatureSensorExternMin != null && temperatureSensorExternMax != null) count++;
    if (humidityAirSensorMin != null && humidityAirSensorMax != null) count++;
    if (humidityGroundSensorMin != null && humidityGroundSensorMax != null) count++;
    if (lightSensorMin != null && lightSensorMax != null) count++;
    if (expositionTimeSunMin != null && expositionTimeSunMax != null) count++;
    if (conductivityElectriqueFertilityMin != null && conductivityElectriqueFertilityMax != null) count++;
    return count;
  }
} 