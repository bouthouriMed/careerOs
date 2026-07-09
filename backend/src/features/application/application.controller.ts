import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { ApplicationService } from './application.service';
import { CompanyService } from '../company/company.service';
import { JobService } from '../job/job.service';
import { ApplicationStatus } from '@prisma/client';
import { TimelineResponseDto, ApplicationDetailDto, UpdateStatusDto, ImportApplicationDto } from './dto/application-response.dto';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly companyService: CompanyService,
    private readonly jobService: JobService,
  ) {}

  @Post('import')
  @ApiOperation({ summary: 'Import an application from a URL (browser extension)' })
  @ApiResponse({ status: 201, description: 'Application created' })
  async import(
    @CurrentUser() user: { id: string },
    @Body() dto: ImportApplicationDto,
  ) {
    const company = await this.companyService.findOrCreate(
      dto.companyName,
      dto.companyDomain,
      dto.companyDescription,
    );

    const job = await this.jobService.findOrCreate(company.id, dto.jobTitle, {
      description: dto.jobDescription,
      location: dto.jobLocation,
      url: dto.sourceUrl,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      currency: dto.salaryCurrency,
      keywords: dto.keywords || [],
      source: dto.source,
    });

    const application = await this.applicationService.create({
      userId: user.id,
      companyId: company.id,
      jobId: job.id,
      source: dto.source,
    });

    return application;
  }

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
