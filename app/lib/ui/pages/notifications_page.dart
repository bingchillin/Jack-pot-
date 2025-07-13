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
        _error = AppLocalizations.of(context)!.notAuthenticated;
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
      
      print('Debug: Loaded ${allNotifications.length} total notifications');
      for (final notif in allNotifications) {
        print('Debug: Notification type: ${notif.notificationType}, title: ${notif.title}');
      }
      
      final socialNotifs = allNotifications
          .where((n) => n.isSocialNotification)
          .toList();
          
      final plantNotifs = allNotifications
          .where((n) => n.isPlantNotification)
          .toList();
      
      print('Debug: Found ${socialNotifs.length} social notifications');
      print('Debug: Found ${plantNotifs.length} plant notifications');
      
      setState(() {
        _allNotifications = allNotifications;
        _socialNotifications = socialNotifs;
        _plantNotifications = plantNotifs;
        _isLoading = false;
      });
    } catch (e) {
      print('Debug: Error loading notifications: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.notifications),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(icon: const Icon(Icons.all_inbox), text: localizations.all),
            Tab(icon: const Icon(Icons.chat_bubble_outline), text: localizations.social),
            Tab(icon: const Icon(Icons.eco), text: localizations.plants),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        localizations.errorLoadingNotifications,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildNotificationList(_allNotifications, localizations),
                    _buildNotificationList(_socialNotifications, localizations),
                    _buildNotificationList(_plantNotifications, localizations),
                  ],
                ),
    );
  }

  Widget _buildNotificationList(List<NotificationModel> notifications, AppLocalizations localizations) {
    if (notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              localizations.noNotifications,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: notifications.length,
      separatorBuilder: (context, index) => Divider(
        height: 1,
        color: Colors.grey[200],
        indent: 16,
        endIndent: 16,
      ),
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return _buildNotificationItem(notification, localizations);
      },
    );
  }

  Widget _buildNotificationItem(NotificationModel notification, AppLocalizations localizations) {
    return Container(
      color: notification.isRead ? Colors.white : Colors.blue.withOpacity(0.02),
      child: InkWell(
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
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Notification icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _getNotificationColor(notification).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: _getNotificationColor(notification).withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Icon(
                    _getNotificationIcon(notification),
                    color: _getNotificationColor(notification),
                    size: 24,
                  ),
                ),
              ),
              
              const SizedBox(width: 12),
              
              // Notification content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title and unread indicator
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title ?? 'Notification',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[800],
                            ),
                          ),
                        ),
                        if (!notification.isRead) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.blue,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    
                    const SizedBox(height: 4),
                    
                    // Description
                    if (notification.description != null && notification.description!.isNotEmpty) ...[
                      Text(
                        notification.description!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // Timestamp
                    Text(
                      _formatNotificationTime(notification.createdAt),
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getNotificationIcon(NotificationModel notification) {
    if (notification.isSocialNotification) {
      return Icons.chat_bubble_outline;
    } else if (notification.isPlantNotification) {
      return Icons.eco;
    }
    return Icons.notifications;
  }

  Color _getNotificationColor(NotificationModel notification) {
    if (notification.isSocialNotification) {
      return Colors.blue[600]!;
    } else if (notification.isPlantNotification) {
      return Colors.green[600]!;
    }
    return Colors.grey[600]!;
  }

  String _formatNotificationTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'now';
    }
  }
}