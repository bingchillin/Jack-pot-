import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _obscurePassword = true;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _firstnameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _phoneController = TextEditingController();

  void _submitSignup() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Les mots de passe ne correspondent pas")),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.signup(
      email: _emailController.text.trim(),
      password: _passwordController.text.trim(),
      firstname: _firstnameController.text.trim(),
      surname: _surnameController.text.trim(),
      numberPhone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/profile');
    } else if (mounted) {
      showDialog(
        context: context,
        builder: (_) => const AlertDialog(
          title: Text("Erreur"),
          content: Text("Échec de l'inscription"),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Inscription")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              const Text("Email *"),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(hintText: "Email"),
                validator: (v) => v == null || v.isEmpty ? "Requis" : null,
              ),
              const SizedBox(height: 12),
              const Text("Mot de passe *"),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  hintText: "Mot de passe",
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                validator: (v) => v != null && v.length < 6 ? "Min 6 caractères" : null,
              ),
              const SizedBox(height: 12),
              const Text("Confirmation mot de passe *"),
              TextFormField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: const InputDecoration(hintText: "Confirmez le mot de passe"),
                validator: (v) => v != null && v != _passwordController.text ? "Ne correspond pas" : null,
              ),
              const SizedBox(height: 12),
              const Text("Prénom *"),
              TextFormField(
                controller: _firstnameController,
                decoration: const InputDecoration(hintText: "Prénom"),
                validator: (v) => v == null || v.isEmpty ? "Requis" : null,
              ),
              const SizedBox(height: 12),
              const Text("Nom"),
              TextFormField(
                controller: _surnameController,
                decoration: const InputDecoration(hintText: "Nom"),
              ),
              const SizedBox(height: 12),
              const Text("Téléphone"),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(hintText: "Téléphone (optionnel)"),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : () async {
                  if (!_formKey.currentState!.validate()) return;

                  setState(() => _isLoading = true);
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);

                  final success = await authProvider.signup(
                    email: _emailController.text.trim(),
                    password: _passwordController.text.trim(),
                    firstname: _firstnameController.text.trim(),
                    surname: _surnameController.text.trim(),
                    numberPhone: _phoneController.text.trim(),
                  );

                  setState(() => _isLoading = false);

                  if (success && context.mounted) {
                    Navigator.pushReplacementNamed(context, '/');
                  } else if (context.mounted) {
                    showDialog(
                      context: context,
                      builder: (_) => const AlertDialog(
                        title: Text("Erreur"),
                        content: Text("Échec de l'inscription. Vérifiez vos données."),
                      ),
                    );
                  }
                },
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text("S'inscrire"),

              ),
            ],
          ),
        ),
      ),
    );
  }
}
