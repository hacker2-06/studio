
"use client";

import type { CurrentTestData, Question, Test as EvaluatedTest, Option } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, CheckCircle2, XCircle, HelpCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; 

const LOCAL_STORAGE_EVALUATION_KEY = 'testForEvaluation';
const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

export default function SelfEvaluatePage() {
  const [testData, setTestData] = useState<CurrentTestData | null>(null);
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_EVALUATION_KEY);
      if (storedData) {
        const parsedData: CurrentTestData = JSON.parse(storedData);
        if (parsedData && parsedData.config && parsedData.questions) {
          setTestData(parsedData); // This now includes elapsedTimeSeconds if available
          setEvaluatedQuestions(parsedData.questions.map(q => ({ ...q, isCorrect: undefined })));
        } else {
          setError("Evaluation data is incomplete. Please try taking the test again.");
        }
      } else {
        setError("No test data found for evaluation. Please take a test first.");
      }
    } catch (e) {
      console.error("Failed to load test data for evaluation:", e);
      setError("Failed to load test data. Please try taking the test again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMarkAnswer = (questionId: string, isCorrect: boolean) => {
    setEvaluatedQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, isCorrect } : q
      )
    );
  };

  const handleCompleteEvaluation = () => {
    if (!testData || evaluatedQuestions.some(q => q.isCorrect === undefined && q.userAnswer !== undefined)) {
        toast({
            title: "Evaluation Incomplete",
            description: "Please mark all answered questions as correct or incorrect before completing.",
            variant: "destructive",
        });
      return;
    }

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    evaluatedQuestions.forEach(q => {
      if (q.userAnswer === undefined) {
        unattemptedCount++;
      } else if (q.isCorrect === true) {
        correctCount++;
        score += testData.config.markingCorrect;
      } else if (q.isCorrect === false) {
        incorrectCount++;
        score += testData.config.markingIncorrect;
      }
    });

    const totalAttempted = correctCount + incorrectCount;
    const accuracyPercentage = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0;
    const testId = uuidv4();
    
    const finalEvaluatedTest: EvaluatedTest = {
      id: testId,
      name: testData.config.name,
      config: testData.config,
      questions: evaluatedQuestions, 
      status: 'evaluated',
      createdAt: new Date().toISOString(), // Placeholder
      submittedAt: new Date().toISOString(), // Placeholder
      evaluatedAt: new Date().toISOString(),
      scoreDetails: {
        score,
        correctCount,
        incorrectCount,
        unattemptedCount,
        percentage: accuracyPercentage, // This field now stores accuracy (correct/attempted)
      },
      elapsedTimeSeconds: testData.elapsedTimeSeconds, // Pass along elapsedTimeSeconds
    };

    try {
      localStorage.setItem(`${LOCAL_STORAGE_HISTORY_PREFIX}${testId}`, JSON.stringify(finalEvaluatedTest));
      localStorage.removeItem(LOCAL_STORAGE_EVALUATION_KEY);
      toast({
        title: "Evaluation Complete!",
        description: `Your score is ${score}. Results saved to history.`,
      });
      router.push(`/results/${testId}`);
    } catch (e) {
      console.error("Error saving evaluated test:", e);
      setError("Could not save your evaluation. Please try again.");
      toast({
        title: "Error Saving Evaluation",
        description: "Could not save your evaluation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Evaluation</AlertTitle>
          <AlertDescription>
            {error || "Could not load data for evaluation."}
          </AlertDescription>
        </Alert>
         <Button onClick={() => router.push('/create-test')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Create New Test
        </Button>
      </div>
    );
  }
  
  const getMarkingButtonClass = (question: Question, type: 'correct' | 'incorrect') => {
    if (type === 'correct' && question.isCorrect === true) return "bg-success text-success-foreground hover:bg-success/90";
    if (type === 'incorrect' && question.isCorrect === false) return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    return "bg-muted text-muted-foreground hover:bg-muted/80";
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl w-full max-w-3xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold tracking-tight">Self-Evaluate: {testData.config.name}</CardTitle>
          <CardDescription>
            Review your answers and mark each one as correct or incorrect.
            <br/>
            Marking: +{testData.config.markingCorrect} for correct, {testData.config.markingIncorrect} for incorrect.
          </CardDescription>
        </CardHeader>

        <ScrollArea className="h-[calc(100vh-24rem)] md:h-[calc(100vh-22rem)]">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-6">
              {evaluatedQuestions.map((question, index) => (
                <Card key={question.id} className="bg-card/50 shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-lg font-semibold">{question.text}</p>
                    {question.userAnswer ? (
                      <p className="text-sm">Your Answer: <span className="font-bold text-primary">{question.userAnswer}</span></p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic flex items-center"><HelpCircle className="w-4 h-4 mr-1"/>Unattempted</p>
                    )}
                  </div>
                  
                  {question.userAnswer && ( 
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAnswer(question.id, true)}
                        className={cn("flex-1", getMarkingButtonClass(question, 'correct'))}
                        variant={question.isCorrect === true ? "default" : "outline"}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Correct
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAnswer(question.id, false)}
                        className={cn("flex-1", getMarkingButtonClass(question, 'incorrect'))}
                        variant={question.isCorrect === false ? "default" : "outline"}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Mark Incorrect
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </ScrollArea>

        <CardFooter className="border-t pt-6">
          <Button onClick={handleCompleteEvaluation} className="w-full md:w-auto ml-auto" size="lg">
            Complete Evaluation & View Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
