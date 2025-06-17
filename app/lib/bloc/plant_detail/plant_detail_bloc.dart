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

  PlantDetailBloc({
    required this.service,
    required this.plantId,
    required this.token,
  }) : super(PlantDetailInitial()) {
    on<LoadPlantDetail>(_onLoadPlantDetail);

    // Load initial
    add(LoadPlantDetail(plantId, token));

    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      add(LoadPlantDetail(plantId, token));
    });
  }

  Future<void> _onLoadPlantDetail(
      LoadPlantDetail event, Emitter<PlantDetailState> emit) async {
    try {
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
        oldP.plantType.pathPicture != newP.plantType.pathPicture;
  }


  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    _plantController.close();
    return super.close();
  }
}
