import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { JobService } from './job.service';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(AuthGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: 'Get jobs by company' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async findByCompany(@Query('companyId') companyId: string) {
    return this.jobService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  async findById(@Param('id') id: string) {
    return this.jobService.findById(id);
  }
}
