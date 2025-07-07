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
import 'bloc/comment/comment_list_bloc.dart';
import 'bloc/comment/comment_replies_bloc.dart';
import 'bloc/comment/comment_detail_bloc.dart';
import 'services/comment_service.dart';

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

    // Bloc global pour les commentaires, même sans connexion
    return MultiBlocProvider(
      providers: [
        if (token != null && token.isNotEmpty && personIdStr != null) ...[
          BlocProvider<ObjectProfileBloc>(
            create: (_) => ObjectProfileBloc(
              provider: PlantProvider(baseUrl: AppConfig.baseUrl, token: token),
              personId: int.parse(personIdStr),
            )..add(LoadProfiles()),
          ),
          BlocProvider<ObjectProfileMyListBloc>(
            create: (_) => ObjectProfileMyListBloc(
              provider: PlantProviderMyList(baseUrl: AppConfig.baseUrl, token: token),
              personId: int.parse(personIdStr),
            )..add(LoadProfilesMyList()),
          ),
        ],
        BlocProvider<CommentListBloc>(
          create: (_) => CommentListBloc(
            commentService: CommentService(),
            token: token,
          )..add(LoadComments()),
        ),
        BlocProvider<CommentRepliesBloc>(
          create: (_) => CommentRepliesBloc(
            commentService: CommentService(),
            token: token,
          ),
        ),
        BlocProvider<CommentDetailBloc>(
          create: (_) => CommentDetailBloc(
            commentService: CommentService(),
            token: token,
          ),
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
          print('🌍 Falling back to: [38;5;2m${supportedLocales.first}[0m');
          return supportedLocales.first;
        },
      ),
    );
  }
}

