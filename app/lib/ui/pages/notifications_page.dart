import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/notification_model.dart';
import '../../services/enhanced_notification_service.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';
import 'comment_detail_page.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> with TickerProviderStateMixin {
  final EnhancedNotificationService _notificationService = EnhancedNotificationService();
  late TabController _tabController;
  
  List<NotificationModel> _allNotifications = [];
  List<NotificationModel> _socialNotifications = [];
  List<NotificationModel> _plantNotifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadNotifications();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;

    if (token == null) {
      setState(() {
        _error = 'Non authentifié';
        _isLoading = false;
      });
      return;
    }

    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final allNotifications = await _notificationService.getAllNotifications(token);
      
      setState(() {
        _allNotifications = allNotifications;
        _socialNotifications = allNotifications
            .where((n) => n.isSocialNotification)
            .toList();
        _plantNotifications = allNotifications
            .where((n) => n.isPlantNotification)
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.all_inbox), text: 'Toutes'),
            Tab(icon: Icon(Icons.chat_bubble_outline), text: 'Social'),
            Tab(icon: Icon(Icons.eco), text: 'Plantes'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNotifications,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Erreur: $_error'))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildNotificationList(_allNotifications),
                    _buildNotificationList(_socialNotifications),
                    _buildNotificationList(_plantNotifications),
                  ],
                ),
    );
  }

  Widget _buildNotificationList(List<NotificationModel> notifications) {
    if (notifications.isEmpty) {
      return const Center(
        child: Text('Aucune notification'),
      );
    }

    return ListView.builder(
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return Card(
          margin: const EdgeInsets.all(8),
          child: ListTile(
            leading: CircleAvatar(
              child: Text(notification.notificationIcon),
            ),
            title: Text(notification.title ?? 'Notification'),
            subtitle: Text(notification.description ?? ''),
            trailing: notification.isRead ? null : const Icon(Icons.circle, color: Colors.blue, size: 12),
            onTap: () {
              // Handle tap - navigate to comment if social notification
              if (notification.isSocialNotification && notification.idComment != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CommentDetailPage(commentId: notification.idComment!),
                  ),
                );
              }
            },
          ),
        );
      },
    );
  }
} 