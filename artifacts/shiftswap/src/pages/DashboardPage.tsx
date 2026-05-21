import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeftRight,
  Bell,
  CheckCircle,
  Activity,
  PlusCircle,
  ArrowRight,
  Briefcase,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetDashboardStats,
  useGetRecentActivity,
} from "@workspace/api-client-react";

const activityIcons: Record<string, React.ReactNode> = {
  shift_posted: <PlusCircle className="w-4 h-4 text-primary" />,
  request_received: <Bell className="w-4 h-4 text-amber-500" />,
  request_approved: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  request_rejected: <ArrowLeftRight className="w-4 h-4 text-destructive" />,
  swap_completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const statCards = [
    {
      label: "Active Shifts",
      value: stats?.myActiveShifts ?? 0,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/my-shifts",
    },
    {
      label: "Incoming Requests",
      value: stats?.incomingRequests ?? 0,
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      href: "/my-shifts",
    },
    {
      label: "My Applications",
      value: stats?.outgoingRequests ?? 0,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/my-requests",
    },
    {
      label: "Swaps Completed",
      value: stats?.totalSwapsCompleted ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      href: "/my-requests",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"}.
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your shifts.</p>
        </div>
        <Link to="/shifts/new">
          <Button size="sm" className="gap-2 shrink-0" data-testid="button-post-shift-dashboard">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Shift</span>
          </Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
        All shift swaps require employer approval. ShiftSwap is not responsible for scheduling decisions.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link to={href} key={label}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow hover-elevate">
              <CardContent className="p-4">
                {statsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <>
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pro upgrade nudge */}
      {stats && !stats.isPro && (
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white text-sm">Unlock Pro — $49 lifetime</p>
            <p className="text-white/75 text-xs mt-0.5">Unlimited swaps, AI matching, advanced filters</p>
          </div>
          <Link to="/pricing">
            <Button size="sm" variant="secondary" className="shrink-0 gap-1.5" data-testid="button-upgrade-pro">
              Upgrade <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
            <Link to="/my-shifts">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !activity || activity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet.</p>
              <Link to="/shifts">
                <Button variant="link" size="sm" className="mt-2 text-xs">Browse available shifts</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0"
                  data-testid={`activity-item-${item.id}`}
                >
                  <div className="mt-0.5 shrink-0">{activityIcons[item.type] ?? <Activity className="w-4 h-4 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{timeAgo(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/shifts">
          <Card className="cursor-pointer hover:shadow-md transition-shadow hover-elevate">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Browse shifts</p>
                <p className="text-xs text-muted-foreground mt-0.5">Find shifts to cover near you</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/shifts/new">
          <Card className="cursor-pointer hover:shadow-md transition-shadow hover-elevate">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Post a shift</p>
                <p className="text-xs text-muted-foreground mt-0.5">Need someone to cover you?</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
