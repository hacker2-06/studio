
"use client";

import type { CurrentTestData, Option, Question } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button"; 
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, TimerIcon, ArrowLeft, Flag, Bookmark, Info, ListChecks, ClipboardEdit, MousePointerClick, SendHorizonal, LogOut, Eye } from "lucide-react"; 
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
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTestActiveRef = useRef(false); 

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          questionRefs.current = questionsWithFlags.map(() => null); // Initialize refs array
          isTestActiveRef.current = true;
        } else {
          setError("Test data is incomplete. Please create the test again.");
          isTestActiveRef.current = false;
        }
      } else {
        setError("No test data found. Please create a new test.");
        isTestActiveRef.current = false;
      }
    } catch (e) {
      console.error("Failed to load test data from localStorage:", e);
      setError("Failed to load test data. Please try creating the test again.");
      isTestActiveRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeTest || showTutorialModal || !isTestActiveRef.current) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const { timerMode, durationMinutes = 0 } = activeTest.config;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (timerMode === 'timer') {
      let timeLeft = durationMinutes * 60;
      const alreadyElapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      timeLeft = Math.max(0, durationMinutes * 60 - alreadyElapsed);
      
      setTimeDisplay(formatTime(timeLeft));

      timerIntervalRef.current = setInterval(() => {
        timeLeft--;
        setTimeDisplay(formatTime(timeLeft));
        if (timeLeft <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          toast({ title: "Time's Up!", description: "The test will be submitted automatically.", variant: "default" });
          // Consider auto-submitting: handleSubmitTest(true); 
        }
      }, 1000);
    } else if (timerMode === 'stopwatch') {
      const updateStopwatch = () => {
        const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
        setTimeDisplay(formatTime(elapsed));
      };
      updateStopwatch();
      timerIntervalRef.current = setInterval(updateStopwatch, 1000);
    } else {
      setTimeDisplay("No Timer");
    }
  }, [activeTest?.config.timerMode, activeTest?.config.durationMinutes, showTutorialModal, toast, isTestActiveRef.current]);


  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isTestActiveRef.current) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave? Your test progress will be lost.";
        return event.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); 


  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  

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
    isTestActiveRef.current = false; 
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const endTime = Date.now();
    const elapsedTimeSeconds = startTimeRef.current ? Math.floor((endTime - startTimeRef.current) / 1000) : 0;

    try {
      const testDataForEvaluation: CurrentTestData = {
        ...activeTest,
        questions: activeTest.questions,
        elapsedTimeSeconds,
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
      setIsSubmitting(false);
      isTestActiveRef.current = true; 
    }
  };

  const handleCancelTestConfirmed = () => {
    isTestActiveRef.current = false; 
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    localStorage.removeItem(LOCAL_STORAGE_TEST_DATA_KEY);
    toast({
      title: "Test Cancelled",
      description: "Your current test progress has been cleared.",
    });
    router.push('/'); 
    setShowCancelConfirmDialog(false);
  };

  const scrollToMarkedQuestion = (flagType: 'isMarkedForReview' | 'isMarkedForLater') => {
    if (!activeTest) return;
    const firstMarkedIndex = activeTest.questions.findIndex(q => q[flagType]);
    if (firstMarkedIndex !== -1 && questionRefs.current[firstMarkedIndex]) {
      questionRefs.current[firstMarkedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      toast({
        title: "No Questions Marked",
        description: `No questions are currently marked for ${flagType === 'isMarkedForReview' ? 'review' : 'later'}.`,
        variant: "default"
      });
    }
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

  const markedForReviewCount = activeTest.questions.filter(q => q.isMarkedForReview).length;
  const markedForLaterCount = activeTest.questions.filter(q => q.isMarkedForLater && !q.isMarkedForReview).length; // Count only if not also for review for distinct count display

  return (
    <>
      <Dialog open={showTutorialModal} onOpenChange={(isOpen) => {
          if (!isOpen) {
              setShowTutorialModal(false);
              // Start timer logic handled by useEffect based on isTestActiveRef and showTutorialModal
              isTestActiveRef.current = true; 
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
              Welcome to your NeetSheet test! Here’s a quick guide:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <ul className="list-none space-y-3 pl-1 text-muted-foreground">
              <li className="flex items-start">
                <MousePointerClick className="inline-block h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" /> 
                <span>Select your answer for each question using the radio buttons (1, 2, 3, 4).</span>
              </li>
              <li className="flex items-start">
                <Flag className="inline-block h-5 w-5 mr-3 mt-0.5 text-orange-500 shrink-0" />
                <span>Use this icon to <span className="font-semibold text-foreground">Mark for Review</span> if you're unsure and want to come back.</span>
              </li>
              <li className="flex items-start">
                <Bookmark className="inline-block h-5 w-5 mr-3 mt-0.5 text-blue-500 shrink-0" />
                <span>Use this icon to <span className="font-semibold text-foreground">Mark for Later</span> for any question you want to revisit.</span>
              </li>
              <li className="flex items-start">
                <Eye className="inline-block h-5 w-5 mr-3 mt-0.5 text-purple-500 shrink-0" />
                <span>The bar above questions shows counts for <span className="font-semibold text-foreground">Review</span> &amp; <span className="font-semibold text-foreground">Later</span>. Click them to navigate.</span>
              </li>
              <li className="flex items-start">
                <TimerIcon className="inline-block h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                <span>Your test might be timed. Keep an eye on the <span className="font-semibold text-foreground">{activeTest.config.timerMode === 'timer' ? 'timer (countdown)' : activeTest.config.timerMode === 'stopwatch' ? 'stopwatch (count up)' : 'timer display'}</span> at the top.</span>
              </li>
            </ul>
            <p className="text-muted-foreground">Good luck with your practice!</p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
                setShowTutorialModal(false);
                isTestActiveRef.current = true;
                if (!startTimeRef.current) { 
                  startTimeRef.current = Date.now();
                }
            }} className="w-full">Start Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this test? Your current progress will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Taking Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelTestConfirmed} className={buttonVariants({ variant: "destructive" })}>
              Yes, Cancel Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!showTutorialModal && (
        <div className="container mx-auto py-8">
          <Card className="shadow-xl w-full max-w-3xl mx-auto">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{activeTest.config.name}</CardTitle>
                  <CardDescription className="text-md mt-1 flex items-center text-muted-foreground">
                    <ListChecks className="mr-2 h-4 w-4 text-primary" />
                    Total Questions: {activeTest.questions.length}
                  </CardDescription>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center text-lg font-semibold text-primary">
                        <TimerIcon className="mr-2 h-5 w-5" />
                        {timeDisplay}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center justify-end">
                        <ClipboardEdit className="mr-1.5 h-3 w-3" />
                        Marking: <span className="text-success-foreground bg-success/80 px-1 py-0.5 rounded-sm font-medium ml-1">+{activeTest.config.markingCorrect}</span> / <span className="text-destructive-foreground bg-destructive/80 px-1 py-0.5 rounded-sm font-medium">{activeTest.config.markingIncorrect}</span>
                    </p>
                </div>
              </div>
               {/* Summary Bar for Marked Questions */}
              {(markedForReviewCount > 0 || markedForLaterCount > 0) && (
                <div className="flex items-center space-x-4 mt-2 p-2 bg-muted/50 rounded-md border">
                  {markedForReviewCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50" onClick={() => scrollToMarkedQuestion('isMarkedForReview')}>
                      <Flag className="mr-2 h-4 w-4" /> Review: {markedForReviewCount}
                    </Button>
                  )}
                  {markedForLaterCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50" onClick={() => scrollToMarkedQuestion('isMarkedForLater')}>
                      <Bookmark className="mr-2 h-4 w-4" /> Later: {markedForLaterCount}
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            
            <ScrollArea className="h-[calc(100vh-28rem)] md:h-[calc(100vh-26rem)]"> {/* Adjusted height for header content */}
              <CardContent className="p-4 md:p-6">
                <div className="space-y-6">
                  {activeTest.questions.map((question, index) => {
                    const qState = currentQuestionState(question.id);
                    return (
                      <Card 
                        key={question.id} 
                        ref={(el) => questionRefs.current[index] = el}
                        className={cn("bg-card/50 shadow-sm transition-all", 
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
            
            <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirmDialog(true)} 
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cancel Test
              </Button>
              <Button onClick={handleSubmitTest} className="w-full sm:w-auto" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizonal className="mr-2 h-4 w-4" />}
                Submit Test for Evaluation
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
