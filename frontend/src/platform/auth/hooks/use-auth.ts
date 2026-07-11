import {
  useAuthControllerGetCurrentUserQuery,
  useAuthControllerLogoutMutation,
} from '@/platform/api/rtk-query/generated/api';
import { User } from '../types';

export function useAuth() {
  const { data, isLoading, isError, isFetching } = useAuthControllerGetCurrentUserQuery();
  const currentUser = data as { user: User } | undefined;
  const [logoutMutation] = useAuthControllerLogoutMutation();

  const user: User | null = currentUser?.user ?? null;

  return {
    user,
    isAuthenticated: !isLoading && !isError && !!user,
    isLoading,
    isFetching,
    logout: logoutMutation,
  };
}
