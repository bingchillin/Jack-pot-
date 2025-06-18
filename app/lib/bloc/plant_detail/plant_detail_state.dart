import '../../../models/object_profile.dart';

abstract class PlantDetailState {}

class PlantDetailInitial extends PlantDetailState {}

class PlantDetailLoading extends PlantDetailState {}

class PlantDetailLoaded extends PlantDetailState {
  final ObjectProfile plant;

  PlantDetailLoaded(this.plant);
}

class PlantDetailError extends PlantDetailState {
  final String message;

  PlantDetailError(this.message);
}
