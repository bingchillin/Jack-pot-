import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

/// Service pour gérer Crashlytics et le logging des erreurs
class CrashlyticsService {
  static final CrashlyticsService _instance = CrashlyticsService._internal();
  factory CrashlyticsService() => _instance;
  CrashlyticsService._internal();

  /// Instance de Firebase Crashlytics
  FirebaseCrashlytics get _crashlytics => FirebaseCrashlytics.instance;

  /// Initialise le service Crashlytics
  Future<void> initialize() async {
    try {
      // Active Crashlytics seulement en production
      await _crashlytics.setCrashlyticsCollectionEnabled(!kDebugMode);
      
      // Configure les clés personnalisées pour une meilleure analyse
      await _setCustomKeys();
      
      print('✅ CrashlyticsService initialized');
    } catch (e) {
      print('❌ Error initializing CrashlyticsService: $e');
    }
  }

  /// Configure les clés personnalisées pour l'analyse des crashes
  Future<void> _setCustomKeys() async {
    await _crashlytics.setCustomKey('app_version', '1.0.3+2');
    await _crashlytics.setCustomKey('platform', defaultTargetPlatform.toString());
    await _crashlytics.setCustomKey('build_type', kDebugMode ? 'debug' : 'release');
  }

  /// Définit l'identifiant de l'utilisateur pour le suivi des crashes
  Future<void> setUserIdentifier(String userId) async {
    try {
      await _crashlytics.setUserIdentifier(userId);
      print('✅ User identifier set: $userId');
    } catch (e) {
      print('❌ Error setting user identifier: $e');
    }
  }

  /// Définit les attributs personnalisés de l'utilisateur
  Future<void> setUserAttributes({
    String? email,
    String? name,
    String? role,
  }) async {
    try {
      if (email != null) {
        await _crashlytics.setCustomKey('user_email', email);
      }
      if (name != null) {
        await _crashlytics.setCustomKey('user_name', name);
      }
      if (role != null) {
        await _crashlytics.setCustomKey('user_role', role);
      }
      print('✅ User attributes set');
    } catch (e) {
      print('❌ Error setting user attributes: $e');
    }
  }

  /// Enregistre une erreur non fatale
  Future<void> recordError(
    dynamic error,
    StackTrace? stackTrace, {
    String? reason,
    Map<String, dynamic>? additionalData,
    bool fatal = false,
  }) async {
    try {
      // Ajoute des informations supplémentaires si fournies
      if (reason != null) {
        await _crashlytics.setCustomKey('error_reason', reason);
      }
      
      if (additionalData != null) {
        for (final entry in additionalData.entries) {
          await _crashlytics.setCustomKey(entry.key, entry.value.toString());
        }
      }

      // Enregistre l'erreur
      await _crashlytics.recordError(
        error,
        stackTrace,
        fatal: fatal,
      );

      print('✅ Error recorded: ${error.toString()}');
    } catch (e) {
      print('❌ Error recording error: $e');
    }
  }

  /// Enregistre un message de log
  Future<void> log(String message) async {
    try {
      await _crashlytics.log(message);
      print('📝 Crashlytics log: $message');
    } catch (e) {
      print('❌ Error logging message: $e');
    }
  }

  /// Enregistre un événement personnalisé
  Future<void> recordEvent(String eventName, {Map<String, dynamic>? parameters}) async {
    try {
      await _crashlytics.log('Event: $eventName');
      if (parameters != null) {
        for (final entry in parameters.entries) {
          await _crashlytics.setCustomKey('event_${entry.key}', entry.value.toString());
        }
      }
      print('✅ Event recorded: $eventName');
    } catch (e) {
      print('❌ Error recording event: $e');
    }
  }

  /// Enregistre une erreur d'API
  Future<void> recordApiError(
    String endpoint,
    int statusCode,
    String response, {
    String? method,
    Map<String, dynamic>? requestData,
  }) async {
    try {
      await _crashlytics.setCustomKey('api_endpoint', endpoint);
      await _crashlytics.setCustomKey('api_status_code', statusCode);
      await _crashlytics.setCustomKey('api_method', method ?? 'GET');
      
      if (requestData != null) {
        await _crashlytics.setCustomKey('api_request_data', requestData.toString());
      }

      await _crashlytics.recordError(
        'API Error: $statusCode - $endpoint',
        StackTrace.current,
        fatal: false,
      );

      print('✅ API error recorded: $endpoint - $statusCode');
    } catch (e) {
      print('❌ Error recording API error: $e');
    }
  }

  /// Enregistre une erreur de navigation
  Future<void> recordNavigationError(String route, dynamic error) async {
    try {
      await _crashlytics.setCustomKey('navigation_route', route);
      await _crashlytics.recordError(
        'Navigation Error: $route',
        StackTrace.current,
        fatal: false,
      );
      print('✅ Navigation error recorded: $route');
    } catch (e) {
      print('❌ Error recording navigation error: $e');
    }
  }

  /// Enregistre une erreur de base de données
  Future<void> recordDatabaseError(String operation, dynamic error) async {
    try {
      await _crashlytics.setCustomKey('db_operation', operation);
      await _crashlytics.recordError(
        'Database Error: $operation',
        StackTrace.current,
        fatal: false,
      );
      print('✅ Database error recorded: $operation');
    } catch (e) {
      print('❌ Error recording database error: $e');
    }
  }

  /// Enregistre une erreur de notification
  Future<void> recordNotificationError(String operation, dynamic error) async {
    try {
      await _crashlytics.setCustomKey('notification_operation', operation);
      await _crashlytics.recordError(
        'Notification Error: $operation',
        StackTrace.current,
        fatal: false,
      );
      print('✅ Notification error recorded: $operation');
    } catch (e) {
      print('❌ Error recording notification error: $e');
    }
  }

  /// Enregistre une erreur de Bluetooth
  Future<void> recordBluetoothError(String operation, dynamic error) async {
    try {
      await _crashlytics.setCustomKey('bluetooth_operation', operation);
      await _crashlytics.recordError(
        'Bluetooth Error: $operation',
        StackTrace.current,
        fatal: false,
      );
      print('✅ Bluetooth error recorded: $operation');
    } catch (e) {
      print('❌ Error recording bluetooth error: $e');
    }
  }

  /// Enregistre une erreur de TensorFlow Lite
  Future<void> recordTfliteError(String operation, dynamic error) async {
    try {
      await _crashlytics.setCustomKey('tflite_operation', operation);
      await _crashlytics.recordError(
        'TensorFlow Lite Error: $operation',
        StackTrace.current,
        fatal: false,
      );
      print('✅ TensorFlow Lite error recorded: $operation');
    } catch (e) {
      print('❌ Error recording TensorFlow Lite error: $e');
    }
  }

  /// Force l'envoi des rapports en attente
  Future<void> sendUnsentReports() async {
    try {
      await _crashlytics.sendUnsentReports();
      print('✅ Unsent reports sent');
    } catch (e) {
      print('❌ Error sending unsent reports: $e');
    }
  }

  /// Supprime les rapports en attente
  Future<void> deleteUnsentReports() async {
    try {
      await _crashlytics.deleteUnsentReports();
      print('✅ Unsent reports deleted');
    } catch (e) {
      print('❌ Error deleting unsent reports: $e');
    }
  }

  /// Vérifie si Crashlytics est activé
  Future<bool> isCrashlyticsCollectionEnabled() async {
    try {
      return _crashlytics.isCrashlyticsCollectionEnabled;
    } catch (e) {
      print('❌ Error checking Crashlytics status: $e');
      return false;
    }
  }
} 