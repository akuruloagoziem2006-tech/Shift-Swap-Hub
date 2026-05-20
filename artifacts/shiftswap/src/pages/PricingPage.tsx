import { useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  useGetDashboardStats,
  useCreateCheckoutSession,
  useVerifyCheckout,
  getGetDashboardStatsQueryKey,
  getGetMyProfileQueryKey,
  getVerifyCheckoutQueryKey,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const freeFeatures = [
  "3 shift swaps per month",
  "Basic search & filters",
  "In-app messaging",
  "Browse available shifts",
];

const proFeatures = [
  "Unlimited shift swaps",
  "Priority AI-powered matching",
  "Advanced filters (pay range, distance)",
  "Calendar export",
  "Applicant priority boost",
  "Early access to new shifts",
  "Priority support",
];

export default function PricingPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const { data: stats } = useGetDashboardStats();
  const createSession = useCreateCheckoutSession();
  const verifyParams = { session_id: sessionId ?? "" };
  const { data: verifyData } = useVerifyCheckout(verifyParams, {
    query: {
      enabled: !!sessionId,
      queryKey: getVerifyCheckoutQueryKey(verifyParams),
    },
  });

  useEffect(() => {
    if (verifyData?.success) {
      toast({ title: "Welcome to Pro!", description: "Your lifetime access is now active." });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
    }
  }, [verifyData?.success]);

  const handleCheckout = () => {
    const successUrl = `${window.location.origin}${basePath}/pricing`;
    const cancelUrl = `${window.location.origin}${basePath}/pricing`;
    createSession.mutate(
      { data: { successUrl, cancelUrl } },
      {
        onSuccess: (data) => {
          window.location.href = data.url;
        },
        onError: () => toast({ title: "Checkout failed. Try again.", variant: "destructive" }),
      }
    );
  };

  const isPro = stats?.isPro || verifyData?.isPro;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Simple pricing</h1>
        <p className="text-muted-foreground">Start free. Go Pro when you're ready.</p>
      </div>

      {isPro && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">You're on Pro Lifetime</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Enjoy unlimited swaps and all Pro features.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Free</h2>
              <div className="mt-2">
                <span className="text-3xl font-black text-foreground">$0</span>
                <span className="text-muted-foreground text-sm ml-1">forever</span>
              </div>
            </div>
            <ul className="space-y-2.5">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled data-testid="button-free-plan">
              Current plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-primary border-2 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              Best value
            </Badge>
          </div>
          <CardContent className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Pro</h2>
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-black text-foreground">$49</span>
                <span className="text-muted-foreground text-sm ml-1">one-time, lifetime</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pay once. Use forever. No subscription.</p>
            </div>
            <ul className="space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button disabled className="w-full gap-2">
                <CheckCircle className="w-4 h-4" /> Active
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={handleCheckout}
                disabled={createSession.isPending}
                data-testid="button-checkout-pro"
              >
                {createSession.isPending ? "Loading..." : (
                  <><Zap className="w-4 h-4" /> Upgrade to Pro <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          All shift swaps require employer approval. ShiftSwap is not responsible for scheduling decisions.
          Secure payment via Stripe. Refund policy: contact support within 7 days.
        </p>
      </div>
    </div>
  );
}
