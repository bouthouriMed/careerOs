import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CompanyRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: String, nullable: true }) domain!: string | null;
  @ApiProperty({ type: String, nullable: true }) logoUrl!: string | null;
}

class JobRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
}

class RecruiterRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
}

class ContactRefDto {
  @ApiProperty() role!: string;
  @ApiProperty({ type: RecruiterRefDto }) recruiter!: RecruiterRefDto;
}

class InterviewRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() scheduledAt!: Date;
  @ApiProperty() type!: string;
  @ApiProperty() status!: string;
}

export class ApplicationListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
  @ApiProperty() companyName!: string;
  @ApiProperty({ type: String, nullable: true }) companyDomain!: string | null;
  @ApiProperty({ type: String, nullable: true }) companyLogo!: string | null;
  @ApiProperty({ type: String, nullable: true }) jobTitle!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true, type: RecruiterRefDto })
  recruiter!: RecruiterRefDto | null;
}

export class TimelineEntryDto {
  @ApiProperty() date!: string;
  @ApiProperty({ type: [ApplicationListItemDto] })
  applications!: ApplicationListItemDto[];
}

export class TimelineResponseDto {
  @ApiProperty({ type: [TimelineEntryDto] })
  timeline!: TimelineEntryDto[];
}

export class ApplicationDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: CompanyRefDto }) company!: CompanyRefDto;
  @ApiProperty({ nullable: true, type: JobRefDto }) job!: JobRefDto | null;
  @ApiProperty({ type: [ContactRefDto] }) contacts!: ContactRefDto[];
  @ApiProperty({ type: [InterviewRefDto] }) interviews!: InterviewRefDto[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ['Saved', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Declined', 'Rejected', 'Closed'] })
  status!: string;
}

export class ImportApplicationDto {
  @ApiProperty()
  sourceUrl!: string;

  @ApiProperty()
  companyName!: string;

  @ApiPropertyOptional()
  companyDomain?: string;

  @ApiPropertyOptional()
  companyDescription?: string;

  @ApiProperty()
  jobTitle!: string;

  @ApiPropertyOptional()
  jobDescription?: string;

  @ApiPropertyOptional()
  jobLocation?: string;

  @ApiPropertyOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  salaryMax?: number;

  @ApiPropertyOptional()
  salaryCurrency?: string;

  @ApiPropertyOptional()
  jobType?: string;

  @ApiPropertyOptional({ isArray: true, type: String })
  keywords?: string[];

  @ApiPropertyOptional()
  applicationDeadline?: string;

  @ApiProperty({ default: 'browser_extension' })
  source!: string;
}
