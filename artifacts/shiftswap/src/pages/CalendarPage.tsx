import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListShifts } from "@workspace/api-client-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: shifts, isLoading } = useListShifts({ mine: true });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const shiftsOnDate = (dateKey: string) =>
    shifts?.filter((s) => s.shiftDate === dateKey) ?? [];

  const selectedShifts = selectedDate ? shiftsOnDate(selectedDate) : [];

  const hasShifts = (day: number) => shiftsOnDate(getDateKey(day)).length > 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your shifts at a glance</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-prev-month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold text-foreground">{MONTHS[viewMonth]} {viewYear}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {isLoading ? (
          <div className="p-4"><Skeleton className="h-48 w-full" /></div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-border/50 min-h-[60px]" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = getDateKey(day);
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              const isSelected = dateKey === selectedDate;
              const count = shiftsOnDate(dateKey).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={cn(
                    "border-b border-r border-border/50 min-h-[60px] p-1.5 text-left transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                    (firstDay + day - 1) % 7 === 6 ? "border-r-0" : ""
                  )}
                  data-testid={`calendar-day-${dateKey}`}
                >
                  <span className={cn(
                    "text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium",
                    isToday ? "bg-primary text-primary-foreground" :
                    isSelected ? "bg-primary/20 text-primary" :
                    "text-foreground"
                  )}>
                    {day}
                  </span>
                  {count > 0 && (
                    <div className="mt-1">
                      <span className="text-xs bg-primary/15 text-primary rounded px-1 font-medium">
                        {count}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day shifts */}
      {selectedDate && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric"
            })}
          </h3>
          {selectedShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shifts on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedShifts.map((shift) => (
                <Link to={`/shifts/${shift.id}`} key={shift.id}>
                  <Card className="cursor-pointer hover:shadow-md transition-all hover-elevate" data-testid={`calendar-shift-${shift.id}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{shift.title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shift.startTime}–{shift.endTime}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shift.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{shift.status}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
