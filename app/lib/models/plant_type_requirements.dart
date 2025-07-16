class PlantTypeRequirements {
  final int idPlantType;
  final String title;
  final String? description;
  final String? advise;
  final double? optimalMoistureMin;
  final double? optimalMoistureMax;
  final double? optimalTemperatureMin;
  final double? optimalTemperatureMax;
  final double? optimalLightMin;
  final double? optimalLightMax;
  final double? phMin;
  final double? phMax;
  final String? scientistName;
  final String? familyName;
  final String? typeName;
  final String? expositionType;
  final String? groundType;

  PlantTypeRequirements({
    required this.idPlantType,
    required this.title,
    this.description,
    this.advise,
    this.optimalMoistureMin,
    this.optimalMoistureMax,
    this.optimalTemperatureMin,
    this.optimalTemperatureMax,
    this.optimalLightMin,
    this.optimalLightMax,
    this.phMin,
    this.phMax,
    this.scientistName,
    this.familyName,
    this.typeName,
    this.expositionType,
    this.groundType,
  });

  factory PlantTypeRequirements.fromJson(Map<String, dynamic> json) {
    return PlantTypeRequirements(
      idPlantType: json['id_plant_type'] ?? json['idPlantType'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      advise: json['advise'],
      optimalMoistureMin: json['optimal_moisture_min']?.toDouble(),
      optimalMoistureMax: json['optimal_moisture_max']?.toDouble(),
      optimalTemperatureMin: json['optimal_temperature_min']?.toDouble(),
      optimalTemperatureMax: json['optimal_temperature_max']?.toDouble(),
      optimalLightMin: json['optimal_light_min']?.toDouble(),
      optimalLightMax: json['optimal_light_max']?.toDouble(),
      phMin: json['ph_min']?.toDouble(),
      phMax: json['ph_max']?.toDouble(),
      scientistName: json['scientist_name'],
      familyName: json['family_name'],
      typeName: json['type_name'],
      expositionType: json['exposition_type'],
      groundType: json['ground_type'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_plant_type': idPlantType,
      'title': title,
      'description': description,
      'advise': advise,
      'optimal_moisture_min': optimalMoistureMin,
      'optimal_moisture_max': optimalMoistureMax,
      'optimal_temperature_min': optimalTemperatureMin,
      'optimal_temperature_max': optimalTemperatureMax,
      'optimal_light_min': optimalLightMin,
      'optimal_light_max': optimalLightMax,
      'ph_min': phMin,
      'ph_max': phMax,
      'scientist_name': scientistName,
      'family_name': familyName,
      'type_name': typeName,
      'exposition_type': expositionType,
      'ground_type': groundType,
    };
  }

  /// Calculate score for a sensor reading based on optimal ranges
  int calculateSensorScore(String sensorType, double reading) {
    switch (sensorType.toLowerCase()) {
      case 'moisture':
        return _calculateRangeScore(reading, optimalMoistureMin, optimalMoistureMax, sensorType);
      case 'temperature':
        return _calculateRangeScore(reading, optimalTemperatureMin, optimalTemperatureMax, sensorType);
      case 'light':
        return _calculateRangeScore(reading, optimalLightMin, optimalLightMax, sensorType);
      case 'ph':
        return _calculateRangeScore(reading, phMin, phMax, sensorType);
      default:
        return 0;
    }
  }

  /// Calculate score based on how close a reading is to the optimal range
  int _calculateRangeScore(double reading, double? min, double? max, String sensorType) {
    if (min == null || max == null) {
      // No optimal range defined, return default score
      return _calculateDefaultScore(reading, sensorType);
    }

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

    // Calculate percentage of acceptable range
    double range = max - min;
    double acceptableRange = range * 0.5; // 50% of optimal range is acceptable

    if (distance <= acceptableRange) {
      return 8; // Good - within acceptable range
    } else if (distance <= range) {
      return 6; // Acceptable - within 100% of optimal range
    } else if (distance <= range * 1.5) {
      return 4; // Poor - within 150% of optimal range
    } else {
      return 2; // Critical - far from optimal range
    }
  }

  /// Calculate default score when no optimal range is defined
  int _calculateDefaultScore(double reading, String sensorType) {
    switch (sensorType.toLowerCase()) {
      case 'moisture':
        if (reading >= 60 && reading <= 80) return 10;
        if (reading >= 50 && reading <= 90) return 8;
        if (reading >= 40 && reading <= 95) return 6;
        if (reading >= 30 && reading <= 100) return 4;
        return 2;
      case 'temperature':
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
      default:
        return 5; // Default middle score
    }
  }

  /// Get a description of the optimal conditions for this plant type
  String getOptimalConditionsDescription() {
    List<String> conditions = [];
    
    if (optimalMoistureMin != null && optimalMoistureMax != null) {
      conditions.add('Moisture: ${optimalMoistureMin!.toStringAsFixed(0)}-${optimalMoistureMax!.toStringAsFixed(0)}%');
    }
    
    if (optimalTemperatureMin != null && optimalTemperatureMax != null) {
      conditions.add('Temperature: ${optimalTemperatureMin!.toStringAsFixed(1)}-${optimalTemperatureMax!.toStringAsFixed(1)}°C');
    }
    
    if (optimalLightMin != null && optimalLightMax != null) {
      conditions.add('Light: ${optimalLightMin!.toStringAsFixed(0)}-${optimalLightMax!.toStringAsFixed(0)}%');
    }
    
    if (phMin != null && phMax != null) {
      conditions.add('pH: ${phMin!.toStringAsFixed(1)}-${phMax!.toStringAsFixed(1)}');
    }
    
    if (conditions.isEmpty) {
      return 'Optimal conditions not specified for this plant type.';
    }
    
    return conditions.join(', ');
  }

  /// Check if this plant type has complete requirements defined
  bool get hasCompleteRequirements {
    return optimalMoistureMin != null && 
           optimalMoistureMax != null && 
           optimalTemperatureMin != null && 
           optimalTemperatureMax != null && 
           optimalLightMin != null && 
           optimalLightMax != null && 
           phMin != null && 
           phMax != null;
  }
} 