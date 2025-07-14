import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/plant_care_score/plant_care_score_bloc.dart';
import '../../bloc/plant_care_score/plant_care_score_state.dart';
import '../../l10n/app_localizations.dart';

class PlantCareScoreCard extends StatelessWidget {
  final int plantId;
  final String token;

  const PlantCareScoreCard({
    Key? key,
    required this.plantId,
    required this.token,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return BlocProvider(
      create: (context) => PlantCareScoreBloc(
        service: context.read(),
        plantId: plantId,
        token: token,
      ),
      child: BlocBuilder<PlantCareScoreBloc, PlantCareScoreState>(
        builder: (context, state) {
          if (state is PlantCareScoreLoading) {
            return _buildLoadingCard();
          } else if (state is PlantCareScoreLoaded) {
            return _buildScoreCard(context, localizations, state);
          } else if (state is PlantCareScoreError) {
            return _buildErrorCard(context, localizations, state.message);
          } else {
            return _buildEmptyCard(context, localizations);
          }
        },
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 20,
                        width: 120,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 16,
                        width: 80,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreCard(BuildContext context, AppLocalizations localizations, PlantCareScoreLoaded state) {
    final stats = state.stats;
    if (stats == null) {
      return _buildEmptyCard(context, localizations);
    }

    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.green[50]!,
              Colors.green[100]!.withValues(alpha: 0.3),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: _getScoreColor(stats.averageScore),
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: _getScoreColor(stats.averageScore).withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    _getScoreIcon(stats.averageScore),
                    color: Colors.white,
                    size: 30,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localizations.plantCareScores,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _getLocalizedMessage(localizations, stats.scoreMessage),
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Score Grid
            Row(
              children: [
                Expanded(
                  child: _buildScoreItem(
                    context,
                    localizations.averageScore,
                    '${stats.averageScore.toStringAsFixed(1)}',
                    Icons.trending_up,
                    _getScoreColor(stats.averageScore),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildScoreItem(
                    context,
                    localizations.currentStreak,
                    '${stats.currentStreak}',
                    Icons.local_fire_department,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: _buildScoreItem(
                    context,
                    localizations.bestStreak,
                    '${stats.bestStreak}',
                    Icons.emoji_events,
                    Colors.amber,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildScoreItem(
                    context,
                    localizations.totalScores,
                    '${stats.totalScores}',
                    Icons.assessment,
                    Colors.blue,
                  ),
                ),
              ],
            ),
            
            if (stats.weeklyAverages.isNotEmpty) ...[
              const SizedBox(height: 20),
              
              // Weekly Trend
              Text(
                'Weekly Trend',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 60,
                child: Row(
                  children: stats.weeklyAverages.asMap().entries.map((entry) {
                    final index = entry.key;
                    final score = entry.value;
                    return Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        child: Column(
                          children: [
                            Expanded(
                              child: Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: _getScoreColor(score),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Center(
                                  child: Text(
                                    score.toStringAsFixed(0),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'W${stats.weeklyAverages.length - index}',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
            
            const SizedBox(height: 16),
            
            // Trend Message
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Colors.green[200]!,
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.lightbulb_outline,
                    color: Colors.green[600],
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _getLocalizedMessage(localizations, stats.trendMessage),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreItem(BuildContext context, String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCard(BuildContext context, AppLocalizations localizations) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(40),
              ),
              child: Icon(
                Icons.eco_outlined,
                size: 40,
                color: Colors.grey[400],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              localizations.noScoresYet,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              localizations.startTracking,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard(BuildContext context, AppLocalizations localizations, String error) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.red[100],
                borderRadius: BorderRadius.circular(40),
              ),
              child: Icon(
                Icons.error_outline,
                size: 40,
                color: Colors.red[400],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Error',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 25) return Colors.green[600]!;
    if (score >= 20) return Colors.green[500]!;
    if (score >= 15) return Colors.orange[500]!;
    if (score >= 10) return Colors.orange[600]!;
    if (score >= 5) return Colors.red[500]!;
    return Colors.red[600]!;
  }

  IconData _getScoreIcon(double score) {
    if (score >= 25) return Icons.star;
    if (score >= 20) return Icons.thumb_up;
    if (score >= 15) return Icons.check_circle;
    if (score >= 10) return Icons.help_outline;
    if (score >= 5) return Icons.warning;
    return Icons.error;
  }

  String _getLocalizedMessage(AppLocalizations localizations, String messageKey) {
    switch (messageKey) {
      case 'excellentCare':
        return localizations.excellentCare;
      case 'greatJob':
        return localizations.greatJob;
      case 'goodWork':
        return localizations.goodWork;
      case 'notBad':
        return localizations.notBad;
      case 'needsAttention':
        return localizations.needsAttention;
      case 'immediateCare':
        return localizations.immediateCare;
      case 'greatImprovement':
        return localizations.greatImprovement;
      case 'slightImprovement':
        return localizations.slightImprovement;
      case 'careDeclined':
        return localizations.careDeclined;
      case 'slightDecline':
        return localizations.slightDecline;
      case 'consistentCare':
        return localizations.consistentCare;
      case 'keepTracking':
        return localizations.keepTracking;
      default:
        return messageKey;
    }
  }
} 