import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:jackpote/ui/pages/home_page.dart';
import 'package:jackpote/providers/nav_provider.dart';

void main() {
  testWidgets('tap bottom nav changes content', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => NavProvider(),
        child: const MaterialApp(home: HomePage()),
      ),
    );

    // Vérifie que "My Plant Page" est affiché par défaut
    expect(find.text('🌿 My Plant Page'), findsOneWidget);

    // Clique sur l'onglet "Event"
    await tester.tap(find.byIcon(Icons.event));
    await tester.pumpAndSettle();

    // Vérifie que "Event Page" s'affiche
    expect(find.text('📅 Event Page'), findsOneWidget);
  });
}
