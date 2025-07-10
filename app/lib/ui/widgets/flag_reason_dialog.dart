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
    'inappropriate': 'Contenu inapproprié',
    'spam': 'Spam ou publicité',
    'harassment': 'Harcèlement',
    'hate_speech': 'Discours de haine',
    'other': 'Autre',
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
          const Text('Signaler le commentaire'),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Pourquoi signalez-vous ce commentaire ?',
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
                    Expanded(child: Text(entry.value)),
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
                labelText: 'Détails supplémentaires (optionnel)',
                hintText: 'Expliquez pourquoi ce commentaire pose problème...',
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
          child: const Text('Annuler'),
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
          child: const Text('Signaler'),
        ),
      ],
    );
  }
} 