import 'package:flutter/material.dart';
import 'dart:async';
import '../../models/comment_mention_model.dart';
import '../../services/mention_service.dart';
import 'user_mention_suggestions.dart';

class MentionTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? hintText;
  final int? maxLines;
  final Function(String)? onChanged;
  final Function()? onSubmitted;
  final String token;
  final bool enabled;
  final FocusNode? focusNode;
  final int? currentUserId; // ID de l'utilisateur actuel pour l'exclure

  const MentionTextField({
    Key? key,
    required this.controller,
    this.hintText,
    this.maxLines,
    this.onChanged,
    this.onSubmitted,
    required this.token,
    this.enabled = true,
    this.focusNode,
    this.currentUserId,
  }) : super(key: key);

  @override
  State<MentionTextField> createState() => _MentionTextFieldState();
}

class _MentionTextFieldState extends State<MentionTextField> {
  final MentionService _mentionService = MentionService();
  final LayerLink _layerLink = LayerLink();
  
  List<MentionUser> _suggestions = [];
  bool _isLoadingSuggestions = false;
  String _currentQuery = '';
  int _mentionStartPosition = -1;
  Timer? _debounceTimer;
  
  late FocusNode _focusNode;
  OverlayEntry? _overlayEntry;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
    widget.controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _removeOverlay();
    _focusNode.removeListener(_onFocusChange);
    widget.controller.removeListener(_onTextChanged);
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    if (!_focusNode.hasFocus) {
      _hideSuggestions();
    }
  }

  void _onTextChanged() {
    final text = widget.controller.text;
    final cursorPosition = widget.controller.selection.baseOffset;
    
    // Appeler le callback onChanged si fourni
    if (widget.onChanged != null) {
      widget.onChanged!(text);
    }
    
    // Détecter si on est en train de taper une mention
    _detectMentionTyping(text, cursorPosition);
  }

  void _detectMentionTyping(String text, int cursorPosition) {
    if (cursorPosition < 0 || cursorPosition > text.length) {
      _hideSuggestions();
      return;
    }

    // Chercher le dernier @ avant la position du curseur
    int mentionStart = -1;
    for (int i = cursorPosition - 1; i >= 0; i--) {
      if (text[i] == '@') {
        mentionStart = i;
        break;
      }
      if (text[i] == ' ' || text[i] == '\n') {
        break;
      }
    }

    if (mentionStart == -1) {
      _hideSuggestions();
      return;
    }

    // Extraire le texte de la mention
    String mentionText = '';
    for (int i = mentionStart + 1; i < cursorPosition; i++) {
      if (text[i] == ' ' || text[i] == '\n') {
        _hideSuggestions();
        return;
      }
      mentionText += text[i];
    }

    // Vérifier que le caractère après @ n'est pas un espace
    if (mentionStart + 1 < text.length && text[mentionStart + 1] == ' ') {
      _hideSuggestions();
      return;
    }

    _mentionStartPosition = mentionStart;
    _currentQuery = mentionText;
    
    if (mentionText.isNotEmpty) {
      _searchUsers(mentionText);
    } else {
      _hideSuggestions();
    }
  }

  void _searchUsers(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingSuggestions = true;
    });

    try {
      final users = await _mentionService.searchUsersForMention(
        query: query,
        token: widget.token,
        limit: 8,
      );

      if (mounted) {
        // Filtrer l'utilisateur actuel des suggestions
        final filteredUsers = widget.currentUserId != null 
            ? users.where((user) => user.idPerson != widget.currentUserId).toList()
            : users;
            
        setState(() {
          _suggestions = filteredUsers;
          _isLoadingSuggestions = false;
        });
        _showOverlay();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _suggestions = [];
          _isLoadingSuggestions = false;
        });
        print('Erreur lors de la recherche d\'utilisateurs: $e');
      }
    }
  }

  void _onUserSelected(MentionUser user) {
    final text = widget.controller.text;
    final cursorPosition = widget.controller.selection.baseOffset;
    
    // Remplacer le texte de la mention par le username
    final beforeMention = text.substring(0, _mentionStartPosition);
    final afterMention = text.substring(cursorPosition);
    final mentionText = '@${user.mentionText}';
    
    final newText = beforeMention + mentionText + afterMention;
    final newCursorPosition = _mentionStartPosition + mentionText.length;
    
    widget.controller.text = newText;
    widget.controller.selection = TextSelection.collapsed(offset: newCursorPosition);
    
    _hideSuggestions();
    
    // Remettre le focus sur le TextField
    _focusNode.requestFocus();
  }

  void _showOverlay() {
    if (_overlayEntry != null) {
      _overlayEntry!.remove();
    }

    _overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        width: MediaQuery.of(context).size.width - 32,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: const Offset(0, 60),
          child: Material(
            elevation: 0,
            color: Colors.transparent,
            child: UserMentionSuggestions(
              users: _suggestions,
              onUserSelected: _onUserSelected,
              isLoading: _isLoadingSuggestions,
              query: _currentQuery,
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  void _hideSuggestions() {
    setState(() {
      _suggestions = [];
      _currentQuery = '';
      _mentionStartPosition = -1;
    });
    _removeOverlay();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: TextField(
        controller: widget.controller,
        focusNode: _focusNode,
        enabled: widget.enabled,
        maxLines: widget.maxLines,
        decoration: InputDecoration(
          hintText: widget.hintText,
          hintStyle: TextStyle(
            color: Colors.grey.shade400,
            fontSize: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          suffixIcon: widget.onSubmitted != null
              ? IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: widget.onSubmitted,
                  color: Colors.blue.shade600,
                )
              : null,
        ),
        style: const TextStyle(
          fontSize: 16,
          color: Colors.black87,
        ),
        textInputAction: TextInputAction.newline,
        onSubmitted: (_) {
          if (widget.onSubmitted != null) {
            widget.onSubmitted!();
          }
        },
      ),
    );
  }
}

// Widget simplifié pour les cas où on n'a pas besoin de l'autocomplétion
class SimpleMentionTextField extends StatelessWidget {
  final TextEditingController controller;
  final String? hintText;
  final int? maxLines;
  final Function(String)? onChanged;
  final Function()? onSubmitted;
  final bool enabled;
  final FocusNode? focusNode;

  const SimpleMentionTextField({
    Key? key,
    required this.controller,
    this.hintText,
    this.maxLines,
    this.onChanged,
    this.onSubmitted,
    this.enabled = true,
    this.focusNode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      enabled: enabled,
      maxLines: maxLines,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(
          color: Colors.grey.shade400,
          fontSize: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        suffixIcon: onSubmitted != null
            ? IconButton(
                icon: const Icon(Icons.send),
                onPressed: onSubmitted,
                color: Colors.blue.shade600,
              )
            : null,
      ),
      style: const TextStyle(
        fontSize: 16,
        color: Colors.black87,
      ),
      textInputAction: TextInputAction.newline,
      onSubmitted: (_) {
        if (onSubmitted != null) {
          onSubmitted!();
        }
      },
    );
  }
} 