//Ce test vérifie que ton NavProvider change correctement d’index

import 'package:flutter_test/flutter_test.dart';
import 'package:jackpote/providers/nav_provider.dart';

void main() {
  test('should change selected index', () {
    final provider = NavProvider();

    expect(provider.selectedIndex, 0); // initial index

    provider.setIndex(2);
    expect(provider.selectedIndex, 2);
  });
}
