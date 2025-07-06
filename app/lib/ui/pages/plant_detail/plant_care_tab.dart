import 'package:flutter/material.dart';
import '../../../models/object_profile.dart';
import '../../../l10n/app_localizations.dart';

class PlantCareTab extends StatelessWidget {
  final ObjectProfile plant;

  const PlantCareTab({Key? key, required this.plant}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plant Care Advice Card
          _buildCareCard(
            localizations.plantCareAdvice,
            plant.advise ?? localizations.noAdviceAvailable,
            Icons.lightbulb_outline,
            Colors.orange[600]!,
            'Expert tips for optimal plant health',
          ),

          const SizedBox(height: 24),

          // Care Recipe Card
          _buildCareCard(
            localizations.careRecipe,
            plant.recipe ?? localizations.noRecipeAvailable,
            Icons.restaurant_menu,
            Colors.purple[600]!,
            'Step-by-step care instructions',
          ),

          const SizedBox(height: 24),

          // Quick Care Tips
          _buildQuickTipsSection(localizations),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildCareCard(
    String title,
    String content,
    IconData icon,
    Color color,
    String subtitle,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Content
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: color.withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
              child: Text(
                content,
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.grey[700],
                  height: 1.6,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickTipsSection(AppLocalizations localizations) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.tips_and_updates,
                color: Colors.green[600],
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Text(
              'Quick Care Tips',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Tips Grid
        Row(
          children: [
            Expanded(
              child: _buildTipCard(
                'Watering',
                'Check soil moisture before watering',
                Icons.water_drop,
                Colors.blue[600]!,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildTipCard(
                'Light',
                'Provide bright, indirect light',
                Icons.wb_sunny,
                Colors.yellow[600]!,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(
              child: _buildTipCard(
                'Temperature',
                'Maintain consistent room temperature',
                Icons.thermostat,
                Colors.red[600]!,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildTipCard(
                'Humidity',
                'Monitor air humidity levels',
                Icons.air,
                Colors.cyan[600]!,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTipCard(String title, String tip, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            tip,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
} 