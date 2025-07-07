import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('es'),
    Locale('fr'),
  ];

  /// The name of the application
  ///
  /// In en, this message translates to:
  /// **'Jack Pot'**
  String get appName;

  /// Title of the login page
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get loginTitle;

  /// Email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// Password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// Sign in button text
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// Forgot password link text
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get forgotPassword;

  /// Divider text between login and signup
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get or;

  /// Text before create account link
  ///
  /// In en, this message translates to:
  /// **'New to Jack Pot? '**
  String get newToJackPot;

  /// Create account link text
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccount;

  /// Email validation error message
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get emailRequired;

  /// Email format validation error message
  ///
  /// In en, this message translates to:
  /// **'Invalid email format'**
  String get invalidEmailFormat;

  /// Password length validation error message
  ///
  /// In en, this message translates to:
  /// **'6 characters minimum'**
  String get passwordMinimum;

  /// Error dialog title
  ///
  /// In en, this message translates to:
  /// **'Connection Error'**
  String get connectionError;

  /// Error dialog message
  ///
  /// In en, this message translates to:
  /// **'Check your credentials and try again.'**
  String get checkCredentials;

  /// OK button text
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// Loading state text
  ///
  /// In en, this message translates to:
  /// **'Signing in...'**
  String get signingIn;

  /// Profile page title
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// Welcome greeting
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// Contact information section title
  ///
  /// In en, this message translates to:
  /// **'Contact Information'**
  String get contactInformation;

  /// Phone number label
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// Address label
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// Edit profile button text
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// Account settings section title
  ///
  /// In en, this message translates to:
  /// **'Account Settings'**
  String get accountSettings;

  /// My plants button text
  ///
  /// In en, this message translates to:
  /// **'My Plants'**
  String get myPlants;

  /// Plant care section title
  ///
  /// In en, this message translates to:
  /// **'Plant Care'**
  String get plantCare;

  /// Logout button text
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// Logout confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout?'**
  String get logoutConfirmation;

  /// Cancel button text
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Member since label
  ///
  /// In en, this message translates to:
  /// **'Member since'**
  String get memberSince;

  /// Text when information is not provided
  ///
  /// In en, this message translates to:
  /// **'Not provided'**
  String get notProvided;

  /// First name label
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get firstName;

  /// Last name label
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get lastName;

  /// First name validation error
  ///
  /// In en, this message translates to:
  /// **'First name is required'**
  String get firstNameRequired;

  /// Last name validation error
  ///
  /// In en, this message translates to:
  /// **'Last name is required'**
  String get lastNameRequired;

  /// Phone number validation error
  ///
  /// In en, this message translates to:
  /// **'Invalid phone number'**
  String get invalidPhoneNumber;

  /// Save button text
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// Profile update success message
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully!'**
  String get profileUpdatedSuccess;

  /// Profile update error message
  ///
  /// In en, this message translates to:
  /// **'Error updating profile'**
  String get profileUpdateError;

  /// Current password field label
  ///
  /// In en, this message translates to:
  /// **'Current Password'**
  String get currentPassword;

  /// Current password validation error
  ///
  /// In en, this message translates to:
  /// **'Current password is required'**
  String get currentPasswordRequired;

  /// New password field label
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// Confirm new password field label
  ///
  /// In en, this message translates to:
  /// **'Confirm New Password'**
  String get confirmNewPassword;

  /// New password length validation error
  ///
  /// In en, this message translates to:
  /// **'New password must be at least 6 characters'**
  String get newPasswordMinLength;

  /// Password confirmation validation error
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordsDoNotMatch;

  /// Notice about required fields
  ///
  /// In en, this message translates to:
  /// **'Fields marked with * are required'**
  String get requiredFieldsNotice;

  /// Title for field requirements help text
  ///
  /// In en, this message translates to:
  /// **'Field Requirements:'**
  String get fieldRequirementsTitle;

  /// Field requirements help text
  ///
  /// In en, this message translates to:
  /// **'• First Name & Last Name are required\n• Current Password is required for any changes\n• Phone number must be 9-15 digits (if provided)\n• New password must be at least 6 characters (if provided)'**
  String get fieldRequirementsText;

  /// Success message when both profile and password are updated
  ///
  /// In en, this message translates to:
  /// **'Profile and password updated successfully!'**
  String get profileAndPasswordUpdatedSuccess;

  /// Error message when current password is wrong
  ///
  /// In en, this message translates to:
  /// **'Current password is incorrect'**
  String get currentPasswordIncorrect;

  /// Sign up button text
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// Sign up page title
  ///
  /// In en, this message translates to:
  /// **'Create Your Account'**
  String get signUpTitle;

  /// Confirm password field label
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get confirmPassword;

  /// Confirm password field placeholder
  ///
  /// In en, this message translates to:
  /// **'Confirm your password'**
  String get confirmPasswordPlaceholder;

  /// Error message when passwords don't match
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordsNoMatch;

  /// Success message when account is created
  ///
  /// In en, this message translates to:
  /// **'Account created successfully!'**
  String get signUpSuccess;

  /// Error message when signup fails
  ///
  /// In en, this message translates to:
  /// **'Failed to create account. Please check your information.'**
  String get signUpError;

  /// Text before sign in link on signup page
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get alreadyHaveAccount;

  /// Link text to go to login page
  ///
  /// In en, this message translates to:
  /// **'Sign in here'**
  String get signInHere;

  /// Error dialog title
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// Optional field indicator
  ///
  /// In en, this message translates to:
  /// **'(optional)'**
  String get optional;

  /// Error message when confirm password is empty
  ///
  /// In en, this message translates to:
  /// **'Please confirm your password'**
  String get confirmPasswordRequired;

  /// Subtitle for my plants page
  ///
  /// In en, this message translates to:
  /// **'Manage your plants smartly'**
  String get managePlants;

  /// Favorites section title
  ///
  /// In en, this message translates to:
  /// **'My Favorites'**
  String get favorites;

  /// Subtitle for favorites section
  ///
  /// In en, this message translates to:
  /// **'Your favorite plants'**
  String get favoritePlantsSubtitle;

  /// My list section title
  ///
  /// In en, this message translates to:
  /// **'My List'**
  String get myList;

  /// Subtitle for my plants section
  ///
  /// In en, this message translates to:
  /// **'All your plants'**
  String get myPlantsSubtitle;

  /// Empty state message for favorites
  ///
  /// In en, this message translates to:
  /// **'No favorite plants'**
  String get noFavoritePlants;

  /// Empty state description for favorites
  ///
  /// In en, this message translates to:
  /// **'Add your favorite plants to favorites'**
  String get addFavoritePlantsDescription;

  /// Tooltip for adding plant to favorites
  ///
  /// In en, this message translates to:
  /// **'Add to favorites'**
  String get addToFavorites;

  /// Tooltip for removing plant from favorites
  ///
  /// In en, this message translates to:
  /// **'Remove from favorites'**
  String get removeFromFavorites;

  /// Message when plant is added to favorites
  ///
  /// In en, this message translates to:
  /// **'Added to favorites'**
  String get addedToFavorites;

  /// Message when plant is removed from favorites
  ///
  /// In en, this message translates to:
  /// **'Removed from favorites'**
  String get removedFromFavorites;

  /// Title for auth required dialog
  ///
  /// In en, this message translates to:
  /// **'Authentication Required'**
  String get authenticationRequired;

  /// Message asking user to sign in for favorites
  ///
  /// In en, this message translates to:
  /// **'Please sign in to add plants to your favorites'**
  String get pleaseSignInToAddFavorites;

  /// Empty state message for my plants list
  ///
  /// In en, this message translates to:
  /// **'No plants in your list'**
  String get noMyPlants;

  /// Empty state description for my plants list
  ///
  /// In en, this message translates to:
  /// **'Start adding your plants'**
  String get addMyPlantsDescription;

  /// Automatic mode toggle label
  ///
  /// In en, this message translates to:
  /// **'AUTO'**
  String get autoMode;

  /// Water mode toggle label
  ///
  /// In en, this message translates to:
  /// **'WATER'**
  String get waterMode;

  /// Fallback text for unknown plant name
  ///
  /// In en, this message translates to:
  /// **'Unknown name'**
  String get unknownName;

  /// Fallback text for unknown plant type
  ///
  /// In en, this message translates to:
  /// **'Unknown type'**
  String get unknownType;

  /// Text when plant image is not available
  ///
  /// In en, this message translates to:
  /// **'Image not available'**
  String get imageNotAvailable;

  /// Text when there is no image
  ///
  /// In en, this message translates to:
  /// **'No image'**
  String get noImage;

  /// Plant detail page title
  ///
  /// In en, this message translates to:
  /// **'Plant Detail'**
  String get plantDetail;

  /// Error message when token is missing
  ///
  /// In en, this message translates to:
  /// **'Token missing'**
  String get tokenMissing;

  /// Close button text
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Plant overview section title
  ///
  /// In en, this message translates to:
  /// **'Plant Overview'**
  String get plantOverview;

  /// Last updated label
  ///
  /// In en, this message translates to:
  /// **'Last Updated'**
  String get lastUpdated;

  /// Next watering label
  ///
  /// In en, this message translates to:
  /// **'Next Watering'**
  String get nextWatering;

  /// Health score label
  ///
  /// In en, this message translates to:
  /// **'Health Score'**
  String get healthScore;

  /// Sensor data section title
  ///
  /// In en, this message translates to:
  /// **'Sensor Data'**
  String get sensorData;

  /// Soil moisture sensor label
  ///
  /// In en, this message translates to:
  /// **'Soil Moisture'**
  String get soilMoisture;

  /// Air humidity sensor label
  ///
  /// In en, this message translates to:
  /// **'Air Humidity'**
  String get airHumidity;

  /// Temperature sensor label
  ///
  /// In en, this message translates to:
  /// **'Temperature'**
  String get temperature;

  /// Light level sensor label
  ///
  /// In en, this message translates to:
  /// **'Light Level'**
  String get lightLevel;

  /// Soil pH sensor label
  ///
  /// In en, this message translates to:
  /// **'Soil pH'**
  String get soilPH;

  /// Fertility sensor label
  ///
  /// In en, this message translates to:
  /// **'Fertility'**
  String get fertility;

  /// Ground temperature sensor label
  ///
  /// In en, this message translates to:
  /// **'Ground Temperature'**
  String get groundTemp;

  /// Sun exposure sensor label
  ///
  /// In en, this message translates to:
  /// **'Sun Exposure'**
  String get sunExposure;

  /// Optimal sensor status
  ///
  /// In en, this message translates to:
  /// **'Optimal'**
  String get optimal;

  /// Good sensor status
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get good;

  /// Moderate sensor status
  ///
  /// In en, this message translates to:
  /// **'Moderate'**
  String get moderate;

  /// Warning sensor status
  ///
  /// In en, this message translates to:
  /// **'Warning'**
  String get warning;

  /// Critical sensor status
  ///
  /// In en, this message translates to:
  /// **'Critical'**
  String get critical;

  /// Not available text
  ///
  /// In en, this message translates to:
  /// **'Not available'**
  String get notAvailable;

  /// Plant care advice section title
  ///
  /// In en, this message translates to:
  /// **'Plant Care Advice'**
  String get plantCareAdvice;

  /// Care recipe section title
  ///
  /// In en, this message translates to:
  /// **'Care Recipe'**
  String get careRecipe;

  /// No advice available text
  ///
  /// In en, this message translates to:
  /// **'No advice available'**
  String get noAdviceAvailable;

  /// No recipe available text
  ///
  /// In en, this message translates to:
  /// **'No recipe available'**
  String get noRecipeAvailable;

  /// Minutes ago text
  ///
  /// In en, this message translates to:
  /// **'minutes ago'**
  String get minutesAgo;

  /// Hours ago text
  ///
  /// In en, this message translates to:
  /// **'hours ago'**
  String get hoursAgo;

  /// Days ago text
  ///
  /// In en, this message translates to:
  /// **'days ago'**
  String get daysAgo;

  /// Just now text
  ///
  /// In en, this message translates to:
  /// **'just now'**
  String get justNow;

  /// Tomorrow text
  ///
  /// In en, this message translates to:
  /// **'tomorrow'**
  String get tomorrow;

  /// Today text
  ///
  /// In en, this message translates to:
  /// **'today'**
  String get today;

  /// Loading error message
  ///
  /// In en, this message translates to:
  /// **'Loading error'**
  String get loadingError;

  /// Excellent plant state
  ///
  /// In en, this message translates to:
  /// **'Excellent'**
  String get stateExcellent;

  /// Good plant state
  ///
  /// In en, this message translates to:
  /// **'Good condition'**
  String get stateGood;

  /// Fair plant state
  ///
  /// In en, this message translates to:
  /// **'Fair'**
  String get stateFair;

  /// Needs attention plant state
  ///
  /// In en, this message translates to:
  /// **'Needs attention'**
  String get stateNeedsAttention;

  /// Critical plant state
  ///
  /// In en, this message translates to:
  /// **'Critical state'**
  String get stateCritical;

  /// Unknown plant state
  ///
  /// In en, this message translates to:
  /// **'Unknown state'**
  String get stateUnknown;

  /// Loading message
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// General error message
  ///
  /// In en, this message translates to:
  /// **'An error occurred'**
  String get errorOccurred;

  /// Button text to retry an action
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// Welcome page main title
  ///
  /// In en, this message translates to:
  /// **'Welcome to the Future of Plant Care'**
  String get welcomeToJackPot;

  /// App tagline on welcome page
  ///
  /// In en, this message translates to:
  /// **'Smart Plant Care Made Simple'**
  String get smartPlantCareSimple;

  /// Welcome page description
  ///
  /// In en, this message translates to:
  /// **'Monitor your plants with IoT sensors, get smart care recommendations, and join a community of plant enthusiasts.'**
  String get welcomeDescription;

  /// Feature card title
  ///
  /// In en, this message translates to:
  /// **'Smart Monitoring'**
  String get smartMonitoring;

  /// Feature card description
  ///
  /// In en, this message translates to:
  /// **'Real-time sensor data'**
  String get smartMonitoringDesc;

  /// Feature card title
  ///
  /// In en, this message translates to:
  /// **'Auto Care'**
  String get autoCare;

  /// Feature card description
  ///
  /// In en, this message translates to:
  /// **'Remote plant control'**
  String get autoCareDesc;

  /// Feature card title
  ///
  /// In en, this message translates to:
  /// **'Community'**
  String get community;

  /// Feature card description
  ///
  /// In en, this message translates to:
  /// **'Share & learn together'**
  String get communityDesc;

  /// Feature card title
  ///
  /// In en, this message translates to:
  /// **'Health Analytics'**
  String get healthAnalytics;

  /// Feature card description
  ///
  /// In en, this message translates to:
  /// **'Track plant progress'**
  String get healthAnalyticsDesc;

  /// Primary CTA button text on welcome page
  ///
  /// In en, this message translates to:
  /// **'Create an Account'**
  String get createAccountFree;

  /// Secondary button text on welcome page
  ///
  /// In en, this message translates to:
  /// **'I Already Have an Account'**
  String get alreadyHaveAccountWelcome;

  /// Guest mode section header
  ///
  /// In en, this message translates to:
  /// **'Just want to explore?'**
  String get justWantToExplore;

  /// Guest mode button text
  ///
  /// In en, this message translates to:
  /// **'Continue as Guest'**
  String get continueAsGuest;

  /// Legal disclaimer text
  ///
  /// In en, this message translates to:
  /// **'By continuing, you agree to our Terms of Service and Privacy Policy'**
  String get termsAndPrivacy;

  /// Demo mode banner title
  ///
  /// In en, this message translates to:
  /// **'Demo Mode'**
  String get demoMode;

  /// Demo mode banner message
  ///
  /// In en, this message translates to:
  /// **'These are sample plants. Sign up to add your own plants and access all features!'**
  String get demoBannerMessage;

  /// Demo plant banner title
  ///
  /// In en, this message translates to:
  /// **'Demo Plant'**
  String get demoPlant;

  /// Demo plant detail page message
  ///
  /// In en, this message translates to:
  /// **'This is a sample plant. Sign up to add your own plants and control them remotely!'**
  String get demoPlantMessage;

  /// Premium feature dialog title
  ///
  /// In en, this message translates to:
  /// **'Premium Feature'**
  String get premiumFeature;

  /// Plant controls restriction message
  ///
  /// In en, this message translates to:
  /// **'Plant controls are available for registered users only. Sign up to control your plants remotely and access smart automation features!'**
  String get plantControlsMessage;

  /// Sign up required dialog title
  ///
  /// In en, this message translates to:
  /// **'Sign Up Required'**
  String get signUpRequired;

  /// Add plants restriction message
  ///
  /// In en, this message translates to:
  /// **'You need to sign up to add your own plants and access smart monitoring features. Join thousands of plant parents who trust Jack Pot!'**
  String get addPlantsMessage;

  /// Generic unlock feature message
  ///
  /// In en, this message translates to:
  /// **'Sign in to unlock this feature'**
  String get unlockAllFeatures;

  /// Guest mode indicator in app bar
  ///
  /// In en, this message translates to:
  /// **'Guest Mode'**
  String get guestModeActive;

  /// Encourage exploration in guest mode
  ///
  /// In en, this message translates to:
  /// **'Explore all the amazing features below!'**
  String get exploreFeatures;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'es', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
