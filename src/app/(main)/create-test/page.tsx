
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestCreationForm } from "@/components/test/TestCreationForm";

export default function CreateTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Create New Test</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your new test by providing a name, number of questions, timer settings, and marking rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestCreationForm />
        </CardContent>
      </Card>
    </div>
  );
}
