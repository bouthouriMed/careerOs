import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { RecruiterService } from './recruiter.service';

@ApiTags('Recruiters')
@Controller('recruiters')
@UseGuards(AuthGuard)
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @Get()
  @ApiOperation({ summary: 'Get recruiters by company' })
  @ApiResponse({ status: 200, description: 'List of recruiters' })
  async findByCompany(@Query('companyId') companyId: string) {
    return this.recruiterService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recruiter by ID' })
  @ApiResponse({ status: 200, description: 'Recruiter details' })
  async findById(@Param('id') id: string) {
    return this.recruiterService.findById(id);
  }
}
