
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Test as EvaluatedTest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, BarChart3, CheckCircle2, XCircle, HelpCircle, PieChartIcon, Clock } from 'lucide-react'; // Added Clock
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"


const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

const COLORS = {
  correct: 'hsl(var(--success))', 
  incorrect: 'hsl(var(--destructive))', 
  unattempted: 'hsl(var(--muted))', 
};

const chartConfig: ChartConfig = {
  correct: {
    label: "Correct",
    color: COLORS.correct,
    icon: CheckCircle2,
  },
  incorrect: {
    label: "Incorrect",
    color: COLORS.incorrect,
    icon: XCircle,
  },
  unattempted: {
    label: "Unattempted",
    color: COLORS.unattempted,
    icon: HelpCircle,
  },
} satisfies ChartConfig;

const formatElapsedTime = (totalSeconds?: number): string => {
  if (totalSeconds === undefined || totalSeconds < 0) return "N/A";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [testResult, setTestResult] = useState<EvaluatedTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      try {
        const storedData = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_PREFIX}${testId}`);
        if (storedData) {
          const parsedData: EvaluatedTest = JSON.parse(storedData);
          setTestResult(parsedData);
        } else {
          setError("Test result not found. It might have been cleared or the link is invalid.");
        }
      } catch (e) {
        console.error("Failed to load test result:", e);
        setError("Failed to load test result data.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No Test ID provided.");
      setIsLoading(false);
    }
  }, [testId]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading results...</div>;
  }

  if (error || !testResult) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Could not display test results."}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/history')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Test History
        </Button>
      </div>
    );
  }

  const { name, config, questions, scoreDetails, evaluatedAt, elapsedTimeSeconds } = testResult;
  
  const chartData = [
    { name: 'Correct', value: scoreDetails.correctCount, fill: COLORS.correct },
    { name: 'Incorrect', value: scoreDetails.incorrectCount, fill: COLORS.incorrect },
    { name: 'Unattempted', value: scoreDetails.unattemptedCount, fill: COLORS.unattempted },
  ].filter(item => item.value > 0); // Filter out zero values for cleaner chart

  const maxPossibleScore = config.numberOfQuestions * config.markingCorrect;
  const overallPercentage = maxPossibleScore > 0 ? (scoreDetails.score / maxPossibleScore) * 100 : 0;
  // scoreDetails.percentage already holds accuracy (correct/attempted)

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl max-w-4xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold tracking-tight">Test Results: {name}</CardTitle>
          <CardDescription>
            Evaluated on: {new Date(evaluatedAt).toLocaleString()}
            <br />
            Marking: +{config.markingCorrect} for correct, {config.markingIncorrect} for incorrect. Total Questions: {questions.length}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">Score Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-lg">
                <p>Final Score:</p><p className="font-bold text-primary">{scoreDetails.score}</p>
                <p>Overall Percentage:</p><p className="font-bold">{overallPercentage.toFixed(2)}%</p>
                <p>Accuracy (Attempted):</p><p className="font-bold">{scoreDetails.percentage.toFixed(2)}%</p>
                {elapsedTimeSeconds !== undefined && (
                  <>
                    <p className="flex items-center"><Clock className="mr-2 h-5 w-5 text-muted-foreground" />Time Taken:</p>
                    <p className="font-bold">{formatElapsedTime(elapsedTimeSeconds)}</p>
                  </>
                )}
                <p className="text-success flex items-center"><CheckCircle2 className="mr-2" />Correct:</p><p className="font-bold text-success">{scoreDetails.correctCount}</p>
                <p className="text-destructive flex items-center"><XCircle className="mr-2" />Incorrect:</p><p className="font-bold text-destructive">{scoreDetails.incorrectCount}</p>
                <p className="text-muted-foreground flex items-center"><HelpCircle className="mr-2" />Unattempted:</p><p className="font-bold text-muted-foreground">{scoreDetails.unattemptedCount}</p>
              </div>
            </div>

            <div className="h-[250px] md:h-[300px]">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" labelLine={false}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Detailed Breakdown</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 border rounded-md p-3">
              {questions.map((q, index) => (
                <div key={q.id} className="p-3 border-b last:border-b-0 bg-card/30 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{q.text}</p>
                    {q.userAnswer ? (
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        q.isCorrect === true ? 'bg-success/20 text-success-foreground' : 
                        q.isCorrect === false ? 'bg-destructive/20 text-destructive-foreground' : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        Your Answer: {q.userAnswer} - {q.isCorrect === true ? "Correct" : q.isCorrect === false ? "Incorrect" : "N/A"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-muted/30 text-muted-foreground font-semibold">Unattempted</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.push('/history')}>
            <BarChart3 className="mr-2 h-4 w-4" /> View All History
          </Button>
          <Button onClick={() => router.push('/create-test')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Create Another Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
