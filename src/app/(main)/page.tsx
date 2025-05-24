
"use client"; // Keep this if it was there, or add if needed for dynamic imports with client-side focus

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Greeting } from "@/components/dashboard/Greeting";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { FilePlus2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import PerformanceChart with SSR turned off
const PerformanceChart = dynamic(
  () => import('@/components/dashboard/PerformanceChart').then(mod => mod.PerformanceChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-lg" /> // Placeholder for chart
  }
);

// Dynamically import RecentTestHistory with SSR turned off
const RecentTestHistory = dynamic(
  () => import('@/components/dashboard/RecentTestHistory').then(mod => mod.RecentTestHistory),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> // Placeholder for history
  }
);

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Greeting />
      
      <MotivationalQuote />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-1">
          <RecentTestHistory />
        </div>
      </div>
      
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Ready for a New Challenge?</CardTitle>
          <CardDescription>
            Create a new OMR sheet, start your test, and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/create-test" passHref legacyBehavior>
            <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <FilePlus2 className="mr-2 h-5 w-5" /> Create New Test
            </Button>
          </Link>
        </CardContent>
      </Card>

    </div>
  );
}
