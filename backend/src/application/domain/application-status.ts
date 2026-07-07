export enum ApplicationStatus {
  Draft = 'Draft',
  Applied = 'Applied',
  Screening = 'Screening',
  Interviewing = 'Interviewing',
  Offer = 'Offer',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Declined = 'Declined',
  Closed = 'Closed',
}

const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.Draft]: [ApplicationStatus.Applied],
  [ApplicationStatus.Applied]: [ApplicationStatus.Screening, ApplicationStatus.Rejected],
  [ApplicationStatus.Screening]: [ApplicationStatus.Interviewing, ApplicationStatus.Rejected],
  [ApplicationStatus.Interviewing]: [ApplicationStatus.Offer, ApplicationStatus.Rejected],
  [ApplicationStatus.Offer]: [ApplicationStatus.Accepted, ApplicationStatus.Declined],
  [ApplicationStatus.Accepted]: [ApplicationStatus.Closed],
  [ApplicationStatus.Rejected]: [ApplicationStatus.Closed],
  [ApplicationStatus.Declined]: [ApplicationStatus.Closed],
  [ApplicationStatus.Closed]: [],
};

export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

export function parseStatus(value: string): ApplicationStatus {
  const status = Object.values(ApplicationStatus).find((s) => s === value);
  if (!status) {
    throw new Error(`Invalid application status: ${value}`);
  }
  return status;
}
