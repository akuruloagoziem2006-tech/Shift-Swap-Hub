import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { AuthProvider, useAuth } from "@/lib/auth-context";
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
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";

initTheme();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect to="/sign-in" />;
  return <AppShell>{children}</AppShell>;
}

function HomeRedirect() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Redirect to="/dashboard" />;
  return <LandingPage />;
}

function ShiftDetailRoute({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  return <ShiftDetailPage id={id} />;
}

function AuthQueryCacheInvalidator() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const prevUserIdRef = React.useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = session?.user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      qc.clear();
    }
    prevUserIdRef.current = userId;
  }, [session, qc]);

  return null;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
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
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
