// object_profile_event.dart
import 'package:equatable/equatable.dart';

abstract class ObjectProfileMyListEvent extends Equatable {
  const ObjectProfileMyListEvent();
  @override
  List<Object?> get props => [];
}

class LoadProfilesMyList extends ObjectProfileMyListEvent {}

class ToggleAutomatic extends ObjectProfileMyListEvent {
  final int id;

  const ToggleAutomatic(this.id);
  @override
  List<Object?> get props => [id];
}

class ToggleWillWatering extends ObjectProfileMyListEvent {
  final int id;

  const ToggleWillWatering(this.id);
  @override
  List<Object?> get props => [id];
}
