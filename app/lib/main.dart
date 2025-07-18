import 'package:flutter/services.dart';
import 'package:jackpote/app_config.dart';
import 'package:jackpote/providers/plant_provider_my_List.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

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
import 'bloc/comment/comment_bloc.dart';
import 'services/comment_service.dart';
import 'services/notification_service.dart';
import 'services/plant_care_score_service.dart';
import 'services/daily_score_background_service.dart';
import 'services/crashlytics_service.dart';
import 'ui/pages/user_profile_page.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
final RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();

// Top-level background message handler
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('🔥 Background message: ${message.messageId}');
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Crashlytics
  await _initializeCrashlytics();
  
  // Initialize Crashlytics Service
  await CrashlyticsService().initialize();
  
  // Set background message handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  
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
    
    // Initialize notification service
    _initializeNotifications();
    
    // Initialize daily score background service
    _initializeDailyScoreService();
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

  /// Initialize notification service
  Future<void> _initializeNotifications() async {
    final notificationService = NotificationService();
    
    // Set up notification tap handler
    notificationService.onNotificationTapped = (String? route) {
      if (route != null && route.isNotEmpty) {
        // Navigate to specific route when notification is tapped
        navigatorKey.currentState?.pushNamed(route);
      }
    };
    
    // Initialize the service
    await notificationService.initialize();
    
    // Subscribe to plant care topics
    await notificationService.subscribeToTopic('plant_care');
    await notificationService.subscribeToTopic('watering_reminders');
  }

  /// Initialize daily score background service
  Future<void> _initializeDailyScoreService() async {
    try {
      // Initialize the background service
      await DailyScoreBackgroundService.initialize();
      print('✅ Daily score background service initialized');
    } catch (e) {
      print('❌ Error initializing daily score background service: $e');
    }
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
        // Bloc global pour les commentaires - remplace tous les anciens blocs
        BlocProvider<CommentBloc>(
          create: (_) => CommentBloc(
            commentService: CommentService(),
            token: token,
          ),
        ),
        // Provider for PlantCareScoreService
        Provider<PlantCareScoreService>(
          create: (_) => PlantCareScoreService(),
        ),
      ],
      child: MaterialApp(
        title: 'Jackpote App',
        theme: appTheme,
        routes: appRoutes,
        onGenerateRoute: (settings) {
          if (settings.name == '/user-profile') {
            final userId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => UserProfilePage(userId: userId),
            );
          }
          return null;
        },
        initialRoute: '/',
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        navigatorObservers: [routeObserver],
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
          print('🌍 Falling back to: [38;5;2m${supportedLocales.first}[0m');
          return supportedLocales.first;
        },
      ),
    );
  }
}

/// Initialize Crashlytics with proper error handling
Future<void> _initializeCrashlytics() async {
  try {
    // Pass all uncaught errors from the framework to Crashlytics
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    
    // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
    
    // Enable Crashlytics collection while doing development
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode);
    
    // Set user identifier if available
    // await FirebaseCrashlytics.instance.setUserIdentifier('user_id');
    
    // Set custom keys for better crash analysis
    await FirebaseCrashlytics.instance.setCustomKey('app_version', '1.0.3+2');
    await FirebaseCrashlytics.instance.setCustomKey('platform', defaultTargetPlatform.toString());
    
    print('✅ Crashlytics initialized successfully');
  } catch (e) {
    print('❌ Error initializing Crashlytics: $e');
  }
}

