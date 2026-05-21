import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeftRight,
  PlusCircle,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListShifts } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const roleOptions = [
  "All roles",
  "Nurse",
  "Doctor",
  "Retail Associate",
  "Warehouse Associate",
  "Security Guard",
  "Cashier",
  "Delivery Driver",
  "Server",
  "Cook",
];

const typeLabels: Record<string, string> = {
  swap: "Swap",
  cover: "Cover",
  drop: "Drop",
};

const statusColors: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  filled: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function ShiftsPage() {
  const { user } = useUser();
  const [roleFilter, setRoleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: shifts, isLoading } = useListShifts({
    role: roleFilter || undefined,
    shiftType: (typeFilter as "swap" | "cover" | "drop") || undefined,
  });

  const filtered = shifts?.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse Shifts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Find shifts to cover or swap near you</p>
        </div>
        <Link to="/shifts/new">
          <Button size="sm" className="gap-2 shrink-0" data-testid="button-post-shift-browse">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-shifts"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === "All roles" ? "" : v)}>
          <SelectTrigger className="w-40" data-testid="select-role-filter">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36" data-testid="select-type-filter">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="swap">Swap</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="drop">Drop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && filtered && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} shift{filtered.length !== 1 ? "s" : ""} available
        </p>
      )}

      {/* Shift cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold">No shifts found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or post one yourself.</p>
          <Link to="/shifts/new">
            <Button className="mt-4 gap-2" size="sm" data-testid="button-post-first-shift">
              <PlusCircle className="w-4 h-4" /> Post a shift
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((shift) => (
            <Link to={`/shifts/${shift.id}`} key={shift.id}>
              <Card
                className="cursor-pointer hover:shadow-md transition-all duration-150 hover-elevate border-border"
                data-testid={`card-shift-${shift.id}`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm truncate">{shift.title}</h3>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs shrink-0", shift.shiftType === "swap" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400")}
                      >
                        {typeLabels[shift.shiftType]}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs shrink-0", statusColors[shift.status])}>
                        {shift.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                      {shift.hourlyRate && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <DollarSign className="w-3 h-3" /> ${shift.hourlyRate}/hr
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    {shift.poster && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={shift.poster.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {shift.poster.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {shift.poster.displayName}
                        </span>
                      </div>
                    )}
                    {(shift.requestCount ?? 0) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {shift.requestCount} applicant{(shift.requestCount ?? 0) !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
