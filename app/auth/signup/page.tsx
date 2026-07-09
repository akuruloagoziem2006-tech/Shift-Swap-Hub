'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the new unified auth page with signup tab active
export default function Signup() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth?tab=signup');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-400">Redirecting...</div>
    </div>
  );
}
