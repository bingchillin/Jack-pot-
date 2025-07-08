import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/notification_service.dart';
import '../../services/api_service.dart';
import '../../core/constants.dart';

class NotificationTestPage extends StatefulWidget {
  const NotificationTestPage({Key? key}) : super(key: key);

  @override
  State<NotificationTestPage> createState() => _NotificationTestPageState();
}

class _NotificationTestPageState extends State<NotificationTestPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  final NotificationService _notificationService = NotificationService();
  late ApiService _apiService;

  bool _isLoading = false;
  String _statusMessage = '';
  bool _fcmTokenRegistered = false;
  List<Map<String, dynamic>> _notifications = [];
  List<String> _testResults = [];

  // Controllers for input fields
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  final _plantNameController = TextEditingController();
  final _moistureController = TextEditingController(text: '45');
  final _lightController = TextEditingController(text: '800');
  final _temperatureController = TextEditingController(text: '22');
  final _nutrientsController = TextEditingController(text: '25');

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _initializeNotificationService();
    _loadNotifications();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Initialize API service with auth provider
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _apiService = ApiService(authProvider: authProvider);
    
    // Check if FCM token is already registered
    _checkFCMTokenStatus();
  }

  Future<void> _checkFCMTokenStatus() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isLoggedIn) {
        // Check if user has FCM token in database
        final response = await _apiService.get('/person/${authProvider.user?['idPerson']}');
        if (response['fcmToken'] != null && response['fcmToken'].toString().isNotEmpty) {
          setState(() => _fcmTokenRegistered = true);
          _updateStatus('✅ FCM token already registered');
        }
      }
    } catch (e) {
      // Token check failed, assume not registered
      _updateStatus('ℹ️ FCM token status check failed: $e');
    }
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  void _initializeNotificationService() async {
    await _notificationService.initialize();
    _updateStatus('🔥 Notification service initialized');
  }

  void _updateStatus(String message) {
    setState(() {
      _statusMessage = message;
      _testResults.add('${DateTime.now().toIso8601String().substring(11, 19)} - $message');
    });
  }

  void _clearResults() {
    setState(() {
      _testResults.clear();
      _statusMessage = '';
    });
  }

  // Step 1: Authentication Status
  Widget _buildAuthenticationSection() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return _buildTestSection(
          title: '🔑 Authentication Status',
          children: [
            _buildStatusCard(
              title: 'Login Status',
              status: authProvider.isLoggedIn ? 'Logged In' : 'Not Logged In',
              color: authProvider.isLoggedIn ? Colors.green : Colors.red,
              icon: authProvider.isLoggedIn ? Icons.check_circle : Icons.error,
            ),
            if (authProvider.isLoggedIn) ...[
              _buildInfoCard('User ID', authProvider.user?['idPerson']?.toString() ?? 'N/A'),
              _buildInfoCard('Email', authProvider.user?['email'] ?? 'N/A'),
              _buildInfoCard('Name', authProvider.user?['firstname'] ?? 'N/A'),
            ],
          ],
        );
      },
    );
  }

  // Step 2: FCM Token Management
  Widget _buildFCMTokenSection() {
    return _buildTestSection(
      title: '🔥 FCM Token Management',
      children: [
        _buildStatusCard(
          title: 'FCM Token Status',
          status: _fcmTokenRegistered ? 'Registered' : 'Not Registered',
          color: _fcmTokenRegistered ? Colors.green : Colors.orange,
          icon: _fcmTokenRegistered ? Icons.check_circle : Icons.warning,
        ),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            Expanded(
              child: _buildActionButton(
                'Register Token',
                Icons.add_circle,
                () => _registerFCMToken(),
                Colors.green,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Remove Token',
                Icons.remove_circle,
                () => _removeFCMToken(),
                Colors.red,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 3: Basic Notification Testing
  Widget _buildBasicNotificationSection() {
    return _buildTestSection(
      title: '📱 Basic Notification Testing',
      children: [
        _buildInputField(
          controller: _titleController,
          label: 'Notification Title',
          hint: '🌱 Test Notification',
          icon: Icons.title,
        ),
        const SizedBox(height: 16),
        _buildInputField(
          controller: _messageController,
          label: 'Notification Message',
          hint: 'This is a test notification!',
          icon: Icons.message,
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          'Send Test Notification',
          Icons.send,
          () => _sendTestNotification(),
          Colors.blue,
        ),
      ],
    );
  }

  // Step 4: Plant-Specific Notifications
  Widget _buildPlantNotificationSection() {
    return _buildTestSection(
      title: '🌱 Plant-Specific Notifications',
      children: [
        _buildInputField(
          controller: _plantNameController,
          label: 'Plant Name',
          hint: 'My Monstera',
          icon: Icons.eco,
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            Expanded(
              child: _buildActionButton(
                'Watering Alert',
                Icons.water_drop,
                () => _sendWateringAlert(),
                Colors.blue,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Light Alert',
                Icons.wb_sunny,
                () => _sendLightAlert(),
                Colors.orange,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Temperature Alert',
                Icons.thermostat,
                () => _sendTemperatureAlert(),
                Colors.red,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Nutrients Alert',
                Icons.grass,
                () => _sendNutrientsAlert(),
                Colors.green,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 5: IoT Sensor Data Testing
  Widget _buildSensorDataSection() {
    return _buildTestSection(
      title: '🌡️ IoT Sensor Data Testing',
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 16,
          children: [
            Expanded(
              child: _buildNumberInputField(
                controller: _moistureController,
                label: 'Moisture (%)',
                icon: Icons.water_drop,
              ),
            ),
            Expanded(
              child: _buildNumberInputField(
                controller: _lightController,
                label: 'Light (lux)',
                icon: Icons.wb_sunny,
              ),
            ),
            Expanded(
              child: _buildNumberInputField(
                controller: _temperatureController,
                label: 'Temperature (°C)',
                icon: Icons.thermostat,
              ),
            ),
            Expanded(
              child: _buildNumberInputField(
                controller: _nutrientsController,
                label: 'Nutrients (%)',
                icon: Icons.grass,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            Expanded(
              child: _buildActionButton(
                'Send Normal Data',
                Icons.sensors,
                () => _sendSensorData(false),
                Colors.green,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Send Alert Data',
                Icons.warning,
                () => _sendSensorData(true),
                Colors.orange,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 6: Notification Management
  Widget _buildNotificationManagementSection() {
    return _buildTestSection(
      title: '📊 Notification Management',
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            Expanded(
              child: _buildActionButton(
                'Load Notifications',
                Icons.refresh,
                () => _loadNotifications(),
                Colors.blue,
              ),
            ),
            Expanded(
              child: _buildActionButton(
                'Mark All Read',
                Icons.mark_email_read,
                () => _markAllNotificationsRead(),
                Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildNotificationsList(),
      ],
    );
  }

  // Test Results Section
  Widget _buildTestResultsSection() {
    return _buildTestSection(
      title: '📝 Test Results',
      children: [
        Container(
          height: 200,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Console Log',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700],
                    ),
                  ),
                  IconButton(
                    onPressed: _clearResults,
                    icon: Icon(Icons.clear, color: Colors.grey[600]),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _testResults.map((result) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Text(
                          result,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontFamily: 'monospace',
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Helper Methods
  Future<void> _registerFCMToken() async {
    setState(() => _isLoading = true);
    try {
      final token = await _notificationService.getDeviceToken();
      if (token != null) {
        final response = await _apiService.post('/notifications/register-token', {
          'fcmToken': token,
          'platform': 'android',
        });
        
        if (response['success'] == true) {
          setState(() => _fcmTokenRegistered = true);
          _updateStatus('✅ FCM Token registered successfully');
        } else {
          _updateStatus('❌ Failed to register FCM token');
        }
      } else {
        _updateStatus('❌ Could not get device token');
      }
    } catch (e) {
      _updateStatus('❌ Error registering FCM token: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _removeFCMToken() async {
    setState(() => _isLoading = true);
    try {
      final token = await _notificationService.getDeviceToken();
      if (token != null) {
        final response = await _apiService.delete('/notifications/remove-token', data: {
          'fcmToken': token,
        });
        
        if (response['success'] == true) {
          setState(() => _fcmTokenRegistered = false);
          _updateStatus('✅ FCM Token removed successfully');
        } else {
          _updateStatus('❌ Failed to remove FCM token');
        }
      }
    } catch (e) {
      _updateStatus('❌ Error removing FCM token: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendTestNotification() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.post('/notifications/test-notification', {
        'title': _titleController.text.isEmpty ? '🌱 Test Notification' : _titleController.text,
        'message': _messageController.text.isEmpty ? 'This is a test notification!' : _messageController.text,
      });
      
      if (response['success'] == true) {
        _updateStatus('✅ Test notification sent successfully');
      } else {
        _updateStatus('❌ Failed to send test notification');
      }
    } catch (e) {
      _updateStatus('❌ Error sending test notification: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendWateringAlert() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await _apiService.post('/notifications/watering-reminder', {
        'personId': authProvider.user?['idPerson'] ?? 1,
        'objectId': 1,
        'plantName': _plantNameController.text.isEmpty ? 'Test Plant' : _plantNameController.text,
        'daysOverdue': 2,
      });
      
      _updateStatus('✅ Watering alert sent');
    } catch (e) {
      _updateStatus('❌ Error sending watering alert: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendLightAlert() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await _apiService.post('/notifications/light-notification', {
        'personId': authProvider.user?['idPerson'] ?? 1,
        'objectId': 1,
        'plantName': _plantNameController.text.isEmpty ? 'Test Plant' : _plantNameController.text,
        'lightLevel': 'too_low',
      });
      
      _updateStatus('✅ Light alert sent');
    } catch (e) {
      _updateStatus('❌ Error sending light alert: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendTemperatureAlert() async {
    setState(() => _isLoading = true);
    try {
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await _apiService.post('/notifications/temperature-alert', {
        'personId': authProvider.user?['idPerson'] ?? 1,
        'objectId': 1,
        'plantName': _plantNameController.text.isEmpty ? 'Test Plant' : _plantNameController.text,
        'temperature': 35,
        'alertType': 'too_hot',
      });

      _updateStatus('✅ Temperature alert sent');
    } catch (e) {
      _updateStatus('❌ Error sending temperature alert: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendNutrientsAlert() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.post('/sensors/test-alert', {
        'alertType': 'nutrients',
        'plantName': _plantNameController.text.isEmpty ? 'Test Plant' : _plantNameController.text,
        'objectId': 1,
      });
      
      _updateStatus('✅ Nutrients alert sent');
    } catch (e) {
      _updateStatus('❌ Error sending nutrients alert: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _sendSensorData(bool triggerAlerts) async {
    setState(() => _isLoading = true);
    try {
      final moisture = triggerAlerts ? 8 : double.parse(_moistureController.text);
      final light = triggerAlerts ? 150 : double.parse(_lightController.text);
      final temperature = triggerAlerts ? 35 : double.parse(_temperatureController.text);
      final nutrients = triggerAlerts ? 5 : double.parse(_nutrientsController.text);
      
      final response = await _apiService.post('/sensors/data', {
        'objectId': 1,
        'moisture': moisture,
        'light': light,
        'temperature': temperature,
        'soilNutrients': nutrients,
        'plantName': _plantNameController.text.isEmpty ? 'Test Plant' : _plantNameController.text,
      });
      
      if (response['success'] == true) {
        final alertsSent = response['alertsSent'] as List? ?? [];
        _updateStatus('✅ Sensor data sent - ${alertsSent.length} alerts triggered');
        
        for (final alert in alertsSent) {
          _updateStatus('  📢 ${alert['type']}: ${alert['message']}');
        }
      } else {
        _updateStatus('❌ Failed to send sensor data');
      }
    } catch (e) {
      _updateStatus('❌ Error sending sensor data: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await _apiService.get('/notifications/person/${authProvider.user?['idPerson'] ?? 1}');
      
      if (response is List) {
        setState(() => _notifications = response.cast<Map<String, dynamic>>());
        _updateStatus('✅ Loaded ${_notifications.length} notifications');
      } else {
        _updateStatus('❌ Failed to load notifications');
      }
    } catch (e) {
      _updateStatus('❌ Error loading notifications: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAllNotificationsRead() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await _apiService.patch('/notifications/person/${authProvider.user?['idPerson'] ?? 1}/read-all');
      _updateStatus('✅ All notifications marked as read');
      _loadNotifications();
    } catch (e) {
      _updateStatus('❌ Error marking notifications as read: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // UI Helper Methods
  Widget _buildTestSection({required String title, required List<Widget> children}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildStatusCard({
    required String title,
    required String status,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
              Text(
                status,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: Colors.green[600]),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(16),
          labelStyle: TextStyle(color: Colors.green[700]),
        ),
      ),
    );
  }

  Widget _buildNumberInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: Colors.green[600]),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(16),
          labelStyle: TextStyle(color: Colors.green[700]),
        ),
      ),
    );
  }

  Widget _buildActionButton(String text, IconData icon, VoidCallback onPressed, Color color) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: _isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    text,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildNotificationsList() {
    if (_notifications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(Icons.notifications_none, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No notifications found',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: _notifications.map((notification) {
        final isRead = notification['isRead'] ?? false;
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isRead ? Colors.grey[50] : Colors.green[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isRead ? Colors.grey[200]! : Colors.green[200]!,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      notification['title'] ?? 'No title',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isRead ? Colors.grey[700] : Colors.green[700],
                      ),
                    ),
                  ),
                  if (!isRead)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'NEW',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                notification['description'] ?? 'No description',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'ID: ${notification['idNotification']}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),
                  if (notification['plantName'] != null)
                    Text(
                      '🌱 ${notification['plantName']}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green[600],
                      ),
                    ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.green[50]!,
              Colors.green[100]!,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.arrow_back, color: Colors.black87),
                        ),
                        const SizedBox(width: 16),
                        const Text(
                          'Notification Testing',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Test all notification system features',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Status Message
                    if (_statusMessage.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 24),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.blue[200]!),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info, color: Colors.blue[600], size: 24),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _statusMessage,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.blue[700],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Test Sections
                    _buildAuthenticationSection(),
                    _buildFCMTokenSection(),
                    _buildBasicNotificationSection(),
                    _buildPlantNotificationSection(),
                    _buildSensorDataSection(),
                    _buildNotificationManagementSection(),
                    _buildTestResultsSection(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _titleController.dispose();
    _messageController.dispose();
    _plantNameController.dispose();
    _moistureController.dispose();
    _lightController.dispose();
    _temperatureController.dispose();
    _nutrientsController.dispose();
    super.dispose();
  }
} 