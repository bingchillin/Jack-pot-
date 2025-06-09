// object_profile_state.dart
import 'package:equatable/equatable.dart';

import '../../models/object_profile.dart';

abstract class ObjectProfileState extends Equatable {
  const ObjectProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileLoading extends ObjectProfileState {}

class ProfileLoaded extends ObjectProfileState {
  final List<ObjectProfile> profiles;

  const ProfileLoaded(this.profiles);
  @override
  List<Object?> get props => [profiles];
}

class ProfileError extends ObjectProfileState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}
