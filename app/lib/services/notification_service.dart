import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  // Callback for when notification is tapped
  Function(String?)? onNotificationTapped;

  /// Initialize Firebase messaging and local notifications
  Future<void> initialize() async {
    try {
      // Request notification permissions
      await _requestPermissions();
      
      // Initialize local notifications
      await _initializeLocalNotifications();
      
      // Configure Firebase messaging
      await _configureFirebaseMessaging();
      
      // Get FCM token for device registration
      String? token = await getDeviceToken();
      if (kDebugMode) {
        print('🔥 FCM Token: $token');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error initializing notifications: $e');
      }
    }
  }

  /// Request notification permissions
  Future<void> _requestPermissions() async {
    // Request notification permission (iOS and Android 13+)
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (kDebugMode) {
      print('🔔 Notification permission status: ${settings.authorizationStatus}');
    }

    // For Android, also request notification permission through permission_handler
    if (await Permission.notification.isDenied) {
      await Permission.notification.request();
    }
  }

  /// Initialize local notifications plugin
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        _handleNotificationTap(response.payload);
      },
    );
  }

  /// Configure Firebase messaging handlers
  Future<void> _configureFirebaseMessaging() async {
    // Handle notification when app is in foreground
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle notification when app is in background and user taps it
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
    
    // Handle notification when app is terminated and user taps it
    RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleBackgroundMessage(initialMessage);
    }
  }

  /// Handle notification when app is in foreground
  void _handleForegroundMessage(RemoteMessage message) {
    if (kDebugMode) {
      print('🔥 Foreground message: ${message.messageId}');
      print('📱 Title: ${message.notification?.title}');
      print('📱 Body: ${message.notification?.body}');
    }

    // Show local notification for foreground messages
    _showLocalNotification(message);
  }

  /// Handle notification when app is opened from background/terminated
  void _handleBackgroundMessage(RemoteMessage message) {
    if (kDebugMode) {
      print('🔥 Background message opened: ${message.messageId}');
    }

    // Navigate to specific screen based on notification data
    String? route = message.data['route'];
    _handleNotificationTap(route);
  }

  /// Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'jackpot_channel',
      'Jackpot Notifications',
      channelDescription: 'Plant care notifications from Jackpot app',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'Jackpot',
      message.notification?.body ?? 'You have a new notification',
      notificationDetails,
      payload: message.data['route'],
    );
  }

  /// Handle notification tap
  void _handleNotificationTap(String? payload) {
    if (onNotificationTapped != null && payload != null) {
      onNotificationTapped!(payload);
    }
  }

  /// Get device FCM token
  Future<String?> getDeviceToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error getting FCM token: $e');
      }
      return null;
    }
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      if (kDebugMode) {
        print('✅ Subscribed to topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error subscribing to topic $topic: $e');
      }
    }
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      if (kDebugMode) {
        print('✅ Unsubscribed from topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error unsubscribing from topic $topic: $e');
      }
    }
  }

  /// Remove FCM token from backend (for logout)
  Future<bool> removeTokenFromBackend({
    required String baseUrl,
    required String authToken,
  }) async {
    try {
      String? fcmToken = await getDeviceToken();
      if (fcmToken == null) {
        if (kDebugMode) {
          print('❌ No FCM token to remove');
        }
        return false;
      }

      final response = await http.delete(
        Uri.parse('$baseUrl/notifications/remove-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode({
          'fcmToken': fcmToken,
        }),
      );

      if (response.statusCode == 200) {
        if (kDebugMode) {
          print('✅ FCM token removed from backend successfully');
        }
        return true;
      } else {
        if (kDebugMode) {
          print('❌ Failed to remove FCM token from backend: ${response.statusCode}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error removing FCM token from backend: $e');
      }
      return false;
    }
  }

  /// Send plant care notification
  Future<bool> sendPlantCareNotification({
    required String baseUrl,
    required String authToken,
    required String plantName,
    required String alertType,
    String? message,
    Map<String, dynamic>? sensorData,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/notifications/send-plant-notification'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode({
          'plantName': plantName,
          'alertType': alertType,
          'message': message,
          'sensorData': sensorData,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (kDebugMode) {
          print('✅ Plant care notification sent successfully');
        }
        return true;
      } else {
        if (kDebugMode) {
          print('❌ Failed to send plant care notification: ${response.statusCode}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error sending plant care notification: $e');
      }
      return false;
    }
  }

  /// Register FCM token with backend
  Future<bool> registerTokenWithBackend({
    required String baseUrl,
    required String authToken,
  }) async {
    try {
      String? fcmToken = await getDeviceToken();
      if (fcmToken == null) {
        if (kDebugMode) {
          print('❌ No FCM token available');
        }
        return false;
      }

      final platform = Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'web';
      
      final response = await http.post(
        Uri.parse('$baseUrl/notifications/register-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode({
          'fcmToken': fcmToken,
          'platform': platform,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body);
        if (kDebugMode) {
          print('✅ FCM token registered successfully: ${responseData['message']}');
        }
        return responseData['success'] ?? true;
      } else {
        if (kDebugMode) {
          print('❌ Failed to register FCM token: ${response.statusCode} - ${response.body}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error registering FCM token with backend: $e');
      }
      return false;
    }
  }

  /// Send test notification to verify setup
  Future<bool> sendTestNotification({
    required String baseUrl,
    required String authToken,
    String? title,
    String? message,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/notifications/test-notification'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode({
          'title': title ?? '🌱 Jack Pot Test',
          'message': message ?? 'This is a test notification from your plant care app!',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body);
        if (kDebugMode) {
          print('✅ Test notification sent: ${responseData['message']}');
        }
        return responseData['success'] ?? true;
      } else {
        if (kDebugMode) {
          print('❌ Failed to send test notification: ${response.statusCode} - ${response.body}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error sending test notification: $e');
      }
      return false;
    }
  }
}

/// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  if (kDebugMode) {
    print('🔥 Background message: ${message.messageId}');
  }
  // Handle background processing if needed
} 