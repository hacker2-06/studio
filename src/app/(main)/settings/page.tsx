import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle"; // Example of using a setting component

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application preferences and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Theme</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Default Scoring Rules</h3>
            <p>Scoring rule settings will be here.</p>
            {/* TODO: Implement ScoringRulesForm component */}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Timer Preferences</h3>
            <p>Timer preference settings will be here.</p>
            {/* TODO: Implement TimerPreferencesForm component */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
