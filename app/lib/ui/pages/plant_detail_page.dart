import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import '../../bloc/plant_detail/plant_detail_bloc.dart';
import '../../bloc/plant_detail/plant_detail_state.dart';
import '../../bloc/plant_detail/plant_detail_event.dart';
import '../../services/object_profile_service.dart';
import '../../providers/auth_provider.dart';
import '../../models/object_profile.dart';
import '../../l10n/app_localizations.dart';
import 'plant_detail/plant_overview_tab.dart';
import 'plant_detail/plant_sensors_tab.dart';
import 'plant_detail/plant_care_tab.dart';

class PlantDetailPage extends StatefulWidget {
  final int plantId;

  const PlantDetailPage({Key? key, required this.plantId}) : super(key: key);

  @override
  State<PlantDetailPage> createState() => _PlantDetailPageState();
}

class _PlantDetailPageState extends State<PlantDetailPage> {
  int _currentTabIndex = 0;

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final token = context.read<AuthProvider>().accessToken;
    
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

