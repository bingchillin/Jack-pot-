import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../bloc/plant_detail/plant_detail_bloc.dart';
import '../../bloc/plant_detail/plant_detail_state.dart';
import '../../bloc/plant_detail/plant_detail_event.dart';
import '../../services/object_profile_service.dart';
import '../../providers/auth_provider.dart';
import '../../models/object_profile.dart';
import '../../models/object_model.dart';
import '../../models/plant_type.dart';
import '../../l10n/app_localizations.dart';
import 'plant_detail/plant_overview_tab.dart';
import 'plant_detail/plant_sensors_tab.dart';
import 'plant_detail/plant_care_tab.dart';
import 'widget/favorite_toggle_button.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PlantDetailPage extends StatefulWidget {
  final int plantId;

  const PlantDetailPage({Key? key, required this.plantId}) : super(key: key);

  @override
  State<PlantDetailPage> createState() => _PlantDetailPageState();
}

class _PlantDetailPageState extends State<PlantDetailPage> {
  int _currentTabIndex = 0;

  // Sample plant data for guest users (same as in my_plant_page_login.dart)
  List<ObjectProfile> get _samplePlants => [
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

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final token = authProvider.accessToken;
    
    // Check if user is in guest mode
    if (!authProvider.isAuthenticated) {
      // Find sample plant by ID
      final samplePlant = _samplePlants.firstWhere(
        (plant) => plant.idObjectProfile == widget.plantId,
        orElse: () => _samplePlants.first, // Fallback to first plant
      );
      return _buildPlantDetailWithBanner(context, localizations, samplePlant);
    }
    
    if (token == null) {
      return _buildErrorState(localizations, context, localizations.tokenMissing);
    }
    
    return BlocProvider(
      create: (context) => PlantDetailBloc(
        service: ObjectProfileService(),
        plantId: widget.plantId,
        token: token,
      ),
      child: BlocBuilder<PlantDetailBloc, PlantDetailState>(
        builder: (context, state) {
          if (state is PlantDetailLoading) {
            return _buildLoadingState(localizations, context);
          } else if (state is PlantDetailError) {
            return _buildErrorState(localizations, context, state.message);
          } else if (state is PlantDetailLoaded) {
            final plant = state.plant;
            return _buildPlantDetail(context, localizations, plant);
          }
          return _buildLoadingState(localizations, context);
        },
      ),
    );
  }

