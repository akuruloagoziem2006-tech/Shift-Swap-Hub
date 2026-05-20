import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { queryClient } from "@/lib/queryClient";
import { initTheme } from "@/lib/theme";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import ShiftsPage from "@/pages/ShiftsPage";
import PostShiftPage from "@/pages/PostShiftPage";
import ShiftDetailPage from "@/pages/ShiftDetailPage";
import MyShiftsPage from "@/pages/MyShiftsPage";
import MyRequestsPage from "@/pages/MyRequestsPage";
import MessagesPage from "@/pages/MessagesPage";
import CalendarPage from "@/pages/CalendarPage";
import PricingPage from "@/pages/PricingPage";
import SettingsPage from "@/pages/SettingsPage";

initTheme();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  baseTheme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(175 84% 32%)",
    colorForeground: "hsl(222.2 84% 4.9%)",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222.2 84% 4.9%)",
    colorNeutral: "hsl(214.3 31.8% 91.4%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-white dark:bg-slate-950 rounded-2xl w-[440px] max-w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      {children}
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <Show when="signed-in" fallback={<Redirect to="/sign-in" />}>
      <AppShell>{children}</AppShell>
    </Show>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = React.useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ShiftDetailRoute({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  return <ShiftDetailPage id={id} />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?">
            <AuthPage>
              <SignIn
                routing="path"
                path={`${basePath}/sign-in`}
                signUpUrl={`${basePath}/sign-up`}
              />
            </AuthPage>
          </Route>
          <Route path="/sign-up/*?">
            <AuthPage>
              <SignUp
                routing="path"
                path={`${basePath}/sign-up`}
                signInUrl={`${basePath}/sign-in`}
              />
            </AuthPage>
          </Route>
          <Route path="/dashboard">
            <Protected><DashboardPage /></Protected>
          </Route>
          <Route path="/shifts/new">
            <Protected><PostShiftPage /></Protected>
          </Route>
          <Route path="/shifts/:id">
            {(params) => (
              <Protected><ShiftDetailRoute params={params} /></Protected>
            )}
          </Route>
          <Route path="/shifts">
            <Protected><ShiftsPage /></Protected>
          </Route>
          <Route path="/my-shifts">
            <Protected><MyShiftsPage /></Protected>
          </Route>
          <Route path="/my-requests">
            <Protected><MyRequestsPage /></Protected>
          </Route>
          <Route path="/messages">
            <Protected><MessagesPage /></Protected>
          </Route>
          <Route path="/calendar">
            <Protected><CalendarPage /></Protected>
          </Route>
          <Route path="/pricing">
            <Protected><PricingPage /></Protected>
          </Route>
          <Route path="/settings">
            <Protected><SettingsPage /></Protected>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
