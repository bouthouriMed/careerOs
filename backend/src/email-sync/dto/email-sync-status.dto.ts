import { ApiProperty } from '@nestjs/swagger';

export class EmailSyncStatusDto {
  @ApiProperty({ example: 'completed' })
  status!: string;

  @ApiProperty({ example: 150 })
  emailsScanned!: number;

  @ApiProperty({ example: 12 })
  applicationsCreated!: number;

  @ApiProperty({ example: null, required: false })
  error?: string | null;

  @ApiProperty({ example: '2026-07-03T15:00:00.000Z' })
  startedAt!: Date;

  @ApiProperty({ example: '2026-07-03T15:01:00.000Z', required: false })
  completedAt?: Date | null;
}
