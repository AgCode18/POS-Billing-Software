'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(!user ? '/login' : user.role === 'SUPER_ADMIN' ? '/super' : '/dashboard');
  }, [user, loading, router]);
  return null;
}
