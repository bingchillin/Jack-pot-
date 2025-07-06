import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'home_page.dart';
import 'home_page_login.dart';
import 'welcome_page.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    // If user is authenticated, show main app
    if (authProvider.isLoggedIn) {
      return const HomePage();
    }
    
    // If user is in guest mode, show guest version
    if (authProvider.isGuestMode) {
      return const HomePageLogin();
    }
    
    // If user is not authenticated and not in guest mode, show welcome page
    return const WelcomePage();
  }
}
