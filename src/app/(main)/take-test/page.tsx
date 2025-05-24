
"use client";

import type { AIQuestion, TestCreationData } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface CurrentTestData {
  config: TestCreationData;
  questions: AIQuestion[];
}

const LOCAL_STORAGE_TEST_DATA_KEY = 'currentSmartsheetTestData';

export default function TakeTestPage() {
  const [currentTest, setCurrentTest] = useState<CurrentTestData | null>(null);
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
          // Optional: Clear the data from localStorage after loading to prevent reuse on refresh
          // or if the user navigates away and back without creating a new test.
          // localStorage.removeItem(LOCAL_STORAGE_TEST_DATA_KEY); 
        } else {
          setError("Test data is incomplete or malformed. Please try creating the test again.");
        }
      } else {
        setError("No test data found. Please create a test first.");
      }
    } catch (e) {
      console.error("Failed to load test data from localStorage:", e);
      setError("Failed to load test data. Please try creating the test again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <p className="text-xl text-muted-foreground">Loading test...</p>
      </div>
    );
  }

  if (error || !currentTest) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Test</AlertTitle>
          <AlertDescription>
            {error || "Could not load the test. Please go back and create a new test."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/create-test')} className="mt-4">
          Create New Test
        </Button>
      </div>
    );
  }

  // Placeholder for OMR Sheet UI
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">{currentTest.config.name}</CardTitle>
          <CardDescription className="text-lg">
            Topic: {currentTest.config.topic} | Questions: {currentTest.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">OMR Sheet / Test Interface</h2>
          <p className="text-muted-foreground mb-2">
            This is where the questions and answer options will be displayed.
          </p>
          <p>Timer: {currentTest.config.timerMode}{currentTest.config.timerMode === 'timer' && currentTest.config.durationMinutes ? ` (${currentTest.config.durationMinutes} mins)` : ''}</p>
          <p>Marking: +{currentTest.config.markingCorrect} for correct, {currentTest.config.markingIncorrect} for incorrect.</p>
          
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h3 className="font-semibold">Developer Note:</h3>
            <p className="text-sm">The actual OMR interface with questions and options needs to be implemented here.</p>
            <p className="text-sm mt-2">Number of questions received: {currentTest.questions.length}</p>
            {currentTest.questions.map((q, index) => (
              <details key={index} className="mt-1 text-xs">
                <summary>Question {index + 1} (Click to expand)</summary>
                <pre className="bg-background p-2 rounded text-xs whitespace-pre-wrap">
                  {JSON.stringify(q, null, 2)}
                </pre>
              </details>
            ))}
          </div>

          <Button className="mt-8 w-full md:w-auto" variant="default">
            Submit Test (Not implemented)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
