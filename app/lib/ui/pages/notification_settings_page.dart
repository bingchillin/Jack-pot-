import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/notification_service.dart';
import '../../services/notification_preferences_service.dart';
import '../../l10n/app_localizations.dart';
import '../../app_config.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  final NotificationService _notificationService = NotificationService();
  final NotificationPreferencesService _preferencesService = NotificationPreferencesService();
  bool _isLoading = false;
  
  // Notification preferences
  bool _plantCareNotifications = true;
  bool _wateringReminders = true;
  bool _lightAlerts = true;
  bool _temperatureAlerts = true;
  bool _nutrientAlerts = true;
  bool _healthCheckups = true;
  bool _systemUpdates = false;
  
  // Social notification preferences
  bool _commentLikes = true;
  bool _commentMentions = true;
  bool _commentReplies = true;
  
  // Test notification
  String _selectedTestType = 'plant_care';

  @override
  void initState() {
    super.initState();
    _loadNotificationPreferences();
  }

  Future<void> _loadNotificationPreferences() async {
    setState(() => _isLoading = true);
    
    try {
      final preferences = await _preferencesService.loadPreferences();
      
      if (mounted) {
        setState(() {
          _plantCareNotifications = preferences['plant_care_notifications'] ?? true;
          _wateringReminders = preferences['watering_reminders'] ?? true;
          _lightAlerts = preferences['light_alerts'] ?? true;
          _temperatureAlerts = preferences['temperature_alerts'] ?? true;
          _nutrientAlerts = preferences['nutrient_alerts'] ?? true;
          _healthCheckups = preferences['health_checkups'] ?? true;
          _systemUpdates = preferences['system_updates'] ?? false;
          _commentLikes = preferences['comment_likes'] ?? true;
          _commentMentions = preferences['comment_mentions'] ?? true;
          _commentReplies = preferences['comment_replies'] ?? true;
        });
      }
    } catch (e) {
      print('Error loading notification preferences: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

    Future<void> _saveNotificationPreferences() async {
    setState(() => _isLoading = true);
    
    try {
      // Create preferences map
      final Map<String, bool> preferences = {
        'plant_care_notifications': _plantCareNotifications,
        'watering_reminders': _wateringReminders,
        'light_alerts': _lightAlerts,
        'temperature_alerts': _temperatureAlerts,
        'nutrient_alerts': _nutrientAlerts,
        'health_checkups': _healthCheckups,
        'system_updates': _systemUpdates,
        'comment_likes': _commentLikes,
        'comment_mentions': _commentMentions,
        'comment_replies': _commentReplies,
      };
      
      // Save to local storage
      final localSuccess = await _preferencesService.savePreferences(preferences);
      
      // Try to save to backend if user is logged in
      bool backendSuccess = false;
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isLoggedIn && authProvider.accessToken != null && authProvider.userId != null) {
        backendSuccess = await _preferencesService.savePreferencesToBackend(
          preferences,
          authProvider.accessToken!,
          int.parse(authProvider.userId!),
        );
      }
      
      if (mounted) {
        final localizations = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localSuccess 
              ? localizations.settingsSaved
              : localizations.settingsSaveError
            ),
            backgroundColor: localSuccess ? Colors.green[600] : Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      print('Error saving notification preferences: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save settings'),
            backgroundColor: Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _sendTestNotification() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    
    if (token == null) return;

    setState(() => _isLoading = true);
    
    try {
      // Check if the selected notification type is enabled
      String preferenceKey;
      switch (_selectedTestType) {
        case 'plant_care':
          preferenceKey = 'plant_care_notifications';
          break;
        case 'comment_like':
          preferenceKey = 'comment_likes';
          break;
        case 'comment_mention':
          preferenceKey = 'comment_mentions';
          break;
        case 'comment_reply':
          preferenceKey = 'comment_replies';
          break;
        default:
          preferenceKey = 'plant_care_notifications';
      }
      
      final isEnabled = await _preferencesService.isNotificationEnabled(preferenceKey);
      
      if (!isEnabled) {
        if (mounted) {
          final localizations = AppLocalizations.of(context)!;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(localizations.notificationDisabled),
              backgroundColor: Colors.orange[600],
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }
      
      String title;
      String message;
      
      switch (_selectedTestType) {
        case 'plant_care':
          title = '🌱 Plant Care Test';
          message = 'This is a test plant care notification!';
          break;
        case 'comment_like':
          title = '❤️ Comment Like Test';
          message = 'Someone liked your comment!';
          break;
        case 'comment_mention':
          title = '@ Mention Test';
          message = 'Someone mentioned you in a comment!';
          break;
        case 'comment_reply':
          title = '💬 Comment Reply Test';
          message = 'Someone replied to your comment!';
          break;
        default:
          title = '🌱 Jackpote Test';
          message = 'This is a test notification from your plant care app!';
      }
      
      final success = await _notificationService.sendTestNotification(
        baseUrl: AppConfig.baseUrl,
        authToken: token,
        title: title,
        message: message,
      );
      
      if (mounted) {
        final localizations = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success 
              ? localizations.testNotificationSent
              : localizations.testNotificationError
            ),
            backgroundColor: success ? Colors.green[600] : Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        final localizations = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localizations.testNotificationError),
            backgroundColor: Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.grey[50],
        foregroundColor: Colors.green[700],
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          localizations.notificationSettings,
          style: const TextStyle(
            color: Colors.green,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Plant Care Notifications Section
              _buildSectionHeader(
                title: localizations.plantCareNotifications,
                subtitle: 'Get alerts about your plants\' health and care needs',
                icon: Icons.eco,
                color: Colors.green,
              ),
              const SizedBox(height: 16),
              _buildNotificationToggle(
                title: localizations.wateringReminders,
                subtitle: 'When your plants need water',
                value: _wateringReminders,
                onChanged: (value) => setState(() => _wateringReminders = value),
                icon: Icons.water_drop,
              ),
              _buildNotificationToggle(
                title: localizations.lightAlerts,
                subtitle: 'When light levels are too low or high',
                value: _lightAlerts,
                onChanged: (value) => setState(() => _lightAlerts = value),
                icon: Icons.wb_sunny,
              ),
              _buildNotificationToggle(
                title: localizations.temperatureAlerts,
                subtitle: 'When temperature is outside optimal range',
                value: _temperatureAlerts,
                onChanged: (value) => setState(() => _temperatureAlerts = value),
                icon: Icons.thermostat,
              ),
              _buildNotificationToggle(
                title: localizations.nutrientAlerts,
                subtitle: 'When soil nutrients are low',
                value: _nutrientAlerts,
                onChanged: (value) => setState(() => _nutrientAlerts = value),
                icon: Icons.scatter_plot,
              ),
              _buildNotificationToggle(
                title: localizations.healthCheckups,
                subtitle: 'Regular plant health reports',
                value: _healthCheckups,
                onChanged: (value) => setState(() => _healthCheckups = value),
                icon: Icons.favorite,
              ),

              const SizedBox(height: 32),

              // Social Notifications Section
              _buildSectionHeader(
                title: localizations.socialNotifications,
                subtitle: 'Notifications from other users and social interactions',
                icon: Icons.people,
                color: Colors.blue,
              ),
              const SizedBox(height: 16),
              _buildNotificationToggle(
                title: localizations.commentLikes,
                subtitle: 'When someone likes your comments',
                value: _commentLikes,
                onChanged: (value) => setState(() => _commentLikes = value),
                icon: Icons.favorite,
              ),
              _buildNotificationToggle(
                title: localizations.commentMentions,
                subtitle: 'When someone mentions you in a comment',
                value: _commentMentions,
                onChanged: (value) => setState(() => _commentMentions = value),
                icon: Icons.alternate_email,
              ),
              _buildNotificationToggle(
                title: localizations.commentReplies,
                subtitle: 'When someone replies to your comments',
                value: _commentReplies,
                onChanged: (value) => setState(() => _commentReplies = value),
                icon: Icons.reply,
              ),

              const SizedBox(height: 32),

              // Test Notification Section
              _buildSectionHeader(
                title: 'Test Notifications',
                subtitle: 'Send test notifications to verify your settings',
                icon: Icons.bug_report,
                color: Colors.orange,
              ),
              const SizedBox(height: 16),
              _buildTestNotificationSection(),

              const SizedBox(height: 32),

              // Save Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _saveNotificationPreferences,
                  icon: _isLoading 
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Icon(Icons.save),
                  label: Text('Save Settings'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[600],
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }



  Widget _buildSectionHeader({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTestNotificationSection() {
    final localizations = AppLocalizations.of(context)!;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Notification type selector
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localizations.selectNotificationType,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedTestType,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                items: [
                  DropdownMenuItem(
                    value: 'plant_care',
                    child: Row(
                      children: [
                        Icon(Icons.eco, color: Colors.green[600], size: 20),
                        const SizedBox(width: 8),
                        Text('Plant Care'),
                      ],
                    ),
                  ),
                  DropdownMenuItem(
                    value: 'comment_like',
                    child: Row(
                      children: [
                        Icon(Icons.favorite, color: Colors.red[600], size: 20),
                        const SizedBox(width: 8),
                        Text('Comment Like'),
                      ],
                    ),
                  ),
                  DropdownMenuItem(
                    value: 'comment_mention',
                    child: Row(
                      children: [
                        Icon(Icons.alternate_email, color: Colors.blue[600], size: 20),
                        const SizedBox(width: 8),
                        Text('Comment Mention'),
                      ],
                    ),
                  ),
                  DropdownMenuItem(
                    value: 'comment_reply',
                    child: Row(
                      children: [
                        Icon(Icons.reply, color: Colors.orange[600], size: 20),
                        const SizedBox(width: 8),
                        Text('Comment Reply'),
                      ],
                    ),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedTestType = value;
                    });
                  }
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Test button
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton.icon(
            onPressed: _isLoading ? null : _sendTestNotification,
            icon: _isLoading 
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Icon(Icons.send),
            label: Text('Send Test Notification'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[600],
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNotificationToggle({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: value ? Colors.green[600] : Colors.grey[400],
            size: 24,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: Colors.green[600],
            activeTrackColor: Colors.green[200],
          ),
        ],
      ),
    );
  }
} 