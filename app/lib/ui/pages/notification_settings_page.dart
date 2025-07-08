import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/notification_service.dart';
import '../../l10n/app_localizations.dart';
import '../../app_config.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  final NotificationService _notificationService = NotificationService();
  bool _isLoading = false;
  
  // Notification preferences
  bool _plantCareNotifications = true;
  bool _wateringReminders = true;
  bool _lightAlerts = true;
  bool _temperatureAlerts = true;
  bool _nutrientAlerts = true;
  bool _healthCheckups = true;
  bool _systemUpdates = false;

  @override
  void initState() {
    super.initState();
    _loadNotificationPreferences();
  }

  Future<void> _loadNotificationPreferences() async {
    // Load user's notification preferences
    // This would typically come from SharedPreferences or backend
    // For now, we'll use default values
  }

  Future<void> _saveNotificationPreferences() async {
    setState(() => _isLoading = true);
    
    try {
      // Save preferences to backend or SharedPreferences
      // For now, we'll just show a success message
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Settings saved successfully'),
            backgroundColor: Colors.green[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
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
      final success = await _notificationService.sendTestNotification(
        baseUrl: AppConfig.baseUrl,
        authToken: token,
        title: '🌱 Jack Pot Test',
        message: 'This is a test notification from your plant care app!',
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success 
              ? 'Test notification sent!'
              : 'Failed to send test notification'
            ),
            backgroundColor: success ? Colors.green[600] : Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send test notification'),
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
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.grey[50],
        foregroundColor: Colors.green[700],
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          'Notification Settings',
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
              _buildSectionCard(
                title: 'Plant Care Notifications',
                subtitle: 'Get alerts about your plants\' health and care needs',
                icon: Icons.eco,
                children: [
                  _buildNotificationToggle(
                    title: 'Watering Reminders',
                    subtitle: 'When your plants need water',
                    value: _wateringReminders,
                    onChanged: (value) => setState(() => _wateringReminders = value),
                    icon: Icons.water_drop,
                  ),
                  _buildNotificationToggle(
                    title: 'Light Alerts',
                    subtitle: 'When light levels are too low or high',
                    value: _lightAlerts,
                    onChanged: (value) => setState(() => _lightAlerts = value),
                    icon: Icons.wb_sunny,
                  ),
                  _buildNotificationToggle(
                    title: 'Temperature Alerts',
                    subtitle: 'When temperature is outside optimal range',
                    value: _temperatureAlerts,
                    onChanged: (value) => setState(() => _temperatureAlerts = value),
                    icon: Icons.thermostat,
                  ),
                  _buildNotificationToggle(
                    title: 'Nutrient Alerts',
                    subtitle: 'When soil nutrients are low',
                    value: _nutrientAlerts,
                    onChanged: (value) => setState(() => _nutrientAlerts = value),
                    icon: Icons.scatter_plot,
                  ),
                  _buildNotificationToggle(
                    title: 'Health Checkups',
                    subtitle: 'Regular plant health reports',
                    value: _healthCheckups,
                    onChanged: (value) => setState(() => _healthCheckups = value),
                    icon: Icons.favorite,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // General Notifications Section
              _buildSectionCard(
                title: 'General Notifications',
                subtitle: 'App updates and system notifications',
                icon: Icons.notifications,
                children: [
                  _buildNotificationToggle(
                    title: 'System Updates',
                    subtitle: 'New features and app updates',
                    value: _systemUpdates,
                    onChanged: (value) => setState(() => _systemUpdates = value),
                    icon: Icons.system_update,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Test Notification Section
              _buildSectionCard(
                title: 'Test Notification',
                subtitle: 'Send a test notification to verify your settings',
                icon: Icons.bug_report,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green[50],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green[200]!),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.notification_add,
                          size: 48,
                          color: Colors.green[600],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Tap the button below to send a test notification and verify your settings are working correctly.',
                          style: TextStyle(
                            color: Colors.green[700],
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _isLoading ? null : _sendTestNotification,
                          icon: _isLoading 
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Icon(Icons.send),
                          label: Text('Send Test Notification'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[600],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

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

  Widget _buildSectionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.green[600]!, Colors.green[500]!],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Section Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: children,
            ),
          ),
        ],
      ),
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