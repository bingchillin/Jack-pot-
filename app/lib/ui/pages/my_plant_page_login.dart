import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import 'package:jackpote/ui/pages/widget/plant_card_my_list/plant_item_my_list_widget.dart';
import 'package:jackpote/ui/pages/widget/plant_card_favorite/plant_item_widget.dart';
import '../../providers/auth_provider.dart';
import '../../models/object_profile.dart';
import '../../models/object_model.dart';
import '../../models/plant_type.dart';
import '../../l10n/app_localizations.dart';

class MyPlantPageLogin extends StatefulWidget {
  const MyPlantPageLogin({super.key});

  @override
  State<MyPlantPageLogin> createState() => _MyPlantPageLoginState();
}

class _MyPlantPageLoginState extends State<MyPlantPageLogin> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  // Sample plant data with proper ObjectProfile structure
  late List<ObjectProfile> _sampleFavorites;
  late List<ObjectProfile> _sampleMyList;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut)
    );

    // Initialize sample data
    _initializeSampleData();
    
    _animationController.forward();
    
    // Enable guest mode
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).enableGuestMode();
    });
  }

  void _initializeSampleData() {
    _sampleFavorites = [
      ObjectProfile(
        idObjectProfile: 1,
        title: "Monstera Deliciosa",
        description: "Beautiful Swiss cheese plant with stunning fenestrations",
        advise: "Keep in bright, indirect light. Water when top inch of soil is dry.",
        recipe: "Balanced liquid fertilizer monthly during growing season",
        state: 1,
        isAutomatic: true,
        isWillWatering: false,
        object: ObjectModel(idObject: 1, title: "Living Room Sensor"),
        plantType: PlantType(
          idPlantType: 1,
          title: "Monstera Deliciosa",
          description: "Popular houseplant known for its split leaves",
          scientistName: "Monstera deliciosa",
          familyName: "Araceae",
          typeName: "Tropical",
          expositionType: "Bright indirect light",
          groundType: "Well-draining potting mix",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 65.0,
        humidityGroundSensor: 45.0,
        phGroundSensor: 6.2,
        conductivityElectriqueFertilitySensor: 800.0,
        lightSensor: 25000.0,
        temperatureSensorGround: 22.0,
        temperatureSensorExtern: 23.0,
        expositionTimeSun: 6.0,
      ),
      ObjectProfile(
        idObjectProfile: 2,
        title: "Snake Plant",
        description: "Low-maintenance succulent perfect for beginners",
        advise: "Very drought tolerant. Water sparingly, allow soil to dry completely.",
        recipe: "Minimal fertilizer needed, once in spring",
        state: 0,
        isAutomatic: false,
        isWillWatering: true,
        object: ObjectModel(idObject: 2, title: "Bedroom Sensor"),
        plantType: PlantType(
          idPlantType: 2,
          title: "Snake Plant",
          description: "Resilient plant that thrives in low light",
          scientistName: "Sansevieria trifasciata",
          familyName: "Asparagaceae",
          typeName: "Succulent",
          expositionType: "Low to bright light",
          groundType: "Cactus/succulent mix",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 45.0,
        humidityGroundSensor: 20.0,
        phGroundSensor: 6.8,
        conductivityElectriqueFertilitySensor: 400.0,
        lightSensor: 15000.0,
        temperatureSensorGround: 20.0,
        temperatureSensorExtern: 21.0,
        expositionTimeSun: 4.0,
      ),
      ObjectProfile(
        idObjectProfile: 3,
        title: "Fiddle Leaf Fig",
        description: "Stunning architectural plant with large glossy leaves",
        advise: "Needs consistent bright light and careful watering schedule.",
        recipe: "Diluted liquid fertilizer every 2 weeks in growing season",
        state: 3,
        isAutomatic: true,
        isWillWatering: false,
        object: ObjectModel(idObject: 3, title: "Office Sensor"),
        plantType: PlantType(
          idPlantType: 3,
          title: "Fiddle Leaf Fig",
          description: "Popular statement plant with large fiddle-shaped leaves",
          scientistName: "Ficus lyrata",
          familyName: "Moraceae",
          typeName: "Tropical",
          expositionType: "Bright indirect light",
          groundType: "Well-draining potting soil",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 55.0,
        humidityGroundSensor: 40.0,
        phGroundSensor: 6.5,
        conductivityElectriqueFertilitySensor: 600.0,
        lightSensor: 30000.0,
        temperatureSensorGround: 21.0,
        temperatureSensorExtern: 22.0,
        expositionTimeSun: 7.0,
      ),
    ];

    _sampleMyList = [
      ObjectProfile(
        idObjectProfile: 4,
        title: "Golden Pothos",
        description: "Trailing vine perfect for hanging baskets",
        advise: "Very adaptable. Water when soil feels dry to touch.",
        recipe: "Monthly liquid fertilizer during growing season",
        state: 1,
        isAutomatic: false,
        isWillWatering: true,
        object: ObjectModel(idObject: 4, title: "Kitchen Sensor"),
        plantType: PlantType(
          idPlantType: 4,
          title: "Golden Pothos",
          description: "Easy-care trailing plant that purifies air",
          scientistName: "Epipremnum aureum",
          familyName: "Araceae",
          typeName: "Tropical",
          expositionType: "Medium to bright indirect light",
          groundType: "Regular potting soil",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 60.0,
        humidityGroundSensor: 50.0,
        phGroundSensor: 6.0,
        conductivityElectriqueFertilitySensor: 700.0,
        lightSensor: 20000.0,
        temperatureSensorGround: 23.0,
        temperatureSensorExtern: 24.0,
        expositionTimeSun: 5.0,
      ),
      ObjectProfile(
        idObjectProfile: 5,
        title: "Peace Lily",
        description: "Elegant plant with white blooms and air-purifying qualities",
        advise: "Prefers consistently moist soil and low to medium light.",
        recipe: "Balanced fertilizer every 6 weeks during growing season",
        state: 2,
        isAutomatic: true,
        isWillWatering: false,
        object: ObjectModel(idObject: 5, title: "Bathroom Sensor"),
        plantType: PlantType(
          idPlantType: 5,
          title: "Peace Lily",
          description: "Beautiful flowering houseplant that blooms indoors",
          scientistName: "Spathiphyllum wallisii",
          familyName: "Araceae",
          typeName: "Tropical",
          expositionType: "Low to medium light",
          groundType: "Peat-based potting mix",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 70.0,
        humidityGroundSensor: 60.0,
        phGroundSensor: 5.8,
        conductivityElectriqueFertilitySensor: 500.0,
        lightSensor: 18000.0,
        temperatureSensorGround: 22.0,
        temperatureSensorExtern: 23.0,
        expositionTimeSun: 3.0,
      ),
      ObjectProfile(
        idObjectProfile: 6,
        title: "Rubber Plant",
        description: "Glossy-leaved plant that makes a perfect floor plant",
        advise: "Allow soil to dry between waterings. Wipe leaves regularly.",
        recipe: "Monthly fertilizer during spring and summer",
        state: 0,
        isAutomatic: false,
        isWillWatering: true,
        object: ObjectModel(idObject: 6, title: "Balcony Sensor"),
        plantType: PlantType(
          idPlantType: 6,
          title: "Rubber Plant",
          description: "Sturdy plant with thick, glossy leaves",
          scientistName: "Ficus elastica",
          familyName: "Moraceae",
          typeName: "Tropical",
          expositionType: "Bright indirect light",
          groundType: "Well-draining potting soil",
          pathPicture: null,
          avatars: [],
        ),
        humidityAirSensor: 50.0,
        humidityGroundSensor: 35.0,
        phGroundSensor: 6.3,
        conductivityElectriqueFertilitySensor: 750.0,
        lightSensor: 28000.0,
        temperatureSensorGround: 21.0,
        temperatureSensorExtern: 22.0,
        expositionTimeSun: 6.0,
      ),
    ];
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Widget _buildDemoSection(AppLocalizations localizations) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.blue[200]!,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.visibility,
            color: Colors.blue[600],
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localizations.demoMode,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.blue[800],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  localizations.demoBannerMessage,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.blue[700],
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/signup'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              localizations.signUp,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green[600],
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.green[300]!.withValues(alpha: 0.4),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAddPlantDialog() {
    final localizations = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.lock_outline, color: Colors.orange[600]),
            const SizedBox(width: 8),
            Text(localizations.signUpRequired),
          ],
        ),
        content: Text(
          localizations.addPlantsMessage,
          style: TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(localizations.cancel, style: TextStyle(color: Colors.grey[600])),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/signup');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green[600],
              foregroundColor: Colors.white,
            ),
            child: Text(localizations.signUp),
          ),
        ],
      ),
    );
  }

  Widget _buildEncyclopediaCard(AppLocalizations localizations) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(
          color: Colors.orange[300]!.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.pushNamed(context, '/encyclopedia');
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                // Encyclopedia Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.orange[600]!, Colors.orange[700]!],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.orange[300]!.withValues(alpha: 0.6),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.book,
                    size: 40,
                    color: Colors.white,
                  ),
                ),
                
                const SizedBox(width: 20),
                
                // Text Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localizations.encyclopedia,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Découvrez toutes les plantes disponibles',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(
                            Icons.search,
                            size: 16,
                            color: Colors.orange[600],
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Rechercher et explorer',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.orange[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Arrow
                Icon(
                  Icons.chevron_right,
                  color: Colors.orange[600],
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.green[50]!,
              Colors.green[100]!.withValues(alpha: 0.3),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: CustomScrollView(
              slivers: [
                // Demo Banner
                SliverToBoxAdapter(
                  child: _buildDemoSection(localizations),
                ),

                // Favorites Section
                SliverToBoxAdapter(
                  child: _buildSectionHeader(
                    localizations.favorites,
                    localizations.favoritePlantsSubtitle,
                    Icons.favorite,
                  ),
                ),

                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 350,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: _sampleFavorites.length,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 280,
                          margin: const EdgeInsets.only(right: 16),
                          child: PlantItemWidget(plant: _sampleFavorites[index]),
                        );
                      },
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 32)),

                // My List Section
                SliverToBoxAdapter(
                  child: _buildSectionHeader(
                    localizations.myList,
                    localizations.myPlantsSubtitle,
                    Icons.list_alt,
                  ),
                ),

                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: PlantItemMyListWidget(plant: _sampleMyList[index]),
                    ),
                    childCount: _sampleMyList.length,
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 32)),

                // Encyclopedia Section
                SliverToBoxAdapter(
                  child: _buildSectionHeader(
                    localizations.encyclopedia,
                    localizations.encyclopedia,
                    Icons.book,
                  ),
                ),

                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    child: _buildEncyclopediaCard(localizations),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: _buildFloatingActionButtons(context, localizations),
    );
  }

  Widget _buildFloatingActionButtons(BuildContext context, AppLocalizations localizations) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // AI Classification Button - Available for guest users
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.purple[600]!, Colors.purple[700]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.purple[300]!.withValues(alpha: 0.6),
                blurRadius: 15,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: FloatingActionButton(
            onPressed: () {
              Navigator.pushNamed(context, '/plant_classifier');
            },
            backgroundColor: Colors.transparent,
            elevation: 0,
            heroTag: "ai_classifier",
            child: const Icon(
              Icons.smart_toy,
              size: 28,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Main Add Button - Shows dialog for guest users
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.green[600]!, Colors.green[700]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(36),
            boxShadow: [
              BoxShadow(
                color: Colors.green[300]!.withValues(alpha: 0.6),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: FloatingActionButton(
            onPressed: _showAddPlantDialog,
            backgroundColor: Colors.transparent,
            elevation: 0,
            heroTag: "add_device",
            child: const Icon(
              Icons.add,
              size: 36,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}