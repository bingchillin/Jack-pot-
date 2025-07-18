import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/notification_model.dart' show NotificationModel, Person, PlantObject;
import '../../services/enhanced_notification_service.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';
import 'comment_detail_page.dart';
import 'friends_management_page.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> with TickerProviderStateMixin {
  final EnhancedNotificationService _notificationService = EnhancedNotificationService();
  late TabController _tabController;
  late AnimationController _readAnimationController;
  
  List<NotificationModel> _allNotifications = [];
  List<NotificationModel> _socialNotifications = [];
  List<NotificationModel> _plantNotifications = [];
  bool _isLoading = true;
  String? _error;
  Set<int> _animatingNotifications = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _readAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _loadNotifications();
    
    // Auto-mark notifications as read after a short delay (like modern apps)
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && _hasUnreadNotifications()) {
        _markAllAsReadWithAnimation();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _readAnimationController.dispose();
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
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.pushNamed(context, '/notification-settings');
            },
            tooltip: localizations.notificationSettings,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.all_inbox),
                  if (_getUnreadCount(_allNotifications) > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_getUnreadCount(_allNotifications)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.all,
            ),
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.chat_bubble_outline),
                  if (_getUnreadCount(_socialNotifications) > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_getUnreadCount(_socialNotifications)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.social,
            ),
            Tab(
              icon: Stack(
                children: [
                  const Icon(Icons.eco),
                  if (_getUnreadCount(_plantNotifications) > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${_getUnreadCount(_plantNotifications)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              text: localizations.plants,
            ),
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
    final isAnimating = _animatingNotifications.contains(notification.idNotification);
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
      color: notification.isRead ? Colors.white : Colors.blue.withOpacity(0.02),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 400),
        opacity: isAnimating ? 0.7 : 1.0,
        child: InkWell(
        onTap: () => _handleNotificationTap(notification),
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
                          AnimatedScale(
                            duration: const Duration(milliseconds: 400),
                            scale: isAnimating ? 0.0 : 1.0,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Colors.blue,
                                shape: BoxShape.circle,
                              ),
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
    ));
  }

  IconData _getNotificationIcon(NotificationModel notification) {
    if (notification.isFriendNotification) {
      switch (notification.notificationType) {
        case 'friend_request_received':
          return Icons.person_add;
        case 'friend_request_accepted':
          return Icons.check_circle;
        case 'friend_request_rejected':
          return Icons.cancel;
        default:
          return Icons.people;
      }
    } else if (notification.isSocialNotification) {
      switch (notification.notificationType) {
        case 'comment_like':
          return Icons.favorite;
        case 'comment_mention':
          return Icons.alternate_email;
        case 'comment_reply':
          return Icons.reply;
        default:
          return Icons.chat_bubble_outline;
      }
    } else if (notification.isPlantNotification) {
      return Icons.eco;
    }
    return Icons.notifications;
  }

  Color _getNotificationColor(NotificationModel notification) {
    if (notification.isFriendNotification) {
      switch (notification.notificationType) {
        case 'friend_request_received':
          return Colors.orange[600]!;
        case 'friend_request_accepted':
          return Colors.green[600]!;
        case 'friend_request_rejected':
          return Colors.red[600]!;
        default:
          return Colors.purple[600]!;
      }
    } else if (notification.isSocialNotification) {
      switch (notification.notificationType) {
        case 'comment_like':
          return Colors.pink[600]!;
        case 'comment_mention':
          return Colors.blue[600]!;
        case 'comment_reply':
          return Colors.indigo[600]!;
        default:
          return Colors.blue[600]!;
      }
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

  bool _hasUnreadNotifications() {
    return _allNotifications.any((notification) => !notification.isRead);
  }

  int _getUnreadCount(List<NotificationModel> notifications) {
    return notifications.where((notification) => !notification.isRead).length;
  }

  Future<void> _markAllAsReadWithAnimation() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;
    final personId = authProvider.currentUser?.idPerson;

    if (token == null || personId == null) return;

    try {
      // Get all unread notification IDs
      final unreadNotifications = _allNotifications.where((n) => !n.isRead).toList();
      if (unreadNotifications.isEmpty) return;

      // Start animation for all unread notifications
      setState(() {
        for (var notification in unreadNotifications) {
          _animatingNotifications.add(notification.idNotification);
        }
      });

      // Wait a bit for animation to start
      await Future.delayed(const Duration(milliseconds: 200));

      // Mark all as read on server
      final success = await _notificationService.markAllAsRead(token, personId);
      
      if (success) {
        // Animate each notification with a staggered delay
        for (int i = 0; i < unreadNotifications.length; i++) {
          await Future.delayed(Duration(milliseconds: i * 50)); // Stagger by 50ms
          
          if (mounted) {
            setState(() {
              unreadNotifications[i].isRead = true;
            });
          }
        }

        // Update all filtered lists
        if (mounted) {
          setState(() {
            for (var notification in _socialNotifications) {
              if (unreadNotifications.any((n) => n.idNotification == notification.idNotification)) {
                notification.isRead = true;
              }
            }
            for (var notification in _plantNotifications) {
              if (unreadNotifications.any((n) => n.idNotification == notification.idNotification)) {
                notification.isRead = true;
              }
            }
          });
        }

        // Clear animation state after animations complete
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) {
          setState(() {
            _animatingNotifications.clear();
          });
        }
        
        print('DEBUG: Auto-marked ${unreadNotifications.length} notifications as read with animation');
      } else {
        // If API call failed, clear animation state
        if (mounted) {
          setState(() {
            _animatingNotifications.clear();
          });
        }
      }
    } catch (e) {
      print('Error auto-marking notifications as read: $e');
      // Clear animation state on error
      if (mounted) {
        setState(() {
          _animatingNotifications.clear();
        });
      }
    }
  }

  void _handleNotificationTap(NotificationModel notification) {
    // Mark as read if not already read
    if (!notification.isRead) {
      _markNotificationAsRead(notification);
    }

    // Navigate based on notification type
    if (notification.isFriendNotification) {
      _handleFriendNotificationTap(notification);
    } else if (notification.notificationType == 'comment_like' || 
               notification.notificationType == 'comment_mention' || 
               notification.notificationType == 'comment_reply') {
      _handleCommentNotificationTap(notification);
    } else if (notification.isPlantNotification) {
      _handlePlantNotificationTap(notification);
    }
  }

  void _handleFriendNotificationTap(NotificationModel notification) {
    switch (notification.notificationType) {
      case 'friend_request_received':
        // Navigate to friends management page with focus on pending requests tab
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const FriendsManagementPage(initialTabIndex: 1), // Tab index 1 = Pending requests
          ),
        );
        break;
      case 'friend_request_accepted':
      case 'friend_request_rejected':
        // Navigate to the user's profile if we have the triggering person
        if (notification.triggeringPerson != null) {
          Navigator.pushNamed(
            context, 
            '/user-profile',
            arguments: notification.triggeringPerson!.idPerson,
          );
        } else {
          // Fallback to friends list
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const FriendsManagementPage(initialTabIndex: 0), // Tab index 0 = Friends list
            ),
          );
        }
        break;
    }
  }

  void _handleCommentNotificationTap(NotificationModel notification) {
    if (notification.idComment != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CommentDetailPage(commentId: notification.idComment!),
        ),
      );
    }
  }

  void _handlePlantNotificationTap(NotificationModel notification) {
    if (notification.idObject != null) {
      // Navigate to plant detail page
      Navigator.pushNamed(
        context,
        '/plant-detail',
        arguments: notification.idObject,
      );
    } else {
      // Fallback to plants list
      Navigator.pushNamed(context, '/my-plants');
    }
  }

  Future<void> _markNotificationAsRead(NotificationModel notification) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.accessToken;

    if (token == null) return;

    try {
      final success = await _notificationService.markAsRead(token, notification.idNotification);
      if (success && mounted) {
        setState(() {
          notification.isRead = true;
        });
      }
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }
}