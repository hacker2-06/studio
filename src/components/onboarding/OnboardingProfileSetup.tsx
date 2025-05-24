
"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface OnboardingProfileSetupProps {
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null; // For editing mode
}

const currentYear = new Date().getFullYear();
const targetYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
const classOptions = ["Class 11", "Class 12", "Dropper (1st Year)", "Dropper (2nd+ Year)", "Other"];

export function OnboardingProfileSetup({ onSave, initialProfile }: OnboardingProfileSetupProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [neetClass, setNeetClass] = useState(initialProfile?.neetClass || "");
  const [targetNeetYear, setTargetNeetYear] = useState<string>(
    initialProfile?.targetNeetYear?.toString() || targetYears[1].toString() // Default to next year
  );
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    onSave({
      name: name.trim(),
      neetClass: neetClass || undefined, // Store as undefined if empty
      targetNeetYear: parseInt(targetNeetYear, 10),
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Tell Us About Yourself</CardTitle>
          <CardDescription className="text-muted-foreground">
            This will help us personalize your NeetSheet experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aspirant Kumar"
                className="text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neetClass" className="text-base">Your Class (Optional)</Label>
              <Select value={neetClass} onValueChange={setNeetClass}>
                <SelectTrigger id="neetClass" className="text-base">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-base">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetNeetYear" className="text-base">Target NEET Year</Label>
              <Select value={targetNeetYear} onValueChange={setTargetNeetYear}>
                <SelectTrigger id="targetNeetYear" className="text-base">
                  <SelectValue placeholder="Select your target year" />
                </SelectTrigger>
                <SelectContent>
                  {targetYears.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-base">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" className="w-full">
              <Save className="mr-2 h-5 w-5" />
              Save & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
       <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
