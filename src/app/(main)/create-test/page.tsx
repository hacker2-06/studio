import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Test</CardTitle>
          <CardDescription>Configure your new test by providing a name, number of questions, and other settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test creation form will be here.</p>
          {/* TODO: Implement TestCreationForm component */}
        </CardContent>
      </Card>
    </div>
  );
}
