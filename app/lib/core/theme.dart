import 'package:flutter/material.dart';

final ThemeData appTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
  useMaterial3: true,
  
  // AppBar theme for navbar pages
  appBarTheme: const AppBarTheme(
    titleTextStyle: TextStyle(
      fontFamily: '04B_30__',
      fontSize: 20,
      color: Colors.black87,
    ),
  ),
);