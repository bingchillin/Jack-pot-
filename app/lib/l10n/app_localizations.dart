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

  /// Button to sign in
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
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

  /// View my profile button text
  ///
  /// In en, this message translates to:
  /// **'View My Profile'**
  String get viewMyProfile;

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

  /// Member since label on profile page
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

  /// Total daily score label
  ///
  /// In en, this message translates to:
  /// **'Total Score'**
  String get totalScore;

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

  /// Minutes ago suffix for relative time
  ///
  /// In en, this message translates to:
  /// **'m ago'**
  String get minutesAgo;

  /// Hours ago suffix for relative time
  ///
  /// In en, this message translates to:
  /// **'h ago'**
  String get hoursAgo;

  /// Days ago suffix for relative time
  ///
  /// In en, this message translates to:
  /// **'d ago'**
  String get daysAgo;

  /// Text shown for very recent times
  ///
  /// In en, this message translates to:
  /// **'Just now'**
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

  /// Error message when loading fails
  ///
  /// In en, this message translates to:
  /// **'Loading Error'**
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

  /// Community section title
  ///
  /// In en, this message translates to:
  /// **'Community'**
  String get community;

  /// Community section description
  ///
  /// In en, this message translates to:
  /// **'Connect with plant lovers'**
  String get communityDesc;

  /// Title for the comments/community page
  ///
  /// In en, this message translates to:
  /// **'Community'**
  String get commentsTitle;

  /// Subtitle for the comments/community page
  ///
  /// In en, this message translates to:
  /// **'Connect with plant lovers'**
  String get commentsSubtitle;

  /// Feed toggle option for personalized content
  ///
  /// In en, this message translates to:
  /// **'For You'**
  String get feedForYou;

  /// Feed toggle option for friends' content
  ///
  /// In en, this message translates to:
  /// **'Friends'**
  String get feedFriends;

  /// Label for category filter section
  ///
  /// In en, this message translates to:
  /// **'Filter by category'**
  String get filterByCategory;

  /// Filter option to show all posts
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// Filter option for conversation posts
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get filterConversation;

  /// Filter option for advice posts
  ///
  /// In en, this message translates to:
  /// **'Advice'**
  String get filterAdvice;

  /// No posts message
  ///
  /// In en, this message translates to:
  /// **'No posts yet'**
  String get noPostsYet;

  /// No posts from friends message
  ///
  /// In en, this message translates to:
  /// **'Your friends haven\'t posted yet'**
  String get noPostsFriends;

  /// No posts in category message
  ///
  /// In en, this message translates to:
  /// **'No posts in \"{category}\"'**
  String noPostsFilter(String category);

  /// Encouragement message to create first post
  ///
  /// In en, this message translates to:
  /// **'Be the first to post!'**
  String get beFirstToPost;

  /// Friends not posted message
  ///
  /// In en, this message translates to:
  /// **'Your friends haven\'t shared anything yet'**
  String get friendsNotPosted;

  /// Try different filter message
  ///
  /// In en, this message translates to:
  /// **'Try a different filter or be the first to share!'**
  String get tryDifferentFilter;

  /// Show all posts button text
  ///
  /// In en, this message translates to:
  /// **'Show All Posts'**
  String get showAllPosts;

  /// Manage friends button text
  ///
  /// In en, this message translates to:
  /// **'Manage Friends'**
  String get manageFriends;

  /// New post button text
  ///
  /// In en, this message translates to:
  /// **'New Post'**
  String get newPost;

  /// Retry button text
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// Message when user needs to login to see friends' posts
  ///
  /// In en, this message translates to:
  /// **'Sign in to see your friends\' posts'**
  String get loginToSeeFriends;

  /// Message shown when a comment is deleted
  ///
  /// In en, this message translates to:
  /// **'Comment deleted'**
  String get commentDeleted;

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

  /// Urgent notification indicator
  ///
  /// In en, this message translates to:
  /// **'Urgent!'**
  String get notificationUrgent;

  /// Plant needs care notification
  ///
  /// In en, this message translates to:
  /// **'Needs care'**
  String get notificationNeedsCare;

  /// Multiple issues notification
  ///
  /// In en, this message translates to:
  /// **'{count} issues'**
  String notificationMultipleIssues(int count);

  /// Urgent watering notification
  ///
  /// In en, this message translates to:
  /// **'Needs water urgently!'**
  String get notificationNeedsWaterUrgently;

  /// Normal watering notification
  ///
  /// In en, this message translates to:
  /// **'Time to water'**
  String get notificationTimeToWater;

  /// Light sensor issue notification
  ///
  /// In en, this message translates to:
  /// **'Light issue detected'**
  String get notificationLightIssue;

  /// Temperature sensor issue notification
  ///
  /// In en, this message translates to:
  /// **'Temperature problem'**
  String get notificationTemperatureProblem;

  /// Low nutrients notification
  ///
  /// In en, this message translates to:
  /// **'Low soil nutrients'**
  String get notificationLowNutrients;

  /// Water level sensor issue notification
  ///
  /// In en, this message translates to:
  /// **'Water level issue'**
  String get notificationWaterLevelIssue;

  /// Generic sensor alert notification
  ///
  /// In en, this message translates to:
  /// **'Sensor alert'**
  String get notificationSensorAlert;

  /// Multiple issues detected notification
  ///
  /// In en, this message translates to:
  /// **'{count} issues detected'**
  String notificationIssuesDetected(int count);

  /// Urgent issues notification
  ///
  /// In en, this message translates to:
  /// **'{count} urgent issues!'**
  String notificationUrgentIssues(int count);

  /// Issues with urgent count notification
  ///
  /// In en, this message translates to:
  /// **'{total} issues ({urgent} urgent)'**
  String notificationIssuesWithUrgent(int total, int urgent);

  /// Advice for moisture issues
  ///
  /// In en, this message translates to:
  /// **'Check soil moisture and water if needed'**
  String get notificationAdviceCheckMoisture;

  /// Advice for light issues
  ///
  /// In en, this message translates to:
  /// **'Adjust plant position for optimal light exposure'**
  String get notificationAdviceAdjustLight;

  /// Advice for temperature issues
  ///
  /// In en, this message translates to:
  /// **'Move plant to a more suitable temperature environment'**
  String get notificationAdviceTemperature;

  /// Advice for nutrient issues
  ///
  /// In en, this message translates to:
  /// **'Consider adding fertilizer to improve soil nutrients'**
  String get notificationAdviceNutrients;

  /// Advice for water level issues
  ///
  /// In en, this message translates to:
  /// **'Check water reservoir and drainage system'**
  String get notificationAdviceWaterLevel;

  /// General plant care advice
  ///
  /// In en, this message translates to:
  /// **'Please check your plant\'s overall health and environment.'**
  String get notificationAdviceGeneral;

  /// Notifications page title
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// My notifications menu item
  ///
  /// In en, this message translates to:
  /// **'My Notifications'**
  String get myNotifications;

  /// Notification settings menu item
  ///
  /// In en, this message translates to:
  /// **'Notification Settings'**
  String get notificationSettings;

  /// Plant care notifications section title
  ///
  /// In en, this message translates to:
  /// **'Plant Care Notifications'**
  String get plantCareNotifications;

  /// Social notifications section title
  ///
  /// In en, this message translates to:
  /// **'Social Notifications'**
  String get socialNotifications;

  /// General notifications section title
  ///
  /// In en, this message translates to:
  /// **'General Notifications'**
  String get generalNotifications;

  /// Comment likes notification setting
  ///
  /// In en, this message translates to:
  /// **'Comment Likes'**
  String get commentLikes;

  /// Comment mentions notification setting
  ///
  /// In en, this message translates to:
  /// **'Comment Mentions'**
  String get commentMentions;

  /// Comment replies notification setting
  ///
  /// In en, this message translates to:
  /// **'Comment Replies'**
  String get commentReplies;

  /// Watering reminders notification setting
  ///
  /// In en, this message translates to:
  /// **'Watering Reminders'**
  String get wateringReminders;

  /// Light alerts notification setting
  ///
  /// In en, this message translates to:
  /// **'Light Alerts'**
  String get lightAlerts;

  /// Temperature alerts notification setting
  ///
  /// In en, this message translates to:
  /// **'Temperature Alerts'**
  String get temperatureAlerts;

  /// Nutrient alerts notification setting
  ///
  /// In en, this message translates to:
  /// **'Nutrient Alerts'**
  String get nutrientAlerts;

  /// Health checkups notification setting
  ///
  /// In en, this message translates to:
  /// **'Health Checkups'**
  String get healthCheckups;

  /// System updates notification setting
  ///
  /// In en, this message translates to:
  /// **'System Updates'**
  String get systemUpdates;

  /// Success message when settings are saved
  ///
  /// In en, this message translates to:
  /// **'Settings saved successfully'**
  String get settingsSaved;

  /// Error message when settings fail to save
  ///
  /// In en, this message translates to:
  /// **'Failed to save settings'**
  String get settingsSaveError;

  /// Message when trying to test a disabled notification type
  ///
  /// In en, this message translates to:
  /// **'This notification type is disabled. Please enable it first.'**
  String get notificationDisabled;

  /// Success message when test notification is sent
  ///
  /// In en, this message translates to:
  /// **'Test notification sent!'**
  String get testNotificationSent;

  /// Error message when test notification fails
  ///
  /// In en, this message translates to:
  /// **'Failed to send test notification'**
  String get testNotificationError;

  /// Label for notification type selector
  ///
  /// In en, this message translates to:
  /// **'Select notification type to test:'**
  String get selectNotificationType;

  /// All notifications tab
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// Social notifications tab
  ///
  /// In en, this message translates to:
  /// **'Social'**
  String get social;

  /// Plant notifications tab
  ///
  /// In en, this message translates to:
  /// **'Plants'**
  String get plants;

  /// Message when there are no notifications
  ///
  /// In en, this message translates to:
  /// **'No notifications'**
  String get noNotifications;

  /// Error message when user is not authenticated
  ///
  /// In en, this message translates to:
  /// **'Not authenticated'**
  String get notAuthenticated;

  /// Error message when notifications fail to load
  ///
  /// In en, this message translates to:
  /// **'Error loading notifications'**
  String get errorLoadingNotifications;

  /// Button to mark all notifications as read
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get markAllRead;

  /// Success message when all notifications are marked as read
  ///
  /// In en, this message translates to:
  /// **'All notifications marked as read'**
  String get allNotificationsRead;

  /// Friends page title
  ///
  /// In en, this message translates to:
  /// **'Friends'**
  String get friends;

  /// Pending friend request status
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// Sent requests tab
  ///
  /// In en, this message translates to:
  /// **'Sent'**
  String get sent;

  /// Blocked users tab
  ///
  /// In en, this message translates to:
  /// **'Blocked'**
  String get blocked;

  /// Like button text
  ///
  /// In en, this message translates to:
  /// **'Like'**
  String get like;

  /// Unlike button text
  ///
  /// In en, this message translates to:
  /// **'Unlike'**
  String get unlike;

  /// Reply button text
  ///
  /// In en, this message translates to:
  /// **'Reply'**
  String get reply;

  /// Edit button text
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// Delete button text
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// Report button text
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get report;

  /// Block user option
  ///
  /// In en, this message translates to:
  /// **'Block'**
  String get block;

  /// Unblock button text
  ///
  /// In en, this message translates to:
  /// **'Unblock'**
  String get unblock;

  /// Thread discussion page title
  ///
  /// In en, this message translates to:
  /// **'Thread Discussion'**
  String get threadDiscussion;

  /// No data message
  ///
  /// In en, this message translates to:
  /// **'No data'**
  String get noData;

  /// Message shown when trying to like without being logged in
  ///
  /// In en, this message translates to:
  /// **'Please login to like'**
  String get loginToLike;

  /// Message shown when trying to reply without being logged in
  ///
  /// In en, this message translates to:
  /// **'Please login to reply'**
  String get loginToReply;

  /// Message when user needs to login to report
  ///
  /// In en, this message translates to:
  /// **'Sign in to report'**
  String get loginToReport;

  /// Message when user needs to login to delete
  ///
  /// In en, this message translates to:
  /// **'Sign in to delete'**
  String get loginToDelete;

  /// Delete confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this post?'**
  String get deleteConfirmation;

  /// Delete post button text
  ///
  /// In en, this message translates to:
  /// **'Delete Post'**
  String get deletePost;

  /// Success message when post is deleted
  ///
  /// In en, this message translates to:
  /// **'Post deleted'**
  String get postDeleted;

  /// Edit post button text
  ///
  /// In en, this message translates to:
  /// **'Edit Post'**
  String get editPost;

  /// Success message when post is updated
  ///
  /// In en, this message translates to:
  /// **'Post updated'**
  String get postUpdated;

  /// Error message when post update fails
  ///
  /// In en, this message translates to:
  /// **'Error updating post'**
  String get postUpdateError;

  /// Create post button text
  ///
  /// In en, this message translates to:
  /// **'Create Post'**
  String get createPost;

  /// Post content placeholder
  ///
  /// In en, this message translates to:
  /// **'What\'s on your mind?'**
  String get postContent;

  /// Add image button text
  ///
  /// In en, this message translates to:
  /// **'Add Image'**
  String get addImage;

  /// Remove image button text
  ///
  /// In en, this message translates to:
  /// **'Remove Image'**
  String get removeImage;

  /// Success message when post is created
  ///
  /// In en, this message translates to:
  /// **'Post created successfully!'**
  String get postCreated;

  /// Error message when post creation fails
  ///
  /// In en, this message translates to:
  /// **'Error creating post'**
  String get postCreationError;

  /// Select category label
  ///
  /// In en, this message translates to:
  /// **'Select Category'**
  String get selectCategory;

  /// Conversation category
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get conversation;

  /// Advice category
  ///
  /// In en, this message translates to:
  /// **'Advice'**
  String get advice;

  /// Replies count text
  ///
  /// In en, this message translates to:
  /// **'Replies'**
  String get replies;

  /// View replies button text
  ///
  /// In en, this message translates to:
  /// **'View replies'**
  String get viewReplies;

  /// Hide replies button text
  ///
  /// In en, this message translates to:
  /// **'Hide replies'**
  String get hideReplies;

  /// No replies message
  ///
  /// In en, this message translates to:
  /// **'No replies yet'**
  String get noReplies;

  /// Encouragement to be first to reply
  ///
  /// In en, this message translates to:
  /// **'Be the first to reply!'**
  String get beFirstToReply;

  /// Message shown when viewing blocked user's profile
  ///
  /// In en, this message translates to:
  /// **'This user is blocked'**
  String get userBlocked;

  /// Block user button text
  ///
  /// In en, this message translates to:
  /// **'Block User'**
  String get blockUser;

  /// Unblock user button text
  ///
  /// In en, this message translates to:
  /// **'Unblock User'**
  String get unblockUser;

  /// Report post button text
  ///
  /// In en, this message translates to:
  /// **'Report Post'**
  String get reportPost;

  /// Report reason label
  ///
  /// In en, this message translates to:
  /// **'Report Reason'**
  String get reportReason;

  /// Inappropriate content report reason
  ///
  /// In en, this message translates to:
  /// **'Inappropriate content'**
  String get inappropriateContent;

  /// Spam report reason
  ///
  /// In en, this message translates to:
  /// **'Spam'**
  String get spam;

  /// Harassment report reason
  ///
  /// In en, this message translates to:
  /// **'Harassment'**
  String get harassment;

  /// Other report reason
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get other;

  /// Report submitted success message
  ///
  /// In en, this message translates to:
  /// **'Report submitted'**
  String get reportSubmitted;

  /// Report submission error message
  ///
  /// In en, this message translates to:
  /// **'Error submitting report'**
  String get reportError;

  /// Be first to share message
  ///
  /// In en, this message translates to:
  /// **'Be the first to share!'**
  String get beFirstToShare;

  /// Delete post confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this post?'**
  String get deletePostConfirmation;

  /// Report post confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to report this post?'**
  String get reportPostConfirmation;

  /// Post reported success message
  ///
  /// In en, this message translates to:
  /// **'Post reported successfully'**
  String get postReported;

  /// Block user confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to block this user?'**
  String get blockUserConfirmation;

  /// Unblock user confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to unblock this user?'**
  String get unblockUserConfirmation;

  /// User already blocked message
  ///
  /// In en, this message translates to:
  /// **'{name} is already blocked'**
  String userAlreadyBlocked(String name);

  /// User blocked success message
  ///
  /// In en, this message translates to:
  /// **'{name} has been blocked'**
  String userBlockedSuccess(String name);

  /// User unblocked success message
  ///
  /// In en, this message translates to:
  /// **'{name} has been unblocked'**
  String userUnblockedSuccess(String name);

  /// User not blocked message
  ///
  /// In en, this message translates to:
  /// **'{name} is not blocked'**
  String userNotBlocked(String name);

  /// Block user error message
  ///
  /// In en, this message translates to:
  /// **'Error blocking user'**
  String get blockError;

  /// Unblock user error message
  ///
  /// In en, this message translates to:
  /// **'Error unblocking user'**
  String get unblockError;

  /// Empty content validation message
  ///
  /// In en, this message translates to:
  /// **'Please write something'**
  String get writeSomething;

  /// Loading replies message
  ///
  /// In en, this message translates to:
  /// **'Loading replies...'**
  String get loadingReplies;

  /// Error loading replies message
  ///
  /// In en, this message translates to:
  /// **'Error loading replies'**
  String get errorLoadingReplies;

  /// Delete reply confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this reply?'**
  String get deleteReplyConfirmation;

  /// Delete reply button text
  ///
  /// In en, this message translates to:
  /// **'Delete Reply'**
  String get deleteReply;

  /// Reply deleted success message
  ///
  /// In en, this message translates to:
  /// **'Reply deleted successfully'**
  String get replyDeleted;

  /// Reply delete error message
  ///
  /// In en, this message translates to:
  /// **'Error deleting reply'**
  String get replyDeleteError;

  /// Reply to reply coming soon message
  ///
  /// In en, this message translates to:
  /// **'Reply to reply functionality coming soon!'**
  String get replyToReply;

  /// Edit reply coming soon message
  ///
  /// In en, this message translates to:
  /// **'Edit reply functionality coming soon!'**
  String get editReply;

  /// Login required dialog title
  ///
  /// In en, this message translates to:
  /// **'Login Required'**
  String get loginRequired;

  /// Login required message
  ///
  /// In en, this message translates to:
  /// **'Please sign in to {action} this reply and participate in the community.'**
  String loginRequiredMessage(String action);

  /// Later button text
  ///
  /// In en, this message translates to:
  /// **'Later'**
  String get later;

  /// Redirecting to login message
  ///
  /// In en, this message translates to:
  /// **'Redirecting to login page...'**
  String get redirectingToLogin;

  /// Connect button text
  ///
  /// In en, this message translates to:
  /// **'Connect'**
  String get connect;

  /// Authentication token missing message
  ///
  /// In en, this message translates to:
  /// **'Authentication token missing'**
  String get authTokenMissing;

  /// Like error message
  ///
  /// In en, this message translates to:
  /// **'Error liking reply'**
  String get likeError;

  /// Delete error message
  ///
  /// In en, this message translates to:
  /// **'Error deleting reply'**
  String get deleteError;

  /// Image selected message
  ///
  /// In en, this message translates to:
  /// **'Image selected'**
  String get imageSelected;

  /// Remove image tooltip
  ///
  /// In en, this message translates to:
  /// **'Remove image'**
  String get removeImageTooltip;

  /// Add image tooltip
  ///
  /// In en, this message translates to:
  /// **'Add image'**
  String get addImageTooltip;

  /// Title of the thread page
  ///
  /// In en, this message translates to:
  /// **'Discussion Thread'**
  String get threadTitle;

  /// Message shown when there are no comments
  ///
  /// In en, this message translates to:
  /// **'No comments yet'**
  String get noComments;

  /// Label for a post in the thread view
  ///
  /// In en, this message translates to:
  /// **'Post'**
  String get post;

  /// Publications section title on profile page
  ///
  /// In en, this message translates to:
  /// **'Posts'**
  String get publications;

  /// Empty state when user has no posts
  ///
  /// In en, this message translates to:
  /// **'No posts'**
  String get noPublications;

  /// Description for empty posts state
  ///
  /// In en, this message translates to:
  /// **'This user hasn\'t posted any content yet.'**
  String get noPublicationsDescription;

  /// Follow button text
  ///
  /// In en, this message translates to:
  /// **'Add friend'**
  String get follow;

  /// Following button text when already following
  ///
  /// In en, this message translates to:
  /// **'Friends'**
  String get following;

  /// Accept friend request button
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get accept;

  /// Reject friend request button
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get reject;

  /// Unfollow option in menu
  ///
  /// In en, this message translates to:
  /// **'Remove friend ?'**
  String get unfollow;

  /// Title for unfollow confirmation dialog
  ///
  /// In en, this message translates to:
  /// **'Unfollow User'**
  String get unfollowConfirmTitle;

  /// Message for unfollow confirmation dialog
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to unfollow this user?'**
  String get unfollowConfirmMessage;

  /// Cancel friend request button
  ///
  /// In en, this message translates to:
  /// **'Cancel Request'**
  String get cancelRequest;

  /// Cancel friend request confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to cancel this friend request?'**
  String get cancelRequestMessage;

  /// Success message when friend request is sent
  ///
  /// In en, this message translates to:
  /// **'Friend request sent'**
  String get friendRequestSent;

  /// Message to unblock user to see their content
  ///
  /// In en, this message translates to:
  /// **'Unblock to see posts'**
  String get unblockToSee;

  /// Message shown when viewing posts of a user you blocked
  ///
  /// In en, this message translates to:
  /// **'You have blocked this user. Their posts are hidden.'**
  String get youBlockedThisUserPosts;

  /// Message shown when trying to view posts of a user who blocked you
  ///
  /// In en, this message translates to:
  /// **'This user has blocked you. You cannot view their posts.'**
  String get thisUserBlockedYouPosts;

  /// Button text to navigate to blocked users management
  ///
  /// In en, this message translates to:
  /// **'Manage Blocked Users'**
  String get manageBlockedUsers;

  /// Title shown when access is restricted due to blocking
  ///
  /// In en, this message translates to:
  /// **'Access Restricted'**
  String get accessRestricted;

  /// Plant classification page title
  ///
  /// In en, this message translates to:
  /// **'Plant Classification'**
  String get plantClassification;

  /// Plant identification header title
  ///
  /// In en, this message translates to:
  /// **'Identify Your Plant'**
  String get identifyYourPlant;

  /// Description of AI classification feature
  ///
  /// In en, this message translates to:
  /// **'Take a photo to automatically identify your plant among:\nOrchid, Ficus Lyrata, Lavender, Monstera Deliciosa'**
  String get aiClassificationDescription;

  /// Button text to take a picture
  ///
  /// In en, this message translates to:
  /// **'Take Picture'**
  String get takePicture;

  /// Button text to select from gallery
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get gallery;

  /// Message when no image is selected
  ///
  /// In en, this message translates to:
  /// **'No image selected'**
  String get noImageSelected;

  /// Loading model message
  ///
  /// In en, this message translates to:
  /// **'Loading model...'**
  String get loadingModel;

  /// Analysis in progress message
  ///
  /// In en, this message translates to:
  /// **'Analysis in progress...'**
  String get analysisInProgress;

  /// Plant identification in progress message
  ///
  /// In en, this message translates to:
  /// **'Identifying your plant'**
  String get identifyingPlant;

  /// Title for identification results
  ///
  /// In en, this message translates to:
  /// **'Identification Result'**
  String get identificationResult;

  /// Label for all predictions section
  ///
  /// In en, this message translates to:
  /// **'All predictions:'**
  String get allPredictions;

  /// Button text to add identified plant
  ///
  /// In en, this message translates to:
  /// **'Add This Plant'**
  String get addThisPlant;

  /// Confidence level display
  ///
  /// In en, this message translates to:
  /// **'{percentage}% confidence'**
  String confidenceLevel(int percentage);

  /// Warning for low confidence predictions
  ///
  /// In en, this message translates to:
  /// **'Low confidence prediction'**
  String get lowConfidencePrediction;

  /// Error message when model fails to load
  ///
  /// In en, this message translates to:
  /// **'Model loading error: {error}'**
  String modelLoadError(String error);

  /// Error message when image selection fails
  ///
  /// In en, this message translates to:
  /// **'Image selection error: {error}'**
  String imageSelectionError(String error);

  /// Error message when classification fails
  ///
  /// In en, this message translates to:
  /// **'Classification error: {error}'**
  String classificationError(String error);

  /// Tooltip for AI classifier button
  ///
  /// In en, this message translates to:
  /// **'AI Plant Classifier'**
  String get aiClassifierTooltip;

  /// Tooltip for add device button
  ///
  /// In en, this message translates to:
  /// **'Add Smart Device'**
  String get addDeviceTooltip;

  /// Orchid plant name
  ///
  /// In en, this message translates to:
  /// **'Orchid'**
  String get orchid;

  /// Ficus Lyrata plant name
  ///
  /// In en, this message translates to:
  /// **'Ficus Lyrata'**
  String get ficusLyrata;

  /// Lavender plant name
  ///
  /// In en, this message translates to:
  /// **'Lavender'**
  String get lavender;

  /// Monstera Deliciosa plant name
  ///
  /// In en, this message translates to:
  /// **'Monstera Deliciosa'**
  String get monsteraDeliciosa;

  /// Plant care scores section title
  ///
  /// In en, this message translates to:
  /// **'Plant Care Scores'**
  String get plantCareScores;

  /// Daily score label
  ///
  /// In en, this message translates to:
  /// **'Daily Score'**
  String get dailyScore;

  /// Daily score subtitle explaining what the score represents
  ///
  /// In en, this message translates to:
  /// **'Your plant care performance for today'**
  String get dailyScoreSubtitle;

  /// Weekly score label
  ///
  /// In en, this message translates to:
  /// **'Weekly Score'**
  String get weeklyScore;

  /// Current streak label
  ///
  /// In en, this message translates to:
  /// **'Current Streak'**
  String get currentStreak;

  /// Best streak label
  ///
  /// In en, this message translates to:
  /// **'Best Streak'**
  String get bestStreak;

  /// Average score label
  ///
  /// In en, this message translates to:
  /// **'Average Score'**
  String get averageScore;

  /// Total scores label
  ///
  /// In en, this message translates to:
  /// **'Total Scores'**
  String get totalScores;

  /// Score history section title
  ///
  /// In en, this message translates to:
  /// **'Score History'**
  String get scoreHistory;

  /// Message when no scores are available
  ///
  /// In en, this message translates to:
  /// **'No scores yet'**
  String get noScoresYet;

  /// Message to encourage starting score tracking
  ///
  /// In en, this message translates to:
  /// **'Start tracking your plant care!'**
  String get startTracking;

  /// Message for excellent plant care scores
  ///
  /// In en, this message translates to:
  /// **'Excellent! Your plant care is outstanding!'**
  String get excellentCare;

  /// Message for great plant care scores
  ///
  /// In en, this message translates to:
  /// **'Great job! Your plant is thriving!'**
  String get greatJob;

  /// Message for good plant care scores
  ///
  /// In en, this message translates to:
  /// **'Good work! Keep up the consistent care!'**
  String get goodWork;

  /// Message for average plant care scores
  ///
  /// In en, this message translates to:
  /// **'Not bad! A few adjustments could help.'**
  String get notBad;

  /// Message for below average plant care scores
  ///
  /// In en, this message translates to:
  /// **'Your plant needs more attention.'**
  String get needsAttention;

  /// Message for poor plant care scores
  ///
  /// In en, this message translates to:
  /// **'Your plant needs immediate care and attention.'**
  String get immediateCare;

  /// Message for significant improvement in care
  ///
  /// In en, this message translates to:
  /// **'Great improvement! Your care is getting better!'**
  String get greatImprovement;

  /// Message for slight improvement in care
  ///
  /// In en, this message translates to:
  /// **'Slight improvement - keep it up!'**
  String get slightImprovement;

  /// Message for significant decline in care
  ///
  /// In en, this message translates to:
  /// **'Care quality has declined - check your routine.'**
  String get careDeclined;

  /// Message for slight decline in care
  ///
  /// In en, this message translates to:
  /// **'Slight decline - review your care practices.'**
  String get slightDecline;

  /// Message for consistent care quality
  ///
  /// In en, this message translates to:
  /// **'Consistent care - maintain this steady approach!'**
  String get consistentCare;

  /// Message to encourage continued tracking
  ///
  /// In en, this message translates to:
  /// **'Keep tracking to see trends!'**
  String get keepTracking;

  /// Message when no data is available for selected period
  ///
  /// In en, this message translates to:
  /// **'No data in selected period'**
  String get noDataInPeriod;

  /// Message when trend data is not available
  ///
  /// In en, this message translates to:
  /// **'No trends available'**
  String get noTrendsAvailable;

  /// Button to calculate plant care score
  ///
  /// In en, this message translates to:
  /// **'Calculate Score'**
  String get calculateScore;

  /// Title for score calculation dialog
  ///
  /// In en, this message translates to:
  /// **'Score Calculation'**
  String get scoreCalculation;

  /// Moisture level label
  ///
  /// In en, this message translates to:
  /// **'Moisture Level'**
  String get moistureLevel;

  /// Temperature level label
  ///
  /// In en, this message translates to:
  /// **'Temperature Level'**
  String get temperatureLevel;

  /// pH level label
  ///
  /// In en, this message translates to:
  /// **'pH Level'**
  String get phLevel;

  /// Label for optional notes field
  ///
  /// In en, this message translates to:
  /// **'Add Notes (Optional)'**
  String get addNotes;

  /// Calculate button text
  ///
  /// In en, this message translates to:
  /// **'Calculate'**
  String get calculate;

  /// Success message when score is calculated
  ///
  /// In en, this message translates to:
  /// **'Score calculated successfully!'**
  String get scoreCalculated;

  /// Error message when score calculation fails
  ///
  /// In en, this message translates to:
  /// **'Error calculating score'**
  String get errorCalculatingScore;

  /// Encyclopedia page title
  ///
  /// In en, this message translates to:
  /// **'Encyclopedia'**
  String get encyclopedia;

  /// Search plants placeholder text
  ///
  /// In en, this message translates to:
  /// **'Search plants...'**
  String get searchPlants;

  /// Plants found count text
  ///
  /// In en, this message translates to:
  /// **'plants found'**
  String get plantsFound;

  /// Error loading plants message
  ///
  /// In en, this message translates to:
  /// **'Error loading plants'**
  String get errorLoadingPlants;

  /// No plants found message
  ///
  /// In en, this message translates to:
  /// **'No plants found'**
  String get noPlantsFound;

  /// No plants available message
  ///
  /// In en, this message translates to:
  /// **'No plants available'**
  String get noPlantsAvailable;

  /// Try different search suggestion
  ///
  /// In en, this message translates to:
  /// **'Try a different search'**
  String get tryDifferentSearch;

  /// Check back later suggestion
  ///
  /// In en, this message translates to:
  /// **'Check back later'**
  String get checkBackLater;

  /// No description provided for @bonusScore.
  ///
  /// In en, this message translates to:
  /// **'Bonus'**
  String get bonusScore;

  /// No description provided for @moisture.
  ///
  /// In en, this message translates to:
  /// **'Moisture'**
  String get moisture;

  /// No description provided for @light.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get light;

  /// No description provided for @ph.
  ///
  /// In en, this message translates to:
  /// **'pH'**
  String get ph;
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
