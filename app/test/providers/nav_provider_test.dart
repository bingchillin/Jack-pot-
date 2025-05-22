//Ce test vérifie que ton NavProvider change correctement d’index

import 'package:flutter_test/flutter_test.dart';
import 'package:app/providers/nav_provider.dart'; // remplace "app" par le nom de ton package

void main() {
  test('should change selected index', () {
    final provider = NavProvider();

    expect(provider.selectedIndex, 0); // initial index

    provider.setIndex(2);
    expect(provider.selectedIndex, 2);
  });
}
