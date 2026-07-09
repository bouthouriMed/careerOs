import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { ApplicationService } from './application.service';
import { ApplicationStatus } from '@prisma/client';
import { TimelineResponseDto, ApplicationDetailDto, UpdateStatusDto } from './dto/application-response.dto';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications for current user' })
  @ApiResponse({ status: 200, type: [Object] })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
  ) {
    return this.applicationService.findAll(user.id, status as ApplicationStatus | undefined);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get applications grouped by date' })
  @ApiResponse({ status: 200, type: TimelineResponseDto })
  async getTimeline(@CurrentUser() user: { id: string }) {
    const timeline = await this.applicationService.getTimeline(user.id);
    return { timeline };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application detail' })
  @ApiResponse({ status: 200, type: ApplicationDetailDto })
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.applicationService.findById(id, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    await this.applicationService.updateStatus(id, user.id, dto.status as ApplicationStatus);
    return { message: 'Status updated' };
  }
}
