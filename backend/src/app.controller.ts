import { Controller, Get, UseGuards } from '@nestjs/common';
import { TasksService } from './modules/tasks/tasks.service';
import { TeamsService } from './modules/teams/teams.service';
import { CognitoAuthGuard } from './common/guards/cognito-auth.guard';

@Controller('status')
export class AppController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly teamsService: TeamsService,
  ) {}

  @Get()
  @UseGuards(CognitoAuthGuard)
  async getStatus() {
    const [tasksStats, allTeams] = await Promise.all([
      this.tasksService.getGlobalStats(),
      this.teamsService.findAll(),
    ]);

    const teamMetrics = allTeams.map((team: any) => {
      const stats = tasksStats.teamStats[team.teamId];
      return {
        teamName: team.name,
        avgTimeToClose: stats && stats.totalClosed > 0 
          ? parseFloat((stats.totalDuration / stats.totalClosed).toFixed(2))
          : 0,
      };
    });

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      analytics: {
        totalTasks: tasksStats.totalTasks,
        closedTasks: tasksStats.closedTasks,
        teamMetrics,
      },
    };
  }
}
