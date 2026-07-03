import { baseApi as api } from '../base-api';
export const addTagTypes = ['Authentication', 'Health'] as const;
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
export const {
  useAuthControllerGetGoogleAuthUrlQuery,
  useAuthControllerHandleGoogleCallbackQuery,
  useAuthControllerLogoutMutation,
  useAuthControllerGetCurrentUserQuery,
  useHealthControllerCheckQuery,
} = injectedRtkApi;
