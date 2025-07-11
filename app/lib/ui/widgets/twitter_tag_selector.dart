import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

class TwitterTagSelector extends StatelessWidget {
  final String? selectedTag;
  final Function(String?) onTagSelected;
  final List<String> availableTags;

  const TwitterTagSelector({
    Key? key,
    required this.selectedTag,
    required this.onTagSelected,
    this.availableTags = const ['Conversation', 'Conseil'],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return PopupMenuButton<String?>(
      initialValue: selectedTag,
      onSelected: onTagSelected,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.tag,
              color: Colors.grey[600],
              size: 16,
            ),
            const SizedBox(width: 6),
            Text(
              selectedTag != null 
                  ? _getTagDisplayName(selectedTag!, localizations)
                  : localizations.selectCategory,
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.arrow_drop_down,
              color: Colors.grey[600],
              size: 16,
            ),
          ],
        ),
      ),
      itemBuilder: (context) => [
        PopupMenuItem<String?>(
          value: null,
          child: Row(
            children: [
              Icon(
                Icons.clear,
                size: 18,
                color: Colors.grey[600],
              ),
              const SizedBox(width: 8),
              Text('No Category'),
            ],
          ),
        ),
        ...availableTags.map((tag) => PopupMenuItem<String>(
          value: tag,
          child: Row(
            children: [
              Icon(
                _getTagIcon(tag),
                size: 18,
                color: _getTagColor(tag),
              ),
              const SizedBox(width: 8),
              Text(_getTagDisplayName(tag, localizations)),
            ],
          ),
        )),
      ],
    );
  }

  String _getTagDisplayName(String tag, AppLocalizations localizations) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return localizations.conversation;
      case 'conseil':
        return localizations.advice;
      default:
        return tag;
    }
  }

  Color _getTagColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return Colors.blue[600]!;
      case 'conseil':
        return Colors.green[600]!;
      default:
        return Colors.grey[600]!;
    }
  }

  IconData _getTagIcon(String tag) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return Icons.chat_bubble_outline;
      case 'conseil':
        return Icons.lightbulb_outline;
      default:
        return Icons.tag;
    }
  }
} 