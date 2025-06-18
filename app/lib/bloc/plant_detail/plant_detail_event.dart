abstract class PlantDetailEvent {}

class LoadPlantDetail extends PlantDetailEvent {
  final int plantId;
  final String token;

  LoadPlantDetail(this.plantId, this.token);
}

class ToggleAutomatic extends PlantDetailEvent {}

class ToggleWillWatering extends PlantDetailEvent {}