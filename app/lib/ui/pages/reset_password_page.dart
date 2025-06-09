import 'package:flutter/material.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  void _submitResetPassword() {
    if (!_formKey.currentState!.validate()) return;

    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Les mots de passe ne correspondent pas.")),
      );
      return;
    }

    // Affiche le mot de passe dans la console (temporaire)
    print("Nouveau mot de passe : $password");

    // Ici on redirigerait ou appellerait l'API plus tard
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Nouveau mot de passe")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const Text("Veuillez choisir un nouveau mot de passe", style: TextStyle(fontSize: 18)),
              const SizedBox(height: 24),

              // Champ mot de passe
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: "Nouveau mot de passe",
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.length < 6) {
                    return "6 caractères minimum";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Champ confirmation
              TextFormField(
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                decoration: InputDecoration(
                  labelText: "Confirmer le mot de passe",
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: Icon(_obscureConfirmPassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () {
                      setState(() {
                        _obscureConfirmPassword = !_obscureConfirmPassword;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Veuillez confirmer votre mot de passe";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 30),

              ElevatedButton(
                onPressed: _submitResetPassword,
                child: const Text("Valider"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
