import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>Review your past test performances and results.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test history table will be here.</p>
          {/* TODO: Implement TestHistoryTable component */}
        </CardContent>
      </Card>
    </div>
  );
}
