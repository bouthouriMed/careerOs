import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../platform/auth/auth.guard';
import { CurrentUser } from '../platform/auth/current-user.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import {
  ApplicationResponseDto,
  ApplicationListResponseDto,
  TimelineResponseDto,
} from './dto/application-response.dto';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, type: ApplicationResponseDto })
  async create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.applicationService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all applications' })
  @ApiResponse({ status: 200, type: ApplicationListResponseDto })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.applicationService.findAll(user.id, { status, source });
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get application timeline grouped by date' })
  @ApiResponse({ status: 200, type: TimelineResponseDto })
  async getTimeline(@CurrentUser() user: { id: string }) {
    return this.applicationService.getTimeline(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.applicationService.findById(id, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.applicationService.updateStatus(id, dto, user.id);
  }
}
