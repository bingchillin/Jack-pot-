import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/notification_model.dart';
import '../app_config.dart';

class EnhancedNotificationService {
  static String get baseUrl => AppConfig.baseUrl;

  /// Get all notifications for current user
  Future<List<NotificationModel>> getAllNotifications(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/all'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching notifications: $e');
    }
  }

  /// Get social notifications (likes, mentions, replies, friend requests)
  Future<List<NotificationModel>> getSocialNotifications(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/social'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load social notifications: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching social notifications: $e');
    }
  }

  /// Get notifications by type
  Future<List<NotificationModel>> getNotificationsByType(String token, String type) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/by-type/$type'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load notifications by type: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching notifications by type: $e');
    }
  }

  /// Mark notification as read
  Future<bool> markAsRead(String token, int notificationId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Mark all notifications as read for current user
  Future<bool> markAllAsRead(String token, int personId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/person/$personId/read-all'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Get unread notification count
  Future<int> getUnreadCount(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/unread-count'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['count'] ?? 0;
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  }

  /// Navigate to comment from notification
  String getCommentRoute(NotificationModel notification) {
    if (notification.idComment != null) {
      return '/comment/${notification.idComment}';
    }
    return '/notifications';
  }

  /// Get plant route from notification
  String getPlantRoute(NotificationModel notification) {
    if (notification.idObject != null) {
      return '/plant/${notification.idObject}';
    }
    return '/plants';
  }

  /// Get friend notifications
  Future<List<NotificationModel>> getFriendNotifications(String token) async {
    try {
      final allNotifications = await getAllNotifications(token);
      return allNotifications.where((notification) => 
        notification.notificationType == 'friend_request_received' ||
        notification.notificationType == 'friend_request_accepted' ||
        notification.notificationType == 'friend_request_rejected'
      ).toList();
    } catch (e) {
      throw Exception('Error fetching friend notifications: $e');
    }
  }

  /// Get user route from notification
  String getUserProfileRoute(NotificationModel notification) {
    if (notification.idTriggeringPerson != null) {
      return '/user-profile/${notification.idTriggeringPerson}';
    }
    return '/friends-management';
  }
}