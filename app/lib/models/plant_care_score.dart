class PlantCareScore {
  final int idPlantCareScore;
  final int idObjectProfile;
  final DateTime scoreDate;
  final int dailyScore;
  final int weeklyScore;
  final int moistureScore;
  final int temperatureScore;
  final int lightScore;
  final int phScore;
  final int consistencyBonus;
  final int improvementBonus;
  final String? dailyMessage;
  final String? weeklyMessage;
  final Map<String, dynamic>? sensorData;
  final bool isPerfectDay;
  final bool isPerfectWeek;
  final DateTime createdAt;
  final DateTime updatedAt;

  PlantCareScore({
    required this.idPlantCareScore,
    required this.idObjectProfile,
    required this.scoreDate,
    required this.dailyScore,
    required this.weeklyScore,
    required this.moistureScore,
    required this.temperatureScore,
    required this.lightScore,
    required this.phScore,
    required this.consistencyBonus,
    required this.improvementBonus,
    this.dailyMessage,
    this.weeklyMessage,
    this.sensorData,
    required this.isPerfectDay,
    required this.isPerfectWeek,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PlantCareScore.fromJson(Map<String, dynamic> json) {
    return PlantCareScore(
      idPlantCareScore: json['idPlantCareScore'] ?? 0,
      idObjectProfile: json['idObjectProfile'] ?? 0,
      scoreDate: DateTime.parse(json['scoreDate']),
      dailyScore: json['dailyScore'] ?? 0,
      weeklyScore: json['weeklyScore'] ?? 0,
      moistureScore: json['moistureScore'] ?? 0,
      temperatureScore: json['temperatureScore'] ?? 0,
      lightScore: json['lightScore'] ?? 0,
      phScore: json['phScore'] ?? 0,
      consistencyBonus: json['consistencyBonus'] ?? 0,
      improvementBonus: json['improvementBonus'] ?? 0,
      dailyMessage: json['dailyMessage'],
      weeklyMessage: json['weeklyMessage'],
      sensorData: json['sensorData'] != null 
          ? Map<String, dynamic>.from(json['sensorData'])
          : null,
      isPerfectDay: json['isPerfectDay'] ?? false,
      isPerfectWeek: json['isPerfectWeek'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idPlantCareScore': idPlantCareScore,
      'idObjectProfile': idObjectProfile,
      'scoreDate': scoreDate.toIso8601String().split('T')[0], // YYYY-MM-DD format
      'dailyScore': dailyScore,
      'weeklyScore': weeklyScore,
      'moistureScore': moistureScore,
      'temperatureScore': temperatureScore,
      'lightScore': lightScore,
      'phScore': phScore,
      'consistencyBonus': consistencyBonus,
      'improvementBonus': improvementBonus,
      'dailyMessage': dailyMessage,
      'weeklyMessage': weeklyMessage,
      'sensorData': sensorData,
      'isPerfectDay': isPerfectDay,
      'isPerfectWeek': isPerfectWeek,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  PlantCareScore copyWith({
    int? idPlantCareScore,
    int? idObjectProfile,
    DateTime? scoreDate,
    int? dailyScore,
    int? weeklyScore,
    int? moistureScore,
    int? temperatureScore,
    int? lightScore,
    int? phScore,
    int? consistencyBonus,
    int? improvementBonus,
    String? dailyMessage,
    String? weeklyMessage,
    Map<String, dynamic>? sensorData,
    bool? isPerfectDay,
    bool? isPerfectWeek,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PlantCareScore(
      idPlantCareScore: idPlantCareScore ?? this.idPlantCareScore,
      idObjectProfile: idObjectProfile ?? this.idObjectProfile,
      scoreDate: scoreDate ?? this.scoreDate,
      dailyScore: dailyScore ?? this.dailyScore,
      weeklyScore: weeklyScore ?? this.weeklyScore,
      moistureScore: moistureScore ?? this.moistureScore,
      temperatureScore: temperatureScore ?? this.temperatureScore,
      lightScore: lightScore ?? this.lightScore,
      phScore: phScore ?? this.phScore,
      consistencyBonus: consistencyBonus ?? this.consistencyBonus,
      improvementBonus: improvementBonus ?? this.improvementBonus,
      dailyMessage: dailyMessage ?? this.dailyMessage,
      weeklyMessage: weeklyMessage ?? this.weeklyMessage,
      sensorData: sensorData ?? this.sensorData,
      isPerfectDay: isPerfectDay ?? this.isPerfectDay,
      isPerfectWeek: isPerfectWeek ?? this.isPerfectWeek,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class DailyScoreCalculation {
  final int dailyScore;
  final int moistureScore;
  final int temperatureScore;
  final int lightScore;
  final int phScore;
  final int consistencyBonus;
  final String dailyMessage;
  final bool isPerfectDay;

  DailyScoreCalculation({
    required this.dailyScore,
    required this.moistureScore,
    required this.temperatureScore,
    required this.lightScore,
    required this.phScore,
    required this.consistencyBonus,
    required this.dailyMessage,
    required this.isPerfectDay,
  });

  factory DailyScoreCalculation.fromJson(Map<String, dynamic> json) {
    return DailyScoreCalculation(
      dailyScore: json['dailyScore'] ?? 0,
      moistureScore: json['moistureScore'] ?? 0,
      temperatureScore: json['temperatureScore'] ?? 0,
      lightScore: json['lightScore'] ?? 0,
      phScore: json['phScore'] ?? 0,
      consistencyBonus: json['consistencyBonus'] ?? 0,
      dailyMessage: json['dailyMessage'] ?? '',
      isPerfectDay: json['isPerfectDay'] ?? false,
    );
  }
}

class WeeklyScoreCalculation {
  final int weeklyScore;
  final int improvementBonus;
  final String weeklyMessage;
  final bool isPerfectWeek;

  WeeklyScoreCalculation({
    required this.weeklyScore,
    required this.improvementBonus,
    required this.weeklyMessage,
    required this.isPerfectWeek,
  });

  factory WeeklyScoreCalculation.fromJson(Map<String, dynamic> json) {
    return WeeklyScoreCalculation(
      weeklyScore: json['weeklyScore'] ?? 0,
      improvementBonus: json['improvementBonus'] ?? 0,
      weeklyMessage: json['weeklyMessage'] ?? '',
      isPerfectWeek: json['isPerfectWeek'] ?? false,
    );
  }
} 