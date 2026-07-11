import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { SignalService } from './signal.service';
import { SignalResponseDto, SignalStatsDto } from './dto/signal-response.dto';

@ApiTags('Signals')
@Controller('signals')
@UseGuards(AuthGuard)
export class SignalController {
  constructor(private readonly signalService: SignalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all signals for current user' })
  @ApiResponse({ status: 200, type: [SignalResponseDto] })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
  ) {
    return this.signalService.findAll(user.id, status as any);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active signals for current user' })
  @ApiResponse({ status: 200, type: [SignalResponseDto] })
  async findActive(@CurrentUser() user: { id: string }) {
    return this.signalService.findActive(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get signal statistics' })
  @ApiResponse({ status: 200, type: SignalStatsDto })
  async getStats(@CurrentUser() user: { id: string }) {
    return this.signalService.getStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal detail' })
  @ApiResponse({ status: 200, type: SignalResponseDto })
  async findById(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.signalService.findById(id, user.id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a signal' })
  @ApiResponse({ status: 200, description: 'Signal dismissed' })
  async dismiss(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    await this.signalService.dismiss(id, user.id);
    return { message: 'Signal dismissed' };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a signal as completed' })
  @ApiResponse({ status: 200, description: 'Signal completed' })
  async complete(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    await this.signalService.complete(id, user.id);
    return { message: 'Signal completed' };
  }
}
