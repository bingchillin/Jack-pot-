import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import 'package:jackpote/ui/pages/widget/plant_card_my_list/plant_item_my_list_widget.dart';
import 'package:jackpote/ui/pages/widget/plant_card_favorite/plant_item_widget.dart';
import '../../bloc/object_profile/object_profile_bloc.dart';
import '../../bloc/object_profile/object_profile_event.dart';
import '../../bloc/object_profile_my_list/object_profile_my_list_bloc.dart';
import '../../bloc/object_profile_my_list/object_profile_my_list_event.dart';
import '../../models/object_profile.dart';
import '../../l10n/app_localizations.dart';
import '../../services/object_profile_service.dart';

class MyPlantPage extends StatefulWidget {
  const MyPlantPage({Key? key}) : super(key: key);

  @override
  State<MyPlantPage> createState() => _MyPlantPageState();
}

class _MyPlantPageState extends State<MyPlantPage> with TickerProviderStateMixin, WidgetsBindingObserver {
  late ObjectProfileBloc favoriteBloc;
  late ObjectProfileMyListBloc myListBloc;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    favoriteBloc = context.read<ObjectProfileBloc>();
    myListBloc = context.read<ObjectProfileMyListBloc>();

    // Add observer to detect when app comes back to foreground
    WidgetsBinding.instance.addObserver(this);

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut)
    );

    // Load initial data
    favoriteBloc.add(LoadProfiles());
    myListBloc.add(LoadProfilesMyList());
    
    _animationController.forward();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      print('🔄 App resumed, refreshing plant data');
      // Clear cache and refresh data when returning to app
      ObjectProfileService.clearCache();
      favoriteBloc.add(LoadProfiles());
      myListBloc.add(LoadProfilesMyList());
    }
  }

  Future<void> _refreshFavorite() async {
    ObjectProfileService.clearCache();
    favoriteBloc.add(LoadProfiles());
    await favoriteBloc.profilesStream.firstWhere((_) => true);
  }

  Future<void> _refreshMyList() async {
    ObjectProfileService.clearCache();
    myListBloc.add(LoadProfilesMyList());
    await myListBloc.profilesStream.firstWhere((_) => true);
  }

  Widget _buildShimmerCard({double width = 280, double height = 320}) {
    return Container(
      width: width,
      height: height,
      margin: const EdgeInsets.only(right: 16),
      child: Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerListItem({double height = 100}) {
    return Container(
      height: height,
      margin: const EdgeInsets.only(bottom: 16),
      child: Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
        ),
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

  Widget _buildEmptyState(String title, String subtitle, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(48),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: Colors.green[200]!,
                width: 2,
              ),
            ),
            child: Icon(
              icon,
              size: 48,
              color: Colors.green[600],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[800],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
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
            child: RefreshIndicator(
              onRefresh: () async {
                await Future.wait([_refreshFavorite(), _refreshMyList()]);
              },
              color: Colors.green[600],
              backgroundColor: Colors.white,
              child: CustomScrollView(
                slivers: [
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
                      child: StreamBuilder<List<ObjectProfile>>(
                        stream: favoriteBloc.profilesStream,
                        builder: (context, snapshot) {
                          if (!snapshot.hasData) {
                            return ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              itemCount: 3,
                              itemBuilder: (context, index) => _buildShimmerCard(),
                            );
                          }

                          final plants = snapshot.data!;
                          if (plants.isEmpty) {
                            return _buildEmptyState(
                              localizations.noFavoritePlants,
                              localizations.addFavoritePlantsDescription,
                              Icons.favorite_border,
                            );
                          }

                          return ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            itemCount: plants.length,
                            itemBuilder: (context, index) {
                              return Container(
                                width: 280,
                                margin: const EdgeInsets.only(right: 16),
                                child: PlantItemWidget(plant: plants[index]),
                              );
                            },
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

                  StreamBuilder<List<ObjectProfile>>(
                    stream: myListBloc.profilesStream,
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              child: _buildShimmerListItem(),
                            ),
                            childCount: 4,
                          ),
                        );
                      }

                      final plants = snapshot.data!;
                      if (plants.isEmpty) {
                        return SliverToBoxAdapter(
                          child: _buildEmptyState(
                            localizations.noMyPlants,
                            localizations.addMyPlantsDescription,
                            Icons.add_circle_outline,
                          ),
                        );
                      }

                      return SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) => Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: PlantItemMyListWidget(plant: plants[index]),
                          ),
                          childCount: plants.length,
                        ),
                      );
                    },
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: Container(
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
          onPressed: () {
            Navigator.pushNamed(context, '/add_my_object');
          },
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: const Icon(
            Icons.add,
            size: 36,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
