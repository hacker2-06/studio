
"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const currentYear = new Date().getFullYear();
const targetYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
const classOptions = ["Class 11", "Class 12", "Dropper (1st Year)", "Dropper (2nd+ Year)", "Other"];

export function ProfileSettingsForm() {
  const { userProfile, setUserProfile } = useSettings();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [neetClass, setNeetClass] = useState("");
  const [targetNeetYear, setTargetNeetYear] = useState<string>(targetYears[1].toString()); // Default to next year

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setNeetClass(userProfile.neetClass || "");
      setTargetNeetYear(userProfile.targetNeetYear?.toString() || targetYears[1].toString());
    }
  }, [userProfile]);

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
    const updatedProfile: UserProfile = {
      name: name.trim(),
      neetClass: neetClass || undefined,
      targetNeetYear: parseInt(targetNeetYear, 10),
    };
    setUserProfile(updatedProfile);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Your Profile</CardTitle>
        <CardDescription>Manage your personal information for NeetSheet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileName" className="text-base">Your Name</Label>
            <Input
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirant Kumar"
              className="text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileNeetClass" className="text-base">Your Class (Optional)</Label>
            <Select value={neetClass} onValueChange={setNeetClass}>
              <SelectTrigger id="profileNeetClass" className="text-base">
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
            <Label htmlFor="profileTargetNeetYear" className="text-base">Target NEET Year</Label>
            <Select value={targetNeetYear} onValueChange={setTargetNeetYear}>
              <SelectTrigger id="profileTargetNeetYear" className="text-base">
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

          <Button type="submit" className="w-full sm:w-auto">
            <Save className="mr-2 h-5 w-5" />
            Save Profile Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
