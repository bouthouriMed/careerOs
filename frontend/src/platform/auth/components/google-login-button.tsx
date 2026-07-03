'use client';

import { Button } from '@/platform/design-system/components/Button';
import { useAuthControllerGetGoogleAuthUrlQuery } from '@/platform/api/rtk-query/generated/api';

export function GoogleLoginButton() {
  const { data } = useAuthControllerGetGoogleAuthUrlQuery();
  const authUrl = data as { url: string } | undefined;

  const handleLogin = () => {
    if (authUrl?.url) {
      window.location.href = authUrl.url;
    }
  };

  return <Button onClick={handleLogin}>Continue with Google</Button>;
}
