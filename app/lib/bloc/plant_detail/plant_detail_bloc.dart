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

    // Poll toutes les 30 sec
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
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

  /// Compare les champs importants uniquement
  bool _diffAndUpdate(ObjectProfile oldP, ObjectProfile newP) {
    return oldP.title != newP.title ||
        oldP.description != newP.description ||
        oldP.isAutomatic != newP.isAutomatic ||
        oldP.isWillWatering != newP.isWillWatering ||
        oldP.state != newP.state ||
        oldP.plantType.pathPicture != newP.plantType.pathPicture;
    // Tu peux ajouter d'autres comparaisons ici si besoin
  }

  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    _plantController.close();
    return super.close();
  }
}
