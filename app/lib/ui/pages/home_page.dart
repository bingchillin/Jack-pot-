import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/nav_provider.dart';
import '../../providers/auth_provider.dart';
import 'my_plant_page.dart';
import 'event_page.dart';
import 'advise_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const List<Widget> _pages = [
    AdvisePage(),
    MyPlantPage(),
    EventPage(),
  ];

  @override
  Widget build(BuildContext context) {
    final navProvider = Provider.of<NavProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('JACKPOT HOME GOOD LOGIN'),
        automaticallyImplyLeading: false,
        actions: [
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
