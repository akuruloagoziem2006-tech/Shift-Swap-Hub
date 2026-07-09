'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the new unified auth page
export default function Login() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-400">Redirecting...</div>
    </div>
  );
}
