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

      // Get all users with their total scores and plant counts
      const userScores = await this.plantCareScoreRepository
        .createQueryBuilder('score')
        .select([
          'person.idPerson as userId',
          'person.firstname as firstname',
          'person.surname as surname',
          'SUM(score.dailyScore) as totalScore',
          'COUNT(DISTINCT profile.idObjectProfile) as plantCount',
          'AVG(score.dailyScore) as averageScore'
        ])
        .innerJoin('score.objectProfile', 'profile')
        .innerJoin('profile.person', 'person')
        .groupBy('person.idPerson')
        .addGroupBy('person.firstname')
        .addGroupBy('person.surname')
        .having('COUNT(DISTINCT profile.idObjectProfile) > 0') // Only users with plants
        .orderBy('totalScore', 'DESC')
        .getRawMany();

      // Transform to LeaderboardEntry format
      this.leaderboardCache = userScores.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        username: `${user.firstname} ${user.surname}`,
        totalScore: parseInt(user.totalScore) || 0,
        plantCount: parseInt(user.plantCount) || 0,
        averageScore: parseFloat(user.averageScore) || 0,
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
      if (!this.isCacheValid()) {
        await this.refreshLeaderboardCache();
      }

      const userEntry = this.leaderboardCache.find(entry => entry.userId === userId);
      return userEntry ? userEntry.rank : null;
    } catch (error) {
      this.logger.error(`Error getting user rank: ${error.message}`);
      return null;
    }
  }

  async getUserStats(userId: number): Promise<LeaderboardEntry | null> {
    try {
      if (!this.isCacheValid()) {
        await this.refreshLeaderboardCache();
      }

      return this.leaderboardCache.find(entry => entry.userId === userId) || null;
    } catch (error) {
      this.logger.error(`Error getting user stats: ${error.message}`);
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