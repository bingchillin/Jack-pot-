import 'core/env_config.dart';

class AppConfig {
  // Current API URL (changes based on environment)
  static String get baseUrl => EnvConfig.apiUrl;
  
  // API Endpoints
  static String get loginEndpoint => "$baseUrl/auth/user/login";
  static String get signupEndpoint => "$baseUrl/auth/signup";
  static String get requestPasswordResetEndpoint => "$baseUrl/auth/request-password-reset";
  static String get resetPasswordEndpoint => "$baseUrl/auth/user/reset_password";
  
  // Dynamic endpoints
  static String objectProfilesEndpoint(String personId) => "$baseUrl/person/$personId/object-profiles";
  static String updateObjectProfileEndpoint(String id) => "$baseUrl/api/object-profile/$id";
  static String objectProfilesFavorisEndpoint(String personId) => "$baseUrl/person/$personId/object-profiles/favoris";
  
  // Simple way to check current setup
  static void showCurrentEnvironment() {
    EnvConfig.printCurrentEnv();
  }
}