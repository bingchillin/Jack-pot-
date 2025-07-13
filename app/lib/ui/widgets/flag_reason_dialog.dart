import 'package:flutter/material.dart';

class FlagReasonDialog extends StatefulWidget {
  final Function(String reason, String? details) onFlag;

  const FlagReasonDialog({
    super.key,
    required this.onFlag,
  });

  @override
  State<FlagReasonDialog> createState() => _FlagReasonDialogState();
}

class _FlagReasonDialogState extends State<FlagReasonDialog> {
  String _selectedReason = 'inappropriate';
  final TextEditingController _detailsController = TextEditingController();

  final Map<String, String> _reasons = {
    'inappropriate': 'Inappropriate content',
    'spam': 'Spam or advertising',
    'harassment': 'Harassment',
    'hate_speech': 'Hate speech',
    'other': 'Other',
  };

  final Map<String, IconData> _reasonIcons = {
    'inappropriate': Icons.warning,
    'spam': Icons.block,
    'harassment': Icons.person_off,
    'hate_speech': Icons.sentiment_very_dissatisfied,
    'other': Icons.more_horiz,
  };

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Icon(Icons.flag, color: Colors.red.shade600),
          const SizedBox(width: 8),
          const Expanded(child: Text('Report Comment')),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Why are you reporting this comment?',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 16),
            
            // Liste des raisons
            ...(_reasons.entries.map((entry) {
              return RadioListTile<String>(
                value: entry.key,
                groupValue: _selectedReason,
                onChanged: (value) {
                  setState(() {
                    _selectedReason = value!;
                  });
                },
                title: Row(
                  children: [
                    Icon(
                      _reasonIcons[entry.key],
                      size: 20,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        entry.value,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                contentPadding: EdgeInsets.zero,
                dense: true,
              );
            }).toList()),
            
            const SizedBox(height: 16),
            
            // Champ de détails optionnel
            TextField(
              controller: _detailsController,
              decoration: const InputDecoration(
                labelText: 'Additional details (optional)',
                hintText: 'Explain why this comment is problematic...',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 3,
              maxLength: 500,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            final details = _detailsController.text.trim();
            widget.onFlag(
              _selectedReason,
              details.isEmpty ? null : details,
            );
            Navigator.of(context).pop();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
          child: const Text('Report'),
        ),
      ],
    );
  }
} 