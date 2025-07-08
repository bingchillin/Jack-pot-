import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import 'package:jackpote/app_config.dart';

class CurrentUser {
  final int idPerson;
  CurrentUser({required this.idPerson});
}

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _accessToken;
  String? _refreshToken;
  String? _userId;
  Map<String, dynamic>? _userData;
  Map<String, dynamic>? _user;
  bool _isLoadingUser = true;
  bool _isGuestMode = false;
  Timer? _refreshTimer;

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  String? get userId => _userId;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  Map<String, dynamic>? get userData => _userData;
  Map<String, dynamic>? get user => _user;
  bool get isLoggedIn => _isAuthenticated;
  bool get isLoadingUser => _isLoadingUser;
  bool get isGuestMode => _isGuestMode;
  
  // Current user avec idPerson pour les blocs
  CurrentUser? get currentUser => _userData != null 
    ? CurrentUser(idPerson: int.parse(_userId!))
    : null;

  String? _firstName;
  String? get firstName => _firstName;

  AuthProvider() {
    _initializeAuth();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  // Initialize authentication on app start
  Future<void> _initializeAuth() async {
    _isLoadingUser = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');
      final refreshToken = prefs.getString('refresh_token');
      final userId = prefs.getString('userId');
      final userDataJson = prefs.getString('userData');
      final tokenExpiry = prefs.getInt('token_expiry');

      if (token != null && refreshToken != null && userId != null && userDataJson != null) {
        _accessToken = token;
        _refreshToken = refreshToken;
        _userId = userId;
        _userData = jsonDecode(userDataJson);
        _firstName = _userData?['firstname'];
        _user = _userData;

        // Check if token is expired or will expire soon
        final now = DateTime.now().millisecondsSinceEpoch;
        final isExpired = tokenExpiry != null && now >= tokenExpiry;
        final willExpireSoon = tokenExpiry != null && now >= (tokenExpiry - 300000); // 5 minutes before expiry

        if (isExpired || willExpireSoon) {
          print('🔄 Token expired or expiring soon, refreshing...');
          final refreshed = await _refreshTokens();
          if (refreshed) {
            _isAuthenticated = true;
            _setupTokenRefreshTimer();
            print('✅ Authentication restored with refresh');
          } else {
            print('❌ Token refresh failed, logging out');
            await _clearAuthData();
          }
        } else {
          _isAuthenticated = true;
          _setupTokenRefreshTimer();
          print('✅ Authentication restored from storage');
        }
      } else {
        print('ℹ️ No stored authentication found');
        await _clearAuthData();
      }
    } catch (e) {
      print('❌ Error initializing auth: $e');
      await _clearAuthData();
    }

    _isLoadingUser = false;
    notifyListeners();
  }

  // Refresh tokens using refresh token
  Future<bool> _refreshTokens() async {
    if (_refreshToken == null) return false;

    try {
      final url = Uri.parse('${AppConfig.baseUrl}/auth/refresh');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': _refreshToken}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        
        _accessToken = data['access_token'];
        if (data['refresh_token'] != null) {
          _refreshToken = data['refresh_token'];
        }

        // Save new tokens
        await _saveTokens(_accessToken!, _refreshToken!);
        
        print('🔄 Tokens refreshed successfully');
        return true;
      } else {
        print('❌ Token refresh failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Error refreshing tokens: $e');
      return false;
    }
  }

  // Setup automatic token refresh timer
  void _setupTokenRefreshTimer() {
    _refreshTimer?.cancel();
    
    // Refresh token every 15 minutes (JWT tokens usually expire in 1 hour)
    _refreshTimer = Timer.periodic(const Duration(minutes: 15), (timer) async {
      if (_isAuthenticated && _refreshToken != null) {
        print('⏰ Periodic token refresh...');
        final success = await _refreshTokens();
        if (!success) {
          print('❌ Periodic refresh failed, logging out');
          await logout();
        }
      }
    });
  }

  // Save tokens with expiry
  Future<void> _saveTokens(String accessToken, String refreshToken) async {
    final prefs = await SharedPreferences.getInstance();
    final expiryTime = DateTime.now().add(const Duration(hours: 1)).millisecondsSinceEpoch; // Assume 1 hour expiry

    await prefs.setString('access_token', accessToken);
    await prefs.setString('refresh_token', refreshToken);
    await prefs.setInt('token_expiry', expiryTime);
  }

  // Login with persistent authentication
  Future<bool> login(String email, String password) async {
    final url = Uri.parse(AppConfig.loginEndpoint);

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        _accessToken = data['access_token'];
        _refreshToken = data['refresh_token'];
        _userId = data['user']['idPerson'].toString();
        _firstName = data['user']['firstname'].toString();
        _userData = data['user'];
        _user = _userData;
        _isAuthenticated = true;

        // Save all auth data
        await prefs.setString('access_token', _accessToken!);
        await prefs.setString('refresh_token', _refreshToken!);
        await prefs.setString('userId', _userId!);
        await prefs.setString('userData', jsonEncode(_userData));
        await _saveTokens(_accessToken!, _refreshToken!);

        // Setup automatic refresh
        _setupTokenRefreshTimer();

        // Disable guest mode when user logs in
        disableGuestMode();

        notifyListeners();
        print('✅ Login successful - persistent auth enabled');
        return true;
      } else {
        print('❌ Login failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Login error: $e');
      return false;
    }
  }

  // Signup with persistent authentication
  Future<bool> signup({
    required String email,
    required String password,
    required String firstname,
    String? surname,
    String? numberPhone,
  }) async {
    final url = Uri.parse(AppConfig.signupEndpoint);

    final payload = {
      'email': email,
      'password': password,
      'firstname': firstname,
    };

    if (surname != null && surname.isNotEmpty) {
      payload['surname'] = surname;
    }

    if (numberPhone != null && numberPhone.isNotEmpty) {
      payload['numberPhone'] = numberPhone;
    }

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        _accessToken = data['access_token'];
        _refreshToken = data['refresh_token'];
        _userId = data['user']['idPerson'].toString();
        _firstName = data['user']['firstname'];
        _userData = data['user'];
        _user = _userData;
        _isAuthenticated = true;

        // Save all auth data
        await prefs.setString('access_token', _accessToken!);
        await prefs.setString('refresh_token', _refreshToken!);
        await prefs.setString('userId', _userId!);
        await prefs.setString('firstName', _firstName!);
        await prefs.setString('userData', jsonEncode(_userData));
        await _saveTokens(_accessToken!, _refreshToken!);

        // Setup automatic refresh
        _setupTokenRefreshTimer();

        // Disable guest mode when user signs up
        disableGuestMode();

        _isLoadingUser = false;
        notifyListeners();
        print('✅ Signup successful - persistent auth enabled');
        return true;
      } else {
        print('❌ Signup failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Signup error: $e');
      return false;
    }
  }

  // Enable guest mode
  void enableGuestMode() {
    _isGuestMode = true;
    _isLoadingUser = false;
    notifyListeners();
    print('👤 Guest mode enabled');
  }

  // Disable guest mode (when user logs in)
  void disableGuestMode() {
    _isGuestMode = false;
    notifyListeners();
    print('👤 Guest mode disabled');
  }

  // Check if user has access to a feature
  bool hasAccess(String feature) {
    if (_isAuthenticated) return true;
    if (!_isGuestMode) return false;
    
    // Define guest-accessible features
    const guestFeatures = [
      'view_plants',
      'view_advice', 
      'view_events',
      'view_plant_details',
      'browse_catalog',
    ];
    
    return guestFeatures.contains(feature);
  }

  // Check if user needs to login for a feature
  bool needsLogin(String feature) {
    if (_isAuthenticated) return false;
    
    const loginRequiredFeatures = [
      'add_plants',
      'control_devices',
      'create_posts',
      'save_favorites',
      'edit_profile',
      'personal_data',
    ];
    
    return loginRequiredFeatures.contains(feature);
  }

  // Clear all authentication data
  Future<void> _clearAuthData() async {
    _isAuthenticated = false;
    _accessToken = null;
    _refreshToken = null;
    _userId = null;
    _userData = null;
    _user = null;
    _firstName = null;
    _isGuestMode = false;
    _refreshTimer?.cancel();

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Logout
  Future<void> logout() async {
    print('🚪 Logging out...');
    await _clearAuthData();
    notifyListeners();
  }

  // Manual refresh for testing
  Future<bool> refreshTokensManually() async {
    if (!_isAuthenticated) return false;
    
    print('🔄 Manual token refresh...');
    final success = await _refreshTokens();
    if (success) {
      notifyListeners();
    }
    return success;
  }

  // Check if user is authenticated and tokens are valid
  Future<bool> validateAuthentication() async {
    if (!_isAuthenticated || _accessToken == null) return false;

    try {
      // Try to make an authenticated request to validate token
      final url = Uri.parse('${AppConfig.baseUrl}/auth/profile');
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_accessToken',
        },
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        // Token is invalid, try to refresh
        print('🔄 Token invalid, attempting refresh...');
        return await _refreshTokens();
      } else {
        return false;
      }
    } catch (e) {
      print('❌ Auth validation error: $e');
      return false;
    }
  }

  Future<bool> sendResetCodeByEmail(String email, String code) async {
    final url = Uri.parse(AppConfig.requestPasswordResetEndpoint);

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'verificationCode': code}),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Erreur envoi mail : $e");
      return false;
    }
  }

  Future<bool> resetPassword(String email, String newPassword) async {
    final url = Uri.parse(AppConfig.resetPasswordEndpoint);

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': newPassword}),
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Erreur reset password : $e");
      return false;
    }
  }

  // Update profile
  Future<Map<String, dynamic>> updateProfile({
    required String currentPassword,
    String? firstname,
    String? surname,
    String? numberPhone,
    String? address,
    String? newPassword,
  }) async {
    if (!_isAuthenticated || _accessToken == null) {
      return {
        'success': false,
        'message': 'User not authenticated',
      };
    }

    final url = Uri.parse('${AppConfig.baseUrl}/auth/profile');
    
    final updateData = <String, dynamic>{
      'currentPassword': currentPassword,
    };

    // Only include fields that are not null/empty
    if (firstname != null && firstname.isNotEmpty) {
      updateData['firstname'] = firstname;
    }
    if (surname != null && surname.isNotEmpty) {
      updateData['surname'] = surname;
    }
    if (numberPhone != null && numberPhone.isNotEmpty) {
      updateData['numberPhone'] = numberPhone;
    }
    if (address != null && address.isNotEmpty) {
      updateData['address'] = address;
    }
    if (newPassword != null && newPassword.isNotEmpty) {
      updateData['newPassword'] = newPassword;
    }

    try {
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_accessToken',
        },
        body: jsonEncode(updateData),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        
        // Update local user data
        _userData = responseData;
        _user = responseData;
        _firstName = responseData['firstname'];
        
        // Save updated user data to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userData', jsonEncode(_userData));
        if (_firstName != null) {
          await prefs.setString('firstName', _firstName!);
        }

        notifyListeners();
        print('✅ Profile updated successfully');
        
        return {
          'success': true,
          'message': 'Profile updated successfully',
        };
      } else if (response.statusCode == 401) {
        final errorData = jsonDecode(response.body);
        if (errorData['message']?.contains('Current password is incorrect') == true) {
          return {
            'success': false,
            'message': 'Current password is incorrect',
          };
        }
        return {
          'success': false,
          'message': 'Authentication failed',
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to update profile',
        };
      }
    } catch (e) {
      print('❌ Update profile error: $e');
      return {
        'success': false,
        'message': 'Network error occurred',
      };
    }
  }

  // Reset to welcome page (clears guest mode)
  void resetToWelcome() {
    _isGuestMode = false;
    notifyListeners();
    print('🏠 Reset to welcome page');
  }
}
