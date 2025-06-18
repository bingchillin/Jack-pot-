import 'package:app/ui/pages/widget/plant_card_my_list/plant_item_my_list_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/object_profile/object_profile_bloc.dart';
import '../../bloc/object_profile/object_profile_event.dart';
import '../../bloc/object_profile_my_list/object_profile_my_list_bloc.dart';
import '../../bloc/object_profile_my_list/object_profile_my_list_event.dart';
import '../../models/object_profile.dart';
import 'widget/plant_card_favorite/plant_item_widget.dart';

class MyPlantPage extends StatefulWidget {
  const MyPlantPage({Key? key}) : super(key: key);

  @override
  State<MyPlantPage> createState() => _MyPlantPageState();
}

class _MyPlantPageState extends State<MyPlantPage> {
  late ObjectProfileBloc favoriteBloc;
  late ObjectProfileMyListBloc myListBloc;

  @override
  void initState() {
    super.initState();
    favoriteBloc = context.read<ObjectProfileBloc>();
    myListBloc = context.read<ObjectProfileMyListBloc>();
  }

  Future<void> _refreshFavorite() async {
    favoriteBloc.add(LoadProfiles());
    await favoriteBloc.profilesStream.firstWhere((_) => true);
  }

  Future<void> _refreshMyList() async {
    myListBloc.add(LoadProfilesMyList());
    await myListBloc.profilesStream.firstWhere((_) => true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([_refreshFavorite(), _refreshMyList()]);
          },
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Favoris
                const Text(
                  'Mes favoris',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                SizedBox(
                  height: 450,
                  child: StreamBuilder<List<ObjectProfile>>(
                    stream: favoriteBloc.profilesStream,
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      final plants = snapshot.data!;
                      if (plants.isEmpty) {
                        return const Center(child: Text("Aucune plante trouvée."));
                      }
                      return ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: plants.length,
                        itemBuilder: (context, index) {
                          return ConstrainedBox(
                            constraints: const BoxConstraints(
                              minWidth: 280,
                              maxWidth: 280,
                              minHeight: 400,
                            ),
                            child: PlantItemWidget(plant: plants[index]),
                          );
                        },
                      );
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Ma Liste
                const Text(
                  'Ma Liste',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                StreamBuilder<List<ObjectProfile>>(
                  stream: myListBloc.profilesStream,
                  builder: (context, snapshot) {
                    if (!snapshot.hasData) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    final plants = snapshot.data!;
                    if (plants.isEmpty) {
                      return const Center(child: Text("Aucune plante trouvée."));
                    }
                    return ListView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount: plants.length,
                      itemBuilder: (context, index) {
                        return PlantItemMyListWidget(plant: plants[index]);
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
      // Button
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 30.0, right: 10.0),
        child: SizedBox(
          width: 70,
          height: 70,
          child: FloatingActionButton(
            onPressed: () {
              Navigator.pushNamed(context, '/add_my_object');
            },
            backgroundColor: const Color(0xFF4CAF50),
            shape: const CircleBorder(),
            child: const Icon(
              Icons.add,
              size: 40,
              color: Colors.white,
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );

  }
}
