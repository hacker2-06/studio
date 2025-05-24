
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestCreationForm } from "@/components/test/TestCreationForm";

export default function CreateTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Create New OMR Sheet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your new practice test: set the number of questions, timer, and marking scheme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestCreationForm />
        </CardContent>
      </Card>
    </div>
  );
}

