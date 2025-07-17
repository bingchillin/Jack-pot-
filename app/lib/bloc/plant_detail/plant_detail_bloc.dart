import 'dart:async';
import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import '../../../models/object_profile.dart';
import '../../../services/object_profile_service.dart';
import '../../../app_config.dart';
import 'plant_detail_event.dart';
import 'plant_detail_state.dart';

class PlantDetailBloc extends Bloc<PlantDetailEvent, PlantDetailState> {
  final ObjectProfileService service;
  final int plantId;
  final String token;

  final _plantController = StreamController<ObjectProfile>.broadcast();
  Stream<ObjectProfile> get plantStream => _plantController.stream;

  ObjectProfile? _currentPlant;
  Timer? _pollingTimer;
  StreamSubscription<int>? _plantUpdateSubscription;

  PlantDetailBloc({
    required this.service,
    required this.plantId,
    required this.token,
  }) : super(PlantDetailInitial()) {
    on<LoadPlantDetail>(_onLoadPlantDetail);

    // Listen for global plant updates
    _plantUpdateSubscription = ObjectProfileService.plantUpdateStream.listen((updatedPlantId) {
      print('🔔 PlantDetailBloc received update notification for plant $updatedPlantId');
      // If it's our plant or a global refresh, reload with small delay
      if (updatedPlantId == plantId || updatedPlantId == -1) {
        Timer(const Duration(milliseconds: 300), () {
          add(LoadPlantDetail(plantId, token));
        });
      }
    });

    // Load initial
    add(LoadPlantDetail(plantId, token));

    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      print('🔄 PlantDetailBloc polling for plant $plantId');
      add(LoadPlantDetail(plantId, token));
    });
  }

  Future<void> _onLoadPlantDetail(
      LoadPlantDetail event, Emitter<PlantDetailState> emit) async {
    try {
      // Only emit loading state if we don't have data yet
      if (_currentPlant == null) {
        emit(PlantDetailLoading());
      }
      
      // First, trigger health recalculation to ensure it's up to date
      try {
        final healthUrl = Uri.parse("${AppConfig.baseUrl}/api/object-profile/$plantId/recalculate-health");
        final healthResponse = await http.post(healthUrl, headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        });
        print('🔄 PlantDetailBloc triggered health recalculation for plant $plantId - Status: ${healthResponse.statusCode}');
        if (healthResponse.statusCode != 200) {
          print('⚠️ Health recalculation failed with status: ${healthResponse.statusCode}');
          print('Response body: ${healthResponse.body}');
        }
      } catch (e) {
        print('⚠️ PlantDetailBloc health recalculation failed: $e');
        // Continue with normal fetch even if health recalculation fails
      }
      
      // Use direct API call without caching (like other blocs)
      final url = Uri.parse("${AppConfig.baseUrl}/api/object-profile/$plantId");
      final response = await http.get(url, headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      });

      if (response.statusCode == 200) {
        final fresh = ObjectProfile.fromJson(jsonDecode(response.body));
        print('📊 PlantDetailBloc fetched fresh data for plant $plantId - Health: ${fresh.healthPercentage}%, Moisture: ${fresh.humidityGroundSensor}');

        if (_currentPlant == null) {
          _currentPlant = fresh;
          _plantController.add(fresh);
          emit(PlantDetailLoaded(fresh));
        } else {
          final changed = _diffAndUpdate(_currentPlant!, fresh);
          print('🔄 PlantDetailBloc data changed: $changed');
          // Always update current plant and emit state, even if no changes detected
          _currentPlant = fresh;
          _plantController.add(fresh);
          emit(PlantDetailLoaded(fresh));
        }
      } else {
        throw Exception('Failed to fetch plant details: ${response.statusCode}');
      }
    } catch (e) {
      emit(PlantDetailError("Erreur de chargement : $e"));
    }
  }

  bool _diffAndUpdate(ObjectProfile oldP, ObjectProfile newP) {
    final changed = oldP.title != newP.title ||
        oldP.description != newP.description ||
        oldP.advise != newP.advise ||
        oldP.recipe != newP.recipe ||
        oldP.isAutomatic != newP.isAutomatic ||
        oldP.isWillWatering != newP.isWillWatering ||
        oldP.state != newP.state ||
        oldP.healthPercentage != newP.healthPercentage ||
        oldP.humidityAirSensor != newP.humidityAirSensor ||
        oldP.humidityGroundSensor != newP.humidityGroundSensor ||
        oldP.phGroundSensor != newP.phGroundSensor ||
        oldP.conductivityElectriqueFertilitySensor != newP.conductivityElectriqueFertilitySensor ||
        oldP.lightSensor != newP.lightSensor ||
        oldP.temperatureSensorGround != newP.temperatureSensorGround ||
        oldP.temperatureSensorExtern != newP.temperatureSensorExtern ||
        oldP.expositionTimeSun != newP.expositionTimeSun ||
        oldP.plantType?.pathPicture != newP.plantType?.pathPicture;
    
    if (changed) {
      print('🔄 PlantDetailBloc detected changes:');
      print('  Health: ${oldP.healthPercentage} -> ${newP.healthPercentage}');
      print('  pH: ${oldP.phGroundSensor} -> ${newP.phGroundSensor}');
      print('  Moisture: ${oldP.humidityGroundSensor} -> ${newP.humidityGroundSensor}');
    }
    
    return changed;
  }


  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    _plantUpdateSubscription?.cancel();
    _plantController.close();
    return super.close();
  }
}
