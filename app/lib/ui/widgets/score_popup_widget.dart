import 'package:flutter/material.dart';
import 'dart:async';
import '../../l10n/app_localizations.dart';

class ScorePopupWidget extends StatefulWidget {
  final int moistureScore;
  final int temperatureScore;
  final int lightScore;
  final int phScore;
  final int bonusScore;
  final int totalScore;
  final VoidCallback? onDismiss;

  const ScorePopupWidget({
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
  State<ScorePopupWidget> createState() => _ScorePopupWidgetState();
}

class _ScorePopupWidgetState extends State<ScorePopupWidget>
    with TickerProviderStateMixin {
  late AnimationController _popupController;
  late AnimationController _contentController;
  late AnimationController _totalController;
  late AnimationController _messageController;

  late Animation<double> _popupScale;
  late Animation<double> _popupOpacity;
  late Animation<double> _contentOpacity;
  late Animation<double> _totalScale;
  late Animation<double> _messageOpacity;

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
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _popupScale = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _popupController,
      curve: Curves.elasticOut,
    ));
    _popupOpacity = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _popupController,
      curve: Curves.easeInOut,
    ));

    // Content animation
    _contentController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _contentOpacity = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _contentController,
      curve: Curves.easeInOut,
    ));

    // Total score animation
    _totalController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _totalScale = Tween<double>(
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
    _messageOpacity = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _messageController,
      curve: Curves.easeInOut,
    ));
  }

  void _startAnimationSequence() async {
    // Start popup entrance
    _popupController.forward();
    await Future.delayed(const Duration(milliseconds: 300));

    // Show content
    _contentController.forward();
    await Future.delayed(const Duration(milliseconds: 200));

    // Show components one by one
    await _showComponent('moisture');
    await Future.delayed(const Duration(milliseconds: 200));
    
    await _showComponent('temperature');
    await Future.delayed(const Duration(milliseconds: 200));
    
    await _showComponent('light');
    await Future.delayed(const Duration(milliseconds: 200));
    
    await _showComponent('ph');
    await Future.delayed(const Duration(milliseconds: 200));
    
    await _showComponent('bonus');
    await Future.delayed(const Duration(milliseconds: 300));

    // Show total score
    _showTotal = true;
    _totalController.forward();
    await Future.delayed(const Duration(milliseconds: 500));

    // Show message
    _showMessage = true;
    _messageController.forward();
    await Future.delayed(const Duration(milliseconds: 800));

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
    await Future.delayed(const Duration(milliseconds: 100));
  }

  void _dismissPopup() {
    _dismissTimer?.cancel();
    widget.onDismiss?.call();
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _popupController.dispose();
    _contentController.dispose();
    _totalController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return AnimatedBuilder(
      animation: _popupController,
      builder: (context, child) {
        return Transform.scale(
          scale: _popupScale.value,
          child: Opacity(
            opacity: _popupOpacity.value,
            child: _buildPopupContent(localizations),
          ),
        );
      },
    );
  }

  Widget _buildPopupContent(AppLocalizations localizations) {
    return Center(
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
              animation: _contentController,
              builder: (context, child) {
                return Transform.scale(
                  scale: 0.5 + (_contentController.value * 0.5),
                  child: Opacity(
                    opacity: _contentController.value,
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
      animation: _contentController,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.3 + (_contentController.value * 0.7),
          child: Opacity(
            opacity: _contentController.value,
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
      animation: _totalController,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.5 + (_totalController.value * 0.5),
          child: Opacity(
            opacity: _totalController.value,
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
                    '${widget.totalScore}',
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
      animation: _messageController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - _messageController.value)),
          child: Opacity(
            opacity: _messageController.value,
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