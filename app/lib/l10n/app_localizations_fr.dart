// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appName => 'Jack Pot';

  @override
  String get loginTitle => 'Connexion';

  @override
  String get email => 'Email';

  @override
  String get password => 'Mot de passe';

  @override
  String get signIn => 'Se connecter';

  @override
  String get forgotPassword => 'Mot de passe oublié ?';

  @override
  String get or => 'ou';

  @override
  String get newToJackPot => 'Nouveau sur Jack Pot ? ';

  @override
  String get createAccount => 'Créer un compte';

  @override
  String get emailRequired => 'L\'email est requis';

  @override
  String get invalidEmailFormat => 'Format d\'email invalide';

  @override
  String get passwordMinimum => '6 caractères minimum';

  @override
  String get connectionError => 'Erreur de connexion';

  @override
  String get checkCredentials => 'Vérifiez vos identifiants et réessayez.';

  @override
  String get ok => 'OK';

  @override
  String get signingIn => 'Connexion en cours...';

  @override
  String get profile => 'Profil';

  @override
  String get welcome => 'Bienvenue';

  @override
  String get contactInformation => 'Informations de contact';

  @override
  String get phoneNumber => 'Numéro de téléphone';

  @override
  String get address => 'Adresse';

  @override
  String get editProfile => 'Modifier le profil';

  @override
  String get accountSettings => 'Paramètres du compte';

  @override
  String get myPlants => 'Mes plantes';

  @override
  String get plantCare => 'Soin des plantes';

  @override
  String get logout => 'Se déconnecter';

  @override
  String get logoutConfirmation =>
      'Êtes-vous sûr de vouloir vous déconnecter ?';

  @override
  String get cancel => 'Annuler';

  @override
  String get memberSince => 'Membre depuis';

  @override
  String get notProvided => 'Non renseigné';

  @override
  String get firstName => 'Prénom';

  @override
  String get lastName => 'Nom';

  @override
  String get firstNameRequired => 'Le prénom est requis';

  @override
  String get lastNameRequired => 'Le nom est requis';

  @override
  String get invalidPhoneNumber => 'Numéro de téléphone invalide';

  @override
  String get save => 'Sauvegarder';

  @override
  String get profileUpdatedSuccess => 'Profil mis à jour avec succès !';

  @override
  String get profileUpdateError => 'Erreur lors de la mise à jour';

  @override
  String get currentPassword => 'Mot de passe actuel';

  @override
  String get currentPasswordRequired => 'Le mot de passe actuel est requis';

  @override
  String get newPassword => 'Nouveau mot de passe';

  @override
  String get confirmNewPassword => 'Confirmer le nouveau mot de passe';

  @override
  String get newPasswordMinLength =>
      'Le nouveau mot de passe doit contenir au moins 6 caractères';

  @override
  String get passwordsDoNotMatch => 'Les mots de passe ne correspondent pas';

  @override
  String get requiredFieldsNotice =>
      'Les champs marqués avec * sont obligatoires';

  @override
  String get fieldRequirementsTitle => 'Exigences des champs :';

  @override
  String get fieldRequirementsText =>
      '• Prénom et nom sont obligatoires\n• Le mot de passe actuel est requis pour tout changement\n• Le numéro de téléphone doit contenir 9-15 chiffres (si fourni)\n• Le nouveau mot de passe doit contenir au moins 6 caractères (si fourni)';

  @override
  String get profileAndPasswordUpdatedSuccess =>
      'Profil et mot de passe mis à jour avec succès !';

  @override
  String get currentPasswordIncorrect => 'Le mot de passe actuel est incorrect';
}