  Widget _buildPlantDetail(BuildContext context, AppLocalizations localizations, ObjectProfile plant) {
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        toolbarHeight: 80,
        leading: Padding(
          padding: const EdgeInsets.all(12.0),
          child: InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 48,
              height: 48,
              alignment: Alignment.center,
              child: Icon(
                Icons.arrow_back,
                color: Colors.green[700],
                size: 24,
              ),
            ),
          ),
        ),
        title: Text(
          plant.title ?? localizations.unknownName,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        centerTitle: true,
        actions: [
          // Add favorite toggle button to the AppBar
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: FavoriteToggleButton(
              plantId: plant.idObjectProfile,
              currentFavorisValue: plant.favoris,
              onFavoriteChanged: (isFavorite) async {
                // Get token from shared preferences to refresh plant detail
                final prefs = await SharedPreferences.getInstance();
                final token = prefs.getString('access_token');
                if (token != null && mounted) {
                  context.read<PlantDetailBloc>().add(LoadPlantDetail(widget.plantId, token));
                }
              },
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTabButton(0, localizations.plantOverview, Icons.dashboard),
                const SizedBox(width: 8),
                _buildTabButton(1, localizations.sensorData, Icons.sensors),
                const SizedBox(width: 8),
                _buildTabButton(2, localizations.plantCareAdvice, Icons.lightbulb_outline),
              ],
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        color: Colors.green[600],
        onRefresh: () async {
          // Clear cache and reload
          ObjectProfileService.clearCache();
          context.read<PlantDetailBloc>().add(LoadPlantDetail(widget.plantId, context.read<AuthProvider>().accessToken!));
          
          // Wait for the new data to load
          await context.read<PlantDetailBloc>().stream.firstWhere((state) => state is PlantDetailLoaded || state is PlantDetailError);
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          child: _buildTabContent(context, localizations, plant),
        ),
      ),
    );
  }

  Widget _buildPlantDetailWithBanner(BuildContext context, AppLocalizations localizations, ObjectProfile plant) {
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        toolbarHeight: 80,
        leading: Padding(
          padding: const EdgeInsets.all(12.0),
          child: InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 48,
              height: 48,
              alignment: Alignment.center,
              child: Icon(
                Icons.arrow_back,
                color: Colors.green[700],
                size: 24,
              ),
            ),
          ),
        ),
        title: Text(
          plant.title ?? localizations.unknownName,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTabButton(0, localizations.plantOverview, Icons.dashboard),
                const SizedBox(width: 8),
                _buildTabButton(1, localizations.sensorData, Icons.sensors),
                const SizedBox(width: 8),
                _buildTabButton(2, localizations.plantCareAdvice, Icons.lightbulb_outline),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Demo Banner
            Container(
              margin: const EdgeInsets.all(16),
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
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          localizations.demoPlant,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue[800],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          localizations.demoPlantMessage,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue[700],
                            height: 1.2,
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
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      localizations.signUp,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            
            // Tab Content
            Container(
              padding: const EdgeInsets.all(16),
              child: _buildTabContent(context, localizations, plant),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(int index, String label, IconData icon) {
    final isSelected = _currentTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.green[600] : Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected ? Colors.white : Colors.green[600],
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : Colors.green[600],
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent(BuildContext context, AppLocalizations localizations, ObjectProfile plant) {
    switch (_currentTabIndex) {
      case 0:
        return PlantOverviewTab(plant: plant);
      case 1:
        return PlantSensorsTab(plant: plant);
      case 2:
        return PlantCareTab(plant: plant);
      default:
        return PlantOverviewTab(plant: plant);
    }
  }

  Widget _buildLoadingState(AppLocalizations localizations, BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        toolbarHeight: 80,
        leading: Padding(
          padding: const EdgeInsets.all(12.0),
          child: InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 48,
              height: 48,
              alignment: Alignment.center,
              child: Icon(
                Icons.arrow_back,
                color: Colors.green[700],
                size: 24,
              ),
            ),
          ),
        ),
        title: Text(
          localizations.plantDetail,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTabButton(0, localizations.plantOverview, Icons.dashboard),
                const SizedBox(width: 8),
                _buildTabButton(1, localizations.sensorData, Icons.sensors),
                const SizedBox(width: 8),
                _buildTabButton(2, localizations.plantCareAdvice, Icons.lightbulb_outline),
              ],
            ),
          ),
        ),
      ),
      body: Container(
        padding: const EdgeInsets.all(16),
        child: _buildShimmerForTab(_currentTabIndex),
      ),
    );
  }

  Widget _buildErrorState(AppLocalizations localizations, BuildContext context, String message) {
  return Scaffold(
    backgroundColor: Colors.green[50],
    appBar: AppBar(
      backgroundColor: Colors.green[50],
      surfaceTintColor: Colors.green[50],
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      toolbarHeight: 80,
      leading: Padding(
        padding: const EdgeInsets.all(12.0),
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () => Navigator.pop(context),
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              Icons.arrow_back,
              color: Colors.green[700],
              size: 24,
            ),
          ),
        ),
      ),
      title: Text(
        localizations.error,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.grey[800],
        ),
      ),
      centerTitle: true,
    ),
    body: Container(
      padding: const EdgeInsets.all(16),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[400],
            ),
            const SizedBox(height: 16),
            Text(
              localizations.error,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[600],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(localizations.tryAgain),
            ),
          ],
        ),
      ),
    ),
  );
}

Widget _buildShimmerForTab(int index) {
  switch (index) {
    case 0:
      return _buildOverviewShimmer();
    case 1:
      return _buildSensorsShimmer();
    case 2:
      return _buildCareShimmer();
    default:
      return _buildOverviewShimmer();
  }
}

Widget _buildOverviewShimmer() {
  return SingleChildScrollView(
    padding: const EdgeInsets.all(24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header shimmer
        Row(
          children: [
            Shimmer.fromColors(
              baseColor: Colors.grey[300]!,
              highlightColor: Colors.grey[100]!,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Shimmer.fromColors(
              baseColor: Colors.grey[300]!,
              highlightColor: Colors.grey[100]!,
              child: Container(
                width: 120,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Image card shimmer
        Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            height: 280,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Health section header shimmer
        Row(
          children: [
            Shimmer.fromColors(
              baseColor: Colors.grey[300]!,
              highlightColor: Colors.grey[100]!,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Shimmer.fromColors(
              baseColor: Colors.grey[300]!,
              highlightColor: Colors.grey[100]!,
              child: Container(
                width: 100,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Health card shimmer
        Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            height: 180,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
      ],
    ),
  );
}

Widget _buildSensorsShimmer() {
  return SingleChildScrollView(
    padding: const EdgeInsets.all(24),
    child: Column(
      children: [
        for (int i = 0; i < 4; i++) ...[
          // Section shimmer
          Row(
            children: [
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 140,
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Grid of sensor cards
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
            ),
            itemCount: 4,
            itemBuilder: (context, index) {
              return Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ],
    ),
  );
}

Widget _buildCareShimmer() {
  return SingleChildScrollView(
    padding: const EdgeInsets.all(24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (int i = 0; i < 3; i++) ...[
          // Section header shimmer
          Row(
            children: [
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 120,
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Content card shimmer
          Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Container(
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ],
    ),
  );
}
}

