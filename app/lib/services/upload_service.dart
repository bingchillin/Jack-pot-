import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../app_config.dart';
import 'package:http_parser/http_parser.dart'; // For MediaType


class UploadService {
  static final String baseUrl = AppConfig.baseUrl;

  /// Upload an image file and return the URL
  Future<String> uploadImage(File imageFile, {String? token}) async {
    try {
      var uri = Uri.parse('$baseUrl/api/upload');
      var request = http.MultipartRequest('POST', uri);
      
      // Add the image file with proper content type detection
      String extension = imageFile.path.split('.').last.toLowerCase();
      MediaType contentType;
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = MediaType('image', 'jpeg');
          break;
        case 'png':
          contentType = MediaType('image', 'png');
          break;
        case 'gif':
          contentType = MediaType('image', 'gif');
          break;
        case 'webp':
          contentType = MediaType('image', 'webp');
          break;
        default:
          contentType = MediaType('image', 'jpeg'); // Default fallback
      }
      
      request.files.add(
        await http.MultipartFile.fromPath(
          'file', 
          imageFile.path,
          contentType: contentType,
        ),
      );
      
      // Add authorization header if token provided
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      
      var response = await request.send();
      var responseData = await response.stream.bytesToString();
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        var jsonResponse = json.decode(responseData);
        return jsonResponse['url'] as String;
      } else {
        throw Exception('Failed to upload image: ${response.statusCode} - $responseData');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Get the full URL for an uploaded image
  static String getImageUrl(String filename) {
    return '$baseUrl/uploads/$filename';
  }

  /// Extract filename from full URL
  static String getFilenameFromUrl(String url) {
    return url.split('/').last;
  }
} 