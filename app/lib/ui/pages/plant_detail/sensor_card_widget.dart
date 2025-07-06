import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class SensorCardWidget extends StatelessWidget {
  final String label;
  final dynamic value;
  final IconData icon;
  final String unit;
  final double? minValue;
  final double? maxValue;
  final Color? customColor;

  const SensorCardWidget({
    Key? key,
    required this.label,
    required this.value,
    required this.icon,
    this.unit = '',
    this.minValue,
    this.maxValue,
    this.customColor,
  }) : super(key: key);

  double _getProgressValue() {
    if (value == null || minValue == null || maxValue == null) return 0.0;
    
    final numValue = value is String ? double.tryParse(value) : value as double?;
    if (numValue == null) return 0.0;
    
    return ((numValue - minValue!) / (maxValue! - minValue!)).clamp(0.0, 1.0);
  }

  Color _getStatusColor() {
    if (customColor != null) return customColor!;
    
    final progress = _getProgressValue();
    if (progress < 0.3) return Colors.red[600]!;
    if (progress < 0.5) return Colors.orange[600]!;
    if (progress < 0.8) return Colors.green[500]!;
    return Colors.green[600]!;
  }

  String _getStatusText(AppLocalizations localizations) {
    if (value == null) return localizations.notAvailable;
    
    final progress = _getProgressValue();
    if (progress < 0.3) return localizations.critical;
    if (progress < 0.5) return localizations.warning;
    if (progress < 0.8) return localizations.good;
    return localizations.optimal;
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final statusColor = _getStatusColor();
    final progress = _getProgressValue();
    final displayValue = value?.toString() ?? '--';

    return Container(
      height: 100, // Fixed height to prevent overflow
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: statusColor.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row - Icon and Status
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(
                    icon,
                    size: 16,
                    color: statusColor,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _getStatusText(localizations),
                    style: TextStyle(
                      fontSize: 10,
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 8),
            
            // Label
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            
            const SizedBox(height: 4),
            
            // Value
            Text(
              '$displayValue$unit',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            
            const Spacer(),
            
            // Progress Bar
            if (minValue != null && maxValue != null && value != null) ...[
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(2),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: progress,
                  child: Container(
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
            ] else ...[
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
} 