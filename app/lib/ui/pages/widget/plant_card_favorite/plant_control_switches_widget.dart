import 'package:app/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../models/object_profile.dart';
import '../../../../services/object_profile_service.dart';

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

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("AUTO", style: TextStyle(fontSize: 16)),
            Switch(
              value: isAutomatic,
              onChanged: (val) {
                setState(() => isAutomatic = val);
                _updateField("isAutomatic", val);
              },
              activeColor: Colors.green,
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("ARROSER", style: TextStyle(fontSize: 16)),
            Switch(
              value: isWillWatering,
              onChanged: (val) {
                setState(() => isWillWatering = val);
                _updateField("isWillWatering", val);
              },
              activeColor: Colors.blue,
            ),
          ],
        ),
      ],
    );
  }
}
