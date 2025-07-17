import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'dart:async';
import '../../models/plant_type.dart';
import '../../models/avatar.dart';
import '../../l10n/app_localizations.dart';
import '../../app_config.dart';

class PlantTypeDetailPage extends StatefulWidget {
  final PlantType plantType;

  const PlantTypeDetailPage({Key? key, required this.plantType}) : super(key: key);

  @override
  State<PlantTypeDetailPage> createState() => _PlantTypeDetailPageState();
}

class _PlantTypeDetailPageState extends State<PlantTypeDetailPage> {
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _startAutoScroll();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    if (_avatars.length > 1) {
      _autoScrollTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (mounted) {
          final nextIndex = (_currentImageIndex + 1) % _avatars.length;
          _pageController.animateToPage(
            nextIndex,
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOut,
          );
        }
      });
    }
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentImageIndex = index;
    });
    // Reset timer when user manually changes page
    _autoScrollTimer?.cancel();
    _startAutoScroll();
  }

  List<Avatar> get _avatars {
    return widget.plantType.avatars ?? [];
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        title: Text(
          widget.plantType.title ?? localizations.unknownName,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        backgroundColor: Colors.green[50],
        surfaceTintColor: Colors.green[50],
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.green[700]),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Carousel
            if (_avatars.isNotEmpty) _buildImageCarousel() else _buildPlaceholderImage(),
            
            // Plant Information
            _buildPlantInfo(localizations),
            
            // Stats Section
            _buildStatsSection(localizations),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildImageCarousel() {
    return Container(
      height: 300,
      child: Stack(
        children: [
          // PageView for images
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: _avatars.length,
            pageSnapping: true,
            physics: const BouncingScrollPhysics(),
            itemBuilder: (context, index) {
              final avatar = _avatars[index];
              final imageUrl = avatar.pathPicture != null
                  ? Uri.parse(AppConfig.baseUrlSrc).resolve(avatar.pathPicture!).toString()
                  : null;

              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: imageUrl != null
                      ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Shimmer.fromColors(
                              baseColor: Colors.grey.shade300,
                              highlightColor: Colors.grey.shade100,
                              child: Container(
                                width: double.infinity,
                                height: double.infinity,
                                color: Colors.white,
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) {
                            return _buildImagePlaceholder();
                          },
                        )
                      : _buildImagePlaceholder(),
                ),
              );
            },
          ),
          
          // Page indicator
          if (_avatars.length > 1)
            Positioned(
              bottom: 20,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_avatars.length, (index) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _currentImageIndex == index
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.5),
                    ),
                  );
                }),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      height: 300,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.green[100],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.green[300]!,
          width: 2,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.local_florist,
              size: 64,
              color: Colors.green[600],
            ),
            const SizedBox(height: 16),
            Text(
              'No images available',
              style: TextStyle(
                fontSize: 16,
                color: Colors.green[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green[100]!, Colors.green[200]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          Icons.local_florist,
          size: 48,
          color: Colors.green[600],
        ),
      ),
    );
  }

  Widget _buildPlantInfo(AppLocalizations localizations) {
    return Container(
      margin: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plant Name
          Text(
            widget.plantType.title ?? localizations.unknownName,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.grey[800],
            ),
          ),
          
          const SizedBox(height: 4),
          
          // Scientific Name
          if (widget.plantType.scientistName != null && widget.plantType.scientistName!.isNotEmpty)
            Text(
              widget.plantType.scientistName!,
              style: TextStyle(
                fontSize: 16,
                fontStyle: FontStyle.italic,
                color: Colors.green[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          
          const SizedBox(height: 8),
          
          // Family Name
          if (widget.plantType.familyName != null && widget.plantType.familyName!.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.green[200]!,
                  width: 1,
                ),
              ),
              child: Text(
                '${localizations.family}: ${widget.plantType.familyName}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.green[700],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          
          const SizedBox(height: 16),
          
          // Description
          if (widget.plantType.description != null && widget.plantType.description!.isNotEmpty)
            Container(
              width: double.infinity,
              child: Text(
                widget.plantType.description!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[700],
                  height: 1.5,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(AppLocalizations localizations) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[600],
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue[300]!.withValues(alpha: 0.4),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.analytics,
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
                        localizations.plantRequirements,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        localizations.optimalGrowingConditions,
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
          ),
          
          // Stats Grid
          _buildStatCard(
            localizations.soilMoisture,
            _formatRange(widget.plantType.humidityGroundSensorMin, widget.plantType.humidityGroundSensorMax, '%'),
            Icons.water_drop,
            Colors.blue[600]!,
            localizations.optimalSoilMoistureRange,
          ),
          
          _buildStatCard(
            localizations.temperature,
            _formatRange(widget.plantType.temperatureSensorExternMin, widget.plantType.temperatureSensorExternMax, '°C'),
            Icons.thermostat,
            Colors.orange[600]!,
            localizations.optimalTemperatureRange,
          ),
          
          _buildStatCard(
            localizations.lightLevel,
            _formatRange(widget.plantType.lightSensorMin, widget.plantType.lightSensorMax, ' lux'),
            Icons.wb_sunny,
            Colors.yellow[700]!,
            localizations.optimalLightRange,
          ),
          
          _buildStatCard(
            localizations.soilPH,
            _formatRange(widget.plantType.phMin, widget.plantType.phMax, ''),
            Icons.science,
            Colors.purple[600]!,
            localizations.optimalSoilPHRange,
          ),
          
          _buildStatCard(
            localizations.conductivity,
            _formatRange(widget.plantType.conductivityElectriqueFertilityMin, widget.plantType.conductivityElectriqueFertilityMax, ' µS/cm'),
            Icons.electric_bolt,
            Colors.green[600]!,
            localizations.optimalSoilConductivityRange,
          ),
          
          _buildStatCard(
            localizations.airHumidity,
            _formatRange(widget.plantType.humidityAirSensorMin, widget.plantType.humidityAirSensorMax, '%'),
            Icons.air,
            Colors.cyan[600]!,
            localizations.optimalAirHumidityRange,
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, String description) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 24,
                color: color,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatRange(double? min, double? max, String unit) {
    if (min == null && max == null) {
      return 'N/A';
    }
    if (min == null) {
      return 'Max: ${max?.toStringAsFixed(1) ?? 'N/A'}$unit';
    }
    if (max == null) {
      return 'Min: ${min.toStringAsFixed(1)}$unit';
    }
    return '${min.toStringAsFixed(1)}$unit - ${max.toStringAsFixed(1)}$unit';
  }
} 