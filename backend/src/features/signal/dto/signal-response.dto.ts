import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignalResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  confidence!: number;

  @ApiPropertyOptional()
  applicationId?: string;

  @ApiPropertyOptional()
  companyId?: string;

  @ApiProperty()
  surfaces!: string[];

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class SignalStatsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  active!: number;

  @ApiProperty()
  byType!: Record<string, number>;

  @ApiProperty()
  byPriority!: Record<string, number>;
}
