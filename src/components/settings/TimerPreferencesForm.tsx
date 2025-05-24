
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, type TimerPreferences, type TimerMode } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from "react";

const timerPreferencesSchema = z.object({
  defaultMode: z.enum(["timer", "stopwatch", "none"], {
    required_error: "Default timer mode is required.",
  }),
  defaultDurationMinutes: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
}).refine(data => {
  if (data.defaultMode === 'timer' && (data.defaultDurationMinutes === undefined || data.defaultDurationMinutes <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Default duration is required and must be positive when timer mode is 'timer'.",
  path: ["defaultDurationMinutes"],
});

type TimerPreferencesFormValues = z.infer<typeof timerPreferencesSchema>;

export function TimerPreferencesForm() {
  const { timerPreferences, setTimerPreferences } = useSettings();
  const { toast } = useToast();

  const form = useForm<TimerPreferencesFormValues>({
    resolver: zodResolver(timerPreferencesSchema),
    defaultValues: {
      defaultMode: timerPreferences.defaultMode,
      defaultDurationMinutes: timerPreferences.defaultDurationMinutes,
    },
  });

   // Effect to reset form if context values change
  useEffect(() => {
    form.reset({
      defaultMode: timerPreferences.defaultMode,
      defaultDurationMinutes: timerPreferences.defaultDurationMinutes,
    });
  }, [timerPreferences, form]);

  const watchedTimerMode = form.watch("defaultMode");

  function onSubmit(values: TimerPreferencesFormValues) {
    const prefsToSave: TimerPreferences = {
      defaultMode: values.defaultMode as TimerMode,
      defaultDurationMinutes: values.defaultMode === 'timer' ? values.defaultDurationMinutes : undefined,
    };
    setTimerPreferences(prefsToSave);
    toast({
      title: "Timer Preferences Updated",
      description: "Default timer settings have been saved.",
    });
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Default Timer Preferences</CardTitle>
        <CardDescription>Configure the default timer behavior for new tests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Timer Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value} // Ensure value is controlled
                    suppressHydrationWarning
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a default timer mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="timer">Timer (Countdown)</SelectItem>
                      <SelectItem value="stopwatch">Stopwatch (Count Up)</SelectItem>
                      <SelectItem value="none">No Timer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedTimerMode === "timer" && (
              <FormField
                control={form.control}
                name="defaultDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>
                      Default time limit in minutes if default mode is 'timer'.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full sm:w-auto">Save Timer Preferences</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
