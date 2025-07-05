import 'package:jackpote/app_config.dart';
import 'package:jackpote/providers/plant_provider_my_List.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'bloc/object_profile/object_profile_event.dart';
import 'routes/app_routes.dart';
import 'core/theme.dart';
import 'providers/nav_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/plant_provider.dart';
import 'bloc/object_profile/object_profile_bloc.dart';
import 'bloc/object_profile_my_list/object_profile_my_list_bloc.dart';
import 'bloc/object_profile_my_list/object_profile_my_list_event.dart';
import 'l10n/app_localizations.dart';

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
class RootApp extends StatefulWidget {
  const RootApp({super.key});

  @override
  State<RootApp> createState() => _RootAppState();
}

class _RootAppState extends State<RootApp> {
  @override
  void initState() {
    super.initState();

    // Écoute des changements AuthProvider pour rebuild
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    authProvider.addListener(_onAuthChanged);
  }

  @override
  void dispose() {
    Provider.of<AuthProvider>(context, listen: false).removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    // Force le rebuild quand login/signup change l'état
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final token = authProvider.accessToken;
    final personIdStr = authProvider.userId;

    if (token == null || token.isEmpty || personIdStr == null) {
      return MaterialApp(
        title: 'Jackpot App',
        theme: appTheme,
        routes: appRoutes,
        initialRoute: '/',
        debugShowCheckedModeBanner: false,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', ''),
          Locale('fr', ''),
          Locale('es', ''),
        ],
        localeResolutionCallback: (locale, supportedLocales) {
          // Debug: Print locale info
          print('🌍 Device locale: $locale');
          print('🌍 Supported locales: $supportedLocales');
          
          // Check if the current device locale is supported
          if (locale != null) {
            for (var supportedLocale in supportedLocales) {
              if (supportedLocale.languageCode == locale.languageCode) {
                print('🌍 Using locale: $supportedLocale');
                return supportedLocale;
              }
            }
          }
          // If not supported, return the first supported locale (English)
          print('🌍 Falling back to: ${supportedLocales.first}');
          return supportedLocales.first;
        },
      );
    }

    final personId = int.parse(personIdStr);

    return MultiBlocProvider(
      providers: [
        BlocProvider<ObjectProfileBloc>(
          create: (_) => ObjectProfileBloc(
            provider: PlantProvider(baseUrl: AppConfig.baseUrl, token: token),
            personId: personId,
          )..add(LoadProfiles()),
        ),
        BlocProvider<ObjectProfileMyListBloc>(
          create: (_) => ObjectProfileMyListBloc(
            provider: PlantProviderMyList(baseUrl: AppConfig.baseUrl, token: token),
            personId: personId,
          )..add(LoadProfilesMyList()),
        ),
      ],
      child: MaterialApp(
        title: 'Jackpot App',
        theme: appTheme,
        routes: appRoutes,
        initialRoute: '/',
        debugShowCheckedModeBanner: false,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', ''),
          Locale('fr', ''),
          Locale('es', ''),
        ],
        localeResolutionCallback: (locale, supportedLocales) {
          // Debug: Print locale info
          print('🌍 Device locale: $locale');
          print('🌍 Supported locales: $supportedLocales');
          
          // Check if the current device locale is supported
          if (locale != null) {
            for (var supportedLocale in supportedLocales) {
              if (supportedLocale.languageCode == locale.languageCode) {
                print('🌍 Using locale: $supportedLocale');
                return supportedLocale;
              }
            }
          }
          // If not supported, return the first supported locale (English)
          print('🌍 Falling back to: ${supportedLocales.first}');
          return supportedLocales.first;
        },
      ),
    );
  }
}

