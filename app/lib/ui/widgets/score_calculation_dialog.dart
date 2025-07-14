import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/plant_care_score/plant_care_score_bloc.dart';
import '../../bloc/plant_care_score/plant_care_score_event.dart';
import '../../bloc/plant_care_score/plant_care_score_state.dart';
import '../../l10n/app_localizations.dart';

class ScoreCalculationDialog extends StatefulWidget {
  final int plantId;
  final String token;

  const ScoreCalculationDialog({
    Key? key,
    required this.plantId,
    required this.token,
  }) : super(key: key);

  @override
  State<ScoreCalculationDialog> createState() => _ScoreCalculationDialogState();
}

class _ScoreCalculationDialogState extends State<ScoreCalculationDialog> {
  final _formKey = GlobalKey<FormState>();
  final _moistureController = TextEditingController();
  final _temperatureController = TextEditingController();
  final _lightController = TextEditingController();
  final _phController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _moistureController.dispose();
    _temperatureController.dispose();
    _lightController.dispose();
    _phController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return BlocProvider(
      create: (context) => PlantCareScoreBloc(
        service: context.read(),
        plantId: widget.plantId,
        token: widget.token,
      ),
      child: BlocListener<PlantCareScoreBloc, PlantCareScoreState>(
        listener: (context, state) {
          if (state is PlantCareScoreCreated) {
            Navigator.of(context).pop(true);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(localizations.scoreCalculated),
                backgroundColor: Colors.green,
              ),
            );
          } else if (state is PlantCareScoreError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(localizations.errorCalculatingScore),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        child: Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Icon(
                          Icons.calculate,
                          color: Colors.green[600],
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              localizations.scoreCalculation,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Enter sensor data to calculate your plant care score',
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
                  
                  const SizedBox(height: 24),
                  
                  // Sensor Data Inputs
                  _buildSensorInput(
                    controller: _moistureController,
                    label: localizations.moistureLevel,
                    icon: Icons.water_drop,
                    color: Colors.blue,
                    hint: '0-100%',
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildSensorInput(
                    controller: _temperatureController,
                    label: localizations.temperatureLevel,
                    icon: Icons.thermostat,
                    color: Colors.orange,
                    hint: '°C',
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildSensorInput(
                    controller: _lightController,
                    label: localizations.lightLevel,
                    icon: Icons.wb_sunny,
                    color: Colors.amber,
                    hint: '0-1000 lux',
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildSensorInput(
                    controller: _phController,
                    label: localizations.phLevel,
                    icon: Icons.science,
                    color: Colors.purple,
                    hint: '0-14',
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Notes Input
                  TextFormField(
                    controller: _notesController,
                    decoration: InputDecoration(
                      labelText: localizations.addNotes,
                      hintText: 'Optional notes about today\'s care...',
                      prefixIcon: Icon(
                        Icons.note,
                        color: Colors.grey[600],
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Colors.green[600]!,
                          width: 2,
                        ),
                      ),
                    ),
                    maxLines: 3,
                    textInputAction: TextInputAction.done,
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            localizations.cancel,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _calculateScore,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[600],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 2,
                          ),
                          child: BlocBuilder<PlantCareScoreBloc, PlantCareScoreState>(
                            builder: (context, state) {
                              if (state is PlantCareScoreLoading) {
                                return const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                );
                              }
                              return Text(
                                localizations.calculate,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSensorInput({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required Color color,
    required String hint,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(
          icon,
          color: color,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: color,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: color.withValues(alpha: 0.05),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter a value';
        }
        final number = double.tryParse(value);
        if (number == null) {
          return 'Please enter a valid number';
        }
        return null;
      },
    );
  }

  void _calculateScore() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final moistureScore = double.parse(_moistureController.text);
    final temperatureScore = double.parse(_temperatureController.text);
    final lightScore = double.parse(_lightController.text);
    final phScore = double.parse(_phController.text);
    final notes = _notesController.text.isNotEmpty ? _notesController.text : null;

    context.read<PlantCareScoreBloc>().add(
      CreatePlantCareScore(
        plantId: widget.plantId,
        token: widget.token,
        moistureScore: moistureScore,
        temperatureScore: temperatureScore,
        lightScore: lightScore,
        phScore: phScore,
        notes: notes,
      ),
    );
  }
} 