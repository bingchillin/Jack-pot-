import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import '../../../models/leaderboard_entry.dart';

class LeaderboardItem extends StatelessWidget {
  final LeaderboardEntry entry;
  final bool isCurrentUser;

  const LeaderboardItem({
    Key? key,
    required this.entry,
    required this.isCurrentUser,
  }) : super(key: key);

  Color _getRankColor() {
    if (entry.rank == 0) {
      return Colors.grey[400]!; // Grey for unranked
    }
    switch (entry.rank) {
      case 1:
        return Colors.amber[700]!; // Gold
      case 2:
        return Colors.grey[400]!; // Silver
      case 3:
        return Colors.orange[300]!; // Bronze
      default:
        return Colors.grey[600]!;
    }
  }

  IconData _getRankIcon() {
    if (entry.rank == 0) {
      return Icons.person_outline; // Outline person for unranked
    }
    switch (entry.rank) {
      case 1:
        return Icons.emoji_events; // Trophy
      case 2:
        return Icons.workspace_premium; // Premium
      case 3:
        return Icons.star; // Star
      default:
        return Icons.person; // Person
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isCurrentUser ? Colors.green[50] : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentUser ? Colors.green[300]! : Colors.grey[200]!,
          width: isCurrentUser ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: _getRankColor(),
            borderRadius: BorderRadius.circular(25),
          ),
          child: Center(
            child: Icon(
              _getRankIcon(),
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        title: Row(
          children: [
            Text(
              entry.rank > 0 ? '#${entry.rank}' : l10n.unranked,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: _getRankColor(),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                entry.username,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isCurrentUser ? FontWeight.bold : FontWeight.normal,
                  color: isCurrentUser ? Colors.green[700] : Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (isCurrentUser)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green[600],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'YOU',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Icon(
                Icons.score,
                size: 16,
                color: Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Text(
                '${entry.totalScore} pts',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.eco,
                size: 16,
                color: Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Text(
                '${entry.plantCount} ${l10n.plants}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
} 