import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/object_profile/object_profile_bloc.dart';
import '../../bloc/object_profile/object_profile_event.dart';
import '../../models/object_profile.dart';
import 'widget/plant_item_widget.dart';

class MyPlantPage extends StatefulWidget {
  const MyPlantPage({Key? key}) : super(key: key);


  @override
  State<MyPlantPage> createState() => _MyPlantPageState();
}

class _MyPlantPageState extends State<MyPlantPage> {
  late ObjectProfileBloc bloc;

  @override
  void initState() {
    super.initState();
    bloc = context.read<ObjectProfileBloc>();
  }

  Future<void> _refresh() async {
    bloc.add(LoadProfiles());
    await bloc.profilesStream.firstWhere((_) => true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamBuilder<List<ObjectProfile>>(
        stream: bloc.profilesStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final plants = snapshot.data!;
          if (plants.isEmpty) {
            return const Center(child: Text("Aucune plante trouvée."));
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'My Favorite',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(
                    height: 450,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: plants.length,
                      itemBuilder: (context, index) {
                        return PlantItemWidget(plant: plants[index]);
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

}
