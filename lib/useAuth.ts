import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from './auth';
import { roleToDefaultPath } from './utils';

export { roleToDefaultPath };

export function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = getAuth();
      if (auth?.user) {
        router.push(roleToDefaultPath(auth.user.role) || '/dashboard');
      }
    } catch {
      // Ignore localStorage error if any
    }
  }, [router]);
}

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = getAuth();
      if (!auth?.user) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);
}

