import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/foundation.dart'; // pour listEquals
import '../../models/object_profile.dart';
import '../../providers/plant_provider.dart';
import '../../services/object_profile_service.dart';
import 'object_profile_event.dart';
import 'object_profile_state.dart';

class ObjectProfileBloc extends Bloc<ObjectProfileEvent, ObjectProfileState> {
  final PlantProvider provider;
  final int personId;

  final _profilesController = StreamController<List<ObjectProfile>>.broadcast();
  Stream<List<ObjectProfile>> get profilesStream => _profilesController.stream;

  List<ObjectProfile> _currentProfiles = [];
  Timer? _pollingTimer;
  StreamSubscription<int>? _plantUpdateSubscription;

  ObjectProfileBloc({
    required this.provider,
    required this.personId,
  }) : super(ProfileLoading()) {
    on<LoadProfiles>(_onLoad);
    on<ToggleAutomatic>(_onToggleAutomatic);
    on<ToggleWillWatering>(_onToggleWillWatering);

    // Listen for global plant updates
    _plantUpdateSubscription = ObjectProfileService.plantUpdateStream.listen((plantId) {
      print('🔔 ObjectProfileBloc received update notification for plant $plantId');
      // Refresh our data when any plant is updated
      add(LoadProfiles());
    });

    // Démarrage du polling automatique toutes les 10 secondes
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      add(LoadProfiles());
    });

    // Chargement initial
    add(LoadProfiles());
  }

  Future<void> _onLoad(LoadProfiles event, Emitter<ObjectProfileState> emit) async {
    try {
      final profiles = await provider.fetchProfiles(personId);

      // Toujours émettre si c'est le premier chargement
      final shouldEmit = _currentProfiles.isEmpty && profiles.isEmpty
          || !listEquals(profiles, _currentProfiles);

      if (shouldEmit) {
        _currentProfiles = profiles;
        _profilesController.add(_currentProfiles);
        emit(ProfileLoaded(_currentProfiles));
      } else if (state is! ProfileLoaded) {
        // Cas de premier affichage même si pas de changement
        emit(ProfileLoaded(_currentProfiles));
      }
    } catch (e) {
      emit(ProfileError("Erreur de chargement : $e"));
    }
  }


  void _onToggleAutomatic(ToggleAutomatic event, Emitter<ObjectProfileState> emit) {
    if (state is! ProfileLoaded) return;

    _currentProfiles = _currentProfiles.map((profile) {
      if (profile.idObjectProfile == event.id) {
        return profile.copyWith(isAutomatic: !(profile.isAutomatic ?? false));
      }
      return profile;
    }).toList();

    emit(ProfileLoaded(_currentProfiles));
    _profilesController.add(_currentProfiles);
  }

  void _onToggleWillWatering(ToggleWillWatering event, Emitter<ObjectProfileState> emit) {
    if (state is! ProfileLoaded) return;

    _currentProfiles = _currentProfiles.map((profile) {
      if (profile.idObjectProfile == event.id) {
        return profile.copyWith(isWillWatering: !(profile.isWillWatering ?? false));
      }
      return profile;
    }).toList();

    emit(ProfileLoaded(_currentProfiles));
    _profilesController.add(_currentProfiles);
  }

  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    _plantUpdateSubscription?.cancel();
    _profilesController.close();
    return super.close();
  }
}
