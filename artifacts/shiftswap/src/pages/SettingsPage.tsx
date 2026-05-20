import { useEffect } from "react";
import { useUser } from "@clerk/react";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  useGetMyProfile,
  useUpsertProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timesOptions = ["Morning (6am–12pm)", "Afternoon (12pm–6pm)", "Evening (6pm–12am)", "Night (12am–6am)"];

const roleOptions = [
  "Nurse", "Doctor", "Retail Associate", "Warehouse Associate",
  "Security Guard", "Cashier", "Delivery Driver", "Server", "Cook", "Other",
];

const schema = z.object({
  displayName: z.string().min(1, "Name is required"),
  jobRole: z.string().min(1, "Job role is required"),
  location: z.string().optional(),
  bio: z.string().optional(),
  preferredDays: z.array(z.string()).default([]),
  preferredTimes: z.array(z.string()).default([]),
  minHourlyRate: z.string().optional(),
  maxHourlyRate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetMyProfile();
  const upsertProfile = useUpsertProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      jobRole: "",
      location: "",
      bio: "",
      preferredDays: [],
      preferredTimes: [],
      minHourlyRate: "",
      maxHourlyRate: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        jobRole: profile.jobRole,
        location: profile.location ?? "",
        bio: profile.bio ?? "",
        preferredDays: profile.preferredDays ?? [],
        preferredTimes: profile.preferredTimes ?? [],
        minHourlyRate: profile.minHourlyRate?.toString() ?? "",
        maxHourlyRate: profile.maxHourlyRate?.toString() ?? "",
      });
    } else if (user) {
      form.reset({
        displayName: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "",
        jobRole: "",
        location: "",
        bio: "",
        preferredDays: [],
        preferredTimes: [],
        minHourlyRate: "",
        maxHourlyRate: "",
      });
    }
  }, [profile, user?.id]);

  const onSubmit = (values: FormValues) => {
    upsertProfile.mutate(
      {
        data: {
          displayName: values.displayName,
          jobRole: values.jobRole,
          location: values.location || undefined,
          bio: values.bio || undefined,
          preferredDays: values.preferredDays,
          preferredTimes: values.preferredTimes,
          minHourlyRate: values.minHourlyRate ? parseFloat(values.minHourlyRate) : undefined,
          maxHourlyRate: values.maxHourlyRate ? parseFloat(values.maxHourlyRate) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Profile saved!" });
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        },
        onError: () => toast({ title: "Failed to save profile", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Update your profile and preferences</p>
      </div>

      {/* User info */}
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
        <Avatar className="w-14 h-14">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user?.firstName?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">
            {user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.emailAddresses?.[0]?.emailAddress}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} data-testid="input-display-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
                    <FormLabel>Location / City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chicago, IL" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others a bit about yourself and your experience..."
                        rows={3}
                        className="resize-none"
                        {...field}
                        data-testid="textarea-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredDays"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred days</FormLabel>
                    <FormDescription>Which days can you typically work?</FormDescription>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {daysOptions.map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="preferredDays"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) field.onChange([...current, day]);
                                    else field.onChange(current.filter((d) => d !== day));
                                  }}
                                  data-testid={`checkbox-day-${day}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">{day.slice(0, 3)}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTimes"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred shift times</FormLabel>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {timesOptions.map((time) => (
                        <FormField
                          key={time}
                          control={form.control}
                          name="preferredTimes"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(time)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) field.onChange([...current, time]);
                                    else field.onChange(current.filter((t) => t !== time));
                                  }}
                                  data-testid={`checkbox-time-${time.split(" ")[0]}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">{time}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minHourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min hourly rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} data-testid="input-min-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxHourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max hourly rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} data-testid="input-max-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={upsertProfile.isPending}
                data-testid="button-save-profile"
              >
                {upsertProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
