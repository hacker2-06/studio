
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestHistoryTable } from "@/components/test/TestHistoryTable";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Test History</CardTitle>
          <CardDescription>Review your past test performances, detailed results, and trends over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading history...</p></div>}>
            <TestHistoryTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
