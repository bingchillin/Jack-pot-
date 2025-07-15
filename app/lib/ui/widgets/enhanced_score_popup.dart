import 'package:flutter/material.dart';
import 'package:animated_text_kit/animated_text_kit.dart';
import '../../l10n/app_localizations.dart';
import '../../models/object_profile.dart';

class EnhancedScorePopupService {
  static final EnhancedScorePopupService _instance = EnhancedScorePopupService._internal();
  factory EnhancedScorePopupService() => _instance;
  EnhancedScorePopupService._internal();

  void showScorePopup({
    required BuildContext context,
    required ObjectProfile plant,
    required int moistureScore,
    required int temperatureScore,
    required int lightScore,
    required int phScore,
    required int bonusScore,
    required int totalScore,
    VoidCallback? onDismiss,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black54,
      builder: (BuildContext context) {
        return EnhancedScorePopupWidget(
          plant: plant,
          moistureScore: moistureScore,
          temperatureScore: temperatureScore,
          lightScore: lightScore,
          phScore: phScore,
          bonusScore: bonusScore,
          totalScore: totalScore,
          onDismiss: () {
            Navigator.of(context).pop();
            onDismiss?.call();
          },
        );
      },
    );
  }
}

class EnhancedScorePopupWidget extends StatefulWidget {
  final ObjectProfile plant;
  final int moistureScore;
  final int temperatureScore;
  final int lightScore;
  final int phScore;
  final int bonusScore;
  final int totalScore;
  final VoidCallback onDismiss;

  const EnhancedScorePopupWidget({
    super.key,
    required this.plant,
    required this.moistureScore,
    required this.temperatureScore,
    required this.lightScore,
    required this.phScore,
    required this.bonusScore,
    required this.totalScore,
    required this.onDismiss,
  });

  @override
  State<EnhancedScorePopupWidget> createState() => _EnhancedScorePopupWidgetState();
}

