import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../models/object_profile.dart';
import '../../../../services/object_profile_service.dart';
import '../../../../l10n/app_localizations.dart';

class PlantControlSwitches extends StatefulWidget {
  final ObjectProfile plant;

  const PlantControlSwitches({Key? key, required this.plant}) : super(key: key);

  @override
  State<PlantControlSwitches> createState() => _PlantControlSwitchesState();
}

class _PlantControlSwitchesState extends State<PlantControlSwitches> {
  late bool isAutomatic;
  late bool isWillWatering;

  @override
  void initState() {
    super.initState();
    isAutomatic = widget.plant.isAutomatic ?? false;
    isWillWatering = widget.plant.isWillWatering ?? false;
  }

  @override
  void didUpdateWidget(covariant PlantControlSwitches oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.plant.isAutomatic != widget.plant.isAutomatic) {
      setState(() {
        isAutomatic = widget.plant.isAutomatic ?? false;
      });
    }
    if (oldWidget.plant.isWillWatering != widget.plant.isWillWatering) {
      setState(() {
        isWillWatering = widget.plant.isWillWatering ?? false;
      });
    }
  }

  Future<void> _updateField(String field, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');

    if (token == null) {
      print('Token introuvable');
      return;
    }

    try {
      await ObjectProfileService().updateObjectProfile(
        id: widget.plant.idObjectProfile.toString(),
        body: {field: value},
        token: token,
      );
    } catch (e) {
      print('Erreur lors de la mise à jour $field: $e');
      setState(() {
        if (field == "isAutomatic") isAutomatic = !value;
        if (field == "isWillWatering") isWillWatering = !value;
      });
    }
  }

  Widget _buildFloatingToggle({
    required String label,
    required bool value,
    required Function(bool) onChanged,
    required Color activeColor,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        height: 36, // Bigger height
        margin: const EdgeInsets.symmetric(horizontal: 3),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9), // Glass-morphism effect
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: value ? activeColor.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => onChanged(!value),
            borderRadius: BorderRadius.circular(18),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    size: 16,
                    color: value ? activeColor : Colors.grey[600],
                  ),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: value ? activeColor : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 24,
                    height: 14,
                    decoration: BoxDecoration(
                      color: value ? activeColor : Colors.grey[400],
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: AnimatedAlign(
                      duration: const Duration(milliseconds: 250),
                      curve: Curves.easeInOut,
                      alignment: value ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        width: 12,
                        height: 12,
                        margin: const EdgeInsets.all(1),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.25),
                              blurRadius: 3,
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Container(
      height: 36, // Bigger fixed height
      child: Row(
        children: [
          _buildFloatingToggle(
            label: localizations.autoMode,
            value: isAutomatic,
            onChanged: (val) {
              setState(() => isAutomatic = val);
              _updateField("isAutomatic", val);
            },
            activeColor: Colors.green[600]!,
            icon: Icons.settings,
          ),
          const SizedBox(width: 8), // More spacing between toggles
          _buildFloatingToggle(
            label: localizations.waterMode,
            value: isWillWatering,
            onChanged: (val) {
              setState(() => isWillWatering = val);
              _updateField("isWillWatering", val);
            },
            activeColor: Colors.blue[600]!,
            icon: Icons.water_drop,
          ),
        ],
      ),
    );
  }
}
