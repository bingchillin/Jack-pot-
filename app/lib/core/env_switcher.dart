import 'env_config.dart';

/// Utilitaire pour faciliter le changement d'environnement
class EnvSwitcher {
  /// Changer vers l'environnement émulateur
  static void switchToEmulator() {
    // Vous devez manuellement changer _currentEnv à Environment.local dans env_config.dart
    print('🔄 Pour utiliser l\'émulateur :');
    print('   Changez _currentEnv à Environment.local dans env_config.dart');
    print('   URL API: http://10.0.2.2:3000');
  }
  
  /// Changer vers l'environnement appareil physique
  static void switchToPhysicalDevice() {
    // Vous devez manuellement changer _currentEnv à Environment.localPhysical dans env_config.dart
    print('🔄 Pour utiliser un appareil physique :');
    print('   Changez _currentEnv à Environment.localPhysical dans env_config.dart');
    print('   URL API: http://192.168.0.231:3000');
  }
  
  /// Changer vers l'environnement production
  static void switchToProduction() {
    // Vous devez manuellement changer _currentEnv à Environment.production dans env_config.dart
    print('🔄 Pour utiliser la production :');
    print('   Changez _currentEnv à Environment.production dans env_config.dart');
    print('   URL API: https://jacquespote.duckdns.org');
  }
  
  /// Afficher l'environnement actuel
  static void showCurrentEnvironment() {
    EnvConfig.printCurrentEnv();
  }
  
  /// Afficher toutes les configurations disponibles
  static void showAllEnvironments() {
    print('📋 Environnements disponibles :');
    print('   🟢 local: http://10.0.2.2:3000 (émulateur)');
    print('   🟢 localPhysical: http://192.168.0.231:3000 (appareil physique)');
    print('   🟢 production: https://jacquespote.duckdns.org (production)');
    print('');
    print('🔧 Environnement actuel :');
    showCurrentEnvironment();
  }
} 