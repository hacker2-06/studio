
"use client";

import type { CurrentTestData, Option, Question } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Terminal, TimerIcon, CheckSquare, XSquare, AlertCircle } from "lucide-react"; // Added more icons

const LOCAL_STORAGE_TEST_DATA_KEY = 'currentSmartsheetTestData';

export default function TakeTestPage() {
  const [currentTest, setCurrentTest] = useState<CurrentTestData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, Option>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_TEST_DATA_KEY);
      if (storedData) {
        const parsedData: CurrentTestData = JSON.parse(storedData);
        if (parsedData && parsedData.config && parsedData.questions) {
          setCurrentTest(parsedData);
          // Initialize userAnswers if needed, though default empty is fine.
          // localStorage.removeItem(LOCAL_STORAGE_TEST_DATA_KEY); // Consider clearing after load
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

  const handleAnswerChange = (questionId: string, selectedOption: Option) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmitTest = () => {
    if (!currentTest) return;
    // For now, just log. Later, this will navigate to self-evaluation.
    console.log("Submitting test with answers:", userAnswers);
    const testDataWithAnswers = {
      ...currentTest,
      questions: currentTest.questions.map(q => ({
        ...q,
        userAnswer: userAnswers[q.id],
      })),
    };
    // Store for evaluation page
    localStorage.setItem('testForEvaluation', JSON.stringify(testDataWithAnswers));
    // router.push('/self-evaluate'); // Navigate to self-evaluation page (to be created)
    alert("Test submitted! (Self-evaluation step to be implemented next). Answers logged to console.");
    router.push('/create-test'); // Go back for now
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

  if (error || !currentTest) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Test</AlertTitle>
          <AlertDescription>
            {error || "Could not load the test details. This might happen if you refreshed the page or navigated here directly."}
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

  // Timer Display Logic (Placeholder for now)
  const renderTimerInfo = () => {
    const { timerMode, durationMinutes } = currentTest.config;
    let timerText = "No Timer";
    if (timerMode === 'timer' && durationMinutes) {
      timerText = `Timer: ${durationMinutes} minutes`;
    } else if (timerMode === 'stopwatch') {
      timerText = `Stopwatch Mode`;
    }
    return (
        <div className="flex items-center text-sm text-muted-foreground">
            <TimerIcon className="mr-2 h-4 w-4" />
            {timerText}
        </div>
    );
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl w-full max-w-3xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">{currentTest.config.name}</CardTitle>
              <CardDescription className="text-md mt-1">
                Total Questions: {currentTest.questions.length}
              </CardDescription>
            </div>
            <div className="text-right">
                {renderTimerInfo()}
                <p className="text-sm text-muted-foreground mt-1">
                    Marking: <span className="text-success-foreground bg-success/80 px-1.5 py-0.5 rounded-sm font-medium">+{currentTest.config.markingCorrect}</span> for correct, <span className="text-destructive-foreground bg-destructive/80 px-1.5 py-0.5 rounded-sm font-medium">{currentTest.config.markingIncorrect}</span> for incorrect.
                </p>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea className="h-[calc(100vh-22rem)] md:h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
          <CardContent className="p-4 md:p-6">
            <div className="space-y-6">
              {currentTest.questions.map((question, index) => (
                <Card key={question.id} className="bg-card/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{question.text}</CardTitle>
                     {/* If there's actual question text from AI, it would go here, for OMR it's just "Question X" */}
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={userAnswers[question.id]}
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
              ))}
            </div>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSubmitTest} className="w-full md:w-auto ml-auto" size="lg">
            Submit Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper icons (if not already available globally or you prefer local ones)
// You can also import from lucide-react directly if preferred
const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
