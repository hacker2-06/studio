
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScoringRulesForm } from "@/components/settings/ScoringRulesForm";
import { TimerPreferencesForm } from "@/components/settings/TimerPreferencesForm";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Application Settings</CardTitle>
          <CardDescription>Manage your application preferences and default test settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 p-6">
          
          <section>
            <h2 className="text-lg font-semibold mb-3 text-primary">Theme</h2>
            <Card className="shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-card-foreground">Appearance Mode</span>
                <ThemeToggle />
              </CardContent>
            </Card>
          </section>

          <section>
            <ScoringRulesForm />
          </section>

          <section>
            <TimerPreferencesForm />
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
