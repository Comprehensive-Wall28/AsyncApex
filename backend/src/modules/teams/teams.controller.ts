import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Teams')
@ApiBearerAuth('cognito-jwt')
@Controller('teams')
@UseGuards(CognitoAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a team', description: 'Manager only.' })
  @ApiResponse({ status: 201, description: 'Team created' })
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams', description: 'Available to all authenticated users.' })
  @ApiResponse({ status: 200, description: 'Array of team objects' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', description: 'teamId (UUID)' })
  @ApiResponse({ status: 200, description: 'Team object' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @ApiOperation({ summary: 'Update a team', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'teamId (UUID)' })
  @ApiResponse({ status: 200, description: 'Updated team object' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'teamId (UUID)' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async remove(@Param('id') id: string) {
    await this.teamsService.remove(id);
  }

  @Post(':id/users')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a user to a team', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'teamId (UUID)' })
  @ApiResponse({ status: 200, description: 'User added to team' })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  addUserToTeam(@Param('id') teamId: string, @Body() dto: AddUserToTeamDto) {
    return this.teamsService.addUserToTeam(teamId, dto.userId);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users in a team' })
  @ApiParam({ name: 'id', description: 'teamId (UUID)' })
  @ApiResponse({ status: 200, description: 'Array of users in the team' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  getTeamUsers(@Param('id') teamId: string) {
    return this.teamsService.getTeamUsers(teamId);
  }
}
