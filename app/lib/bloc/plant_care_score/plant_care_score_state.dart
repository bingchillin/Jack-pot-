import 'package:equatable/equatable.dart';
import '../../models/plant_care_score.dart';

abstract class PlantCareScoreState extends Equatable {
  const PlantCareScoreState();
  @override
  List<Object?> get props => [];
}

class PlantCareScoreInitial extends PlantCareScoreState {}

class PlantCareScoreLoading extends PlantCareScoreState {}

class PlantCareScoreLoaded extends PlantCareScoreState {
  final List<PlantCareScore> scores;
  final PlantCareStats? stats;
  
  const PlantCareScoreLoaded(this.scores, {this.stats});
  @override
  List<Object?> get props => [scores, stats];
}

class PlantCareScoreCreated extends PlantCareScoreState {
  final PlantCareScore score;
  
  const PlantCareScoreCreated(this.score);
  @override
  List<Object?> get props => [score];
}

class PlantCareScoreError extends PlantCareScoreState {
  final String message;
  
  const PlantCareScoreError(this.message);
  @override
  List<Object?> get props => [message];
}

class PlantCareStats {
  final double averageScore;
  final int totalScores;
  final int currentStreak;
  final int bestStreak;
  final List<double> weeklyAverages;
  final String scoreMessage;
  final String trendMessage;
  
  const PlantCareStats({
    required this.averageScore,
    required this.totalScores,
    required this.currentStreak,
    required this.bestStreak,
    required this.weeklyAverages,
    required this.scoreMessage,
    required this.trendMessage,
  });
} 