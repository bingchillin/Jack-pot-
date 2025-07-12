import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../../widgets/twitter_tag_selector.dart';
import '../../widgets/robust_image_picker_widget.dart';
import '../../../l10n/app_localizations.dart';

class CreatePostModal extends StatefulWidget {
  const CreatePostModal({super.key});

  @override
  State<CreatePostModal> createState() => _CreatePostModalState();
}

class _CreatePostModalState extends State<CreatePostModal> with TickerProviderStateMixin {
  final TextEditingController _contentController = TextEditingController();
  final FocusNode _contentFocusNode = FocusNode();
  String? _selectedImagePath;
  String? _selectedTag;
  bool _isSubmitting = false;
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;

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
    _contentController.dispose();
    _contentFocusNode.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
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
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Transform.translate(
            offset: Offset(0, MediaQuery.of(context).size.height * 0.1 * _slideAnimation.value),
            child: DraggableScrollableSheet(
              initialChildSize: 0.9,
              minChildSize: 0.5,
              maxChildSize: 0.95,
              builder: (context, scrollController) {
                return Column(
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
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          bottom: BorderSide(
                            color: Colors.grey[100]!,
                            width: 1,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                                                          child: Text(
                                'Cancel',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
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
                          if (_isSubmitting)
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.green[600]!),
                              ),
                            )
                          else
                            ElevatedButton(
                              onPressed: _canSubmit() ? _submitPost : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _canSubmit() ? Colors.green[600] : Colors.grey[300],
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: Text(
                                'Post',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    // Content
                    Expanded(
                      child: SingleChildScrollView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // User info
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
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      authProvider.firstName ?? 'User',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.black,
                                      ),
                                    ),
                                    if (_selectedTag != null)
                                      Container(
                                        margin: const EdgeInsets.only(top: 4),
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _getTagColor(_selectedTag!).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(
                                            color: _getTagColor(_selectedTag!).withValues(alpha: 0.3),
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
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Content text field
                            TextField(
                              controller: _contentController,
                              focusNode: _contentFocusNode,
                              maxLines: null,
                              minLines: 3,
                              maxLength: 1000,
                              decoration: InputDecoration(
                                hintText: localizations.postContent,
                                hintStyle: TextStyle(
                                  color: Colors.grey[500],
                                  fontSize: 18,
                                ),
                                border: InputBorder.none,
                                counterText: '',
                                contentPadding: EdgeInsets.zero,
                              ),
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.black,
                                height: 1.4,
                              ),
                              onChanged: (value) {
                                setState(() {});
                              },
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Image preview
                            if (_selectedImagePath != null) ...[
                              Container(
                                width: double.infinity,
                                constraints: const BoxConstraints(maxHeight: 300),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.grey[300]!),
                                ),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(16),
                                      child: Image.asset(
                                        _selectedImagePath!,
                                        width: double.infinity,
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
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.7),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: const Icon(
                                            Icons.close,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            
                            // Bottom toolbar
                            Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                border: Border(
                                  top: BorderSide(
                                    color: Colors.grey[100]!,
                                    width: 1,
                                  ),
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Image picker button
                                  IconButton(
                                    onPressed: _pickImage,
                                    icon: Icon(
                                      Icons.image_outlined,
                                      color: Colors.green[600],
                                      size: 24,
                                    ),
                                    tooltip: localizations.addImage,
                                  ),
                                  
                                  const SizedBox(width: 8),
                                  
                                  // Tag selector
                                  Expanded(
                                    child: TwitterTagSelector(
                                      selectedTag: _selectedTag,
                                      onTagSelected: (tag) {
                                        setState(() {
                                          _selectedTag = tag;
                                        });
                                      },
                                    ),
                                  ),
                                  
                                  const SizedBox(width: 16),
                                  
                                  // Character count
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getCharacterCountColor().withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      '${_contentController.text.length}/1000',
                                      style: TextStyle(
                                        color: _getCharacterCountColor(),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
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
                  ],
                );
              },
            ),
          ),
        );
        },
      ),
    );
  }

  Color _getCharacterCountColor() {
    final length = _contentController.text.length;
    if (length > 900) return Colors.red[600]!;
    if (length > 800) return Colors.orange[600]!;
    return Colors.grey[600]!;
  }

  bool _canSubmit() {
    return _contentController.text.trim().isNotEmpty && !_isSubmitting;
  }

  void _pickImage() async {
    HapticFeedback.lightImpact();
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