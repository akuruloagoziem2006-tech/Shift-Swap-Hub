import { Link } from "wouter";
import { Clock, MapPin, ArrowLeftRight, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMyRequests } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const statusConfig: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  pending: { icon: Hourglass, className: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", label: "Pending" },
  approved: { icon: CheckCircle, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive", label: "Rejected" },
};

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useListMyRequests();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Shifts you've applied to cover</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No applications yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Browse available shifts and apply to cover.</p>
          <Link to="/shifts">
            <Button className="mt-4" size="sm" data-testid="button-browse-from-requests">Browse shifts</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const cfg = statusConfig[req.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <Link to={`/shifts/${req.shiftId}`} key={req.id}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-all hover-elevate"
                  data-testid={`card-my-request-${req.id}`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">
                          {req.shift?.title ?? `Shift #${req.shiftId}`}
                        </h3>
                        <Badge variant="secondary" className={cn("text-xs gap-1", cfg.className)}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                      </div>
                      {req.shift && (
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ArrowLeftRight className="w-3 h-3" /> {req.shift.role}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {req.shift.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(req.shift.shiftDate)} · {req.shift.startTime}–{req.shift.endTime}
                          </span>
                        </div>
                      )}
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{req.message}"</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
