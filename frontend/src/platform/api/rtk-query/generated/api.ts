import { baseApi as api } from '../base-api';
export const addTagTypes = ['Authentication', 'Health', 'Applications', 'Email Sync'] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authControllerGetGoogleAuthUrl: build.query<
        AuthControllerGetGoogleAuthUrlApiResponse,
        AuthControllerGetGoogleAuthUrlApiArg
      >({
        query: () => ({ url: `/auth/google/url` }),
        providesTags: ['Authentication'],
      }),
      authControllerHandleGoogleCallback: build.query<
        AuthControllerHandleGoogleCallbackApiResponse,
        AuthControllerHandleGoogleCallbackApiArg
      >({
        query: () => ({ url: `/auth/google/callback` }),
        providesTags: ['Authentication'],
      }),
      authControllerLogout: build.mutation<
        AuthControllerLogoutApiResponse,
        AuthControllerLogoutApiArg
      >({
        query: () => ({ url: `/auth/logout`, method: 'POST' }),
        invalidatesTags: ['Authentication'],
      }),
      authControllerGetCurrentUser: build.query<
        AuthControllerGetCurrentUserApiResponse,
        AuthControllerGetCurrentUserApiArg
      >({
        query: () => ({ url: `/auth/me` }),
        providesTags: ['Authentication'],
      }),
      healthControllerCheck: build.query<
        HealthControllerCheckApiResponse,
        HealthControllerCheckApiArg
      >({
        query: () => ({ url: `/health` }),
        providesTags: ['Health'],
      }),
      applicationControllerCreate: build.mutation<
        ApplicationControllerCreateApiResponse,
        ApplicationControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/applications`,
          method: 'POST',
          body: queryArg.createApplicationDto,
        }),
        invalidatesTags: ['Applications'],
      }),
      applicationControllerFindAll: build.query<
        ApplicationControllerFindAllApiResponse,
        ApplicationControllerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/applications`,
          params: { status: queryArg.status, source: queryArg.source },
        }),
        providesTags: ['Applications'],
      }),
      applicationControllerGetTimeline: build.query<
        ApplicationControllerGetTimelineApiResponse,
        ApplicationControllerGetTimelineApiArg
      >({
        query: () => ({ url: `/applications/timeline` }),
        providesTags: ['Applications'],
      }),
      applicationControllerFindById: build.query<
        ApplicationControllerFindByIdApiResponse,
        ApplicationControllerFindByIdApiArg
      >({
        query: (queryArg) => ({ url: `/applications/${queryArg.id}` }),
        providesTags: ['Applications'],
      }),
      applicationControllerUpdateStatus: build.mutation<
        ApplicationControllerUpdateStatusApiResponse,
        ApplicationControllerUpdateStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/applications/${queryArg.id}/status`,
          method: 'PATCH',
          body: queryArg.updateApplicationStatusDto,
        }),
        invalidatesTags: ['Applications'],
      }),
      emailSyncControllerStartSync: build.mutation<
        EmailSyncControllerStartSyncApiResponse,
        EmailSyncControllerStartSyncApiArg
      >({
        query: () => ({ url: `/email-sync/sync`, method: 'POST' }),
        invalidatesTags: ['Email Sync'],
      }),
      emailSyncControllerGetStatus: build.query<
        EmailSyncControllerGetStatusApiResponse,
        EmailSyncControllerGetStatusApiArg
      >({
        query: () => ({ url: `/email-sync/status` }),
        providesTags: ['Email Sync'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type AuthControllerGetGoogleAuthUrlApiResponse = unknown;
export type AuthControllerGetGoogleAuthUrlApiArg = void;
export type AuthControllerHandleGoogleCallbackApiResponse = unknown;
export type AuthControllerHandleGoogleCallbackApiArg = void;
export type AuthControllerLogoutApiResponse = unknown;
export type AuthControllerLogoutApiArg = void;
export type AuthControllerGetCurrentUserApiResponse = unknown;
export type AuthControllerGetCurrentUserApiArg = void;
export type HealthControllerCheckApiResponse = unknown;
export type HealthControllerCheckApiArg = void;
export type ApplicationControllerCreateApiResponse = /** status 201  */ ApplicationResponseDto;
export type ApplicationControllerCreateApiArg = {
  createApplicationDto: CreateApplicationDto;
};
export type ApplicationControllerFindAllApiResponse = /** status 200  */ ApplicationListResponseDto;
export type ApplicationControllerFindAllApiArg = {
  status: string;
  source: string;
};
export type ApplicationControllerGetTimelineApiResponse = /** status 200  */ TimelineResponseDto;
export type ApplicationControllerGetTimelineApiArg = void;
export type ApplicationControllerFindByIdApiResponse = /** status 200  */ ApplicationResponseDto;
export type ApplicationControllerFindByIdApiArg = {
  id: string;
};
export type ApplicationControllerUpdateStatusApiResponse =
  /** status 200  */ ApplicationResponseDto;
export type ApplicationControllerUpdateStatusApiArg = {
  id: string;
  updateApplicationStatusDto: UpdateApplicationStatusDto;
};
export type EmailSyncControllerStartSyncApiResponse = unknown;
export type EmailSyncControllerStartSyncApiArg = void;
export type EmailSyncControllerGetStatusApiResponse = EmailSyncStatusDto;
export type EmailSyncControllerGetStatusApiArg = void;
export type EmailSyncStatusDto = {
  status: 'never_synced' | 'pending' | 'in_progress' | 'completed' | 'failed';
  emailsScanned?: number;
  applicationsCreated?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
};
export type ApplicationResponseDto = {
  id: string;
  status: string;
  source: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  notes?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateApplicationDto = {
  jobId?: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  appliedAt?: string;
  source?: 'manual' | 'email';
};
export type ApplicationListResponseDto = {
  applications: ApplicationResponseDto[];
  total: number;
};
export type TimelineEntryDto = {
  date: string;
  applications: ApplicationResponseDto[];
};
export type TimelineResponseDto = {
  timeline: TimelineEntryDto[];
};
export type UpdateApplicationStatusDto = {
  status:
    | 'Draft'
    | 'Applied'
    | 'Screening'
    | 'Interviewing'
    | 'Offer'
    | 'Accepted'
    | 'Rejected'
    | 'Declined'
    | 'Closed';
};
export const {
  useAuthControllerGetGoogleAuthUrlQuery,
  useAuthControllerHandleGoogleCallbackQuery,
  useAuthControllerLogoutMutation,
  useAuthControllerGetCurrentUserQuery,
  useHealthControllerCheckQuery,
  useApplicationControllerCreateMutation,
  useApplicationControllerFindAllQuery,
  useApplicationControllerGetTimelineQuery,
  useApplicationControllerFindByIdQuery,
  useApplicationControllerUpdateStatusMutation,
  useEmailSyncControllerStartSyncMutation,
  useEmailSyncControllerGetStatusQuery,
} = injectedRtkApi;
