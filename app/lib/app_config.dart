class AppConfig {
  static const String url = "http://192.168.0.100";
  static const String url_s = "http://51.222.110.241";
  static const String port = "3000";

  static String get baseUrl => "$url:$port";
  static String get baseUrlS => url_s;

  static String get loginEndpoint => "$baseUrl/auth/user/login";
  static String get signupEndpoint => "$baseUrl/auth/user/signup";
  static String get requestPasswordResetEndpoint => "$baseUrl/auth/request-password-reset";
  static String get resetPasswordEndpoint => "$baseUrl/auth/user/reset_password";
  static String objectProfilesEndpoint(String personId) => "$baseUrl/person/$personId/object-profiles";
  static String updateObjectProfileEndpoint(String id) => "$baseUrl/api/object-profile/$id";
  static String objectProfilesFavorisEndpoint(String personId) => "$baseUrl/person/$personId/object-profiles/favoris";
}