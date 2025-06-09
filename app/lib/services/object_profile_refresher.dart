import 'dart:async';

import '../bloc/object_profile/object_profile_bloc.dart';
import '../bloc/object_profile/object_profile_event.dart';

class ObjectProfileRefresher {
  static Timer? _timer;

  static void start(ObjectProfileBloc bloc) {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) {
      bloc.add(LoadProfiles());
    });
  }

  static void stop() {
    _timer?.cancel();
    _timer = null;
  }
}
