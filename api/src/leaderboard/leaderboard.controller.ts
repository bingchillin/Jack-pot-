import { Controller, Get, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaderboardService, LeaderboardResponse } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  private readonly logger = new Logger(LeaderboardController.name);

  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get leaderboard with pagination' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  async getLeaderboard(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<LeaderboardResponse> {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    return await this.leaderboardService.getLeaderboard(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-rank')
  @ApiOperation({ summary: 'Get current user rank' })
  @ApiResponse({ status: 200, description: 'User rank retrieved successfully' })
  async getMyRank(@Request() req: any): Promise<{ rank: number | null }> {
    const userId = req.user.idPerson;
    this.logger.log(`🎯 getMyRank called for user ID: ${userId}`);
    const stats = await this.leaderboardService.getCurrentUserStats(userId);
    this.logger.log(`🎯 getMyRank result: ${JSON.stringify(stats)}`);
    const result = { rank: stats?.rank || 0 };
    this.logger.log(`🎯 getMyRank returning: ${JSON.stringify(result)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-stats')
  @ApiOperation({ summary: 'Get current user leaderboard stats' })
  @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
  async getMyStats(@Request() req: any) {
    const userId = req.user.idPerson;
    this.logger.log(`📊 getMyStats called for user ID: ${userId}`);
    const result = await this.leaderboardService.getCurrentUserStats(userId);
    this.logger.log(`📊 getMyStats returning: ${JSON.stringify(result)}`);
    return result;
  }
} 