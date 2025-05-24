
"use client";

import type { Test } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowRight, BarChartHorizontalBig, FilePlus2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';
const MAX_RECENT_TESTS = 3;

export function RecentTestHistory() {
  const [recentTests, setRecentTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const testHistoryKeys = keys.filter(key => key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX));
      
      const loadedTests: Test[] = testHistoryKeys.map(key => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) as Test : null;
      }).filter(test => test !== null) as Test[];

      loadedTests.sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
      setRecentTests(loadedTests.slice(0, MAX_RECENT_TESTS));
    } catch (e) {
      console.error("Failed to load recent test history:", e);
      // setError("Could not load recent test history."); // Optional: handle error display
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <ListChecks className="mr-3 h-6 w-6 text-primary" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(MAX_RECENT_TESTS)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-32 rounded-md ml-auto" />
        </CardFooter>
      </Card>
    );
  }

  if (recentTests.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <ListChecks className="mr-3 h-6 w-6 text-primary" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <BarChartHorizontalBig className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3" />
          <p className="text-muted-foreground">No tests taken yet.</p>
          <p className="text-sm text-muted-foreground">Complete a test to see your history here.</p>
           <Button onClick={() => router.push('/create-test')} className="mt-4">
              <FilePlus2 className="mr-2 h-4 w-4" /> Create First Test
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <ListChecks className="mr-3 h-6 w-6 text-primary" />
          Recent Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTests.map(test => (
          <div 
            key={test.id} 
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => router.push(`/results/${test.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/results/${test.id}`)}
            aria-label={`View results for ${test.name}`}
          >
            <div>
              <p className="font-medium text-foreground">{test.name}</p>
              <p className="text-xs text-muted-foreground">
                Evaluated: {new Date(test.evaluatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">{test.scoreDetails.score} pts</p>
              <p className="text-xs text-muted-foreground">
                 {test.scoreDetails.percentage.toFixed(1)}% Acc.
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      {recentTests.length > 0 && (
         <CardFooter className="pt-4">
            <Button variant="outline" onClick={() => router.push('/history')} className="w-full sm:w-auto ml-auto">
                View All History <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
