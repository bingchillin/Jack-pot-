import 'package:flutter/material.dart';
import 'custom_back_button.dart';

class AppBarWidget {
  /// Creates a standard app bar with green background for main pages
  static AppBar greenAppBar({
    required String title,
    List<Widget>? actions,
    bool automaticallyImplyLeading = true,
    bool centerTitle = false,
    VoidCallback? onBackPressed,
    double? toolbarHeight,
    PreferredSizeWidget? bottom,
  }) {
    return AppBar(
      backgroundColor: Colors.green[50],
      surfaceTintColor: Colors.green[50],
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      toolbarHeight: toolbarHeight,
      leading: automaticallyImplyLeading
          ? CustomBackButton(onPressed: onBackPressed)
          : null,
      title: Text(
        title,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      centerTitle: centerTitle,
      actions: actions,
      bottom: bottom,
    );
  }

  /// Creates a standard app bar with white background for home pages
  static AppBar whiteAppBar({
    required String title,
    List<Widget>? actions,
    bool automaticallyImplyLeading = false,
    bool centerTitle = false,
    VoidCallback? onBackPressed,
  }) {
    return AppBar(
      backgroundColor: Colors.green[50],
      surfaceTintColor: Colors.green[50],
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      leading: automaticallyImplyLeading
          ? CustomBackButton(onPressed: onBackPressed)
          : null,
      title: Text(title),
      centerTitle: centerTitle,
      actions: actions,
    );
  }

  /// Creates a standard app bar with grey background for profile pages
  static AppBar greyAppBar({
    required String title,
    List<Widget>? actions,
    bool automaticallyImplyLeading = true,
    bool centerTitle = false,
    VoidCallback? onBackPressed,
  }) {
    return AppBar(
      backgroundColor: Colors.grey[50],
      surfaceTintColor: Colors.grey[50],
      foregroundColor: Colors.green[700],
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      leading: automaticallyImplyLeading
          ? CustomBackButton(onPressed: onBackPressed)
          : null,
      title: Text(
        title,
        style: const TextStyle(color: Colors.green),
      ),
      centerTitle: centerTitle,
      actions: actions,
    );
  }

  /// Creates a plant detail app bar with custom styling and tabs
  static AppBar plantDetailAppBar({
    required String title,
    List<Widget>? actions,
    VoidCallback? onBackPressed,
    PreferredSizeWidget? bottom,
    double toolbarHeight = 80,
  }) {
    return AppBar(
      backgroundColor: Colors.green[50],
      surfaceTintColor: Colors.green[50],
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      toolbarHeight: toolbarHeight,
      leading: CustomBackButton(onPressed: onBackPressed),
      title: Text(
        title,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      centerTitle: true,
      actions: actions,
      bottom: bottom,
    );
  }
} 