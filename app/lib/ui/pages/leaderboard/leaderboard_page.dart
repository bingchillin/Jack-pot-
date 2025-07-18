import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/leaderboard/leaderboard_item.dart';
import '../../../services/leaderboard_service.dart';
import '../../../models/leaderboard_entry.dart';

class LeaderboardPage extends StatefulWidget {
  const LeaderboardPage({Key? key}) : super(key: key);

  @override
  State<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<LeaderboardPage> {
  final LeaderboardService _leaderboardService = LeaderboardService();
  final List<LeaderboardEntry> _entries = [];
  final ScrollController _scrollController = ScrollController();
  
  bool _isLoading = false;
  bool _hasMoreData = true;
  int _currentPage = 1;
  String? _token;
  int? _myRank;
  LeaderboardEntry? _myStats;

  @override
  void initState() {
    super.initState();
    _loadToken();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token != null) {
      setState(() {
        _token = token;
      });
      await _loadInitialData();
    }
  }

  Future<void> _loadInitialData() async {
    if (_token == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      // Load leaderboard data
      final response = await _leaderboardService.getLeaderboard(
        page: 1,
        limit: 20,
        token: _token!,
      );

      // Load user's rank and stats
      final myRank = await _leaderboardService.getMyRank(_token!);
      final myStats = await _leaderboardService.getMyStats(_token!);

      setState(() {
        _entries.clear();
        _entries.addAll(response.entries);
        _currentPage = response.currentPage;
        _hasMoreData = response.hasNextPage;
        _myRank = myRank;
        _myStats = myStats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocalizations.of(context)!.errorLoadingLeaderboard}: $e')),
        );
      }
    }
  }

  Future<void> _loadMoreData() async {
    if (_token == null || _isLoading || !_hasMoreData) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _leaderboardService.getLeaderboard(
        page: _currentPage + 1,
        limit: 20,
        token: _token!,
      );

      setState(() {
        _entries.addAll(response.entries);
        _currentPage = response.currentPage;
        _hasMoreData = response.hasNextPage;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocalizations.of(context)!.errorLoadingMoreData}: $e')),
        );
      }
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreData();
    }
  }

  Future<void> _refreshData() async {
    _currentPage = 1;
    _hasMoreData = true;
    await _loadInitialData();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.leaderboard),
        backgroundColor: Colors.green[50],
        foregroundColor: Colors.black,
        elevation: 0
      ),
      body: Column(
        children: [
          // User's rank card
          if (_myStats != null)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green[400]!, Colors.green[600]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Center(
                      child: Text(
                        _myStats!.rank > 0 ? '#${_myStats!.rank}' : l10n.unranked,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _myStats!.username,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${l10n.totalScore}: ${_myStats!.totalScore} • ${l10n.plants}: ${_myStats!.plantCount}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          
          // Leaderboard list
          Expanded(
            child: _isLoading && _entries.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _refreshData,
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _entries.length + (_hasMoreData ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _entries.length) {
                          return _hasMoreData
                              ? const Padding(
                                  padding: EdgeInsets.all(16),
                                  child: Center(child: CircularProgressIndicator()),
                                )
                              : const SizedBox.shrink();
                        }

                        final entry = _entries[index];
                        return LeaderboardItem(
                          entry: entry,
                          isCurrentUser: entry.userId == _myStats?.userId,
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
} 