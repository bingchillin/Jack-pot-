import 'package:flutter/material.dart';
import '../ui/pages/choose_your_plant_page.dart';
import '../ui/pages/add_my_object_page.dart';
import '../ui/pages/advise_page.dart';
import '../ui/pages/auth_wrapper_redirection.dart';
import '../ui/pages/event_page.dart';
import '../ui/pages/forgot_password_page.dart';
import '../ui/pages/get_code_email_page.dart';
import '../ui/pages/my_plant_page.dart';
import '../ui/pages/my_plant_page_login.dart';
import '../ui/pages/profile_page.dart';
import '../ui/pages/edit_profile_page.dart';
import '../ui/pages/login_page.dart';
import '../ui/pages/reset_password_page.dart';
import '../ui/pages/signup_page.dart';
import '../ui/pages/welcome_page.dart';

final Map<String, WidgetBuilder> appRoutes = {
  '/': (context) => const AuthWrapper(),
  '/welcome': (_) => const WelcomePage(),
  '/advise': (_) => const AdvisePage(),
  '/plant': (_) => const MyPlantPage(),
  '/plant_login': (_) => const MyPlantPageLogin(),
  '/event': (_) => const EventPage(),
  '/profile': (_) => const ProfilePage(),
  '/edit-profile': (_) => const EditProfilePage(),
  '/login': (_) => const LoginPage(),
  '/forgot_password': (_) => const ForgotPasswordPage(),
  '/signup': (_) => const SignupPage(),
  '/get_code_email': (_) => const GetCodeEmailPage(),
  '/reset_password': (_) => const ResetPasswordPage(),
  '/add_my_object': (_) => AddMyObjectPage(),
  '/choose_your_plant': (_) => ChooseYourPlantPage(),
};
