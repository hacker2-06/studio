
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
import { useToast } from "@/hooks/use-toast";
import type { TestCreationData, AIQuestion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateTestQuestions, type GenerateTestQuestionsInput } from "@/ai/flows/generate-test-questions-flow";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Test name must be at least 3 characters.",
  }).max(100, {
    message: "Test name must not exceed 100 characters.",
  }),
  topic: z.string().min(3, {
    message: "Test topic must be at least 3 characters.",
  }).max(100, {
    message: "Test topic must not exceed 100 characters.",
  }),
  numberOfQuestions: z.coerce
    .number({ invalid_type_error: "Number of questions must be a number." })
    .int({ message: "Number of questions must be a whole number." })
    .positive({ message: "Number of questions must be positive." })
    .min(1, { message: "At least 1 question is required." })
    .max(20, { message: "Maximum 20 questions allowed for now." }), // Capped for faster generation initially
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

export function TestCreationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  // We don't need to store generatedQuestions in state here if we navigate away immediately

  const form = useForm<TestCreationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      topic: "",
      numberOfQuestions: 5,
      timerMode: "timer",
      durationMinutes: 10,
      markingCorrect: 4,
      markingIncorrect: -1,
    },
  });

  const timerMode = form.watch("timerMode");

  async function onSubmit(values: TestCreationFormValues) {
    const testData: TestCreationData = {
      name: values.name,
      topic: values.topic,
      numberOfQuestions: values.numberOfQuestions,
      timerMode: values.timerMode as 'timer' | 'stopwatch' | 'none',
      durationMinutes: values.timerMode === 'timer' ? values.durationMinutes : undefined,
      markingCorrect: values.markingCorrect,
      markingIncorrect: values.markingIncorrect,
    };
    
    // Toast for configuration is less relevant if we navigate away quickly.
    // Consider if this toast is still needed or should be shown on the next page.
    /*
    toast({
      title: "Test Configured",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(testData, null, 2)}</code>
        </pre>
      ),
    });
    */

    setIsGeneratingQuestions(true);
    try {
      const aiInput: GenerateTestQuestionsInput = {
        topic: values.topic,
        numberOfQuestions: values.numberOfQuestions,
      };
      const result = await generateTestQuestions(aiInput);
      
      if (!result || !result.questions || result.questions.length === 0) {
        toast({
          title: "Question Generation Failed",
          description: "The AI did not return any questions. Please try a different topic or number of questions.",
          variant: "destructive",
        });
        setIsGeneratingQuestions(false);
        return;
      }
      
      toast({
        title: "AI Questions Generated!",
        description: `Successfully generated ${result.questions.length} questions. Starting test...`,
        variant: "default",
      });

      const fullTestData = {
        config: testData,
        questions: result.questions,
      };

      localStorage.setItem(LOCAL_STORAGE_TEST_DATA_KEY, JSON.stringify(fullTestData));
      router.push('/take-test');

    } catch (error) {
      console.error("Error generating questions or navigating:", error);
      toast({
        title: "Error During Test Setup",
        description: `An error occurred: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      // setIsGeneratingQuestions(false); // Not strictly necessary if navigating away
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
                <Input placeholder="e.g., Algebra Basics Quiz" {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your test.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Topic / Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g., High School Physics, World Capitals" {...field} />
              </FormControl>
              <FormDescription>
                What subject or topic will this test cover?
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
                <Input type="number" placeholder="e.g., 10" {...field} />
              </FormControl>
              <FormDescription>
                How many questions will this test have? (Max 20 for now)
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {timerMode === "timer" && (
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 60" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Set the time limit in minutes if using timer mode.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                    Points awarded for each correct answer.
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
                    Points deducted (or 0) for each incorrect answer.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Button type="submit" className="w-full md:w-auto" disabled={isGeneratingQuestions}>
          {isGeneratingQuestions ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating & Starting Test...
            </>
          ) : (
            "Configure & Generate Questions to Start Test"
          )}
        </Button>
      </form>
    </Form>
  );
}
