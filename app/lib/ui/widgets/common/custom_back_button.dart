import 'package:flutter/material.dart';

class CustomBackButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Color? iconColor;
  final Color? backgroundColor;
  final double? size;
  final double? iconSize;

  const CustomBackButton({
    super.key,
    this.onPressed,
    this.iconColor,
    this.backgroundColor,
    this.size = 48.0,
    this.iconSize = 24.0,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onPressed ?? () => Navigator.pop(context),
        child: Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: backgroundColor != null
              ? BoxDecoration(
                  color: backgroundColor,
                  borderRadius: BorderRadius.circular(24),
                )
              : null,
          child: Icon(
            Icons.arrow_back,
            color: iconColor ?? Colors.green[700],
            size: iconSize,
          ),
        ),
      ),
    );
  }
} 