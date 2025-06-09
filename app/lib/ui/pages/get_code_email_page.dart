import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class GetCodeEmailPage extends StatefulWidget {
  const GetCodeEmailPage({super.key});

  @override
  State<GetCodeEmailPage> createState() => _GetCodeEmailPageState();
}

class _GetCodeEmailPageState extends State<GetCodeEmailPage> {
  late String email;
  final TextEditingController _codeController = TextEditingController();
  String _generatedCode = "";
  bool _isSending = false;
  bool _canResend = false;
  int _countdown = 30;
  Timer? _timer;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)!.settings.arguments;
    if (args != null && args is String) {
      email = args;
      _generateAndSendCode(); // envoie automatique au démarrage
    }
  }

  void _startTimer() {
    setState(() {
      _canResend = false;
      _countdown = 30;
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown == 0) {
        setState(() {
          _canResend = true;
          timer.cancel();
        });
      } else {
        setState(() => _countdown--);
      }
    });
  }

  String _generateRandomCode() {
    final random = Random();
    return List.generate(6, (_) => random.nextInt(10)).join();
  }

  Future<void> _generateAndSendCode() async {
    setState(() => _isSending = true);

    _generatedCode = _generateRandomCode();
    final success = await Provider.of<AuthProvider>(context, listen: false)
        .sendResetCodeByEmail(email, _generatedCode);

    setState(() => _isSending = false);

    if (success) {
      print("code : $_generatedCode");
      _startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Code envoyé par email")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Échec de l'envoi de l'email")),
      );
    }
  }

  void _validateCode() {
    if (_codeController.text.trim() == _generatedCode) {
      Navigator.pushNamed(context, '/reset_password', arguments: email);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Code incorrect")),
      );
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Vérification de code")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Si l'adresse mail existe dans notre base, un code vous a été envoyé.",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),
            TextField(
              controller: _codeController,
              decoration: const InputDecoration(
                labelText: "Code reçu",
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _canResend && !_isSending ? _generateAndSendCode : null,
                    child: _isSending
                        ? const CircularProgressIndicator()
                        : Text(_canResend
                        ? "Générer code"
                        : "Réessayer dans $_countdown s"),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _validateCode,
                    child: const Text("Valider"),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
