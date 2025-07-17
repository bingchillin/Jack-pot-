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

    // Show loading screen while authentication is being initialized
    if (authProvider.isLoadingUser) {
      return Scaffold(
        backgroundColor: Colors.green[50],
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
              ),
              const SizedBox(height: 16),
              Text(
                'Loading...',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      );
    }

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
