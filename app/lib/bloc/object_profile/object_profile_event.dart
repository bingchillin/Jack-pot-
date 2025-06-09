// object_profile_event.dart
import 'package:equatable/equatable.dart';

abstract class ObjectProfileEvent extends Equatable {
  const ObjectProfileEvent();
  @override
  List<Object?> get props => [];
}

class LoadProfiles extends ObjectProfileEvent {}

class ToggleAutomatic extends ObjectProfileEvent {
  final int id;

  const ToggleAutomatic(this.id);
  @override
  List<Object?> get props => [id];
}

class ToggleWillWatering extends ObjectProfileEvent {
  final int id;

  const ToggleWillWatering(this.id);
  @override
  List<Object?> get props => [id];
}
