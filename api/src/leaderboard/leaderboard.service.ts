import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantCareScore } from '../plant-care-score/entities/plant-care-score.entity';
import { ObjectProfile } from '../object-profile/entities/object-profile.entity';
import { Person } from '../person/entities/person.entity';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalScore: number;
  plantCount: number;
  averageScore: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private leaderboardCache: LeaderboardEntry[] = [];
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectRepository(PlantCareScore)
    private plantCareScoreRepository: Repository<PlantCareScore>,
    @InjectRepository(ObjectProfile)
    private objectProfileRepository: Repository<ObjectProfile>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  async getLeaderboard(page: number = 1, limit: number = 20): Promise<LeaderboardResponse> {
    try {
      // Check if cache is valid
      if (this.isCacheValid()) {
        return this.getPaginatedLeaderboard(page, limit);
      }

      // Refresh cache
      await this.refreshLeaderboardCache();

      return this.getPaginatedLeaderboard(page, limit);
    } catch (error) {
      this.logger.error(`Error getting leaderboard: ${error.message}`);
      throw error;
    }
  }

  async refreshLeaderboardCache(): Promise<void> {
    try {
      this.logger.log('🔄 Refreshing leaderboard cache...');

      // Get all users with their object profiles and scores
      const userStats = await this.objectProfileRepository
        .createQueryBuilder('profile')
        .select([
          'person.idPerson as userId',
          'person.firstname as firstname',
          'person.surname as surname',
          'COUNT(DISTINCT profile.idObjectProfile) as plantCount'
        ])
        .innerJoin('profile.person', 'person')
        .groupBy('person.idPerson')
        .addGroupBy('person.firstname')
        .addGroupBy('person.surname')
        .getRawMany();

      // Get scores for users who have them
      const userScores = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select([
          'person.idPerson as userId',
          'SUM(score.dailyScore) as totalScore',
          'AVG(score.dailyScore) as averageScore'
        ])
        .innerJoin('score.objectProfile', 'profile')
        .innerJoin('profile.person', 'person')
        .groupBy('person.idPerson')
        .getRawMany();

      // Create a map of scores for quick lookup
      const scoreMap = new Map();
      userScores.forEach(score => {
        scoreMap.set(score.userId, {
          totalScore: parseInt(score.totalScore) || 0,
          averageScore: parseFloat(score.averageScore) || 0
        });
      });

      // Combine stats and scores
      const combinedStats = userStats.map(user => {
        const scores = scoreMap.get(user.userId) || { totalScore: 0, averageScore: 0 };
        return {
          userId: user.userId,
          plantCount: parseInt(user.plantCount) || 0,
          totalScore: scores.totalScore,
          averageScore: scores.averageScore
        };
      });

      // Sort by total score (descending) and then by plant count (descending)
      combinedStats.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.plantCount - a.plantCount;
      });

      // Transform to LeaderboardEntry format with ranks
      this.leaderboardCache = combinedStats.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        username: userStats.find(u => u.userId === user.userId)?.firstname + ' ' + userStats.find(u => u.userId === user.userId)?.surname,
        totalScore: user.totalScore,
        plantCount: user.plantCount,
        averageScore: user.averageScore,
      }));

      this.lastCacheUpdate = new Date();
      this.logger.log(`✅ Leaderboard cache refreshed with ${this.leaderboardCache.length} users`);
    } catch (error) {
      this.logger.error(`Error refreshing leaderboard cache: ${error.message}`);
      throw error;
    }
  }

  private getPaginatedLeaderboard(page: number, limit: number): LeaderboardResponse {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const entries = this.leaderboardCache.slice(startIndex, endIndex);
    const totalUsers = this.leaderboardCache.length;
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      entries,
      totalUsers,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate || this.leaderboardCache.length === 0) {
      return false;
    }

    const now = new Date();
    const timeSinceUpdate = now.getTime() - this.lastCacheUpdate.getTime();
    return timeSinceUpdate < this.CACHE_DURATION;
  }

  async getUserRank(userId: number): Promise<number | null> {
    try {
      this.logger.log(`🔍 Getting rank for user ID: ${userId}`);

      // Get total score for this user
      const scoreResult = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select('SUM(score.dailyScore)', 'totalScore')
        .innerJoin('score.objectProfile', 'profile')
        .where('profile.person.idPerson = :userId', { userId })
        .getRawOne();
      
      const totalScore = parseInt(scoreResult?.totalScore) || 0;
      this.logger.log(`📊 Total score for user ${userId}: ${totalScore}`);

      // If no scores, return 0 (unranked)
      if (totalScore <= 0) {
        this.logger.log(`🏆 No scores, rank is 0`);
        return 0;
      }

      // Get all users with their total scores
      const allUserScores = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select([
          'person.idPerson as userId',
          'SUM(score.dailyScore) as totalScore'
        ])
        .innerJoin('score.objectProfile', 'profile')
        .innerJoin('profile.person', 'person')
        .groupBy('person.idPerson')
        .getRawMany();

      this.logger.log(`🏆 All user scores: ${JSON.stringify(allUserScores)}`);

      // Sort by total score and find user's position
      const sortedScores = allUserScores
        .map(score => ({
          userId: score.userid || score.userId, // Handle both cases
          totalScore: parseInt(score.totalscore || score.totalScore) || 0
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      this.logger.log(`🏆 Sorted scores: ${JSON.stringify(sortedScores)}`);

      const userPosition = sortedScores.findIndex(score => score.userId === userId);
      this.logger.log(`🏆 User position: ${userPosition}`);
      const rank = userPosition >= 0 ? userPosition + 1 : 0;
      this.logger.log(`🏆 Final rank: ${rank}`);

      return rank;
    } catch (error) {
      this.logger.error(`Error getting user rank: ${error.message}`);
      return 0; // Return 0 for unranked instead of null
    }
  }

  async getUserStats(userId: number): Promise<LeaderboardEntry | null> {
    try {
      if (!this.isCacheValid()) {
        await this.refreshLeaderboardCache();
      }

      // First check if user is in the leaderboard
      const userEntry = this.leaderboardCache.find(entry => entry.userId === userId);
      if (userEntry) {
        return userEntry;
      }

      // If user is not in leaderboard, check if they exist and get their stats
      const user = await this.personRepository.findOne({ where: { idPerson: userId } });
      if (user) {
        // Count their object profiles
        const plantCount = await this.objectProfileRepository.count({
          where: { person: { idPerson: userId } }
        });

        return {
          rank: 0, // 0 means unranked
          userId: user.idPerson,
          username: `${user.firstname} ${user.surname}`,
          totalScore: 0,
          plantCount: plantCount,
          averageScore: 0,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting user stats: ${error.message}`);
      return null;
    }
  }

  async getCurrentUserStats(userId: number): Promise<LeaderboardEntry | null> {
    try {
      this.logger.log(`🔍 Getting stats for user ID: ${userId}`);

      // Get user info
      const user = await this.personRepository.findOne({ where: { idPerson: userId } });
      this.logger.log(`👤 User found: ${user ? 'YES' : 'NO'}`);
      if (user) {
        this.logger.log(`👤 User name: ${user.firstname} ${user.surname}`);
      }
      
      if (!user) {
        this.logger.log(`❌ User not found for ID: ${userId}`);
        return null;
      }

      // Count object profiles for this user
      const plantCount = await this.objectProfileRepository.count({
        where: { person: { idPerson: userId } }
      });
      this.logger.log(`🌱 Plant count for user ${userId}: ${plantCount}`);

      // Get total score for this user
      const scoreResult = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select('SUM(score.dailyScore)', 'totalScore')
        .innerJoin('score.objectProfile', 'profile')
        .where('profile.person.idPerson = :userId', { userId })
        .getRawOne();
      
      this.logger.log(`📊 Score result: ${JSON.stringify(scoreResult)}`);
      const totalScore = parseInt(scoreResult?.totalScore) || 0;
      this.logger.log(`📊 Total score for user ${userId}: ${totalScore}`);

      // Get average score for this user
      const avgResult = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select('AVG(score.dailyScore)', 'averageScore')
        .innerJoin('score.objectProfile', 'profile')
        .where('profile.person.idPerson = :userId', { userId })
        .getRawOne();
      
      this.logger.log(`📊 Average result: ${JSON.stringify(avgResult)}`);
      const averageScore = parseFloat(avgResult?.averageScore) || 0;
      this.logger.log(`📊 Average score for user ${userId}: ${averageScore}`);

      // Get user's rank (only among users with scores)
      let rank = 0;
      if (totalScore > 0) {
        // Get all users with their total scores
        const allUserScores = await this.plantCareScoreRepository
          .createQueryBuilder('score')
          .select([
            'person.idPerson as userId',
            'SUM(score.dailyScore) as totalScore'
          ])
          .innerJoin('score.objectProfile', 'profile')
          .innerJoin('profile.person', 'person')
          .groupBy('person.idPerson')
          .getRawMany();

        this.logger.log(`🏆 All user scores: ${JSON.stringify(allUserScores)}`);

        // Sort by total score and find user's position
        const sortedScores = allUserScores
          .map(score => ({
            userId: score.userid || score.userId, // Handle both cases
            totalScore: parseInt(score.totalscore || score.totalScore) || 0
          }))
          .sort((a, b) => b.totalScore - a.totalScore);

        this.logger.log(`🏆 Sorted scores: ${JSON.stringify(sortedScores)}`);

        const userPosition = sortedScores.findIndex(score => score.userId === userId);
        this.logger.log(`🏆 User position: ${userPosition}`);
        rank = userPosition >= 0 ? userPosition + 1 : 0;
        this.logger.log(`🏆 Final rank: ${rank}`);
      } else {
        this.logger.log(`🏆 No scores, rank remains 0`);
      }

      const result = {
        rank: rank,
        userId: user.idPerson,
        username: `${user.firstname} ${user.surname}`,
        totalScore: totalScore,
        plantCount: plantCount,
        averageScore: averageScore,
      };

      this.logger.log(`✅ Final result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error getting current user stats: ${error.message}`);
      this.logger.error(`❌ Error stack: ${error.stack}`);
      return null;
    }
  }

  // Method to be called when new scores are created
  async invalidateCache(): Promise<void> {
    this.lastCacheUpdate = null;
    this.leaderboardCache = [];
    this.logger.log('🗑️ Leaderboard cache invalidated');
  }
} 