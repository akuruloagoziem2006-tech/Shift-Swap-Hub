import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/sign-in");
      }
    });
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm bg-zinc-900 rounded-3xl border border-zinc-800 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-3xl select-none">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Sign in failed</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
          <button
            onClick={() => navigate("/sign-in")}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-zinc-400">Completing sign in...</p>
      </div>
    </div>
  );
}
