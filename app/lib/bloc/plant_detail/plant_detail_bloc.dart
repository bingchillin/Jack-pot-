import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../models/object_profile.dart';
import '../../../services/object_profile_service.dart';
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
      add(LoadPlantDetail(plantId, token));
    });
  }

  Future<void> _onLoadPlantDetail(
      LoadPlantDetail event, Emitter<PlantDetailState> emit) async {
    try {
      // Check if we have fresh cached data to avoid loading state
      final cached = service.getCachedPlant(plantId);
      
      if (cached != null && _currentPlant == null) {
        // We have cached data and this is the first load - skip loading state
        _currentPlant = cached;
        _plantController.add(cached);
        emit(PlantDetailLoaded(cached));
        return;
      }
      
      // Only emit loading state if we don't have data yet
      if (_currentPlant == null) {
        emit(PlantDetailLoading());
      }
      
      final fresh = await service.fetchObjectProfileDetails(plantId, token);

      if (_currentPlant == null) {
        _currentPlant = fresh;
        _plantController.add(fresh);
        emit(PlantDetailLoaded(fresh));
      } else {
        final changed = _diffAndUpdate(_currentPlant!, fresh);
        if (changed) {
          _currentPlant = fresh;
          _plantController.add(fresh);
          emit(PlantDetailLoaded(fresh));
        }
      }
    } catch (e) {
      emit(PlantDetailError("Erreur de chargement : $e"));
    }
  }

  bool _diffAndUpdate(ObjectProfile oldP, ObjectProfile newP) {
    return oldP.title != newP.title ||
        oldP.description != newP.description ||
        oldP.advise != newP.advise ||
        oldP.recipe != newP.recipe ||
        oldP.isAutomatic != newP.isAutomatic ||
        oldP.isWillWatering != newP.isWillWatering ||
        oldP.state != newP.state ||
        oldP.humidityAirSensor != newP.humidityAirSensor ||
        oldP.humidityGroundSensor != newP.humidityGroundSensor ||
        oldP.phGroundSensor != newP.phGroundSensor ||
        oldP.conductivityElectriqueFertilitySensor != newP.conductivityElectriqueFertilitySensor ||
        oldP.lightSensor != newP.lightSensor ||
        oldP.temperatureSensorGround != newP.temperatureSensorGround ||
        oldP.temperatureSensorExtern != newP.temperatureSensorExtern ||
        oldP.expositionTimeSun != newP.expositionTimeSun ||
        oldP.plantType?.pathPicture != newP.plantType?.pathPicture;
  }


  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    _plantUpdateSubscription?.cancel();
    _plantController.close();
    return super.close();
  }
}
