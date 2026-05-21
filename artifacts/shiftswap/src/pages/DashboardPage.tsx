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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetDashboardStats,
  useGetRecentActivity,
} from "@workspace/api-client-react";

const activityIcons: Record<string, React.ReactNode> = {
  shift_posted: <PlusCircle className="w-4 h-4 text-teal-500" />,
  request_received: <Bell className="w-4 h-4 text-amber-400" />,
  request_approved: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  request_rejected: <ArrowLeftRight className="w-4 h-4 text-red-400" />,
  swap_completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
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

const statCards = [
  {
    label: "Active Shifts",
    key: "myActiveShifts" as const,
    icon: Briefcase,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-600/15",
    href: "/my-shifts",
  },
  {
    label: "Incoming Requests",
    key: "incomingRequests" as const,
    icon: Bell,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    href: "/my-shifts",
  },
  {
    label: "My Applications",
    key: "outgoingRequests" as const,
    icon: Clock,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    href: "/my-requests",
  },
  {
    label: "Swaps Completed",
    key: "totalSwapsCompleted" as const,
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    href: "/my-requests",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">
            {greeting}, {firstName}.
          </h1>
          <p className="text-zinc-400 text-lg mt-1">
            Here's what's happening with your shifts.
          </p>
        </div>
        <Link to="/shifts/new">
          <Button
            className="gap-2 shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-post-shift-dashboard"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Shift</span>
          </Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-sm text-amber-300">
        All shift swaps require employer approval. ShiftSwap is not responsible for scheduling decisions.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, key, icon: Icon, iconColor, iconBg, href }) => (
          <Link to={href} key={label}>
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 cursor-pointer hover:border-zinc-600 hover:bg-zinc-750 transition-all">
              {statsLoading ? (
                <Skeleton className="h-16 w-full bg-zinc-700" />
              ) : (
                <>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.[key] ?? 0}</div>
                  <div className="text-sm text-zinc-400 mt-1">{label}</div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pro upgrade nudge */}
      {stats && !stats.isPro && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-lg">Unlock Pro — $49 lifetime</p>
            <p className="text-teal-100 text-sm mt-0.5">Unlimited swaps, AI matching, advanced filters</p>
          </div>
          <Link to="/pricing">
            <Button
              size="sm"
              className="shrink-0 gap-1.5 bg-white text-teal-700 hover:bg-zinc-100 font-semibold"
              data-testid="button-upgrade-pro"
            >
              Upgrade <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Recent Activity
          </h2>
          <Link to="/my-shifts">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1 text-sm">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="px-6 py-4">
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-zinc-700" />
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No activity yet.</p>
              <Link to="/shifts">
                <Button variant="link" size="sm" className="mt-2 text-teal-400 hover:text-teal-300 text-sm">
                  Browse available shifts
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-3 border-b border-zinc-700/50 last:border-0"
                  data-testid={`activity-item-${item.id}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {activityIcons[item.type] ?? <Activity className="w-4 h-4 text-zinc-500" />}
                  </div>
                  <p className="flex-1 text-sm text-zinc-300 leading-snug">{item.description}</p>
                  <span className="text-xs text-zinc-500 shrink-0 tabular-nums">{timeAgo(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/shifts">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-zinc-600 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-teal-600/15 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Browse shifts</p>
              <p className="text-sm text-zinc-400 mt-0.5">Find shifts to cover near you</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 ml-auto group-hover:text-zinc-300 transition-colors" />
          </div>
        </Link>
        <Link to="/shifts/new">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-zinc-600 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Post a shift</p>
              <p className="text-sm text-zinc-400 mt-0.5">Need someone to cover you?</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 ml-auto group-hover:text-zinc-300 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
