import 'package:flutter/material.dart';
import '../ui/pages/advise_page.dart';
import '../ui/pages/auth_wrapper_redirection.dart';
import '../ui/pages/event_page.dart';
import '../ui/pages/forgot_password_page.dart';
import '../ui/pages/home_page.dart';
import '../ui/pages/my_plant_page.dart';
import '../ui/pages/profile_page.dart';
import '../ui/pages/login_page.dart';
import '../ui/pages/signup_page.dart';


final Map<String, WidgetBuilder> appRoutes = {
  '/': (context) => const AuthWrapper(),
  '/advise': (_) => const AdvisePage(),
  '/plant': (_) => const MyPlantPage(),
  '/event': (_) => const EventPage(),
  '/profile': (_) => const ProfilePage(),
  '/login': (_) => const LoginPage(),
  '/forgot_password': (_) => const ForgotPasswordPage(),
  '/signup': (_) => const SignupPage(),

};
