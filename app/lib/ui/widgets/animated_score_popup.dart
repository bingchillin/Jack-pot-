import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;
import '../../l10n/app_localizations.dart';

class AnimatedScorePopup extends StatefulWidget {
  final int moistureScore;
  final int temperatureScore;
  final int lightScore;
  final int phScore;
  final int bonusScore;
  final int totalScore;
  final VoidCallback? onDismiss;

  const AnimatedScorePopup({
    Key? key,
    required this.moistureScore,
    required this.temperatureScore,
    required this.lightScore,
    required this.phScore,
    required this.bonusScore,
    required this.totalScore,
    this.onDismiss,
  }) : super(key: key);

  @override
  State<AnimatedScorePopup> createState() => _AnimatedScorePopupState();
}

class _AnimatedScorePopupState extends State<AnimatedScorePopup>
    with TickerProviderStateMixin {
  late AnimationController _popupController;
  late AnimationController _titleController;
  late AnimationController _componentController;
  late AnimationController _totalController;
  late AnimationController _messageController;
  late AnimationController _dismissController;

  late Animation<double> _popupSlideAnimation;
  late Animation<double> _popupFadeAnimation;
  late Animation<double> _titleAnimation;
  late Animation<double> _componentAnimation;
  late Animation<double> _totalAnimation;
  late Animation<double> _messageAnimation;
  late Animation<double> _dismissAnimation;

  int _currentMoistureScore = 0;
  int _currentTemperatureScore = 0;
  int _currentLightScore = 0;
  int _currentPhScore = 0;
  int _currentBonusScore = 0;
  int _currentTotalScore = 0;

  bool _showMoisture = false;
  bool _showTemperature = false;
  bool _showLight = false;
  bool _showPh = false;
  bool _showBonus = false;
  bool _showTotal = false;
  bool _showMessage = false;

  Timer? _dismissTimer;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _startAnimationSequence();
  }

  void _initializeAnimations() {
    // Popup entrance animation
    _popupController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _popupSlideAnimation = Tween<double>(
      begin: -1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _popupController,
      curve: Curves.elasticOut,
    ));
    _popupFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _popupController,
      curve: Curves.easeInOut,
    ));

    // Title animation
    _titleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _titleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _titleController,
      curve: Curves.easeInOut,
    ));

    // Component animations
    _componentController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _componentAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _componentController,
      curve: Curves.bounceOut,
    ));

    // Total score animation
    _totalController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _totalAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _totalController,
      curve: Curves.elasticOut,
    ));

    // Message animation
    _messageController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _messageAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _messageController,
      curve: Curves.easeInOut,
    ));

    // Dismiss animation
    _dismissController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _dismissAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _dismissController,
      curve: Curves.easeInOut,
    ));
  }

  void _startAnimationSequence() async {
    // Start popup entrance
    _popupController.forward();
    await Future.delayed(const Duration(milliseconds: 300));

    // Show title
    _titleController.forward();
    await Future.delayed(const Duration(milliseconds: 800));

    // Show components one by one
    await _showComponent('moisture');
    await Future.delayed(const Duration(milliseconds: 300));
    
    await _showComponent('temperature');
    await Future.delayed(const Duration(milliseconds: 300));
    
    await _showComponent('light');
    await Future.delayed(const Duration(milliseconds: 300));
    
    await _showComponent('ph');
    await Future.delayed(const Duration(milliseconds: 300));
    
    await _showComponent('bonus');
    await Future.delayed(const Duration(milliseconds: 500));

    // Show total score
    _showTotal = true;
    _totalController.forward();
    await _animateTotalScore();
    await Future.delayed(const Duration(milliseconds: 800));

    // Show message
    _showMessage = true;
    _messageController.forward();
    await Future.delayed(const Duration(milliseconds: 1000));

    // Auto dismiss after 3 seconds
    _dismissTimer = Timer(const Duration(seconds: 3), () {
      _dismissPopup();
    });
  }

  Future<void> _showComponent(String component) async {
    setState(() {
      switch (component) {
        case 'moisture':
          _showMoisture = true;
          break;
        case 'temperature':
          _showTemperature = true;
          break;
        case 'light':
          _showLight = true;
          break;
        case 'ph':
          _showPh = true;
          break;
        case 'bonus':
          _showBonus = true;
          break;
      }
    });

    _componentController.reset();
    _componentController.forward();
    await _componentController.forward();
  }

  Future<void> _animateTotalScore() async {
    const duration = Duration(milliseconds: 1500);
    const steps = 30;
    final stepDuration = duration.inMilliseconds ~/ steps;
    final stepIncrement = widget.totalScore / steps;

    for (int i = 0; i <= steps; i++) {
      setState(() {
        _currentTotalScore = (stepIncrement * i).round();
      });
      await Future.delayed(Duration(milliseconds: stepDuration));
    }
  }

  void _dismissPopup() {
    _dismissTimer?.cancel();
    _dismissController.forward().then((_) {
      widget.onDismiss?.call();
    });
  }

  @override
  void dispose() {
    _popupController.dispose();
    _titleController.dispose();
    _componentController.dispose();
    _totalController.dispose();
    _messageController.dispose();
    _dismissController.dispose();
    _dismissTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return AnimatedBuilder(
      animation: _dismissController,
      builder: (context, child) {
        if (_dismissController.value == 1.0) {
          return const SizedBox.shrink();
        }

        return Transform.translate(
          offset: Offset(0, 100 * _dismissController.value),
          child: Opacity(
            opacity: 1.0 - _dismissController.value,
            child: _buildPopupContent(localizations),
          ),
        );
      },
    );
  }

  Widget _buildPopupContent(AppLocalizations localizations) {
    return AnimatedBuilder(
      animation: _popupController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 300 * (1 - _popupSlideAnimation.value)),
          child: Opacity(
            opacity: _popupFadeAnimation.value,
            child: _buildMainContent(localizations),
          ),
        );
      },
    );
  }

  Widget _buildMainContent(AppLocalizations localizations) {
    return Material(
      color: Colors.transparent,
      child: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.black.withValues(alpha: 0.7),
        child: Center(
          child: GestureDetector(
            onTap: _dismissPopup,
            child: Container(
              margin: const EdgeInsets.all(32),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.green[50]!,
                    Colors.green[100]!,
                    Colors.white,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title
                  AnimatedBuilder(
                    animation: _titleAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: 0.5 + (_titleAnimation.value * 0.5),
                        child: Opacity(
                          opacity: _titleAnimation.value,
                          child: Text(
                            localizations.dailyScore,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );
                    },
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Score Components
                  _buildScoreComponents(),
                  
                  const SizedBox(height: 24),
                  
                  // Total Score
                  if (_showTotal) _buildTotalScore(),
                  
                  const SizedBox(height: 16),
                  
                  // Message
                  if (_showMessage) _buildMessage(localizations),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScoreComponents() {
    return Column(
      children: [
        if (_showMoisture) _buildScoreComponent(
          icon: Icons.water_drop,
          label: 'Moisture',
          score: widget.moistureScore,
          color: Colors.blue,
        ),
        if (_showTemperature) _buildScoreComponent(
          icon: Icons.thermostat,
          label: 'Temperature',
          score: widget.temperatureScore,
          color: Colors.orange,
        ),
        if (_showLight) _buildScoreComponent(
          icon: Icons.wb_sunny,
          label: 'Light',
          score: widget.lightScore,
          color: Colors.amber,
        ),
        if (_showPh) _buildScoreComponent(
          icon: Icons.science,
          label: 'pH',
          score: widget.phScore,
          color: Colors.purple,
        ),
        if (_showBonus) _buildScoreComponent(
          icon: Icons.star,
          label: 'Bonus',
          score: widget.bonusScore,
          color: Colors.amber[700]!,
        ),
      ],
    );
  }

  Widget _buildScoreComponent({
    required IconData icon,
    required String label,
    required int score,
    required Color color,
  }) {
    return AnimatedBuilder(
      animation: _componentAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.3 + (_componentAnimation.value * 0.7),
          child: Opacity(
            opacity: _componentAnimation.value,
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 4),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: color.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(icon, color: color, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: color,
                      ),
                    ),
                  ),
                  Text(
                    '+$score',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: color,
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

  Widget _buildTotalScore() {
    return AnimatedBuilder(
      animation: _totalAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.5 + (_totalAnimation.value * 0.5),
          child: Opacity(
            opacity: _totalAnimation.value,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.green[600]!,
                    Colors.green[700]!,
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green[300]!.withValues(alpha: 0.5),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    'TOTAL SCORE',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$_currentTotalScore',
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
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

  Widget _buildMessage(AppLocalizations localizations) {
    final message = _getScoreMessage(widget.totalScore, localizations);
    
    return AnimatedBuilder(
      animation: _messageAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - _messageAnimation.value)),
          child: Opacity(
            opacity: _messageAnimation.value,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.green[200]!,
                  width: 1,
                ),
              ),
              child: Text(
                message,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        );
      },
    );
  }

  String _getScoreMessage(int score, AppLocalizations localizations) {
    if (score >= 25) return localizations.excellentCare;
    if (score >= 20) return localizations.greatJob;
    if (score >= 15) return localizations.goodWork;
    if (score >= 10) return localizations.notBad;
    if (score >= 5) return localizations.needsAttention;
    return localizations.immediateCare;
  }
} 