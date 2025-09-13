'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NavBar from './NavBar';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedWrapper({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}