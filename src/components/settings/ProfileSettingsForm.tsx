
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
import { Save, CalendarDays, Flame, Target } from "lucide-react"; // Added icons

const currentYear = new Date().getFullYear();
const targetYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
const classOptions = ["Class 11", "Class 12", "Dropper (1st Year)", "Dropper (2nd+ Year)", "Other"];

export function ProfileSettingsForm() {
  const { userProfile, setUserProfile } = useSettings();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [neetClass, setNeetClass] = useState("");
  const [targetNeetYear, setTargetNeetYear] = useState<string>(targetYears[1].toString());
  const [weeklyTestGoal, setWeeklyTestGoal] = useState<string>("3");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setNeetClass(userProfile.neetClass || "");
      setTargetNeetYear(userProfile.targetNeetYear?.toString() || targetYears[1].toString());
      setWeeklyTestGoal(userProfile.weeklyTestGoal?.toString() || "3");
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
    const goal = parseInt(weeklyTestGoal, 10);
    if (isNaN(goal) || goal < 0) {
      toast({
        title: "Invalid Goal",
        description: "Weekly test goal must be a non-negative number.",
        variant: "destructive",
      });
      return;
    }

    const updatedProfile: UserProfile = {
      ...(userProfile || { dailyStreak: 0 }), // Preserve existing streak data or default
      name: name.trim(),
      neetClass: neetClass || undefined,
      targetNeetYear: parseInt(targetNeetYear, 10),
      weeklyTestGoal: goal,
      // dailyStreak and lastTestCompletedDate are managed by recordTestCompletion, so we don't overwrite them here unless not present
      dailyStreak: userProfile?.dailyStreak || 0,
      lastTestCompletedDate: userProfile?.lastTestCompletedDate,
    };
    setUserProfile(updatedProfile);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return "Invalid Date";
    }
  };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Your Profile</CardTitle>
        <CardDescription>Manage your personal information and goals for NeetSheet.</CardDescription>
      </CardHeader>
      <CardContent>
        {userProfile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center">
              <Flame className="mr-2 h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Streak</p>
                <p className="text-lg font-semibold">{userProfile.dailyStreak || 0} Day{userProfile.dailyStreak !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Test Completed</p>
                <p className="text-lg font-semibold">{formatDate(userProfile.lastTestCompletedDate)}</p>
              </div>
            </div>
          </div>
        )}
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

          <div className="space-y-2">
              <Label htmlFor="profileWeeklyTestGoal" className="text-base flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-600"/> Weekly Test Goal
              </Label>
              <Input
                id="profileWeeklyTestGoal"
                type="number"
                value={weeklyTestGoal}
                onChange={(e) => setWeeklyTestGoal(e.target.value)}
                placeholder="e.g., 3"
                min="0"
                className="text-base"
              />
               <p className="text-xs text-muted-foreground">How many tests do you aim to complete each week?</p>
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
