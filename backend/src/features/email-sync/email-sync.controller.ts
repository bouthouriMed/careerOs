import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../platform/auth/auth.guard';
import { CurrentUser } from '../../platform/auth/current-user.decorator';
import { EmailSyncService } from './email-sync.service';
import { SyncStatusResponseDto, StartSyncResponseDto } from './dto/sync-status-response.dto';

@ApiTags('Email Sync')
@Controller('email-sync')
@UseGuards(AuthGuard)
export class EmailSyncController {
  constructor(private readonly emailSyncService: EmailSyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get email sync status' })
  @ApiResponse({ status: 200, type: SyncStatusResponseDto })
  async getStatus(@CurrentUser() user: { id: string }) {
    return this.emailSyncService.getStatus(user.id);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start email sync' })
  @ApiResponse({ status: 200, type: StartSyncResponseDto })
  async startSync(@CurrentUser() user: { id: string }) {
    return this.emailSyncService.startSync(user.id);
  }
}
