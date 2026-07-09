import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty() applicationId!: string;
  @ApiProperty({ enum: ['Phone', 'Video', 'Onsite', 'Technical', 'TakeHome', 'Final', 'Other'] })
  type!: string;
  @ApiProperty() scheduledAt!: string;
  @ApiPropertyOptional() durationMinutes?: number;
  @ApiPropertyOptional() location?: string;
  @ApiPropertyOptional() meetingUrl?: string;
  @ApiPropertyOptional() round?: string;
}

export class UpdateInterviewStatusDto {
  @ApiProperty({ enum: ['Scheduled', 'Completed', 'Cancelled', 'FeedbackReceived'] })
  status!: string;
}
