'use client';

import { GoogleLoginButton } from '@/platform/auth/components/google-login-button';

export default function LoginPage() {
  return (
    <main>
      <div>
        <h1>CareerOS</h1>
        <p>Your intelligent career operating system</p>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
