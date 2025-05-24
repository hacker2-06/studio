
"use client";

import type { CurrentTestData, Option, Question } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, TimerIcon, ArrowLeft, Flag, Bookmark, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_TEST_DATA_KEY = 'currentSmartsheetTestData';
const LOCAL_STORAGE_EVALUATION_KEY = 'testForEvaluation';

export default function TakeTestPage() {
  const [activeTest, setActiveTest] = useState<CurrentTestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(true);
  const [timeDisplay, setTimeDisplay] = useState("00:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const startTimeRef = useRef<number | null>(null); // To store the actual start time of the test
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // To store timer interval ID

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_TEST_DATA_KEY);
      if (storedData) {
        const parsedData: CurrentTestData = JSON.parse(storedData);
        if (parsedData && parsedData.config && parsedData.questions) {
          const questionsWithFlags = parsedData.questions.map(q => ({
            ...q,
            isMarkedForReview: q.isMarkedForReview ?? false,
            isMarkedForLater: q.isMarkedForLater ?? false,
          }));
          setActiveTest({ ...parsedData, questions: questionsWithFlags });
        } else {
          setError("Test data is incomplete. Please create the test again.");
        }
      } else {
        setError("No test data found. Please create a new test.");
      }
    } catch (e) {
      console.error("Failed to load test data from localStorage:", e);
      setError("Failed to load test data. Please try creating the test again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear any existing interval when the component unmounts or dependencies change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!activeTest || showTutorialModal) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const { timerMode, durationMinutes = 0 } = activeTest.config;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current); // Clear previous interval if any
    }

    if (timerMode === 'timer') {
      let timeLeft = durationMinutes * 60;
      // Adjust timeLeft if resuming a timed test (though not fully supported here, good for future)
      const alreadyElapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      timeLeft = Math.max(0, durationMinutes * 60 - alreadyElapsed);
      
      setTimeDisplay(formatTime(timeLeft));

      timerIntervalRef.current = setInterval(() => {
        timeLeft--;
        setTimeDisplay(formatTime(timeLeft));
        if (timeLeft <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          toast({ title: "Time's Up!", description: "The test will be submitted automatically.", variant: "default" });
          // Consider auto-submitting: handleSubmitTest(true); // Pass a flag for auto-submission
        }
      }, 1000);
    } else if (timerMode === 'stopwatch') {
      const updateStopwatch = () => {
        const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
        setTimeDisplay(formatTime(elapsed));
      };
      updateStopwatch(); // Initial display
      timerIntervalRef.current = setInterval(updateStopwatch, 1000);
    } else {
      setTimeDisplay("No Timer");
    }
    // Dependencies are refined to only what the timer setup needs
  }, [activeTest?.config.timerMode, activeTest?.config.durationMinutes, showTutorialModal, toast]);


  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback((questionId: string, selectedOption: Option) => {
    setActiveTest(prevTest => {
      if (!prevTest) return null;
      return {
        ...prevTest,
        questions: prevTest.questions.map(q =>
          q.id === questionId ? { ...q, userAnswer: selectedOption } : q
        ),
      };
    });
  }, []);

  const toggleQuestionFlag = useCallback((questionId: string, flagType: 'isMarkedForReview' | 'isMarkedForLater') => {
    setActiveTest(prevTest => {
      if (!prevTest) return null;
      return {
        ...prevTest,
        questions: prevTest.questions.map(q =>
          q.id === questionId ? { ...q, [flagType]: !q[flagType] } : q
        ),
      };
    });
  }, []);

  const handleSubmitTest = () => {
    if (!activeTest) return;
    setIsSubmitting(true);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current); // Stop timer/stopwatch
    }

    const endTime = Date.now();
    const elapsedTimeSeconds = startTimeRef.current ? Math.floor((endTime - startTimeRef.current) / 1000) : 0;

    try {
      const testDataForEvaluation: CurrentTestData = {
        ...activeTest,
        questions: activeTest.questions, // Ensure questions are the latest state
        elapsedTimeSeconds, // Add elapsed time
      };
      localStorage.setItem(LOCAL_STORAGE_EVALUATION_KEY, JSON.stringify(testDataForEvaluation));
      localStorage.removeItem(LOCAL_STORAGE_TEST_DATA_KEY);
      router.push('/self-evaluate');
    } catch (e) {
      console.error("Error saving test for evaluation:", e);
      setError("Could not save your answers. Please try submitting again.");
      toast({
        title: "Submission Error",
        description: "Could not save your answers. Please try submitting again.",
        variant: "destructive",
      });
      setIsSubmitting(false); // Only set to false on error, success navigates away
    }
    // No setIsSubmitting(false) here on success, as navigation occurs.
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading your test sheet...</p>
        </div>
      </div>
    );
  }

  if (error || !activeTest) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Test</AlertTitle>
          <AlertDescription>
            {error || "Could not load the test details."}
            <br />
            Please go back and create a new test.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/create-test')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Create New Test
        </Button>
      </div>
    );
  }
  
  const currentQuestionState = (questionId: string) => {
    return activeTest.questions.find(q => q.id === questionId);
  };


  return (
    <>
      <Dialog open={showTutorialModal} onOpenChange={(isOpen) => {
          if (!isOpen) {
              setShowTutorialModal(false);
              // Start timer logic only after modal is closed if it was shown
              if (!startTimeRef.current) {
                  startTimeRef.current = Date.now();
              }
          }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <Info className="mr-3 h-7 w-7 text-primary" /> Test Instructions
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Welcome to your test! Here’s a quick guide:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Select your answer for each question using the radio buttons (1, 2, 3, 4).</li>
              <li>Use the <Flag className="inline-block h-4 w-4 mx-1 text-orange-500" /> icon to <span className="font-semibold text-foreground">Mark for Review</span> if you're unsure and want to come back.</li>
              <li>Use the <Bookmark className="inline-block h-4 w-4 mx-1 text-blue-500" /> icon to <span className="font-semibold text-foreground">Mark for Later</span> for any question you want to revisit.</li>
              <li>Your test might be timed. Keep an eye on the <span className="font-semibold text-foreground">{activeTest.config.timerMode === 'timer' ? 'timer (countdown)' : activeTest.config.timerMode === 'stopwatch' ? 'stopwatch (count up)' : 'timer display'}</span> at the top.</li>
            </ul>
            <p className="text-muted-foreground">Good luck!</p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
                setShowTutorialModal(false);
                if (!startTimeRef.current) { // Ensure start time is set if modal is closed quickly
                  startTimeRef.current = Date.now();
                }
            }} className="w-full">Start Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showTutorialModal && (
        <div className="container mx-auto py-8">
          <Card className="shadow-xl w-full max-w-3xl mx-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{activeTest.config.name}</CardTitle>
                  <CardDescription className="text-md mt-1">
                    Total Questions: {activeTest.questions.length}
                  </CardDescription>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center text-lg font-semibold text-primary">
                        <TimerIcon className="mr-2 h-5 w-5" />
                        {timeDisplay}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Marking: <span className="text-success-foreground bg-success/80 px-1 py-0.5 rounded-sm font-medium">+{activeTest.config.markingCorrect}</span> for correct, <span className="text-destructive-foreground bg-destructive/80 px-1 py-0.5 rounded-sm font-medium">{activeTest.config.markingIncorrect}</span> for incorrect.
                    </p>
                </div>
              </div>
            </CardHeader>
            
            <ScrollArea className="h-[calc(100vh-24rem)] md:h-[calc(100vh-22rem)]">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-6">
                  {activeTest.questions.map((question, index) => {
                    const qState = currentQuestionState(question.id);
                    return (
                      <Card key={question.id} className={cn("bg-card/50 shadow-sm transition-all", 
                        qState?.isMarkedForReview && "border-orange-500 ring-2 ring-orange-500/50",
                        qState?.isMarkedForLater && !qState?.isMarkedForReview && "border-blue-500 ring-2 ring-blue-500/50"
                      )}>
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold">{question.text}</CardTitle>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleQuestionFlag(question.id, 'isMarkedForReview')}
                                aria-label="Mark for review"
                                className={cn("h-8 w-8", qState?.isMarkedForReview ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground hover:text-orange-500")}
                              >
                                {qState?.isMarkedForReview ? <Flag fill="currentColor" /> : <Flag />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleQuestionFlag(question.id, 'isMarkedForLater')}
                                aria-label="Mark for later"
                                className={cn("h-8 w-8", qState?.isMarkedForLater ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-blue-500")}
                              >
                                {qState?.isMarkedForLater ? <Bookmark fill="currentColor" /> : <Bookmark />}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <RadioGroup
                            value={qState?.userAnswer}
                            onValueChange={(value) => handleAnswerChange(question.id, value as Option)}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                          >
                            {question.options.map((optionKey) => (
                              <div key={optionKey} className="flex items-center space-x-2">
                                <RadioGroupItem value={optionKey} id={`${question.id}-${optionKey}`} className="peer" />
                                <Label 
                                  htmlFor={`${question.id}-${optionKey}`}
                                  className="text-base font-medium p-3 border rounded-md flex-1 text-center cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted/50 transition-colors"
                                >
                                  {optionKey} 
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </ScrollArea>
            
            <CardFooter className="border-t pt-6">
              <Button onClick={handleSubmitTest} className="w-full md:w-auto ml-auto" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Test for Evaluation
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
