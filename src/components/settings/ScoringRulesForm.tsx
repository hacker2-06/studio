
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
import { useSettings, type ScoringRules } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from "react";

const scoringRulesSchema = z.object({
  correct: z.coerce
    .number({ invalid_type_error: "Points for correct answer must be a number." })
    .int({ message: "Points must be a whole number." }),
  incorrect: z.coerce
    .number({ invalid_type_error: "Points for incorrect answer must be a number." })
    .int({ message: "Points must be a whole number." }),
});

type ScoringRulesFormValues = z.infer<typeof scoringRulesSchema>;

export function ScoringRulesForm() {
  const { scoringRules, setScoringRules } = useSettings();
  const { toast } = useToast();

  const form = useForm<ScoringRulesFormValues>({
    resolver: zodResolver(scoringRulesSchema),
    defaultValues: scoringRules, // Initialize with context values
  });

  // Effect to reset form if context values change (e.g. loaded from localStorage after initial render)
  useEffect(() => {
    form.reset(scoringRules);
  }, [scoringRules, form]);

  function onSubmit(values: ScoringRulesFormValues) {
    setScoringRules(values);
    toast({
      title: "Scoring Rules Updated",
      description: "Default scoring rules have been saved.",
    });
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Default Scoring Rules</CardTitle>
        <CardDescription>Set the default points awarded or deducted for answers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="correct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points for Correct Answer</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incorrect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points for Incorrect Answer</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., -1 or 0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Save Scoring Rules</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
