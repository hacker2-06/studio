
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, DownloadCloud, AlertTriangle, FileUp, Construction } from "lucide-react"; // Added Construction
import type { Test } from "@/lib/types";

const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

export function BackupRestoreData() {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false); // Keep for potential future UI state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showComingSoonToast = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "This functionality is currently under development and will be available in a future update.",
      variant: "default",
      duration: 3000,
      className: "bg-primary/10 text-primary-foreground border-primary", // A bit of custom styling for the toast
    });
  };

  const handleBackup = () => {
    showComingSoonToast();
    // try {
    //   const historyItems: Test[] = [];
    //   let itemsSkipped = 0;
    //   for (let i = 0; i < localStorage.length; i++) {
    //     const key = localStorage.key(i);
    //     if (key && key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX)) {
    //       const item = localStorage.getItem(key);
    //       if (item) {
    //         try {
    //           historyItems.push(JSON.parse(item));
    //         } catch (parseError) {
    //           itemsSkipped++;
    //           console.warn(`Skipping corrupted item in localStorage (key: ${key}):`, parseError);
    //         }
    //       }
    //     }
    //   }

    //   if (itemsSkipped > 0) {
    //     toast({
    //       title: "Backup Partially Complete",
    //       description: `${itemsSkipped} item(s) in your history were corrupted and could not be backed up. The rest were saved.`,
    //       variant: "default",
    //       duration: 5000,
    //     });
    //   }

    //   if (historyItems.length === 0 && itemsSkipped === 0) {
    //     toast({
    //       title: "No History Found",
    //       description: "There is no test history to back up.",
    //       variant: "default",
    //     });
    //     return;
    //   } else if (historyItems.length === 0 && itemsSkipped > 0) {
    //      // Already handled by the "partially complete" toast logic if only corrupted items existed.
    //      // Or, if all items were corrupt and historyItems is empty.
    //      return;
    //   }


    //   const jsonData = JSON.stringify(historyItems, null, 2);
    //   const blob = new Blob([jsonData], { type: "application/json" });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   const backupDate = new Date().toISOString().slice(0,10);
    //   a.download = `neetsheet_history_backup_${backupDate}.json`;
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   URL.revokeObjectURL(url);

    //   if (itemsSkipped === 0 && historyItems.length > 0) { // Only show full success if no items were skipped
    //       toast({
    //         title: "Backup Successful",
    //         description: "Your test history has been downloaded.",
    //       });
    //   }
    // } catch (error) {
    //   console.error("Backup failed:", error);
    //   toast({
    //     title: "Backup Failed",
    //     description: "Could not back up your test history. Please try again.",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleRestoreInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    showComingSoonToast();
    // const file = event.target.files?.[0];
    // if (!file) {
    //   return;
    // }
    // setIsRestoring(true); // Future use
    // Original restore logic...
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    // setIsRestoring(false); // Future use
  };

  const handleRestoreButtonClick = () => {
    showComingSoonToast();
    // fileInputRef.current?.click(); // This would open the dialog if not coming soon
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Construction className="mr-3 h-6 w-6 text-amber-500" />
          Backup & Restore Test History
        </CardTitle>
        <CardDescription>
          Save your test history to a file or restore it from a backup. (This feature is currently under development)
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
                <span className="font-semibold">Warning:</span> Restoring from a backup will <span className="font-bold">erase all current test history</span> in the app before importing data from the file. (Feature Coming Soon)
              </div>
            </div>
          <p className="text-sm text-muted-foreground">
            Upload a previously downloaded backup file (.json) to restore your history.
          </p>
          <Input
            id="restoreFile"
            type="file"
            accept=".json"
            onChange={handleRestoreInputChange}
            disabled // Visually disable, click handled by button which shows toast
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            onClick={handleRestoreButtonClick} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <FileUp className="mr-2 h-5 w-5" />
            Choose File to Restore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
