import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { InterviewService } from './interview.service';
import { CreateInterviewDto, UpdateInterviewStatusDto } from './dto/interview.dto';

@ApiTags('Interviews')
@Controller('interviews')
@UseGuards(AuthGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get()
  @ApiOperation({ summary: 'Get interviews (all or by application)' })
  @ApiResponse({ status: 200, type: [Object] })
  async find(
    @CurrentUser() user: { id: string },
    @Query('applicationId') applicationId?: string,
  ) {
    if (applicationId) {
      return this.interviewService.findByApplication(applicationId);
    }
    return this.interviewService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create interview' })
  @ApiResponse({ status: 201, description: 'Interview created' })
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewService.create({
      applicationId: dto.applicationId,
      type: dto.type as any,
      scheduledAt: dto.scheduledAt,
      durationMinutes: dto.durationMinutes,
      location: dto.location,
      meetingUrl: dto.meetingUrl,
      round: dto.round,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update interview status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInterviewStatusDto) {
    return this.interviewService.updateStatus(id, dto.status as any);
  }
}
