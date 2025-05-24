
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion
import { useToast } from "@/hooks/use-toast";
import type { TestCreationData, Question, Option, CurrentTestData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Test name must be at least 3 characters.",
  }).max(100, {
    message: "Test name must not exceed 100 characters.",
  }),
  numberOfQuestions: z.coerce
    .number({ invalid_type_error: "Number of questions must be a number." })
    .int({ message: "Number of questions must be a whole number." })
    .positive({ message: "Number of questions must be positive." })
    .min(1, { message: "At least 1 question is required." })
    .max(100, { message: "Maximum 100 questions allowed." }),
  timerMode: z.enum(["timer", "stopwatch", "none"], {
    required_error: "Timer mode is required.",
  }),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
  markingCorrect: z.coerce
    .number({ invalid_type_error: "Points for correct answer must be a number." })
    .int({ message: "Points must be a whole number." }),
  markingIncorrect: z.coerce
    .number({ invalid_type_error: "Points for incorrect answer must be a number." })
    .int({ message: "Points must be a whole number." }),
}).refine(data => {
  if (data.timerMode === 'timer' && (data.durationMinutes === undefined || data.durationMinutes <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Duration is required and must be positive when timer mode is 'timer'.",
  path: ["durationMinutes"],
});

export type TestCreationFormValues = z.infer<typeof formSchema>;

const LOCAL_STORAGE_TEST_DATA_KEY = 'currentSmartsheetTestData';
const OPTIONS_KEYS: Option[] = ['1', '2', '3', '4'];

export function TestCreationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { scoringRules, timerPreferences } = useSettings();

  const form = useForm<TestCreationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      numberOfQuestions: 50,
      timerMode: timerPreferences?.defaultMode || "timer",
      durationMinutes: timerPreferences?.defaultDurationMinutes || 30,
      markingCorrect: scoringRules?.correct || 4,
      markingIncorrect: scoringRules?.incorrect || -1,
    },
  });

  useEffect(() => {
    if (scoringRules && !form.formState.dirtyFields.markingCorrect && !form.formState.dirtyFields.markingIncorrect) {
      form.setValue("markingCorrect", scoringRules.correct, { shouldValidate: false });
      form.setValue("markingIncorrect", scoringRules.incorrect, { shouldValidate: false });
    }
    if (timerPreferences && !form.formState.dirtyFields.timerMode && !form.formState.dirtyFields.durationMinutes) {
      form.setValue("timerMode", timerPreferences.defaultMode, { shouldValidate: false });
      if (timerPreferences.defaultMode === 'timer' && timerPreferences.defaultDurationMinutes) {
        form.setValue("durationMinutes", timerPreferences.defaultDurationMinutes, { shouldValidate: false });
      } else {
        form.setValue("durationMinutes", undefined, { shouldValidate: false });
      }
    }
  }, [scoringRules, timerPreferences, form]);

  const watchedTimerMode = form.watch("timerMode");

  async function onSubmit(values: TestCreationFormValues) {
    setIsProcessing(true);

    const testConfigData: TestCreationData = {
      name: values.name,
      numberOfQuestions: values.numberOfQuestions,
      timerMode: values.timerMode as 'timer' | 'stopwatch' | 'none',
      durationMinutes: values.timerMode === 'timer' ? values.durationMinutes : undefined,
      markingCorrect: values.markingCorrect,
      markingIncorrect: values.markingIncorrect,
    };
    
    const generatedQuestions: Question[] = [];
    for (let i = 0; i < values.numberOfQuestions; i++) {
      generatedQuestions.push({
        id: `q_${i + 1}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        text: `Question ${i + 1}`, 
        options: OPTIONS_KEYS, 
        isMarkedForReview: false,
        isMarkedForLater: false,
      });
    }

    const fullTestData: CurrentTestData = {
      config: testConfigData,
      questions: generatedQuestions,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_TEST_DATA_KEY, JSON.stringify(fullTestData));
      
      toast({
        title: "Test Sheet Created!",
        description: `OMR sheet for "${values.name}" with ${values.numberOfQuestions} questions is ready. Starting test...`,
        variant: "default",
      });
      router.push('/take-test');

    } catch (error) {
      console.error("Error preparing OMR test or navigating:", error);
      toast({
        title: "Error During Test Setup",
        description: `An error occurred: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Physics Mock Test 1" {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your OMR sheet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Questions</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100" {...field} />
              </FormControl>
              <FormDescription>
                How many questions will this OMR sheet have?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timerMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timer Mode</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                suppressHydrationWarning 
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timer mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="timer">Timer (Countdown)</SelectItem>
                  <SelectItem value="stopwatch">Stopwatch (Count Up)</SelectItem>
                  <SelectItem value="none">No Timer</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how time will be managed for this test.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedTimerMode === "timer" && (
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 180" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Set the time limit in minutes if using timer mode.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="scoring-rules" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline hover:text-primary py-2 [&[data-state=open]>svg]:text-primary">
              Customize Scoring Rules (Optional)
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="markingCorrect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points for Correct Answer</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 4" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default: {scoringRules.correct}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="markingIncorrect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points for Incorrect Answer</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., -1 or 0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default: {scoringRules.incorrect}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button type="submit" className="w-full md:w-auto" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing OMR Sheet...
            </>
          ) : (
            "Create OMR Sheet & Start Test"
          )}
        </Button>
      </form>
    </Form>
  );
}
