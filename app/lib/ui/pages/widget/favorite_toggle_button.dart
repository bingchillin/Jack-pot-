import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/object_profile_service.dart';
import '../../../l10n/app_localizations.dart';

class FavoriteToggleButton extends StatefulWidget {
  final int plantId;
  final int? currentFavorisValue;
  final Function(bool)? onFavoriteChanged; // Callback when favorite status changes

  const FavoriteToggleButton({
    Key? key,
    required this.plantId,
    required this.currentFavorisValue,
    this.onFavoriteChanged,
  }) : super(key: key);

  @override
  State<FavoriteToggleButton> createState() => _FavoriteToggleButtonState();
}

class _FavoriteToggleButtonState extends State<FavoriteToggleButton>
    with TickerProviderStateMixin {  // Changed to TickerProviderStateMixin for multiple animations
  late bool _isFavorite;
  late int? _currentFavorisValue;
  
  // Multiple animation controllers for complex animation
  late AnimationController _mainAnimationController;
  late AnimationController _pulseAnimationController;
  
  // Multiple animations
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<Color?> _colorAnimation;

  @override
  void initState() {
    super.initState();
    _currentFavorisValue = widget.currentFavorisValue;
    _isFavorite = _currentFavorisValue != null;
    
    // Main animation controller for tap feedback
    _mainAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    // Pulse animation controller for continuous subtle effect
    _pulseAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    // Scale animation with bounce
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.4,
    ).animate(CurvedAnimation(
      parent: _mainAnimationController,
      curve: Curves.elasticOut,
    ));
    
    // Rotation animation
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.5, // Half rotation (180 degrees)
    ).animate(CurvedAnimation(
      parent: _mainAnimationController,
      curve: Curves.easeInOut,
    ));
    
    // Pulse animation for favorites
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseAnimationController,
      curve: Curves.easeInOut,
    ));
    
    // Color animation
    _colorAnimation = ColorTween(
      begin: Colors.grey[600],
      end: Colors.amber[600],
    ).animate(CurvedAnimation(
      parent: _mainAnimationController,
      curve: Curves.easeInOut,
    ));
    
    // Start pulse animation if already favorite
    if (_isFavorite) {
      _pulseAnimationController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _mainAnimationController.dispose();
    _pulseAnimationController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(FavoriteToggleButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentFavorisValue != widget.currentFavorisValue) {
      setState(() {
        _currentFavorisValue = widget.currentFavorisValue;
        _isFavorite = _currentFavorisValue != null;
      });
      
      // Update pulse animation based on favorite status
      if (_isFavorite) {
        _pulseAnimationController.repeat(reverse: true);
      } else {
        _pulseAnimationController.reset();
      }
    }
  }

  Future<void> _toggleFavorite() async {
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;

    if (!authProvider.isAuthenticated) {
      _showAuthRequiredDialog(localizations);
      return;
    }

    // Trigger the beautiful animation sequence
    _mainAnimationController.forward().then((_) {
      _mainAnimationController.reverse();
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');

      if (token == null) {
        throw Exception(localizations.tokenMissing);
      }

      final newFavoriteStatus = await ObjectProfileService().toggleFavorite(
        plantId: widget.plantId,
        token: token,
        currentFavorisValue: _currentFavorisValue,
      );

      setState(() {
        _isFavorite = newFavoriteStatus;
        _currentFavorisValue = newFavoriteStatus ? 1 : null;
      });

      // Control pulse animation based on new status
      if (newFavoriteStatus) {
        _pulseAnimationController.repeat(reverse: true);
      } else {
        _pulseAnimationController.reset();
      }

      widget.onFavoriteChanged?.call(newFavoriteStatus);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            newFavoriteStatus 
              ? localizations.addedToFavorites 
              : localizations.removedFromFavorites
          ),
          backgroundColor: Colors.green[600],
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );

    } catch (e) {
      print('❌ Error toggling favorite: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${localizations.error}: $e'),
          backgroundColor: Colors.red[600],
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  void _showAuthRequiredDialog(AppLocalizations localizations) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(localizations.authenticationRequired),
        content: Text(localizations.pleaseSignInToAddFavorites),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              localizations.cancel,
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to login page - you can implement this based on your navigation structure
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green[600],
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(localizations.signIn),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return AnimatedBuilder(
      animation: Listenable.merge([
        _mainAnimationController, 
        _pulseAnimationController
      ]),
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value * (_isFavorite ? _pulseAnimation.value : 1.0),
          child: Transform.rotate(
            angle: _rotationAnimation.value * 3.14159, // Convert to radians
            child: IconButton(
              onPressed: _toggleFavorite,
              tooltip: _isFavorite ? localizations.removeFromFavorites : localizations.addToFavorites,
              icon: Icon(
                _isFavorite ? Icons.star : Icons.star_border,
                color: _isFavorite ? Colors.amber[600] : _colorAnimation.value,
                size: 28,
              ),
              padding: const EdgeInsets.all(8),
              constraints: const BoxConstraints(
                minWidth: 44,
                minHeight: 44,
              ),
            ),
          ),
        );
      },
    );
  }
} 