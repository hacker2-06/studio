
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
import type { TestCreationData, Question, Option, CurrentTestData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { generateTestQuestions, type GenerateTestQuestionsInput } from "@/ai/flows/generate-test-questions-flow"; // No longer generating content via AI here
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Test name must be at least 3 characters.",
  }).max(100, {
    message: "Test name must not exceed 100 characters.",
  }),
  // topic: z.string().min(3, { // Topic removed as AI is not generating question content here
  //   message: "Test topic must be at least 3 characters.",
  // }).max(100, {
  //   message: "Test topic must not exceed 100 characters.",
  // }),
  numberOfQuestions: z.coerce
    .number({ invalid_type_error: "Number of questions must be a number." })
    .int({ message: "Number of questions must be a whole number." })
    .positive({ message: "Number of questions must be positive." })
    .min(1, { message: "At least 1 question is required." })
    .max(100, { message: "Maximum 100 questions allowed." }), // Increased max slightly
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
const OPTIONS_KEYS: Option[] = ['A', 'B', 'C', 'D'];

export function TestCreationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<TestCreationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      // topic: "", // Topic removed
      numberOfQuestions: 5,
      timerMode: "timer",
      durationMinutes: 10,
      markingCorrect: 4,
      markingIncorrect: -1,
    },
  });

  const timerMode = form.watch("timerMode");

  async function onSubmit(values: TestCreationFormValues) {
    setIsProcessing(true);

    const testConfigData: TestCreationData = {
      name: values.name,
      // topic: values.topic, // Topic removed
      numberOfQuestions: values.numberOfQuestions,
      timerMode: values.timerMode as 'timer' | 'stopwatch' | 'none',
      durationMinutes: values.timerMode === 'timer' ? values.durationMinutes : undefined,
      markingCorrect: values.markingCorrect,
      markingIncorrect: values.markingIncorrect,
    };
    
    // Manually create an array of Question structures
    const generatedQuestions: Question[] = [];
    for (let i = 0; i < values.numberOfQuestions; i++) {
      generatedQuestions.push({
        id: `q_${i + 1}_${Date.now()}`, // Unique ID for each question
        text: `Question ${i + 1}`, // Generic text
        options: OPTIONS_KEYS, // Options will be A, B, C, D
        // aiGeneratedQuestionText, aiGeneratedOptions, etc. will be undefined
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
      console.error("Error preparing test or navigating:", error);
      toast({
        title: "Error During Test Setup",
        description: `An error occurred: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      });
      setIsProcessing(false); // Only set to false on error if not navigating
    }
    // setIsProcessing(false); // Typically, you wouldn't set this if navigation is successful and unmounts the component.
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
                <Input placeholder="e.g., Midterm Exam Practice" {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your test.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Topic Field Removed
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
        */}

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
                How many questions will this test have?
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
        
        <Button type="submit" className="w-full md:w-auto" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Test & Starting...
            </>
          ) : (
            "Create OMR Sheet & Start Test"
          )}
        </Button>
      </form>
    </Form>
  );
}
