import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../models/plant_type.dart';
import '../../services/plant_type_service.dart';
import '../../l10n/app_localizations.dart';
import '../../app_config.dart';
import '../../models/avatar.dart';

class EncyclopediaPage extends StatefulWidget {
  const EncyclopediaPage({Key? key}) : super(key: key);

  @override
  State<EncyclopediaPage> createState() => _EncyclopediaPageState();
}

class _EncyclopediaPageState extends State<EncyclopediaPage> {
  final PlantTypeService _plantTypeService = PlantTypeService();
  final TextEditingController _searchController = TextEditingController();
  
  List<PlantType> _plantTypes = [];
  List<PlantType> _filteredPlantTypes = [];
  bool _isLoading = true;
  bool _isSearching = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPlantTypes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadPlantTypes() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final plantTypes = await _plantTypeService.getAllPlantTypes();
      
      setState(() {
        _plantTypes = plantTypes;
        _filteredPlantTypes = plantTypes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _filterPlantTypes(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredPlantTypes = _plantTypes;
      } else {
        _filteredPlantTypes = _plantTypes.where((plant) {
          final title = plant.title?.toLowerCase() ?? '';
          final familyName = plant.familyName?.toLowerCase() ?? '';
          final description = plant.description?.toLowerCase() ?? '';
          final searchQuery = query.toLowerCase();
          
          return title.contains(searchQuery) ||
                 familyName.contains(searchQuery) ||
                 description.contains(searchQuery);
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: Colors.green[50],
      appBar: AppBar(
        title: Text(
          localizations.encyclopedia,
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
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _filterPlantTypes,
              decoration: InputDecoration(
              hintText: localizations.searchPlants,
                prefixIcon: Icon(Icons.search, color: Colors.green[600]),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, color: Colors.green[600]),
                        onPressed: () {
                          _searchController.clear();
                          _filterPlantTypes('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          
          // Results count
          if (!_isLoading && _error == null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    '${_filteredPlantTypes.length} ${localizations.plantsFound ?? 'plantes trouvées'}',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          
          const SizedBox(height: 8),
          
          // Plant Types List
          Expanded(
            child: _buildPlantTypesList(localizations),
          ),
        ],
      ),
    );
  }

  Widget _buildPlantTypesList(AppLocalizations localizations) {
    if (_isLoading) {
      return _buildLoadingList();
    }

    if (_error != null) {
      return _buildErrorState(localizations);
    }

    if (_filteredPlantTypes.isEmpty) {
      return _buildEmptyState(localizations);
    }

    return RefreshIndicator(
      onRefresh: _loadPlantTypes,
      color: Colors.green[600],
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filteredPlantTypes.length,
        itemBuilder: (context, index) {
          final plantType = _filteredPlantTypes[index];
          return _buildPlantTypeCard(plantType, localizations);
        },
      ),
    );
  }

  Widget _buildPlantTypeCard(PlantType plantType, AppLocalizations localizations) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            // TODO: Navigate to plant type detail page
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${plantType.title} - Détails à venir'),
                backgroundColor: Colors.green[600],
              ),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Plant Avatar
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.green[100],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.green[300]!,
                      width: 2,
                    ),
                  ),
                  child: _buildPlantAvatar(plantType),
                ),
                
                const SizedBox(width: 16),
                
                // Plant Information
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        plantType.title ?? localizations.unknownName ?? 'Nom inconnu',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      
                      const SizedBox(height: 4),
                      
                      // Family Name
                      if (plantType.familyName != null && plantType.familyName!.isNotEmpty)
                        Text(
                          plantType.familyName!,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.green[700],
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      
                      const SizedBox(height: 8),
                      
                      // Description
                      if (plantType.description != null && plantType.description!.isNotEmpty)
                        Text(
                          plantType.description!,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                
                // Arrow indicator
                Icon(
                  Icons.chevron_right,
                  color: Colors.grey[400],
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Row(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 20,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 16,
                        width: 120,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 16,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(AppLocalizations localizations) {
    return Center(
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
            localizations.errorLoadingPlants ?? 'Erreur de chargement',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _error ?? 'Une erreur est survenue',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadPlantTypes,
            icon: const Icon(Icons.refresh),
            label: Text(localizations.retry ?? 'Réessayer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(AppLocalizations localizations) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _searchController.text.isNotEmpty
                ? localizations.noPlantsFound ?? 'Aucune plante trouvée'
                : localizations.noPlantsAvailable ?? 'Aucune plante disponible',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isNotEmpty
                ? localizations.tryDifferentSearch ?? 'Essayez une autre recherche'
                : localizations.checkBackLater ?? 'Revenez plus tard',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildPlantAvatar(PlantType plantType) {
    final avatars = plantType.avatars;
    Avatar? avatar;
    if (avatars == null || avatars.isEmpty) {
      avatar = null;
    } else {
      // Prefer stateP == 0 (default), then typeP == 1 (real photo), then any
      avatar = avatars.firstWhere(
        (a) => a.stateP == 0,
        orElse: () => avatars.firstWhere(
          (a) => a.typeP == 1,
          orElse: () => avatars.first,
        ),
      );
    }
    final pathPicture = avatar?.pathPicture?.toString();
    String? imageUrl;
    if (pathPicture != null && pathPicture.isNotEmpty) {
      imageUrl = Uri.parse(AppConfig.baseUrlSrc).resolve(pathPicture).toString();
    }
    if (imageUrl != null && imageUrl.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(
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
            return Container(
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.local_florist,
                size: 40,
                color: Colors.green[600],
              ),
            );
          },
        ),
      );
    } else {
      return Container(
        decoration: BoxDecoration(
          color: Colors.green[100],
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          Icons.local_florist,
          size: 40,
          color: Colors.green[600],
        ),
      );
    }
  }
} 