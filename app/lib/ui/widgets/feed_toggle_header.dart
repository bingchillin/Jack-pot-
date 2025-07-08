import 'package:flutter/material.dart';

enum FeedType { forYou, friends }

class FeedToggleHeader extends StatelessWidget {
  final FeedType currentFeed;
  final Function(FeedType) onFeedChanged;
  final bool hasUnreadFriends;

  const FeedToggleHeader({
    Key? key,
    required this.currentFeed,
    required this.onFeedChanged,
    this.hasUnreadFriends = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.shade200,
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Toggle "Pour toi" / "Amis"
          Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(25),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildToggleButton(
                  text: 'Pour toi',
                  feedType: FeedType.forYou,
                  isSelected: currentFeed == FeedType.forYou,
                ),
                _buildToggleButton(
                  text: 'Amis',
                  feedType: FeedType.friends,
                  isSelected: currentFeed == FeedType.friends,
                  hasNotification: hasUnreadFriends,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton({
    required String text,
    required FeedType feedType,
    required bool isSelected,
    bool hasNotification = false,
  }) {
    return GestureDetector(
      onTap: () => onFeedChanged(feedType),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? Colors.black87 : Colors.grey.shade600,
              ),
            ),
            if (hasNotification && !isSelected) ...[
              const SizedBox(width: 6),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Widget alternatif style TikTok avec slider
class TikTokStyleFeedToggle extends StatelessWidget {
  final FeedType currentFeed;
  final Function(FeedType) onFeedChanged;
  final bool hasUnreadFriends;

  const TikTokStyleFeedToggle({
    Key? key,
    required this.currentFeed,
    required this.onFeedChanged,
    this.hasUnreadFriends = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.shade800,
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Style TikTok avec texte blanc
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTikTokButton(
                text: 'Pour toi',
                feedType: FeedType.forYou,
                isSelected: currentFeed == FeedType.forYou,
              ),
              const SizedBox(width: 32),
              _buildTikTokButton(
                text: 'Amis',
                feedType: FeedType.friends,
                isSelected: currentFeed == FeedType.friends,
                hasNotification: hasUnreadFriends,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTikTokButton({
    required String text,
    required FeedType feedType,
    required bool isSelected,
    bool hasNotification = false,
  }) {
    return GestureDetector(
      onTap: () => onFeedChanged(feedType),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                text,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? Colors.white : Colors.grey.shade400,
                ),
              ),
              if (hasNotification && !isSelected) ...[
                const SizedBox(width: 6),
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: isSelected ? 30 : 0,
            height: 2,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(1),
            ),
          ),
        ],
      ),
    );
  }
} 