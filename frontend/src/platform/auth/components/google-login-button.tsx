'use client';

import { Button } from '@/platform/design-system/components/Button';

export function GoogleLoginButton() {
  const handleLogin = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google/url`,
    );
    const data = await response.json();
    window.location.href = data.url;
  };

  return <Button onClick={handleLogin}>Continue with Google</Button>;
}
