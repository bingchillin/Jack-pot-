import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import 'package:jackpote/app_config.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _accessToken;
  String? _userId;

  Map<String, dynamic>? _userData;

  bool _isLoadingUser = true;

  bool get isAuthenticated => _isAuthenticated;
  String? get userId => _userId;
  String? get accessToken => _accessToken;

  Map<String, dynamic>? get userData => _userData;

  Map<String, dynamic>? _user;

  Map<String, dynamic>? get user => _user;

  bool get isLoggedIn => _isAuthenticated;


  bool get isLoadingUser => _isLoadingUser;


  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    final userId = prefs.getString('userId');
    final userDataJson = prefs.getString('userData');


    if (token != null && userId != null && userDataJson != null) {
      _isAuthenticated = true;
      _accessToken = token;
      _userId = userId;
      _userData = jsonDecode(userDataJson);
      notifyListeners();
      _firstName = _userData?['firstname'];
      _user = _userData;
      _isAuthenticated = true;
    } else {
      _isAuthenticated = false;
      _user = null;
    }
  }

  String? _firstName;
  String? get firstName => _firstName;

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
        _userId = data['user']['idPerson'].toString();
        _firstName = data['user']['firstname'].toString();
        _userData = data['user'];
        _isAuthenticated = true;

        await prefs.setString('access_token', _accessToken!);
        await prefs.setString('userId', _userId!);
        await prefs.setString('userData', jsonEncode(_userData));

        notifyListeners();
        return true;
      } else {
        return false;
      }
    } catch (e) {
      debugPrint("Erreur lors de la connexion: $e");
      return false;
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _accessToken = null;
    _userId = null;
    _userData = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    notifyListeners();
  }
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

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );


    print("Signup status: ${response.statusCode}");
    print("Response: ${response.body}");

    if (response.statusCode == 201 || response.statusCode == 200) {
      final data = jsonDecode(response.body);

      _isAuthenticated = true;
      _userId = data['user']['idPerson'].toString();
      _firstName = data['user']['firstname'];

      _accessToken = data['access_token'];
      _userData = data['user'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userId', _userId!);
      await prefs.setString('firstName', _firstName!);
      await prefs.setString('access_token', data['access_token']);
      await prefs.setString('refresh_token', data['refresh_token']);
      await prefs.setString('userData', jsonEncode(_userData)); //

      _isLoadingUser = false;
      notifyListeners();
      return true;
    } else {
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

  /// Just test for the moment
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



}
