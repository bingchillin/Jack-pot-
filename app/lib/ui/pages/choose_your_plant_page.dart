import 'dart:async';
import 'dart:ffi';
import 'package:flutter/material.dart';
import 'package:jackpote/models/plant_type.dart';
import 'package:jackpote/services/plant_service.dart';
import '../../models/avatar.dart';
import 'choose_plant_detail_page.dart';

class ChooseYourPlantPage extends StatefulWidget {
  final String? plantName;
  final String? idObject;

  const ChooseYourPlantPage({Key? key, this.plantName, this.idObject}) : super(key: key);

  @override
  State<ChooseYourPlantPage> createState() => _ChooseYourPlantPageState();
}

class _ChooseYourPlantPageState extends State<ChooseYourPlantPage> {
  final TextEditingController _controller = TextEditingController();
  final PlantService _plantService = PlantService();

  List<PlantType> _results = [];
  Timer? _debounce;
  bool _isLoading = false;

  String? _plantName;
  String? _idObject;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;

      setState(() {
        if (args != null && args is Map<String, dynamic>) {
          _plantName = args["plantName"];
          _idObject = args["idObject"];
        } else {
          _plantName = widget.plantName;
          _idObject = widget.idObject;
        }
      });
    });
  }



  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    _debounce = Timer(const Duration(milliseconds: 1000), () {
      FocusScope.of(context).unfocus(); // Fermer le clavier
      if (query.isNotEmpty) {
        _fetchResults(query);
      } else {
        setState(() {
          _results = [];
        });
      }
    });
  }

  Future<void> _fetchResults(String query) async {
    setState(() => _isLoading = true);
    try {
      final data = await _plantService.fetchPlantTypeBySearch(query);
      setState(() => _results = data);
    } catch (e) {
      debugPrint("Erreur de recherche: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de la récupération des plantes')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String? _getImageUrl(PlantType plant) {
    try {
      for (final avatar in plant.avatars) {
        if (avatar.typeP == 1 && avatar.pathPicture.isNotEmpty) {
          return avatar.pathPicture;
        }
      }
      return null;
    } catch (e) {
      debugPrint("Erreur image pour plante ${plant.title}: $e");
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Choisir une plante pour ${_plantName ?? '...'}"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              onChanged: _onSearchChanged,
              decoration: const InputDecoration(
                labelText: "Rechercher une plante",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const CircularProgressIndicator()
            else
              Expanded(
                child: _controller.text.isEmpty
                    ? const Center(child: Text("Indique nous quelle plante sera hébergée par notre pot ! Fait le grâce à la recherche ou la prise de photo !"))
                    : _results.isEmpty && !_isLoading
                    ? const Center(child: Text("Aucune plante trouvée."))
                    : ListView.builder(
                itemCount: _results.length,
                  itemBuilder: (context, index) {
                    try {
                      final plant = _results[index];
                      final imageUrl = _getImageUrl(plant);

                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    ChoosePlantDetailPage(
                                        plant: plant,
                                        plantName: _plantName,
                                        idObject: _idObject
                                    ),
                              ),
                            );
                          },
                          leading: imageUrl != null
                              ? Image.network(
                            imageUrl,
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                            const Icon(Icons.broken_image, color: Colors.red),
                          )
                              : const Icon(Icons.image_not_supported),
                          title: Text(plant.title),
                        ),
                      );
                    } catch (e) {
                      debugPrint("Erreur dans ListView: $e");
                      return const SizedBox.shrink();
                    }
                  },
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/choose_your_plant_picture');
        },
        tooltip: 'Prendre une photo',
        child: Icon(Icons.camera_alt),
      ),

    );
  }
}
