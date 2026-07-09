import { ApiProperty } from '@nestjs/swagger';

export class SyncStatusResponseDto {
  @ApiProperty({ enum: ['never_synced', 'pending', 'completed', 'error'] })
  status!: string;

  @ApiProperty()
  emailsScanned!: number;

  @ApiProperty()
  applicationsDetected!: number;

  @ApiProperty({ type: String, nullable: true })
  startedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  completedAt!: string | null;

  @ApiProperty({ nullable: true, required: false })
  errorMessage?: string;
}

export class StartSyncResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: ['never_synced', 'pending', 'completed', 'error'] })
  status!: string;
}
