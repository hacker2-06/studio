
"use client";

import type { Test } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';

const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';
const MAX_CHART_ITEMS = 5; // Show up to 5 most recent tests in chart

const chartConfig = {
  overallPercentage: {
    label: "Overall %",
    color: "hsl(var(--primary))",
    icon: TrendingUp,
  },
} satisfies ChartConfig;

export function PerformanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const testHistoryKeys = keys.filter(key => key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX));
      
      let loadedTests: Test[] = testHistoryKeys.map(key => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) as Test : null;
      }).filter(test => test !== null) as Test[];

      loadedTests.sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime()); // Oldest to newest for chart progression
      
      const recentTestsForChart = loadedTests.slice(-MAX_CHART_ITEMS); // Take last N for chart

      const formattedData = recentTestsForChart.map(test => {
        const maxPossibleScore = test.config.numberOfQuestions * test.config.markingCorrect;
        const overallPercentage = maxPossibleScore > 0 ? (test.scoreDetails.score / maxPossibleScore) * 100 : 0;
        return {
          name: new Date(test.evaluatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          overallPercentage: parseFloat(overallPercentage.toFixed(1)), // Keep one decimal place
        };
      });
      setChartData(formattedData);
    } catch (e) {
      console.error("Failed to load data for performance chart:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <BarChart className="mr-3 h-6 w-6 text-primary" />
            Recent Performance
          </CardTitle>
          <CardDescription>Your scores over the last few tests.</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <BarChart className="mr-3 h-6 w-6 text-primary" />
            Recent Performance
          </CardTitle>
           <CardDescription>Your scores over the last few tests.</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3" />
          <p className="text-muted-foreground">No performance data yet.</p>
          <p className="text-sm text-muted-foreground">Complete some tests to see your progress.</p>
        </CardContent>
      </Card>
    );
  }
  
  const yAxisDomain = [0, 100];


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <BarChart className="mr-3 h-6 w-6 text-primary" />
          Recent Performance
        </CardTitle>
        <CardDescription>Your overall percentage scores from recent tests.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] pr-0 pl-2 pb-0 pt-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                fontSize={12}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                domain={yAxisDomain}
                tickFormatter={(value) => `${value}%`}
                fontSize={12}
              />
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent indicator="dot" hideLabel />} 
              />
              <Bar dataKey="overallPercentage" fill="var(--color-overallPercentage)" radius={4}>
                 <LabelList 
                    dataKey="overallPercentage" 
                    position="top" 
                    offset={5} 
                    className="fill-foreground" 
                    fontSize={11}
                    formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
