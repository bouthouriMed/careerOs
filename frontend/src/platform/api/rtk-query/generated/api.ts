import { api } from '../base-api';
export const addTagTypes = [
  'Authentication',
  'Health',
  'Email Sync',
  'Companies',
  'Jobs',
  'Recruiters',
  'Applications',
  'Interviews',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authControllerGetGoogleAuthUrl: build.query<
        AuthControllerGetGoogleAuthUrlResponse,
        AuthControllerGetGoogleAuthUrlArg
      >({
        query: () => ({ url: `/auth/google/url` }),
        providesTags: ['Authentication'],
      }),
      authControllerHandleGoogleCallback: build.query<
        AuthControllerHandleGoogleCallbackResponse,
        AuthControllerHandleGoogleCallbackArg
      >({
        query: () => ({ url: `/auth/google/callback` }),
        providesTags: ['Authentication'],
      }),
      authControllerLogout: build.mutation<AuthControllerLogoutResponse, AuthControllerLogoutArg>({
        query: () => ({ url: `/auth/logout`, method: 'POST' }),
        invalidatesTags: ['Authentication'],
      }),
      authControllerGetCurrentUser: build.query<
        AuthControllerGetCurrentUserResponse,
        AuthControllerGetCurrentUserArg
      >({
        query: () => ({ url: `/auth/me` }),
        providesTags: ['Authentication'],
      }),
      healthControllerCheck: build.query<HealthControllerCheckResponse, HealthControllerCheckArg>({
        query: () => ({ url: `/health` }),
        providesTags: ['Health'],
      }),
      emailSyncControllerGetStatus: build.query<
        EmailSyncControllerGetStatusResponse,
        EmailSyncControllerGetStatusArg
      >({
        query: () => ({ url: `/email-sync/status` }),
        providesTags: ['Email Sync'],
      }),
      emailSyncControllerStartSync: build.mutation<
        EmailSyncControllerStartSyncResponse,
        EmailSyncControllerStartSyncArg
      >({
        query: () => ({ url: `/email-sync/start`, method: 'POST' }),
        invalidatesTags: ['Email Sync'],
      }),
      companyControllerFindAll: build.query<
        CompanyControllerFindAllResponse,
        CompanyControllerFindAllArg
      >({
        query: () => ({ url: `/companies` }),
        providesTags: ['Companies'],
      }),
      companyControllerFindById: build.query<
        CompanyControllerFindByIdResponse,
        CompanyControllerFindByIdArg
      >({
        query: (queryArg) => ({ url: `/companies/${queryArg}` }),
        providesTags: ['Companies'],
      }),
      jobControllerFindByCompany: build.query<
        JobControllerFindByCompanyResponse,
        JobControllerFindByCompanyArg
      >({
        query: (queryArg) => ({ url: `/jobs`, params: { companyId: queryArg } }),
        providesTags: ['Jobs'],
      }),
      jobControllerFindById: build.query<JobControllerFindByIdResponse, JobControllerFindByIdArg>({
        query: (queryArg) => ({ url: `/jobs/${queryArg}` }),
        providesTags: ['Jobs'],
      }),
      recruiterControllerFindByCompany: build.query<
        RecruiterControllerFindByCompanyResponse,
        RecruiterControllerFindByCompanyArg
      >({
        query: (queryArg) => ({ url: `/recruiters`, params: { companyId: queryArg } }),
        providesTags: ['Recruiters'],
      }),
      recruiterControllerFindById: build.query<
        RecruiterControllerFindByIdResponse,
        RecruiterControllerFindByIdArg
      >({
        query: (queryArg) => ({ url: `/recruiters/${queryArg}` }),
        providesTags: ['Recruiters'],
      }),
      applicationControllerFindAll: build.query<
        ApplicationControllerFindAllResponse,
        ApplicationControllerFindAllArg
      >({
        query: (queryArg) => ({ url: `/applications`, params: { status: queryArg } }),
        providesTags: ['Applications'],
      }),
      applicationControllerGetTimeline: build.query<
        ApplicationControllerGetTimelineResponse,
        ApplicationControllerGetTimelineArg
      >({
        query: () => ({ url: `/applications/timeline` }),
        providesTags: ['Applications'],
      }),
      applicationControllerFindById: build.query<
        ApplicationControllerFindByIdResponse,
        ApplicationControllerFindByIdArg
      >({
        query: (queryArg) => ({ url: `/applications/${queryArg}` }),
        providesTags: ['Applications'],
      }),
      applicationControllerUpdateStatus: build.mutation<
        ApplicationControllerUpdateStatusResponse,
        ApplicationControllerUpdateStatusArg
      >({
        query: (queryArg) => ({
          url: `/applications/${queryArg.id}/status`,
          method: 'PATCH',
          body: queryArg.updateStatusDto,
        }),
        invalidatesTags: ['Applications'],
      }),
      interviewControllerFindByApplication: build.query<
        InterviewControllerFindByApplicationResponse,
        InterviewControllerFindByApplicationArg
      >({
        query: (queryArg) => ({ url: `/interviews`, params: { applicationId: queryArg } }),
        providesTags: ['Interviews'],
      }),
      interviewControllerCreate: build.mutation<
        InterviewControllerCreateResponse,
        InterviewControllerCreateArg
      >({
        query: (queryArg) => ({ url: `/interviews`, method: 'POST', body: queryArg }),
        invalidatesTags: ['Interviews'],
      }),
      interviewControllerUpdateStatus: build.mutation<
        InterviewControllerUpdateStatusResponse,
        InterviewControllerUpdateStatusArg
      >({
        query: (queryArg) => ({
          url: `/interviews/${queryArg.id}/status`,
          method: 'PATCH',
          body: queryArg.updateInterviewStatusDto,
        }),
        invalidatesTags: ['Interviews'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type AuthControllerGetGoogleAuthUrlResponse = unknown;
export type AuthControllerGetGoogleAuthUrlArg = void;
export type AuthControllerHandleGoogleCallbackResponse = unknown;
export type AuthControllerHandleGoogleCallbackArg = void;
export type AuthControllerLogoutResponse = unknown;
export type AuthControllerLogoutArg = void;
export type AuthControllerGetCurrentUserResponse = unknown;
export type AuthControllerGetCurrentUserArg = void;
export type HealthControllerCheckResponse = unknown;
export type HealthControllerCheckArg = void;
export type EmailSyncControllerGetStatusResponse = /** status 200  */ SyncStatusResponseDto;
export type EmailSyncControllerGetStatusArg = void;
export type EmailSyncControllerStartSyncResponse = /** status 200  */ StartSyncResponseDto;
export type EmailSyncControllerStartSyncArg = void;
export type CompanyControllerFindAllResponse = unknown;
export type CompanyControllerFindAllArg = void;
export type CompanyControllerFindByIdResponse = unknown;
export type CompanyControllerFindByIdArg = string;
export type JobControllerFindByCompanyResponse = unknown;
export type JobControllerFindByCompanyArg = string;
export type JobControllerFindByIdResponse = unknown;
export type JobControllerFindByIdArg = string;
export type RecruiterControllerFindByCompanyResponse = unknown;
export type RecruiterControllerFindByCompanyArg = string;
export type RecruiterControllerFindByIdResponse = unknown;
export type RecruiterControllerFindByIdArg = string;
export type ApplicationControllerFindAllResponse = /** status 200  */ object[];
export type ApplicationControllerFindAllArg = string;
export type ApplicationControllerGetTimelineResponse = /** status 200  */ TimelineResponseDto;
export type ApplicationControllerGetTimelineArg = void;
export type ApplicationControllerFindByIdResponse = /** status 200  */ ApplicationDetailDto;
export type ApplicationControllerFindByIdArg = string;
export type ApplicationControllerUpdateStatusResponse = unknown;
export type ApplicationControllerUpdateStatusArg = {
  id: string;
  updateStatusDto: UpdateStatusDto;
};
export type InterviewControllerFindByApplicationResponse = /** status 200  */ object[];
export type InterviewControllerFindByApplicationArg = string;
export type InterviewControllerCreateResponse = unknown;
export type InterviewControllerCreateArg = CreateInterviewDto;
export type InterviewControllerUpdateStatusResponse = unknown;
export type InterviewControllerUpdateStatusArg = {
  id: string;
  updateInterviewStatusDto: UpdateInterviewStatusDto;
};
export type SyncStatusResponseDto = {
  status: 'never_synced' | 'pending' | 'completed' | 'error';
  emailsScanned: number;
  applicationsDetected: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage?: string | null;
};
export type StartSyncResponseDto = {
  message: string;
  status: 'never_synced' | 'pending' | 'completed' | 'error';
};
export type RecruiterRefDto = {
  id: string;
  name: string;
  email: string | null;
};
export type ApplicationListItemDto = {
  id: string;
  status: string;
  companyName: string;
  companyDomain: string | null;
  companyLogo: string | null;
  jobTitle: string | null;
  createdAt: string;
  recruiter: RecruiterRefDto | null;
};
export type TimelineEntryDto = {
  date: string;
  applications: ApplicationListItemDto[];
};
export type TimelineResponseDto = {
  timeline: TimelineEntryDto[];
};
export type CompanyRefDto = {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
};
export type JobRefDto = {
  id: string;
  title: string;
  location: string | null;
};
export type ContactRefDto = {
  role: string;
  recruiter: RecruiterRefDto;
};
export type InterviewRefDto = {
  id: string;
  scheduledAt: string;
  type: string;
  status: string;
};
export type ApplicationDetailDto = {
  id: string;
  status: string;
  company: CompanyRefDto;
  job: JobRefDto | null;
  contacts: ContactRefDto[];
  interviews: InterviewRefDto[];
  createdAt: string;
  updatedAt: string;
};
export type UpdateStatusDto = {
  status:
    | 'Saved'
    | 'Applied'
    | 'Screening'
    | 'Interviewing'
    | 'Offer'
    | 'Accepted'
    | 'Declined'
    | 'Rejected'
    | 'Closed';
};
export type CreateInterviewDto = {
  applicationId: string;
  type: 'Phone' | 'Video' | 'Onsite' | 'Technical' | 'TakeHome' | 'Final' | 'Other';
  scheduledAt: string;
  durationMinutes?: number;
  location?: string;
  meetingUrl?: string;
  round?: string;
};
export type UpdateInterviewStatusDto = {
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'FeedbackReceived';
};
export const {
  useAuthControllerGetGoogleAuthUrlQuery,
  useAuthControllerHandleGoogleCallbackQuery,
  useAuthControllerLogoutMutation,
  useAuthControllerGetCurrentUserQuery,
  useHealthControllerCheckQuery,
  useEmailSyncControllerGetStatusQuery,
  useEmailSyncControllerStartSyncMutation,
  useCompanyControllerFindAllQuery,
  useCompanyControllerFindByIdQuery,
  useJobControllerFindByCompanyQuery,
  useJobControllerFindByIdQuery,
  useRecruiterControllerFindByCompanyQuery,
  useRecruiterControllerFindByIdQuery,
  useApplicationControllerFindAllQuery,
  useApplicationControllerGetTimelineQuery,
  useApplicationControllerFindByIdQuery,
  useApplicationControllerUpdateStatusMutation,
  useInterviewControllerFindByApplicationQuery,
  useInterviewControllerCreateMutation,
  useInterviewControllerUpdateStatusMutation,
} = injectedRtkApi;
