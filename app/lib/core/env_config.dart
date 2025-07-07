enum Environment { local, production }

class EnvConfig {
  static const Environment _currentEnv = Environment.local;
  
  // API Configuration
  static const Map<Environment, String> _apiUrls = {
    Environment.local: 'http://10.0.2.2:3000', // Changed for Android emulator
    Environment.production: 'https://jacquespote.duckdns.org',
  };
  
  // App Configuration
  static const Map<Environment, Map<String, dynamic>> _appConfig = {
    Environment.local: {
      'debug': true,
      'enableLogging': true,
      'apiTimeout': 30000, // 30 seconds
    },
    Environment.production: {
      'debug': false,
      'enableLogging': false,
      'apiTimeout': 15000, // 15 seconds
    },
  };
  
  // Getters
  static Environment get currentEnvironment => _currentEnv;
  static String get apiUrl => _apiUrls[_currentEnv]!;
  static bool get isDebug => _appConfig[_currentEnv]!['debug'] as bool;
  static bool get enableLogging => _appConfig[_currentEnv]!['enableLogging'] as bool;
  static int get apiTimeout => _appConfig[_currentEnv]!['apiTimeout'] as int;
  
  // Environment checks
  static bool get isLocal => _currentEnv == Environment.local;
  static bool get isProduction => _currentEnv == Environment.production;
  
  // Environment name
  static String get environmentName => _currentEnv.toString().split('.').last;
  
  // Simple status check
  static void printCurrentEnv() {
    print('🌐 Environment: $environmentName');
    print('🔗 API URL: $apiUrl');
    print('📱 Note: Using 10.0.2.2 for Android emulator');
  }
} 