'use client';

import { ProtectedRoute } from '@/platform/routing/protected-route';
import { useAuth } from '@/platform/auth/hooks/use-auth';

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <main>
      <div>
        <h1>Dashboard</h1>
        {user && <p>Welcome, {user.name || user.email}</p>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
