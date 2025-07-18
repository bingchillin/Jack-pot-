class LeaderboardEntry {
  final int rank;
  final int userId;
  final String username;
  final int totalScore;
  final int plantCount;

  LeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.username,
    required this.totalScore,
    required this.plantCount,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] ?? 0,
      userId: json['userId'] ?? 0,
      username: json['username'] ?? '',
      totalScore: json['totalScore'] ?? 0,
      plantCount: json['plantCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rank': rank,
      'userId': userId,
      'username': username,
      'totalScore': totalScore,
      'plantCount': plantCount,
    };
  }
}

class LeaderboardResponse {
  final List<LeaderboardEntry> entries;
  final int totalUsers;
  final int currentPage;
  final int totalPages;
  final bool hasNextPage;

  LeaderboardResponse({
    required this.entries,
    required this.totalUsers,
    required this.currentPage,
    required this.totalPages,
    required this.hasNextPage,
  });

  factory LeaderboardResponse.fromJson(Map<String, dynamic> json) {
    return LeaderboardResponse(
      entries: (json['entries'] as List<dynamic>?)
          ?.map((entry) => LeaderboardEntry.fromJson(entry))
          .toList() ?? [],
      totalUsers: json['totalUsers'] ?? 0,
      currentPage: json['currentPage'] ?? 1,
      totalPages: json['totalPages'] ?? 1,
      hasNextPage: json['hasNextPage'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'entries': entries.map((entry) => entry.toJson()).toList(),
      'totalUsers': totalUsers,
      'currentPage': currentPage,
      'totalPages': totalPages,
      'hasNextPage': hasNextPage,
    };
  }
} 