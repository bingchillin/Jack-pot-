import 'package:flutter/material.dart';

mixin PageAnimationMixin<T extends StatefulWidget> on State<T>, TickerProviderStateMixin<T> {
  late AnimationController animationController;
  late Animation<double> fadeAnimation;
  late Animation<Offset> slideAnimation;
  late Animation<double> scaleAnimation;

  Duration get animationDuration => const Duration(milliseconds: 800);

  void initializeAnimations() {
    animationController = AnimationController(
      duration: animationDuration,
      vsync: this,
    );
    
    fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: animationController, curve: Curves.easeInOut)
    );
    
    slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: animationController, curve: Curves.easeOutCubic));
    
    scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: animationController, curve: Curves.easeOutBack)
    );
    
    animationController.forward();
  }

  void disposeAnimations() {
    animationController.dispose();
  }

  Widget fadeTransition({required Widget child}) {
    return FadeTransition(
      opacity: fadeAnimation,
      child: child,
    );
  }

  Widget slideTransition({required Widget child}) {
    return SlideTransition(
      position: slideAnimation,
      child: child,
    );
  }

  Widget scaleTransition({required Widget child}) {
    return ScaleTransition(
      scale: scaleAnimation,
      child: child,
    );
  }

  Widget fadeAndSlideTransition({required Widget child}) {
    return FadeTransition(
      opacity: fadeAnimation,
      child: SlideTransition(
        position: slideAnimation,
        child: child,
      ),
    );
  }

  Widget fullAnimationTransition({required Widget child}) {
    return FadeTransition(
      opacity: fadeAnimation,
      child: SlideTransition(
        position: slideAnimation,
        child: ScaleTransition(
          scale: scaleAnimation,
          child: child,
        ),
      ),
    );
  }
} 