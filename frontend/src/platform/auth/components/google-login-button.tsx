'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/platform/i18n/use-translation';
import { Button } from '@/platform/design-system/components/Button';
import { useAuthControllerGetGoogleAuthUrlQuery } from '@/platform/api/rtk-query/generated/api';

export function GoogleLoginButton() {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, refetch } = useAuthControllerGetGoogleAuthUrlQuery();
  const authUrl = data as { url: string } | undefined;

  const handleLogin = useCallback(() => {
    if (authUrl?.url) {
      window.location.href = authUrl.url;
      return;
    }
    refetch().then((result) => {
      const url = (result.data as { url: string } | undefined)?.url;
      if (url) {
        window.location.href = url;
      }
    });
  }, [authUrl, refetch]);

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      fullWidth
      loading={isLoading || isFetching}
      disabled={isLoading || isFetching}
    >
      {t('platform.auth.login.cta.button')}
    </Button>
  );
}
