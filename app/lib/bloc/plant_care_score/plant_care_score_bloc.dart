import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/plant_care_score.dart';
import '../../services/plant_care_score_service.dart';
import 'plant_care_score_event.dart';
import 'plant_care_score_state.dart';

class PlantCareScoreBloc extends Bloc<PlantCareScoreEvent, PlantCareScoreState> {
  final PlantCareScoreService service;
  final int plantId;
  final String token;

  List<PlantCareScore> _currentScores = [];
  PlantCareStats? _currentStats;
  Timer? _pollingTimer;

  PlantCareScoreBloc({
    required this.service,
    required this.plantId,
    required this.token,
  }) : super(PlantCareScoreInitial()) {
    on<LoadPlantCareScores>(_onLoadPlantCareScores);
    on<RefreshPlantCareScores>(_onRefreshPlantCareScores);
    on<CreatePlantCareScore>(_onCreatePlantCareScore);
    on<LoadPlantCareStats>(_onLoadPlantCareStats);

    // Start polling every 30 seconds for fresh data
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      add(RefreshPlantCareScores(plantId, token));
    });

    // Load initial data
    add(LoadPlantCareScores(plantId, token));
  }

  Future<void> _onLoadPlantCareScores(LoadPlantCareScores event, Emitter<PlantCareScoreState> emit) async {
    try {
      emit(PlantCareScoreLoading());
      
      // Get scores for the last 30 days
      final today = DateTime.now();
      final thirtyDaysAgo = today.subtract(const Duration(days: 30));
      final scores = await service.getScoresByRange(event.plantId, thirtyDaysAgo, today, event.token);
      _currentScores = scores;
      
      // Calculate stats
      final stats = _calculateStats(scores);
      _currentStats = stats;
      
      emit(PlantCareScoreLoaded(scores, stats: stats));
    } catch (e) {
      emit(PlantCareScoreError(e.toString()));
    }
  }

  Future<void> _onRefreshPlantCareScores(RefreshPlantCareScores event, Emitter<PlantCareScoreState> emit) async {
    try {
      final today = DateTime.now();
      final thirtyDaysAgo = today.subtract(const Duration(days: 30));
      final scores = await service.getScoresByRange(event.plantId, thirtyDaysAgo, today, event.token);
      
      // Only emit if data has changed
      if (!_areScoresEqual(_currentScores, scores)) {
        _currentScores = scores;
        final stats = _calculateStats(scores);
        _currentStats = stats;
        emit(PlantCareScoreLoaded(scores, stats: stats));
      }
    } catch (e) {
      // Don't emit error on refresh to avoid disrupting UI
      print('Error refreshing plant care scores: $e');
    }
  }

  Future<void> _onCreatePlantCareScore(CreatePlantCareScore event, Emitter<PlantCareScoreState> emit) async {
    try {
      // Create a new plant care score
      final score = PlantCareScore(
        idPlantCareScore: 0,
        idObjectProfile: event.plantId,
        scoreDate: DateTime.now(),
        dailyScore: 0, // Will be calculated by backend
        weeklyScore: 0,
        moistureScore: event.moistureScore.toInt(),
        temperatureScore: event.temperatureScore.toInt(),
        lightScore: event.lightScore.toInt(),
        phScore: event.phScore.toInt(),
        consistencyBonus: 0,
        improvementBonus: 0,
        dailyMessage: event.notes,
        weeklyMessage: null,
        sensorData: null,
        isPerfectDay: false,
        isPerfectWeek: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final newScore = await service.createScore(score, event.token);
      emit(PlantCareScoreCreated(newScore));
      
      // Refresh the list to include the new score
      add(RefreshPlantCareScores(plantId, token));
    } catch (e) {
      emit(PlantCareScoreError(e.toString()));
    }
  }

  Future<void> _onLoadPlantCareStats(LoadPlantCareStats event, Emitter<PlantCareScoreState> emit) async {
    try {
      final startDate = event.startDate ?? DateTime.now().subtract(const Duration(days: 30));
      final endDate = event.endDate ?? DateTime.now();
      final scores = await service.getScoresByRange(event.plantId, startDate, endDate, event.token);
      final stats = _calculateStats(scores, startDate: startDate, endDate: endDate);
      
      emit(PlantCareScoreLoaded(scores, stats: stats));
    } catch (e) {
      emit(PlantCareScoreError(e.toString()));
    }
  }

  PlantCareStats _calculateStats(List<PlantCareScore> scores, {DateTime? startDate, DateTime? endDate}) {
    if (scores.isEmpty) {
      return const PlantCareStats(
        averageScore: 0.0,
        totalScores: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyAverages: [],
        scoreMessage: 'No data available',
        trendMessage: 'Start tracking your plant care!',
      );
    }

    // Filter scores by date range if provided
    List<PlantCareScore> filteredScores = scores;
    if (startDate != null || endDate != null) {
      filteredScores = scores.where((score) {
        final scoreDate = score.createdAt;
        if (startDate != null && scoreDate.isBefore(startDate)) return false;
        if (endDate != null && scoreDate.isAfter(endDate)) return false;
        return true;
      }).toList();
    }

    if (filteredScores.isEmpty) {
      return const PlantCareStats(
        averageScore: 0.0,
        totalScores: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyAverages: [],
        scoreMessage: 'No data in selected period',
        trendMessage: 'No trends available',
      );
    }

    // Calculate average score
    final totalScore = filteredScores.fold<double>(0.0, (sum, score) => sum + score.dailyScore);
    final averageScore = totalScore / filteredScores.length;

    // Calculate streaks
    final sortedScores = List<PlantCareScore>.from(filteredScores)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    // Calculate current streak (consecutive days with 20+ points)
    int currentStreak = 0;
    for (final score in sortedScores) {
      if (score.dailyScore >= 20) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    int bestStreak = 0;
    int tempStreak = 0;
    for (final score in sortedScores) {
      if (score.dailyScore >= 20) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Calculate weekly averages (last 4 weeks)
    final weeklyAverages = _calculateWeeklyAverages(sortedScores, weeks: 4);

    // Generate messages
    final scoreMessage = _getScoreMessage(averageScore);
    final trendMessage = _getTrendMessage(weeklyAverages);

    return PlantCareStats(
      averageScore: averageScore,
      totalScores: filteredScores.length,
      currentStreak: currentStreak,
      bestStreak: bestStreak,
      weeklyAverages: weeklyAverages,
      scoreMessage: scoreMessage,
      trendMessage: trendMessage,
    );
  }

  List<double> _calculateWeeklyAverages(List<PlantCareScore> scores, {int weeks = 4}) {
    final weeklyAverages = <double>[];
    final now = DateTime.now();
    
    for (int i = 0; i < weeks; i++) {
      final weekStart = now.subtract(Duration(days: 7 * i + 6));
      final weekEnd = now.subtract(Duration(days: 7 * i));
      
      final weekScores = scores.where((score) {
        return score.createdAt.isAfter(weekStart) && score.createdAt.isBefore(weekEnd);
      }).toList();
      
      if (weekScores.isNotEmpty) {
        final weekAverage = weekScores.fold<double>(0.0, (sum, score) => sum + score.dailyScore) / weekScores.length;
        weeklyAverages.add(weekAverage);
      } else {
        weeklyAverages.add(0.0);
      }
    }
    
    return weeklyAverages.reversed.toList(); // Most recent first
  }

  String _getScoreMessage(double averageScore) {
    if (averageScore >= 25) return 'excellentCare';
    if (averageScore >= 20) return 'greatJob';
    if (averageScore >= 15) return 'goodWork';
    if (averageScore >= 10) return 'notBad';
    if (averageScore >= 5) return 'needsAttention';
    return 'immediateCare';
  }

  String _getTrendMessage(List<double> weeklyAverages) {
    if (weeklyAverages.length < 2) return 'keepTracking';
    
    final recent = weeklyAverages.last;
    final previous = weeklyAverages[weeklyAverages.length - 2];
    
    if (recent > previous + 2) return 'greatImprovement';
    if (recent > previous) return 'slightImprovement';
    if (recent < previous - 2) return 'careDeclined';
    if (recent < previous) return 'slightDecline';
    return 'consistentCare';
  }

  bool _areScoresEqual(List<PlantCareScore> scores1, List<PlantCareScore> scores2) {
    if (scores1.length != scores2.length) return false;
    
    for (int i = 0; i < scores1.length; i++) {
      if (scores1[i].idPlantCareScore != scores2[i].idPlantCareScore || 
          scores1[i].dailyScore != scores2[i].dailyScore ||
          scores1[i].createdAt != scores2[i].createdAt) {
        return false;
      }
    }
    return true;
  }

  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    return super.close();
  }
} 