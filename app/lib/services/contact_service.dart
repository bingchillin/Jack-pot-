import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/contact_model.dart';
import '../app_config.dart';

class ContactService {
  final String baseUrl = AppConfig.baseUrl;

  // Envoyer une demande d'ami
  Future<Contact> sendFriendRequest({
    required int receiverId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/send-request');
    final body = {
      'receiverId': receiverId,
    };

    print('Flutter - Sending friend request to user $receiverId');

    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    print('Flutter - Response status: ${response.statusCode}');
    print('Flutter - Response body: ${response.body}');

    if (response.statusCode == 201) {
      return Contact.fromJson(jsonDecode(response.body));
    } else {
      final errorBody = jsonDecode(response.body);
      throw Exception('Erreur lors de l\'envoi de la demande: ${errorBody['message'] ?? response.statusCode}');
    }
  }

  // Accepter une demande d'ami
  Future<Contact> acceptFriendRequest({
    required int contactId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/$contactId/accept');

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return Contact.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors de l\'acceptation: ${response.statusCode}');
    }
  }

  // Rejeter une demande d'ami
  Future<Contact> rejectFriendRequest({
    required int contactId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/$contactId/reject');

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return Contact.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du rejet: ${response.statusCode}');
    }
  }

  // Bloquer un utilisateur
  Future<Contact> blockUser({
    required int contactId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/$contactId/block');

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return Contact.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du blocage: ${response.statusCode}');
    }
  }

  // Débloquer un utilisateur
  Future<Contact> unblockUser({
    required int contactId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/$contactId/unblock');

    final response = await http.patch(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return Contact.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du déblocage: ${response.statusCode}');
    }
  }

  // Supprimer un contact
  Future<void> removeContact({
    required int contactId,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/$contactId');

    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Erreur lors de la suppression: ${response.statusCode}');
    }
  }

  // Récupérer mes contacts (amis acceptés)
  Future<List<Contact>> getMyContacts({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/my-contacts');
    
    print('🌐 ContactService - Requesting: ${url.toString()}');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    print('📡 ContactService - Response status: ${response.statusCode}');
    print('📡 ContactService - Response body: ${response.body}');

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      final contacts = data.map((json) => Contact.fromJson(json)).toList();
      
      print('📋 ContactService - Parsed ${contacts.length} contacts');
      for (var contact in contacts) {
        print('📋 Contact: id=${contact.id}, status=${contact.status.value}, requester=${contact.requesterId}, receiver=${contact.receiverId}');
      }
      
      return contacts;
    } else {
      throw Exception('Erreur de chargement des contacts: ${response.statusCode}');
    }
  }

  // Récupérer les demandes reçues en attente
  Future<List<Contact>> getPendingRequests({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/pending-requests');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => Contact.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement des demandes: ${response.statusCode}');
    }
  }

  // Récupérer les demandes envoyées en attente
  Future<List<Contact>> getSentRequests({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/sent-requests');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((json) => Contact.fromJson(json)).toList();
    } else {
      throw Exception('Erreur de chargement des demandes envoyées: ${response.statusCode}');
    }
  }

  // Récupérer les contacts bloqués
  Future<List<Contact>> getBlockedContacts({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/contacts/blocked');
    
    print('🌐 ContactService - Requesting blocked: ${url.toString()}');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    print('📡 ContactService - Blocked response status: ${response.statusCode}');
    print('📡 ContactService - Blocked response body: ${response.body}');

    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      final contacts = data.map((json) => Contact.fromJson(json)).toList();
      
      print('📋 ContactService - Parsed ${contacts.length} blocked contacts');
      for (var contact in contacts) {
        print('📋 Blocked Contact: id=${contact.id}, status=${contact.status.value}, requester=${contact.requesterId}, receiver=${contact.receiverId}');
      }
      
      return contacts;
    } else {
      throw Exception('Erreur de chargement des contacts bloqués: ${response.statusCode}');
    }
  }

  // Vérifier le statut de relation avec un utilisateur
  Future<Contact?> getContactStatus({
    required int userId,
    required String token,
  }) async {
    try {
      // On récupère tous les contacts et on filtre côté client
      final myContacts = await getMyContacts(token: token);
      final pendingRequests = await getPendingRequests(token: token);
      final sentRequests = await getSentRequests(token: token);
      final blockedContacts = await getBlockedContacts(token: token);

      // Rechercher dans tous les types de relations
      final allRelations = [...myContacts, ...pendingRequests, ...sentRequests, ...blockedContacts];
      
      for (final contact in allRelations) {
        if (contact.requesterId == userId || contact.receiverId == userId) {
          return contact;
        }
      }
      
      return null; // Aucune relation trouvée
    } catch (e) {
      print('Error checking contact status: $e');
      return null;
    }
  }

  // Check if there's a blocking relationship between current user and target user
  Future<BlockingStatus> checkBlockingStatus({
    required int currentUserId,
    required int targetUserId,
    required String token,
  }) async {
    try {
      final contact = await getContactStatus(userId: targetUserId, token: token);
      
      if (contact == null || !contact.isBlocked) {
        return BlockingStatus.notBlocked;
      }
      
      // Check who blocked whom
      if (contact.blockedBy == currentUserId) {
        return BlockingStatus.youBlockedThem;
      } else {
        return BlockingStatus.theyBlockedYou;
      }
    } catch (e) {
      print('Error checking blocking status: $e');
      return BlockingStatus.notBlocked;
    }
  }
} 