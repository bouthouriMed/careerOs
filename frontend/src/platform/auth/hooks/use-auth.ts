import { baseApi } from '@/platform/api/rtk-query/base-api';
import { User } from '../types';

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { user: User }) => response.user,
      providesTags: ['User'],
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCurrentUserQuery, useLogoutMutation } = authApi;

export function useAuth() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();
  const [logoutMutation] = useLogoutMutation();

  return {
    user: user ?? null,
    isAuthenticated: !isLoading && !isError && !!user,
    isLoading,
    logout: logoutMutation,
  };
}
