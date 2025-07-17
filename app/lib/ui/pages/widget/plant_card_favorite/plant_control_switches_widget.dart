import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../../../../models/object_profile.dart';
import '../../../../services/object_profile_service.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../services/notification_service.dart';
import '../../../../app_config.dart';
import '../../../../l10n/app_localizations.dart';

class PlantControlSwitches extends StatefulWidget {
  final ObjectProfile plant;

  const PlantControlSwitches({Key? key, required this.plant}) : super(key: key);

  @override
  State<PlantControlSwitches> createState() => _PlantControlSwitchesState();
}

class _PlantControlSwitchesState extends State<PlantControlSwitches> {
  late bool isAutomatic;
  late bool isWillWatering;
  final NotificationService _notificationService = NotificationService();

  @override
  void initState() {
    super.initState();
    isAutomatic = widget.plant.isAutomatic ?? false;
    isWillWatering = widget.plant.isWillWatering ?? false;
  }

  @override
  void didUpdateWidget(covariant PlantControlSwitches oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.plant.isAutomatic != widget.plant.isAutomatic) {
      setState(() {
        isAutomatic = widget.plant.isAutomatic ?? false;
      });
    }
    if (oldWidget.plant.isWillWatering != widget.plant.isWillWatering) {
      setState(() {
        isWillWatering = widget.plant.isWillWatering ?? false;
      });
    }
  }

  Future<void> _updateField(String field, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');

    if (token == null) {
      print('Token introuvable');
      return;
    }

    try {
      print('🔄 Updating $field to $value for plant ${widget.plant.idObjectProfile}');
      
      await ObjectProfileService().updateObjectProfile(
        id: widget.plant.idObjectProfile.toString(),
        body: {field: value},
        token: token,
      );
      
      print('✅ Successfully updated $field to $value');
      
      // Send notification about plant control change
      await _sendPlantControlNotification(field, value);
      
      // Small delay to ensure the global notification is sent
      await Future.delayed(const Duration(milliseconds: 100));
      
    } catch (e) {
      print('❌ Error updating $field: $e');
      setState(() {
        if (field == "isAutomatic") isAutomatic = !value;
        if (field == "isWillWatering") isWillWatering = !value;
      });
    }
  }

  Future<void> _sendPlantControlNotification(String field, bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');
      
      if (token == null) return;

      final plantName = widget.plant.title ?? 'Plant';
      final String alertType;
      final String message;

      if (field == "isAutomatic") {
        alertType = value ? 'auto_mode_enabled' : 'auto_mode_disabled';
        message = value 
          ? '$plantName is now in automatic mode 🤖' 
          : '$plantName automatic mode disabled 🔧';
      } else if (field == "isWillWatering") {
        alertType = value ? 'watering_enabled' : 'watering_disabled';
        message = value 
          ? '$plantName watering system activated 💧' 
          : '$plantName watering system deactivated 🚱';
      } else {
        return; // Unknown field
      }

      await _notificationService.sendPlantCareNotification(
        baseUrl: AppConfig.baseUrl,
        authToken: token,
        plantName: plantName,
        alertType: alertType,
        message: message,
      );
      
      print('✅ Plant control notification sent: $alertType');
    } catch (e) {
      print('❌ Error sending plant control notification: $e');
    }
  }

  void _showGuestDialog(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.lock_outline, color: Colors.orange[600]),
            const SizedBox(width: 8),
            Text(localizations.premiumFeature),
          ],
        ),
        content: Text(
          localizations.plantControlsMessage,
          style: const TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(localizations.cancel, style: TextStyle(color: Colors.grey[600])),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/signup');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green[600],
              foregroundColor: Colors.white,
            ),
            child: Text(localizations.signUp),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingToggle({
    required String label,
    required bool value,
    required Function(bool) onChanged,
    required Color activeColor,
    required IconData icon,
    required bool isEnabled,
  }) {
    return Expanded(
      child: Container(
        height: 36, // Bigger height
        margin: const EdgeInsets.symmetric(horizontal: 3),
        decoration: BoxDecoration(
          color: isEnabled 
              ? Colors.white.withValues(alpha: 0.9) 
              : Colors.grey[200]!.withValues(alpha: 0.7), // Disabled appearance
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isEnabled 
                ? (value ? activeColor.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.3))
                : Colors.grey[400]!.withValues(alpha: 0.5),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isEnabled ? 0.15 : 0.05),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isEnabled ? () => onChanged(!value) : () => _showGuestDialog(context),
            borderRadius: BorderRadius.circular(18),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isEnabled ? icon : Icons.lock_outline,
                    size: 16,
                    color: isEnabled 
                        ? (value ? activeColor : Colors.grey[600])
                        : Colors.grey[500],
                  ),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isEnabled 
                          ? (value ? activeColor : Colors.grey[700])
                          : Colors.grey[500],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 24,
                    height: 14,
                    decoration: BoxDecoration(
                      color: isEnabled 
                          ? (value ? activeColor : Colors.grey[400])
                          : Colors.grey[300],
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Stack(
                      children: [
                        AnimatedPositioned(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                          left: (isEnabled && value) ? 12 : 0,
                          top: 1,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(6),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: isEnabled ? 0.25 : 0.1),
                                  blurRadius: 3,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final isEnabled = authProvider.isAuthenticated;
    
    return Container(
      height: 36, // Bigger fixed height
      child: Row(
        children: [
          _buildFloatingToggle(
            label: localizations.autoMode,
            value: isAutomatic,
            onChanged: (val) {
              // Auto button is now disabled - no action
            },
            activeColor: Colors.green[600]!,
            icon: Icons.settings,
            isEnabled: false, // Always disabled for auto button
          ),
          const SizedBox(width: 8), // More spacing between toggles
          _buildFloatingToggle(
            label: localizations.waterMode,
            value: isWillWatering,
            onChanged: (val) {
              setState(() => isWillWatering = val);
              _updateField("isWillWatering", val);
            },
            activeColor: Colors.blue[600]!,
            icon: Icons.water_drop,
            isEnabled: isEnabled,
          ),
        ],
      ),
    );
  }
}
