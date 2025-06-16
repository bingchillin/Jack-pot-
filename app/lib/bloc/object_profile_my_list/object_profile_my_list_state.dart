// object_profile_state.dart
import 'package:equatable/equatable.dart';

import '../../models/object_profile.dart';

abstract class ObjectProfileMyListState extends Equatable {
  const ObjectProfileMyListState();
  @override
  List<Object?> get props => [];
}

class ProfileLoading extends ObjectProfileMyListState {}

class ProfileLoaded extends ObjectProfileMyListState {
  final List<ObjectProfile> profiles;

  const ProfileLoaded(this.profiles);
  @override
  List<Object?> get props => [profiles];
}

class ProfileError extends ObjectProfileMyListState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}
