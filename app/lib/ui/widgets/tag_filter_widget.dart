import 'package:flutter/material.dart';

enum TagFilter { all, conversation, conseil }

class TagFilterWidget extends StatelessWidget {
  final TagFilter selectedFilter;
  final Function(TagFilter) onFilterChanged;

  const TagFilterWidget({
    Key? key,
    required this.selectedFilter,
    required this.onFilterChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.shade200,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.filter_list,
                size: 20,
                color: Colors.grey.shade600,
              ),
              const SizedBox(width: 8),
              Text(
                'Filtrer par catégorie',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip(
                  label: 'Tous',
                  filter: TagFilter.all,
                  icon: Icons.all_inclusive,
                  color: Colors.grey.shade600,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'Conversation',
                  filter: TagFilter.conversation,
                  icon: Icons.chat_bubble_outline,
                  color: Colors.blue,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'Conseil',
                  filter: TagFilter.conseil,
                  icon: Icons.lightbulb_outline,
                  color: Colors.green,
                ),
              ],
            ),
          ),
        ],
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
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
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
            if (isSelected) ...[
              const SizedBox(width: 4),
              Icon(
                Icons.check,
                size: 16,
                color: Colors.white,
              ),
            ],
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
  
  String get displayName {
    switch (this) {
      case TagFilter.all:
        return 'Tous';
      case TagFilter.conversation:
        return 'Conversation';
      case TagFilter.conseil:
        return 'Conseil';
    }
  }
} 