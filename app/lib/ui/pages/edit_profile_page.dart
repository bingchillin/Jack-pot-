import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmNewPasswordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    _animationController.forward();
    
    // Initialize form with current user data
    _initializeForm();
  }

  void _initializeForm() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userData = authProvider.userData;
    
    if (userData != null) {
      _firstNameController.text = userData['firstname'] ?? '';
      _lastNameController.text = userData['surname'] ?? '';
      _phoneController.text = userData['numberPhone'] ?? '';
      _addressController.text = userData['address'] ?? '';
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmNewPasswordController.dispose();
    super.dispose();
  }

  bool _getPasswordVisibility(String? passwordType) {
    switch (passwordType) {
      case 'current':
        return _obscureCurrentPassword;
      case 'new':
        return _obscureNewPassword;
      case 'confirm':
        return _obscureConfirmPassword;
      default:
        return true;
    }
  }

  void _togglePasswordVisibility(String? passwordType) {
    switch (passwordType) {
      case 'current':
        _obscureCurrentPassword = !_obscureCurrentPassword;
        break;
      case 'new':
        _obscureNewPassword = !_obscureNewPassword;
        break;
      case 'confirm':
        _obscureConfirmPassword = !_obscureConfirmPassword;
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final localizations = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.grey[50],
        foregroundColor: Colors.green[700],
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          localizations.editProfile,
          style: const TextStyle(
            color: Colors.green,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Edit Form Card
                    _buildEditFormCard(context, localizations),
                    
                    const SizedBox(height: 24),
                    
                    // Save Button
                    _buildSaveButton(context, localizations),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEditFormCard(BuildContext context, AppLocalizations localizations) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // First Name Field
          _buildTextFormField(
            controller: _firstNameController,
            label: localizations.firstName,
            icon: Icons.person,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return localizations.firstNameRequired;
              }
              return null;
            },
          ),
          
          const SizedBox(height: 20),
          
          // Last Name Field
          _buildTextFormField(
            controller: _lastNameController,
            label: localizations.lastName,
            icon: Icons.person,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return localizations.lastNameRequired;
              }
              return null;
            },
          ),
          
          const SizedBox(height: 20),
          
          // Phone Field
          _buildTextFormField(
            controller: _phoneController,
            label: localizations.phoneNumber,
            icon: Icons.phone,
            keyboardType: TextInputType.phone,
            validator: (value) {
              if (value != null && value.isNotEmpty) {
                if (value.length < 9 || value.length > 15) {
                  return localizations.invalidPhoneNumber;
                }
              }
              return null;
            },
          ),
          
          const SizedBox(height: 20),
          
          // Address Field
          _buildTextFormField(
            controller: _addressController,
            label: localizations.address,
            icon: Icons.location_on,
            maxLines: 2,
          ),
          
          const SizedBox(height: 20),
          
          // Current Password Field (required for updates)
          _buildTextFormField(
            controller: _currentPasswordController,
            label: localizations.currentPassword,
            icon: Icons.lock,
            isPassword: true,
            passwordType: 'current',
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return localizations.currentPasswordRequired;
              }
              return null;
            },
          ),
          
          const SizedBox(height: 20),
          
          // New Password Field (optional)
          _buildTextFormField(
            controller: _newPasswordController,
            label: localizations.newPassword,
            icon: Icons.lock_outline,
            isPassword: true,
            passwordType: 'new',
            validator: (value) {
              // Only validate if user entered something
              if (value != null && value.isNotEmpty && value.length < 6) {
                return localizations.newPasswordMinLength;
              }
              return null;
            },
          ),
          
          const SizedBox(height: 20),
          
          // Confirm New Password Field (optional)
          _buildTextFormField(
            controller: _confirmNewPasswordController,
            label: localizations.confirmNewPassword,
            icon: Icons.lock_outline,
            isPassword: true,
            passwordType: 'confirm',
            validator: (value) {
              // Only validate if new password was entered
              if (_newPasswordController.text.isNotEmpty) {
                if (value != _newPasswordController.text) {
                  return localizations.passwordsDoNotMatch;
                }
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    int maxLines = 1,
    bool isPassword = false,
    String? passwordType, // 'current', 'new', 'confirm'
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          obscureText: isPassword ? _getPasswordVisibility(passwordType) : false,
          decoration: InputDecoration(
            prefixIcon: Icon(
              icon,
              size: 20,
              color: Colors.grey[600],
            ),
            suffixIcon: isPassword 
                ? IconButton(
                    icon: Icon(
                      _getPasswordVisibility(passwordType) ? Icons.visibility : Icons.visibility_off,
                      color: Colors.grey[600],
                    ),
                    onPressed: () {
                      setState(() {
                        _togglePasswordVisibility(passwordType);
                      });
                    },
                  )
                : null,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.green[600]!, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.red[600]!),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.red[600]!, width: 2),
            ),
            filled: true,
            fillColor: Colors.grey[50],
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[800],
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton(BuildContext context, AppLocalizations localizations) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : () => _saveProfile(context, localizations),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green[600],
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                localizations.save,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Future<void> _saveProfile(BuildContext context, AppLocalizations localizations) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      final result = await authProvider.updateProfile(
        currentPassword: _currentPasswordController.text,
        firstname: _firstNameController.text.trim().isNotEmpty ? _firstNameController.text.trim() : null,
        surname: _lastNameController.text.trim().isNotEmpty ? _lastNameController.text.trim() : null,
        numberPhone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        address: _addressController.text.trim().isNotEmpty ? _addressController.text.trim() : null,
        newPassword: _newPasswordController.text.trim().isNotEmpty ? _newPasswordController.text.trim() : null,
      );
      
      if (context.mounted) {
        if (result['success'] == true) {
          // Check if password was changed before clearing fields
          final bool passwordChanged = _newPasswordController.text.trim().isNotEmpty;
          final successMessage = passwordChanged 
              ? 'Profile and password updated successfully!' // TODO: Add to localizations if needed
              : localizations.profileUpdatedSuccess;
          
          // Clear password fields on success
          _currentPasswordController.clear();
          _newPasswordController.clear();
          _confirmNewPasswordController.clear();
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(successMessage),
              backgroundColor: Colors.green[600],
              behavior: SnackBarBehavior.floating,
            ),
          );
          Navigator.pop(context);
        } else {
          // Handle different error types
          String errorMessage = result['message'] ?? localizations.profileUpdateError;
          if (errorMessage.contains('Current password is incorrect')) {
            errorMessage = 'Current password is incorrect'; // TODO: Add to localizations if needed
          }
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMessage),
              backgroundColor: Colors.red[600],
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localizations.profileUpdateError),
            backgroundColor: Colors.red[600],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
} 