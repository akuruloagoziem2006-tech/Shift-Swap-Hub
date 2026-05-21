import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreateShift, getListShiftsQueryKey } from "@workspace/api-client-react";
import { PlusCircle, ArrowLeft } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().min(1, "Location is required"),
  shiftDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hourlyRate: z.string().optional(),
  shiftType: z.enum(["swap", "cover", "drop"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const roleOptions = [
  "Nurse", "Doctor", "Retail Associate", "Warehouse Associate",
  "Security Guard", "Cashier", "Delivery Driver", "Server", "Cook", "Other",
];

export default function PostShiftPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createShift = useCreateShift();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      role: "",
      location: "",
      shiftDate: "",
      startTime: "",
      endTime: "",
      hourlyRate: "",
      shiftType: "cover",
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createShift.mutate(
      {
        data: {
          title: values.title,
          role: values.role,
          location: values.location,
          shiftDate: values.shiftDate,
          startTime: values.startTime,
          endTime: values.endTime,
          hourlyRate: values.hourlyRate ? parseFloat(values.hourlyRate) : undefined,
          shiftType: values.shiftType,
          notes: values.notes || undefined,
        },
      },
      {
        onSuccess: (shift) => {
          queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
          toast({ title: "Shift posted!", description: "Your shift is now live." });
          navigate(`/shifts/${shift.id}`);
        },
        onError: () => {
          toast({ title: "Failed to post shift", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/shifts")}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          data-testid="button-back-shifts"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Post a Shift</h1>
          <p className="text-muted-foreground text-sm">Fill in the details for your shift.</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 mb-5">
        All shift swaps require employer approval. ShiftSwap is not responsible for scheduling decisions.
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ER Nurse night shift coverage" {...field} data-testid="input-shift-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-shift-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-shift-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cover">Cover (I need someone)</SelectItem>
                          <SelectItem value="swap">Swap (Mutual exchange)</SelectItem>
                          <SelectItem value="drop">Drop (Giving up shift)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Facility</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chicago, IL — St. Mary's Hospital" {...field} data-testid="input-shift-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="shiftDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-shift-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-shift-start-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-shift-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly rate (optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input type="number" placeholder="0.00" className="pl-7" {...field} data-testid="input-shift-hourly-rate" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any extra details, requirements, or context..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-shift-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={createShift.isPending}
                data-testid="button-submit-shift"
              >
                {createShift.isPending ? "Posting..." : (
                  <><PlusCircle className="w-4 h-4" /> Post Shift</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
