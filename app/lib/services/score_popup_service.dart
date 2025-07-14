import 'package:flutter/material.dart';
import '../ui/widgets/score_popup_widget.dart';

class ScorePopupService {
  static final ScorePopupService _instance = ScorePopupService._internal();
  factory ScorePopupService() => _instance;
  ScorePopupService._internal();

  void showScorePopup({
    required BuildContext context,
    required int moistureScore,
    required int temperatureScore,
    required int lightScore,
    required int phScore,
    required int bonusScore,
    required int totalScore,
    VoidCallback? onDismiss,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black54,
      builder: (BuildContext context) {
        return ScorePopupWidget(
          moistureScore: moistureScore,
          temperatureScore: temperatureScore,
          lightScore: lightScore,
          phScore: phScore,
          bonusScore: bonusScore,
          totalScore: totalScore,
          onDismiss: () {
            Navigator.of(context).pop();
            onDismiss?.call();
          },
        );
      },
    );
  }
} 