
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScoringRulesForm } from "@/components/settings/ScoringRulesForm";
import { TimerPreferencesForm } from "@/components/settings/TimerPreferencesForm";
import { BackupRestoreData } from "@/components/settings/BackupRestoreData";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm"; // Import new component
import { Palette, ListChecks, DatabaseZap, UserCircle, Settings2 } from "lucide-react"; // Added UserCircle, Settings2 for better icon representation

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold tracking-tight">Application Settings</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground pt-1">
            Manage your application preferences, default test settings, profile, and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full space-y-6" defaultValue="profile">
            
            <AccordionItem value="profile" className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg font-semibold">
                <div className="flex items-center">
                  <UserCircle className="mr-3 h-6 w-6 text-primary" />
                  Your Profile
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <ProfileSettingsForm />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="appearance" className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg font-semibold">
                <div className="flex items-center">
                  <Palette className="mr-3 h-6 w-6 text-primary" />
                  Appearance
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 flex items-center justify-between">
                    <span className="text-card-foreground text-base">Theme Mode</span>
                    <ThemeToggle />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="test_defaults" className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg font-semibold">
                <div className="flex items-center">
                  <ListChecks className="mr-3 h-6 w-6 text-primary" />
                  Test Defaults
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
                <ScoringRulesForm />
                <TimerPreferencesForm />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data_management" className="border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg font-semibold">
                <div className="flex items-center">
                  <DatabaseZap className="mr-3 h-6 w-6 text-primary" />
                  Data Management
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <BackupRestoreData />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
