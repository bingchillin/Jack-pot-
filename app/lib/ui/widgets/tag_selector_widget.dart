import 'package:flutter/material.dart';

class TagSelectorWidget extends StatelessWidget {
  final String? selectedTag;
  final Function(String?) onTagSelected;
  final List<String> availableTags;

  const TagSelectorWidget({
    Key? key,
    required this.selectedTag,
    required this.onTagSelected,
    this.availableTags = const ['Conversation', 'Conseil'],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Catégorie',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              // Option pour aucun tag
              _buildTagChip(
                label: 'Aucune',
                isSelected: selectedTag == null,
                onTap: () => onTagSelected(null),
                color: Colors.grey,
              ),
              // Options pour chaque tag disponible
              ...availableTags.map((tag) => _buildTagChip(
                label: tag,
                isSelected: selectedTag == tag,
                onTap: () => onTagSelected(tag),
                color: _getTagColor(tag),
              )),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTagChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required Color color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey.shade700,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Color _getTagColor(String tag) {
    switch (tag) {
      case 'Conversation':
        return Colors.blue;
      case 'Conseil':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}

// Widget pour afficher un tag dans les commentaires
class TagDisplayWidget extends StatelessWidget {
  final String tag;
  final bool isSmall;

  const TagDisplayWidget({
    Key? key,
    required this.tag,
    this.isSmall = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 8,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: _getTagColor(tag).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getTagColor(tag).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        tag,
        style: TextStyle(
          color: _getTagColor(tag),
          fontSize: isSmall ? 10 : 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getTagColor(String tag) {
    switch (tag) {
      case 'Conversation':
        return Colors.blue;
      case 'Conseil':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
} 