'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FloatingShuttlecocks } from '@/components/FloatingShuttlecocks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sl-bg relative">
        <FloatingShuttlecocks />
        <div className="text-center z-10 space-y-4">
          <div className="text-6xl animate-bounce" style={{ animationDuration: '0.8s' }}>
            🏸
          </div>
          <p
            className="text-xl font-extrabold text-stroke text-sl-green"
            style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}
          >
            ENTERING THE COURT...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevents flashing dashboard before redirecting
  }

  return (
    <div className="min-h-screen bg-sl-bg flex flex-col relative w-full">
      <FloatingShuttlecocks />
      <div className="flex-1 w-full relative z-10">{children}</div>
    </div>
  );
}
