import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin, Clock, DollarSign, ArrowLeftRight, User, MessageSquare,
  CheckCircle, XCircle, Loader2, ArrowLeft, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useGetShift,
  useListShiftRequests,
  useCreateShiftRequest,
  useApproveRequest,
  useRejectRequest,
  useDeleteShift,
  getGetShiftQueryKey,
  getListShiftRequestsQueryKey,
  getListShiftsQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Props { id: number }

export default function ShiftDetailPage({ id }: Props) {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [applyMsg, setApplyMsg] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: shift, isLoading } = useGetShift(id, {
    query: { queryKey: getGetShiftQueryKey(id) },
  });
  const { data: requests } = useListShiftRequests(id, {
    query: { enabled: !!shift && shift.clerkUserId === user?.id, queryKey: getListShiftRequestsQueryKey(id) },
  });
  const createRequest = useCreateShiftRequest();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();
  const deleteShift = useDeleteShift();

  const isOwner = user?.id === shift?.clerkUserId;
  const alreadyApplied = false; // Could track this

  const handleApply = () => {
    createRequest.mutate(
      { id, data: { message: applyMsg || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Application sent!", description: "The shift owner will review your request." });
          setShowApplyForm(false);
          setApplyMsg("");
          queryClient.invalidateQueries({ queryKey: getGetShiftQueryKey(id) });
        },
        onError: () => toast({ title: "Failed to apply", variant: "destructive" }),
      }
    );
  };

  const handleApprove = (requestId: number) => {
    approveRequest.mutate(
      { id: requestId },
      {
        onSuccess: () => {
          toast({ title: "Request approved!" });
          queryClient.invalidateQueries({ queryKey: getListShiftRequestsQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetShiftQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
      }
    );
  };

  const handleReject = (requestId: number) => {
    rejectRequest.mutate(
      { id: requestId },
      {
        onSuccess: () => {
          toast({ title: "Request rejected." });
          queryClient.invalidateQueries({ queryKey: getListShiftRequestsQueryKey(id) });
        },
        onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    deleteShift.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Shift deleted." });
          queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
          navigate("/my-shifts");
        },
        onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
      }
    );
  };

  const getConversationId = (otherUserId: string) => {
    const ids = [user!.id, otherUserId].sort();
    return ids.join("_");
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Shift not found.</p>
        <Button variant="link" onClick={() => navigate("/shifts")}>Back to shifts</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/shifts")}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          data-testid="button-back-shift-detail"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1 truncate">{shift.title}</h1>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive gap-1.5"
            onClick={handleDelete}
            disabled={deleteShift.isPending}
            data-testid="button-delete-shift"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={cn(
              "text-sm",
              shift.shiftType === "swap" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            )}>
              {shift.shiftType === "swap" ? "Swap" : "Cover"}
            </Badge>
            <Badge variant="outline" className={cn(
              "text-sm",
              shift.status === "open" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400" : ""
            )}>
              {shift.status}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ArrowLeftRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">{shift.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">{shift.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {formatDate(shift.shiftDate)}<br />
                  <span className="text-muted-foreground">{shift.startTime} – {shift.endTime}</span>
                </span>
              </div>
              {shift.hourlyRate && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">${shift.hourlyRate}/hr</span>
                </div>
              )}
            </div>

            {shift.poster && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={shift.poster.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {shift.poster.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-sm">{shift.poster.displayName}</p>
                  <p className="text-xs text-muted-foreground">{shift.poster.jobRole}</p>
                  {shift.poster.location && (
                    <p className="text-xs text-muted-foreground">{shift.poster.location}</p>
                  )}
                  {!isOwner && user && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs gap-1 mt-1"
                      onClick={() => navigate(`/messages?with=${shift.poster!.clerkUserId}`)}
                      data-testid="button-message-poster"
                    >
                      <MessageSquare className="w-3 h-3" /> Message
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {shift.notes && (
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{shift.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply section */}
      {!isOwner && shift.status === "open" && (
        <Card>
          <CardContent className="pt-5">
            {!showApplyForm ? (
              <Button
                className="w-full"
                onClick={() => setShowApplyForm(true)}
                data-testid="button-apply-shift"
              >
                Apply for this shift
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Send a message (optional)</p>
                <Textarea
                  value={applyMsg}
                  onChange={(e) => setApplyMsg(e.target.value)}
                  placeholder="Tell the shift owner a bit about yourself or ask a question..."
                  rows={3}
                  className="resize-none"
                  data-testid="textarea-apply-message"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApply}
                    disabled={createRequest.isPending}
                    className="flex-1"
                    data-testid="button-submit-application"
                  >
                    {createRequest.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : "Send Application"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requests section (owner only) */}
      {isOwner && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Applications ({requests?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!requests || requests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg"
                    data-testid={`card-request-${req.id}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={req.requester?.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs bg-muted">
                        {req.requester?.displayName?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        {req.requester?.displayName ?? "Worker"}
                      </p>
                      <p className="text-xs text-muted-foreground">{req.requester?.jobRole}</p>
                      {req.message && <p className="text-sm text-foreground mt-1 italic">"{req.message}"</p>}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs mt-1",
                          req.status === "approved" ? "border-emerald-300 text-emerald-700" :
                          req.status === "rejected" ? "border-destructive/30 text-destructive" : ""
                        )}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={approveRequest.isPending}
                          className="gap-1.5 h-8"
                          data-testid={`button-approve-request-${req.id}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(req.id)}
                          disabled={rejectRequest.isPending}
                          className="gap-1.5 h-8 text-destructive"
                          data-testid={`button-reject-request-${req.id}`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
