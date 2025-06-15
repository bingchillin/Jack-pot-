import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/plant_detail/plant_detail_bloc.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/object_profile_service.dart';
import 'plant_detail_content.dart';

class PlantDetailWrapper extends StatelessWidget {
  final int plantId;

  const PlantDetailWrapper({super.key, required this.plantId});

  @override
  Widget build(BuildContext context) {
    final token = context.read<AuthProvider>().accessToken;

    if (token == null) {
      return const Scaffold(
        body: Center(child: Text("Token non disponible")),
      );
    }

    return BlocProvider(
      create: (_) => PlantDetailBloc(
        service: ObjectProfileService(),
        plantId: plantId,
        token: token,
      ),
      child: const PlantDetailContent(),
    );
  }
}
