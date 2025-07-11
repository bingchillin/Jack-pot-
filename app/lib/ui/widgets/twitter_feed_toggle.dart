import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

enum FeedType { forYou, friends }

class TwitterFeedToggle extends StatelessWidget {
  final FeedType currentFeed;
  final Function(FeedType) onFeedChanged;
  final bool hasUnreadFriends;

  const TwitterFeedToggle({
    Key? key,
    required this.currentFeed,
    required this.onFeedChanged,
    this.hasUnreadFriends = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.green[50],
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[100]!,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Main toggle buttons
          Container(
            height: 60,
            child: Row(
              children: [
                Expanded(
                  child: _buildToggleButton(
                    text: localizations.feedForYou,
                    feedType: FeedType.forYou,
                    isSelected: currentFeed == FeedType.forYou,
                  ),
                ),
                Expanded(
                  child: _buildToggleButton(
                    text: localizations.feedFriends,
                    feedType: FeedType.friends,
                    isSelected: currentFeed == FeedType.friends,
                    hasNotification: hasUnreadFriends,
                  ),
                ),
              ],
            ),
          ),
          
          // Underline indicator
          Container(
            height: 2,
            child: Row(
              children: [
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 2,
                    color: currentFeed == FeedType.forYou 
                        ? Colors.green[600] 
                        : Colors.transparent,
                  ),
                ),
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 2,
                    color: currentFeed == FeedType.friends 
                        ? Colors.green[600] 
                        : Colors.transparent,
                  ),
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
    return InkWell(
      onTap: () => onFeedChanged(feedType),
      child: Container(
        height: 60,
        child: Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? Colors.black : Colors.grey[600],
                ),
                child: Text(text),
              ),
              if (hasNotification && !isSelected) ...[
                const SizedBox(width: 8),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: Colors.green[600],
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
} 