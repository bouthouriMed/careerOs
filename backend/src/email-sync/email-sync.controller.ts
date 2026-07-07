import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../platform/auth/auth.guard';
import { CurrentUser } from '../platform/auth/current-user.decorator';
import { PrismaService } from '../platform/prisma/prisma.service';
import { EmailSyncService } from './email-sync.service';
import { EmailSyncStatusDto } from './dto/email-sync-status.dto';

@ApiTags('Email Sync')
@Controller('email-sync')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EmailSyncController {
  constructor(
    private readonly emailSyncService: EmailSyncService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: 'Start initial email sync from Gmail' })
  @ApiResponse({ status: 201, description: 'Sync completed' })
  async startSync(@CurrentUser() user: { id: string }): Promise<{ emailsScanned: number; applicationsCreated: number; syncDurationMs: number }> {
    return this.emailSyncService.sync(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get latest email sync status' })
  @ApiResponse({ status: 200, type: EmailSyncStatusDto })
  async getStatus(@CurrentUser() user: { id: string }): Promise<EmailSyncStatusDto | { status: string }> {
    const sync = await this.prisma.emailSync.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
    });

    if (!sync) {
      return { status: 'never_synced' };
    }

    return {
      status: sync.status,
      emailsScanned: sync.emailsScanned,
      applicationsCreated: sync.applicationsCreated,
      error: sync.error,
      startedAt: sync.startedAt,
      completedAt: sync.completedAt,
    };
  }
}
