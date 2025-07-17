import 'package:jackpote/ui/pages/my_plant_page_login.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/nav_provider.dart';
import '../../providers/auth_provider.dart';
import 'event_page.dart';
import 'advise_page.dart';

class HomePageLogin extends StatelessWidget {
  const HomePageLogin({super.key});

  static const List<Widget> _pages = [
    AdvisePage(),
    MyPlantPageLogin(),
    EventPage(),
  ];

  @override
  Widget build(BuildContext context) {
    final navProvider = Provider.of<NavProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Jackpote - Guest Mode',
          style: TextStyle(
            fontFamily: '04B_30__',
            fontSize: 20,
            color: Colors.black87,
          ),
        ),
        automaticallyImplyLeading: false,
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        scrolledUnderElevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              if (authProvider.isAuthenticated) {
                Navigator.pushNamed(context, '/notifications');
              } else {
                Navigator.pushNamed(context, '/login');
              }
            },
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              if (authProvider.isAuthenticated) {
                Navigator.pushNamed(context, '/profile');
              } else {
                Navigator.pushNamed(context, '/login');
              }
            },
            tooltip: 'Profil',
          ),
        ],
      ),
      body: _pages[navProvider.selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navProvider.selectedIndex,
        onTap: navProvider.setIndex,
        selectedItemColor: Colors.green,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Advise'),
          BottomNavigationBarItem(icon: Icon(Icons.local_florist), label: 'My Plant'),
          BottomNavigationBarItem(icon: Icon(Icons.event), label: 'Event'),
        ],
      ),
    );
  }
}
