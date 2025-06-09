import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'routes/app_routes.dart';
import 'core/theme.dart';
import 'providers/nav_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/plant_provider.dart';
import 'bloc/object_profile/object_profile_bloc.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NavProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const RootApp(),
    ),
  );
}

class RootApp extends StatelessWidget {
  const RootApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final token = authProvider.accessToken;

    if (token == null || token.isEmpty) {
      // Si pas de token, on va sur la page login ou autre
      return MaterialApp(
        title: 'Jackpot App',
        theme: appTheme,
        routes: appRoutes,
        initialRoute: '/',
      );
    }

    return Provider<ObjectProfileBloc>(
      create: (_) => ObjectProfileBloc(
        provider: PlantProvider(baseUrl: 'http://192.168.0.100:3000', token: token),
        personId: 1,
      ),
      dispose: (_, bloc) => bloc.close(),
      child: MaterialApp(
        title: 'Jackpot App',
        theme: appTheme,
        routes: appRoutes,
        initialRoute: '/',
      ),
    );
  }
}
