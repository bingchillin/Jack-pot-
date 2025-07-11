import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/comment/comment_bloc.dart';
import '../../../models/comment_model.dart';
import '../../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../../widgets/tag_selector_widget.dart';
import '../../widgets/robust_image_picker_widget.dart';
import '../../../l10n/app_localizations.dart';
import '../../../services/comment_service.dart';

class EditCommentModal extends StatefulWidget {
  final Comment comment;
  
  const EditCommentModal({
    super.key,
    required this.comment,
  });

  @override
  State<EditCommentModal> createState() => _EditCommentModalState();
}

class _EditCommentModalState extends State<EditCommentModal> with TickerProviderStateMixin {
  late TextEditingController _contentController;
  String? _selectedImagePath;
  String? _selectedTag;
  bool _isSubmitting = false;
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Initialize with existing comment data
    _contentController = TextEditingController(text: widget.comment.content);
    _selectedImagePath = widget.comment.imageUrl;
    _selectedTag = widget.comment.tag;
    
    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    
    _slideAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _contentController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 100 * _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.8,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: Icon(
                            Icons.close,
                            color: Colors.grey[600],
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          localizations.edit,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[800],
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
                          TextButton(
                            onPressed: _canSubmit() ? _submitEdit : null,
                            style: TextButton.styleFrom(
                              foregroundColor: Colors.green[600],
                              disabledForegroundColor: Colors.grey[400],
                            ),
                            child: Text(
                              'Save',
                              style: const TextStyle(
                                fontSize: 16,
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
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // User info
                          Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Colors.green[400]!, Colors.green[600]!],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Center(
                                  child: Text(
                                    authProvider.firstName?.isNotEmpty == true
                                        ? authProvider.firstName![0].toUpperCase()
                                        : 'U',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
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
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[800],
                                    ),
                                  ),
                                  Text(
                                    'Editing post',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[500],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 24),
                          
                          // Content text field
                          TextField(
                            controller: _contentController,
                            maxLines: 8,
                            maxLength: 1000,
                            decoration: InputDecoration(
                              hintText: 'Edit your post...',
                              hintStyle: TextStyle(
                                color: Colors.grey[400],
                                fontSize: 16,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(color: Colors.green[600]!, width: 2),
                              ),
                              filled: true,
                              fillColor: Colors.grey[50],
                              contentPadding: const EdgeInsets.all(16),
                            ),
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[800],
                              height: 1.5,
                            ),
                            onChanged: (value) {
                              setState(() {});
                            },
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Image picker
                          if (_selectedImagePath != null) ...[
                            Container(
                              width: double.infinity,
                              height: 200,
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
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withValues(alpha: 0.7),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Icon(
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
                            const SizedBox(height: 20),
                          ],
                          
                          // Action buttons
                          Row(
                            children: [
                              // Image picker button
                              GestureDetector(
                                onTap: _pickImage,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.blue[50],
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.blue[200]!),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.image,
                                        color: Colors.blue[600],
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        localizations.addImage,
                                        style: TextStyle(
                                          color: Colors.blue[600],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              
                              const SizedBox(width: 12),
                              
                              // Tag selector (only for top-level comments)
                              if (widget.comment.parentCommentId == null)
                                Expanded(
                                  child: TagSelectorWidget(
                                    selectedTag: _selectedTag,
                                    onTagSelected: (tag) {
                                      setState(() {
                                        _selectedTag = tag;
                                      });
                                    },
                                  ),
                                ),
                            ],
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Character count
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${_contentController.text.length}/1000',
                                style: TextStyle(
                                  color: _contentController.text.length > 900 
                                      ? Colors.orange[600] 
                                      : Colors.grey[500],
                                  fontSize: 14,
                                ),
                              ),
                              if (_selectedTag != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _getTagColor(_selectedTag!).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: _getTagColor(_selectedTag!).withValues(alpha: 0.3),
                                    ),
                                  ),
                                  child: Text(
                                    _getTagDisplayName(_selectedTag!),
                                    style: TextStyle(
                                      color: _getTagColor(_selectedTag!),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  bool _canSubmit() {
    return _contentController.text.trim().isNotEmpty && !_isSubmitting;
  }

  void _pickImage() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => RobustImagePickerWidget(
        onImageSelected: (file) {
          // Handle the selected image file
          if (file != null) {
            setState(() {
              _selectedImagePath = file.path;
            });
          }
        },
      ),
    );
  }

  void _submitEdit() async {
    if (!_canSubmit()) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final localizations = AppLocalizations.of(context)!;
    
    setState(() {
      _isSubmitting = true;
    });
    
    try {
      // Use the comment service directly since there's no UpdateComment event in the main bloc
      final commentService = CommentService();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      await commentService.updateComment(
        commentId: widget.comment.idComment,
        content: _contentController.text.trim(),
        token: authProvider.accessToken!,
      );
      
      // Refresh the comments list
      context.read<CommentBloc>().add(RefreshComments());
      
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Post updated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating post'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Color _getTagColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'conversation':
        return Colors.blue[600]!;
      case 'advice':
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
      case 'advice':
        return localizations.advice;
      default:
        return tag;
    }
  }
} 