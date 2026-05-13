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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Projects')
@ApiBearerAuth('cognito-jwt')
@Controller('projects')
@UseGuards(CognitoAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a project', description: 'Manager only. `managerId` is set automatically from the authenticated user.' })
  @ApiResponse({ status: 201, description: 'Project created' })
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectsService.create(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects', description: 'Available to all authenticated users.' })
  @ApiResponse({ status: 200, description: 'Array of project objects' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'projectId (UUID)' })
  @ApiResponse({ status: 200, description: 'Project object' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @ApiOperation({ summary: 'Update a project', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'projectId (UUID)' })
  @ApiResponse({ status: 200, description: 'Updated project object' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project', description: 'Manager only.' })
  @ApiParam({ name: 'id', description: 'projectId (UUID)' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
  }
}
