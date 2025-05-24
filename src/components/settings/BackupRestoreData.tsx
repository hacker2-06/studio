
"use client";

import { useState, useRef } from "react"; // Added useRef
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, DownloadCloud, AlertTriangle, FileUp } from "lucide-react"; // Added FileUp
import type { Test } from "@/lib/types";

const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

export function BackupRestoreData() {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  const handleBackup = () => {
    try {
      const historyItems: Test[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            historyItems.push(JSON.parse(item));
          }
        }
      }

      if (historyItems.length === 0) {
        toast({
          title: "No History Found",
          description: "There is no test history to back up.",
          variant: "default",
        });
        return;
      }

      const jsonData = JSON.stringify(historyItems, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const_date = new Date().toISOString().slice(0,10);
      a.download = `neetsheet_history_backup_${const_date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Successful",
        description: "Your test history has been downloaded.",
      });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "Could not back up your test history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // No toast here, as user might have cancelled file dialog
      return;
    }

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error("Invalid file content.");
        }
        const restoredHistory: Test[] = JSON.parse(content);

        if (!Array.isArray(restoredHistory) || !restoredHistory.every(item => item.id && item.config && item.questions && item.scoreDetails)) {
          throw new Error("Invalid backup file format. Ensure it's a valid NeetSheet backup.");
        }
        
        // Clear existing history
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Add restored items
        restoredHistory.forEach(test => {
          localStorage.setItem(`${LOCAL_STORAGE_HISTORY_PREFIX}${test.id}`, JSON.stringify(test));
        });

        toast({
          title: "Restore Successful",
          description: `Successfully restored ${restoredHistory.length} test(s). Refresh the history page to see changes.`,
        });
      } catch (error) {
        console.error("Restore failed:", error);
        toast({
          title: "Restore Failed",
          description: `Could not restore history: ${error instanceof Error ? error.message : "Invalid file or format."}`,
          variant: "destructive",
        });
      } finally {
        setIsRestoring(false);
        // Reset file input value to allow selecting the same file again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Backup & Restore Test History</CardTitle>
        <CardDescription>
          Save your test history to a file or restore it from a backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Backup</h3>
          <p className="text-sm text-muted-foreground">
            Download all your test history as a JSON file. Keep this file safe.
          </p>
          <Button onClick={handleBackup} className="w-full sm:w-auto">
            <DownloadCloud className="mr-2 h-5 w-5" />
            Backup Test History
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Restore</h3>
           <div className="flex items-start p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive-foreground text-sm">
              <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 shrink-0 text-destructive" />
              <div>
                <span className="font-semibold">Warning:</span> Restoring from a backup will <span className="font-bold">erase all current test history</span> in the app before importing data from the file.
              </div>
            </div>
          <p className="text-sm text-muted-foreground">
            Upload a previously downloaded backup file (.json) to restore your history.
          </p>
          {/* Hidden file input */}
          <Input
            id="restoreFile"
            type="file"
            accept=".json"
            onChange={handleRestoreInputChange}
            disabled={isRestoring}
            ref={fileInputRef}
            className="hidden" // Hide the default input
          />
          {/* Custom button to trigger file input */}
          <Button 
            onClick={handleRestoreButtonClick} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={isRestoring}
          >
            {isRestoring ? (
              <>
                <UploadCloud className="mr-2 h-5 w-5 animate-pulse" />
                Restoring...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-5 w-5" />
                Choose File to Restore
              </>
            )}
          </Button>
          {isRestoring && (
            <p className="text-sm text-primary flex items-center">
              Processing file... Please wait.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

