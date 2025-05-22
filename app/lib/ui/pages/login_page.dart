import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});


  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _obscurePassword = true;


  void _submitLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (!success && context.mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text("Erreur"),
          content: const Text("Identifiants incorrects."),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("OK"))
          ],
        ),
      );
      return;
    }

    if (context.mounted) {
      Navigator.pushReplacementNamed(context, '/');
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Connexion")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Email", style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(hintText: "Entrez votre email"),
                keyboardType: TextInputType.emailAddress,
                validator: (value) =>
                value == null || value.isEmpty ? "Email requis" : null,
              ),
              const SizedBox(height: 16),
              const Text("Mot de passe", style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  hintText: "Entrez votre mot de passe",
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                obscureText: _obscurePassword,
                validator: (value) =>
                value == null || value.length < 6 ? "6 caractères minimum" : null,
              ),
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/forgot_password');
                  },
                  child: const Text("Mot de passe oublié ?"),
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitLogin,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text("Se connecter"),
                ),

              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Pas encore de compte ?"),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/signup');
                    },
                    child: const Text("Inscription"),
                  ),
                ],
              ),

            ],
          ),
        ),
      ),
    );
  }
}
