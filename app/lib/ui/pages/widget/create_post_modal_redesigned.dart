import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../../widgets/robust_image_picker_widget.dart';
import '../../../l10n/app_localizations.dart';

class CreatePostModalRedesigned extends StatefulWidget {
  const CreatePostModalRedesigned({super.key});

  @override
  State<CreatePostModalRedesigned> createState() => _CreatePostModalRedesignedState();
}

class _CreatePostModalRedesignedState extends State<CreatePostModalRedesigned> with TickerProviderStateMixin {
  final TextEditingController _contentController = TextEditingController();
  final FocusNode _contentFocusNode = FocusNode();
  String? _selectedImagePath;
  String? _selectedTag;
  bool _isSubmitting = false;
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  double _keyboardHeight = 0;

  @override
  void initState() {
    super.initState();
    
    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _slideAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    _animationController.forward();
    
    // Auto-focus on content field
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _contentFocusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _contentController.dispose();
    _contentFocusNode.dispose();
    super.dispose();
  }

  bool _canSubmit() {
    return _contentController.text.trim().isNotEmpty && !_isSubmitting;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final localizations = AppLocalizations.of(context)!;
    _keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
    
    return BlocListener<CommentBloc, CommentState>(
      listener: (context, state) {
        if (state is CommentCreated) {
          // Success - close modal and show success message
          if (mounted) {
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(localizations.postCreated),
                backgroundColor: Colors.green[600],
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            );
          }
        } else if (state is CommentError) {
          // Error - show error message and reset submitting state
          if (mounted) {
            setState(() {
              _isSubmitting = false;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(localizations.postCreationError),
                backgroundColor: Colors.red[600],
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            );
          }
        }
      },
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Scaffold(
            backgroundColor: Colors.transparent,
            resizeToAvoidBottomInset: false,
            body: Container(
              margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.15),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Transform.translate(
                offset: Offset(0, MediaQuery.of(context).size.height * 0.05 * _slideAnimation.value),
                child: Column(
                  children: [
                    // Handle bar
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    
                    // Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Colors.grey[200]!, width: 1),
                        ),
                      ),
                      child: Row(
                        children: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: Text(
                              localizations.cancel,
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            localizations.createPost,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                          const Spacer(),
                          TextButton(
                            onPressed: _canSubmit() ? _submitPost : null,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: _canSubmit() ? Colors.green[600] : Colors.grey[300],
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : Text(
                                      localizations.post,
                                      style: TextStyle(
                                        color: _canSubmit() ? Colors.white : Colors.grey[600],
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Content area
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // User info with tag inline
                            Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [Colors.green[400]!, Colors.green[600]!],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: Center(
                                    child: Text(
                                      authProvider.firstName?.isNotEmpty == true
                                          ? authProvider.firstName![0].toUpperCase()
                                          : 'U',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 20,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Row(
                                    children: [
                                      Text(
                                        authProvider.firstName ?? 'User',
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.black,
                                        ),
                                      ),
                                      if (_selectedTag != null) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: _getTagColor(_selectedTag!).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: _getTagColor(_selectedTag!).withOpacity(0.3),
                                            ),
                                          ),
                                          child: Text(
                                            _getTagDisplayName(_selectedTag!),
                                            style: TextStyle(
                                              color: _getTagColor(_selectedTag!),
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Content input
                            TextField(
                              controller: _contentController,
                              focusNode: _contentFocusNode,
                              maxLines: null,
                              minLines: 3,
                              decoration: InputDecoration(
                                hintText: localizations.postContent,
                                hintStyle: TextStyle(
                                  color: Colors.grey[400],
                                  fontSize: 16,
                                ),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                              ),
                              style: const TextStyle(
                                fontSize: 16,
                                height: 1.4,
                              ),
                              onChanged: (value) {
                                setState(() {});
                              },
                            ),
                            
                            // Selected image preview
                            if (_selectedImagePath != null) ...[
                              const SizedBox(height: 16),
                              Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.asset(
                                      _selectedImagePath!,
                                      width: double.infinity,
                                      height: 200,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _selectedImagePath = null;
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withOpacity(0.6),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Icon(
                                          Icons.close,
                                          color: Colors.white,
                                          size: 16,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            
                            // Add bottom padding to ensure content is visible above toolbar
                            SizedBox(height: _keyboardHeight > 0 ? 80 : 120),
                          ],
                        ),
                      ),
                    ),
                    
                    // Toolbar that follows keyboard
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: EdgeInsets.only(bottom: _keyboardHeight),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          top: BorderSide(color: Colors.grey[200]!, width: 1),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, -2),
                          ),
                        ],
                      ),
                      child: SafeArea(
                        top: false,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          child: Row(
                            children: [
                              // Image picker button
                              GestureDetector(
                                onTap: _pickImage,
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(
                                    Icons.image,
                                    color: Colors.grey[600],
                                    size: 24,
                                  ),
                                ),
                              ),
                              
                              const SizedBox(width: 12),
                              
                              // Tag selector buttons
                              Expanded(
                                child: Row(
                                  children: [
                                    // Conversation button
                                    Expanded(
                                      child: GestureDetector(
                                        onTap: () => _selectTag('Conversation'),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          decoration: BoxDecoration(
                                            color: _selectedTag == 'Conversation' 
                                                ? Colors.blue[600]!.withOpacity(0.1)
                                                : Colors.grey[100],
                                            borderRadius: BorderRadius.circular(20),
                                            border: Border.all(
                                              color: _selectedTag == 'Conversation' 
                                                  ? Colors.blue[600]!
                                                  : Colors.grey[300]!,
                                              width: 1,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Icon(
                                                Icons.chat_bubble_outline,
                                                color: _selectedTag == 'Conversation' 
                                                    ? Colors.blue[600]!
                                                    : Colors.grey[600],
                                                size: 16,
                                              ),
                                              const SizedBox(width: 6),
                                              Flexible(
                                                child: Text(
                                                  localizations.conversation,
                                                  style: TextStyle(
                                                    color: _selectedTag == 'Conversation' 
                                                        ? Colors.blue[600]!
                                                        : Colors.grey[700],
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                    
                                    const SizedBox(width: 8),
                                    
                                    // Advice button
                                    Expanded(
                                      child: GestureDetector(
                                        onTap: () => _selectTag('Conseil'),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          decoration: BoxDecoration(
                                            color: _selectedTag == 'Conseil' 
                                                ? Colors.green[600]!.withOpacity(0.1)
                                                : Colors.grey[100],
                                            borderRadius: BorderRadius.circular(20),
                                            border: Border.all(
                                              color: _selectedTag == 'Conseil' 
                                                  ? Colors.green[600]!
                                                  : Colors.grey[300]!,
                                              width: 1,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Icon(
                                                Icons.lightbulb_outline,
                                                color: _selectedTag == 'Conseil' 
                                                    ? Colors.green[600]!
                                                    : Colors.grey[600],
                                                size: 16,
                                              ),
                                              const SizedBox(width: 6),
                                              Flexible(
                                                child: Text(
                                                  localizations.advice,
                                                  style: TextStyle(
                                                    color: _selectedTag == 'Conseil' 
                                                        ? Colors.green[600]!
                                                        : Colors.grey[700],
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _pickImage() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => RobustImagePickerWidget(
        onImageSelected: (file) {
          if (file != null) {
            setState(() {
              _selectedImagePath = file.path;
            });
          }
        },
      ),
    );
  }

  void _selectTag(String? tag) {
    setState(() {
      // Toggle tag selection - if same tag is selected, deselect it
      if (_selectedTag == tag) {
        _selectedTag = null;
      } else {
        _selectedTag = tag;
      }
    });
  }

  void _submitPost() async {
    if (!_canSubmit()) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    setState(() {
      _isSubmitting = true;
    });
    
    HapticFeedback.lightImpact();
    
    // Dispatch the event - the BlocListener will handle success/error
    context.read<CommentBloc>().add(
      CreateComment(
        _contentController.text.trim(),
        imageUrl: _selectedImagePath,
        tag: _selectedTag,
        userId: authProvider.currentUser!.idPerson.toString(),
      ),
    );
  }

  Color _getTagColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return Colors.blue[600]!;
      case 'conseil':
        return Colors.green[600]!;
      default:
        return Colors.grey[600]!;
    }
  }

  String _getTagDisplayName(String tag) {
    final localizations = AppLocalizations.of(context)!;
    switch (tag.toLowerCase()) {
      case 'conversation':
        return localizations.conversation;
      case 'conseil':
        return localizations.advice;
      default:
        return tag;
    }
  }
}