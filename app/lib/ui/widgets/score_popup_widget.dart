import 'package:flutter/material.dart';

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
  late AnimationController _containerController;
  late AnimationController _titleController;
  late AnimationController _statsController;
  late AnimationController _closeController;

  late Animation<double> _containerAnimation;
  late Animation<double> _titleAnimation;
  late Animation<double> _statsAnimation;
  late Animation<double> _closeAnimation;

  @override
  void initState() {
    super.initState();
    
    _containerController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _titleController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _statsController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    
    _closeController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _containerAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _containerController,
      curve: Curves.easeOutBack,
    ));

    _titleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _titleController,
      curve: Curves.easeOutBack,
    ));

    _statsAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _statsController,
      curve: Curves.easeOutBack,
    ));

    _closeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _closeController,
      curve: Curves.easeOutBack,
    ));

    // Start animations
    _containerController.forward();
    _titleController.forward();
    
    Future.delayed(const Duration(milliseconds: 100), () {
      _statsController.forward();
    });
    
    Future.delayed(const Duration(milliseconds: 200), () {
      _closeController.forward();
    });
  }

  @override
  void dispose() {
    _containerController.dispose();
    _titleController.dispose();
    _statsController.dispose();
    _closeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Stack(
        children: [
          // Background overlay
          Positioned.fill(
            child: Container(
              color: Colors.black54,
            ),
          ),
          
          // Main popup
          Positioned.fill(
            child: Center(
              child: AnimatedBuilder(
                animation: _containerAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _containerAnimation.value,
                    child: Container(
                      margin: const EdgeInsets.all(20),
                      constraints: const BoxConstraints(
                        maxWidth: 400,
                        maxHeight: 600,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Header with close button
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                AnimatedBuilder(
                                  animation: _titleAnimation,
                                  builder: (context, child) {
                                    return Transform.scale(
                                      scale: _titleAnimation.value,
                                      child: Text(
                                        'Plant Care Score',
                                        style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[800],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                AnimatedBuilder(
                                  animation: _closeAnimation,
                                  builder: (context, child) {
                                    return Transform.scale(
                                      scale: _closeAnimation.value,
                                      child: IconButton(
                                        onPressed: widget.onDismiss,
                                        icon: Icon(
                                          Icons.close,
                                          color: Colors.grey[600],
                                          size: 24,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                          
                          // Total score
                          AnimatedBuilder(
                            animation: _titleAnimation,
                            builder: (context, child) {
                              return Transform.scale(
                                scale: _titleAnimation.value,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 16,
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        '${widget.totalScore}',
                                        style: TextStyle(
                                          fontSize: 48,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.green[600],
                                        ),
                                      ),
                                      Text(
                                        'Total Score',
                                        style: TextStyle(
                                          fontSize: 16,
                                          color: Colors.grey[600],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          
                          // Stats grid
                          Expanded(
                            child: AnimatedBuilder(
                              animation: _statsAnimation,
                              builder: (context, child) {
                                return Transform.scale(
                                  scale: _statsAnimation.value,
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: GridView.count(
                                      crossAxisCount: 2,
                                      childAspectRatio: 2.5,
                                      crossAxisSpacing: 8,
                                      mainAxisSpacing: 8,
                                      children: [
                                        _buildStatCard(
                                          'Moisture',
                                          widget.moistureScore,
                                          Icons.water_drop,
                                          Colors.blue,
                                        ),
                                        _buildStatCard(
                                          'Temperature',
                                          widget.temperatureScore,
                                          Icons.thermostat,
                                          Colors.orange,
                                        ),
                                        _buildStatCard(
                                          'Light',
                                          widget.lightScore,
                                          Icons.wb_sunny,
                                          Colors.yellow,
                                        ),
                                        _buildStatCard(
                                          'pH Level',
                                          widget.phScore,
                                          Icons.science,
                                          Colors.purple,
                                        ),
                                        if (widget.bonusScore > 0)
                                          _buildStatCard(
                                            'Bonus',
                                            widget.bonusScore,
                                            Icons.star,
                                            Colors.amber,
                                          ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, int score, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
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
          Icon(
            icon,
            color: color,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
                Text(
                  '$score',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
