import { Link } from "wouter";
import { PlusCircle, ArrowLeftRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListShifts } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusColors: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  filled: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function MyShiftsPage() {
  const { data: shifts, isLoading } = useListShifts({ mine: true });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Shifts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Shifts you've posted</p>
        </div>
        <Link to="/shifts/new">
          <Button size="sm" className="gap-2" data-testid="button-post-shift-my-shifts">
            <PlusCircle className="w-4 h-4" /> Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !shifts || shifts.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No shifts posted yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Post your first shift to get coverage.</p>
          <Link to="/shifts/new">
            <Button className="mt-4 gap-2" size="sm" data-testid="button-post-first-my-shift">
              <PlusCircle className="w-4 h-4" /> Post a shift
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <Link to={`/shifts/${shift.id}`} key={shift.id}>
              <Card
                className="cursor-pointer hover:shadow-md transition-all hover-elevate"
                data-testid={`card-my-shift-${shift.id}`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">{shift.title}</h3>
                      <Badge variant="secondary" className={cn("text-xs", statusColors[shift.status])}>
                        {shift.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3" /> {shift.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {shift.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(shift.shiftDate)} · {shift.startTime}–{shift.endTime}
                      </span>
                    </div>
                  </div>
                  {(shift.requestCount ?? 0) > 0 && (
                    <Badge variant="destructive" className="text-xs shrink-0">
                      {shift.requestCount} request{(shift.requestCount ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
