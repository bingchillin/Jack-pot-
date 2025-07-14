import 'package:equatable/equatable.dart';

abstract class PlantCareScoreEvent extends Equatable {
  const PlantCareScoreEvent();
  @override
  List<Object?> get props => [];
}

class LoadPlantCareScores extends PlantCareScoreEvent {
  final int plantId;
  final String token;
  
  const LoadPlantCareScores(this.plantId, this.token);
  @override
  List<Object?> get props => [plantId, token];
}

class RefreshPlantCareScores extends PlantCareScoreEvent {
  final int plantId;
  final String token;
  
  const RefreshPlantCareScores(this.plantId, this.token);
  @override
  List<Object?> get props => [plantId, token];
}

class CreatePlantCareScore extends PlantCareScoreEvent {
  final int plantId;
  final String token;
  final double moistureScore;
  final double temperatureScore;
  final double lightScore;
  final double phScore;
  final String? notes;
  
  const CreatePlantCareScore({
    required this.plantId,
    required this.token,
    required this.moistureScore,
    required this.temperatureScore,
    required this.lightScore,
    required this.phScore,
    this.notes,
  });
  
  @override
  List<Object?> get props => [plantId, token, moistureScore, temperatureScore, lightScore, phScore, notes];
}

class LoadPlantCareStats extends PlantCareScoreEvent {
  final int plantId;
  final String token;
  final DateTime? startDate;
  final DateTime? endDate;
  
  const LoadPlantCareStats(this.plantId, this.token, {this.startDate, this.endDate});
  @override
  List<Object?> get props => [plantId, token, startDate, endDate];
} 