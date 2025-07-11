import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

enum TagFilter { all, conversation, conseil }

class TwitterTagFilter extends StatelessWidget {
  final TagFilter selectedFilter;
  final Function(TagFilter) onFilterChanged;

  const TwitterTagFilter({
    Key? key,
    required this.selectedFilter,
    required this.onFilterChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.green[50],
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[100]!,
            width: 1,
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildFilterChip(
              label: localizations.filterAll,
              filter: TagFilter.all,
              icon: Icons.all_inclusive,
              color: Colors.grey[700]!,
            ),
            const SizedBox(width: 12),
            _buildFilterChip(
              label: localizations.filterConversation,
              filter: TagFilter.conversation,
              icon: Icons.chat_bubble_outline,
              color: Colors.blue[600]!,
            ),
            const SizedBox(width: 12),
            _buildFilterChip(
              label: localizations.filterAdvice,
              filter: TagFilter.conseil,
              icon: Icons.lightbulb_outline,
              color: Colors.green[600]!,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required TagFilter filter,
    required IconData icon,
    required Color color,
  }) {
    final isSelected = selectedFilter == filter;
    
    return GestureDetector(
      onTap: () => onFilterChanged(filter),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? null : Border.all(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : color,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : color,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Extension pour convertir TagFilter en String pour le filtrage
extension TagFilterExtension on TagFilter {
  String? get tagValue {
    switch (this) {
      case TagFilter.all:
        return null;
      case TagFilter.conversation:
        return 'Conversation';
      case TagFilter.conseil:
        return 'Conseil';
    }
  }
  
  String getDisplayName(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    switch (this) {
      case TagFilter.all:
        return localizations.filterAll;
      case TagFilter.conversation:
        return localizations.filterConversation;
      case TagFilter.conseil:
        return localizations.filterAdvice;
    }
  }
} 