import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  source!: string;

  @ApiPropertyOptional()
  jobId?: string;

  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  appliedAt?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ApplicationListResponseDto {
  @ApiProperty({ type: [ApplicationResponseDto] })
  applications!: ApplicationResponseDto[];

  @ApiProperty()
  total!: number;
}

export class TimelineEntryDto {
  @ApiProperty()
  date!: string;

  @ApiProperty({ type: [ApplicationResponseDto] })
  applications!: ApplicationResponseDto[];
}

export class TimelineResponseDto {
  @ApiProperty({ type: [TimelineEntryDto] })
  timeline!: TimelineEntryDto[];
}