class _EnhancedScorePopupWidgetState extends State<EnhancedScorePopupWidget>
    with TickerProviderStateMixin {
  late AnimationController _containerController;
  late AnimationController _titleController;
  late AnimationController _statsController;
  late AnimationController _totalController;
  late AnimationController _bonusController;
  late AnimationController _pulseController;

  late Animation<double> _containerAnimation;
  late Animation<double> _titleAnimation;
  late Animation<double> _statsAnimation;
  late Animation<double> _totalAnimation;
  late Animation<double> _bonusAnimation;
  late Animation<double> _pulseAnimation;

  bool _showTitle = false;
  bool _showStats = false;
  bool _showTotal = false;
  bool _showBonus = false;

  @override
  void initState() {
    super.initState();
    
    _containerController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _titleController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _statsController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _totalController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _bonusController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _containerAnimation = CurvedAnimation(
      parent: _containerController,
      curve: Curves.elasticOut,
    );
    
    _titleAnimation = CurvedAnimation(
      parent: _titleController,
      curve: Curves.easeOutBack,
    );
    
    _statsAnimation = CurvedAnimation(
      parent: _statsController,
      curve: Curves.easeOutQuart,
    );
    
    _totalAnimation = CurvedAnimation(
      parent: _totalController,
      curve: Curves.bounceOut,
    );
    
    _bonusAnimation = CurvedAnimation(
      parent: _bonusController,
      curve: Curves.elasticOut,
    );
    
    _pulseAnimation = CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    );

    _startAnimationSequence();
  }

  Future<void> _startAnimationSequence() async {
    setState(() => _showTitle = true);
    await Future.wait([
      _containerController.forward(),
      _titleController.forward(),
    ]);
    
    await Future.delayed(const Duration(milliseconds: 150));
    setState(() => _showStats = true);
    await _statsController.forward();
    
    await Future.delayed(const Duration(milliseconds: 200));
    setState(() => _showTotal = true);
    await _totalController.forward();
    
    if (widget.bonusScore > 0) {
      await Future.delayed(const Duration(milliseconds: 100));
      setState(() => _showBonus = true);
      await _bonusController.forward();
      _pulseController.repeat(reverse: true);
    }
    
    await Future.delayed(const Duration(seconds: 5));
    if (mounted) {
      _dismissPopup();
    }
  }

  void _dismissPopup() {
    _pulseController.stop();
    widget.onDismiss();
  }

  @override
  void dispose() {
    _containerController.dispose();
    _titleController.dispose();
    _statsController.dispose();
    _totalController.dispose();
    _bonusController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Color _getScoreColor(int score) {
    if (score >= 25) return Colors.green[600]!;
    if (score >= 20) return Colors.blue[600]!;
    if (score >= 15) return Colors.orange[600]!;
    if (score >= 10) return Colors.yellow[700]!;
    return Colors.red[600]!;
  }

  String _getScoreMessage(int score) {
    if (score >= 25) return "EXCELLENT CARE!";
    if (score >= 20) return "GREAT JOB!";
    if (score >= 15) return "GOOD WORK!";
    if (score >= 10) return "NOT BAD!";
    if (score >= 5) return "NEEDS WORK!";
    return "KEEP TRYING!";
  }

  String _getScoreDescription(int score) {
    if (score >= 25) return "Your plant is thriving! All conditions are optimal.";
    if (score >= 20) return "Your plant is doing well with minor adjustments needed.";
    if (score >= 15) return "Your plant is okay but could use some attention.";
    if (score >= 10) return "Your plant needs more care to reach its potential.";
    if (score >= 5) return "Your plant requires immediate attention to improve.";
    return "Your plant needs significant care improvements.";
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final scoreColor = _getScoreColor(widget.totalScore);
    final scoreMessage = _getScoreMessage(widget.totalScore);
    final scoreDescription = _getScoreDescription(widget.totalScore);
    final screenSize = MediaQuery.of(context).size;

    return Material(
      color: Colors.black54,
      child: Center(
        child: ScaleTransition(
          scale: _containerAnimation,
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: screenSize.height * 0.85,
              maxWidth: screenSize.width > 600 ? 500 : screenSize.width * 0.9,
            ),
            child: SingleChildScrollView(
              child: Container(
                margin: EdgeInsets.symmetric(
                  horizontal: screenSize.width * 0.05,
                  vertical: 16,
                ),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white,
                      Colors.green[50]!,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: scoreColor.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Plant name and header
                    if (_showTitle)
                      AnimatedBuilder(
                        animation: _titleAnimation,
                        builder: (context, child) {
                          final opacity = _titleAnimation.value.clamp(0.0, 1.0);
                          return Transform.scale(
                            scale: _titleAnimation.value,
                            child: Opacity(
                              opacity: opacity,
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: scoreColor.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: Icon(
                                          Icons.emoji_events,
                                          color: scoreColor,
                                          size: 32,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              widget.plant.title ?? 'My Plant',
                                              style: TextStyle(
                                                fontSize: 20,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.grey[800],
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Daily Care Score',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  AnimatedTextKit(
                                    animatedTexts: [
                                      TypewriterAnimatedText(
                                        scoreMessage,
                                        textStyle: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: scoreColor,
                                        ),
                                        speed: const Duration(milliseconds: 100),
                                      ),
                                    ],
                                    totalRepeatCount: 1,
                                    displayFullTextOnTap: true,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    scoreDescription,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),

                    const SizedBox(height: 24),

                    // Stats grid with enhanced descriptions
                    if (_showStats)
                      AnimatedBuilder(
                        animation: _statsAnimation,
                        builder: (context, child) {
                          final opacity = _statsAnimation.value.clamp(0.0, 1.0);
                          return Transform.scale(
                            scale: _statsAnimation.value,
                            child: Opacity(
                              opacity: opacity,
                              child: _buildStatsGrid(localizations),
                            ),
                          );
                        },
                      ),

                    const SizedBox(height: 24),

                    // Total score
                    if (_showTotal)
                      AnimatedBuilder(
                        animation: _totalAnimation,
                        builder: (context, child) {
                          final opacity = _totalAnimation.value.clamp(0.0, 1.0);
                          return Transform.scale(
                            scale: _totalAnimation.value,
                            child: Opacity(
                              opacity: opacity,
                              child: _buildTotalScore(scoreColor, localizations),
                            ),
                          );
                        },
                      ),

                    // Bonus score
                    if (_showBonus && widget.bonusScore > 0)
                      AnimatedBuilder(
                        animation: _bonusAnimation,
                        builder: (context, child) {
                          return AnimatedBuilder(
                            animation: _pulseAnimation,
                            builder: (context, child) {
                              final scale = 1.0 + (_pulseAnimation.value * 0.05);
                              return Transform.scale(
                                scale: scale,
                                child: Container(
                                  margin: const EdgeInsets.only(top: 16),
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.amber[100]!,
                                        Colors.orange[100]!,
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: Colors.amber[300]!,
                                      width: 2,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.star,
                                        color: Colors.amber[600],
                                        size: 24,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Consistency Bonus!',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.amber[800],
                                              ),
                                            ),
                                            Text(
                                              '+${widget.bonusScore} points for regular care',
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.amber[700],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),

                    const SizedBox(height: 24),

                    // Close button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _dismissPopup,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: scoreColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 4,
                        ),
                        child: Text(
                          localizations.close,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid(AppLocalizations localizations) {
    final stats = [
      {
        'label': 'Moisture',
        'score': widget.moistureScore,
        'icon': Icons.water_drop,
        'color': Colors.blue[600]!,
        'maxScore': 10,
        'description': 'Soil hydration levels',
      },
      {
        'label': 'Temperature',
        'score': widget.temperatureScore,
        'icon': Icons.thermostat,
        'color': Colors.orange[600]!,
        'maxScore': 8,
        'description': 'Ambient temperature',
      },
      {
        'label': 'Light',
        'score': widget.lightScore,
        'icon': Icons.wb_sunny,
        'color': Colors.yellow[700]!,
        'maxScore': 6,
        'description': 'Light exposure',
      },
      {
        'label': 'pH Level',
        'score': widget.phScore,
        'icon': Icons.science,
        'color': Colors.purple[600]!,
        'maxScore': 4,
        'description': 'Soil acidity',
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 600 ? 2 : 1,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: MediaQuery.of(context).size.width > 600 ? 3.5 : 4.5,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return _buildAnimatedStatCard(stat, index);
      },
    );
  }

  Widget _buildAnimatedStatCard(Map<String, dynamic> stat, int index) {
    return AnimatedBuilder(
      animation: _statsAnimation,
      builder: (context, child) {
        final delay = index * 0.1;
        final animationValue = (_statsAnimation.value - delay).clamp(0.0, 1.0);
        
        return Transform.scale(
          scale: animationValue,
          child: Opacity(
            opacity: animationValue,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: stat['color'].withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: stat['color'].withValues(alpha: 0.2),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: stat['color'].withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      stat['icon'],
                      color: stat['color'],
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          stat['label'],
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[800],
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          stat['description'],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w400,
                            color: Colors.grey[600],
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              '${stat['score']}',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: stat['color'],
                              ),
                            ),
                            Text(
                              '/${stat['maxScore']}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTotalScore(Color scoreColor, AppLocalizations localizations) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            scoreColor.withValues(alpha: 0.1),
            scoreColor.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: scoreColor.withValues(alpha: 0.3),
          width: 3,
        ),
        boxShadow: [
          BoxShadow(
            color: scoreColor.withValues(alpha: 0.2),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Total Daily Score',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${widget.totalScore}',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: scoreColor,
              shadows: [
                Shadow(
                  color: scoreColor.withValues(alpha: 0.3),
                  offset: const Offset(0, 2),
                  blurRadius: 4,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '/ 30 points',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}