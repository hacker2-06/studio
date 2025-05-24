
"use client";

import { useEffect, useState } from 'react';
import type { Test } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { Eye, AlertCircle, FilePlus2, BarChartHorizontalBig } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card'; // Added Card for empty state

const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

export function TestHistoryTable() {
  const [history, setHistory] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const testHistoryKeys = keys.filter(key => key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX));
      
      const loadedTests: Test[] = testHistoryKeys.map(key => {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as Test;
        }
        return null; // Should not happen if key exists
      }).filter(test => test !== null) as Test[]; // Filter out any nulls if parsing failed unexpectedly

      // Sort tests by evaluatedAt date, most recent first
      loadedTests.sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
      
      setHistory(loadedTests);
    } catch (e) {
      console.error("Failed to load test history:", e);
      setError("Could not load test history. Data might be corrupted.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading History</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
        <Card className="text-center py-10 border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <BarChartHorizontalBig className="h-16 w-16 text-muted-foreground/70" />
                <h3 className="text-xl font-semibold text-muted-foreground">No Test History Found</h3>
                <p className="text-muted-foreground">
                    You haven't completed any tests yet.
                </p>
                <Button onClick={() => router.push('/create-test')}>
                    <FilePlus2 className="mr-2 h-4 w-4" /> Create Your First Test
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableCaption className="py-4">A list of your completed tests. Most recent tests are shown first.</TableCaption>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[250px] font-semibold">Test Name</TableHead>
            <TableHead className="font-semibold">Date Evaluated</TableHead>
            <TableHead className="text-right font-semibold">Score</TableHead>
            <TableHead className="text-right font-semibold">Accuracy</TableHead>
            <TableHead className="text-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="font-medium">{test.name}</TableCell>
              <TableCell>{new Date(test.evaluatedAt).toLocaleDateString()} ({new Date(test.evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</TableCell>
              <TableCell className="text-right font-bold text-primary">{test.scoreDetails.score}</TableCell>
              <TableCell className="text-right">{test.scoreDetails.percentage.toFixed(2)}%</TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/results/${test.id}`)}
                  className="hover:bg-primary/10 hover:text-primary"
                  aria-label={`View results for ${test.name}`}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Results
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
