
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, DownloadCloud, AlertTriangle, FileUp, Construction, AlertCircle } from "lucide-react";
import type { Test } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const LOCAL_STORAGE_HISTORY_PREFIX = 'smartsheet_test_history_';

export function BackupRestoreData() {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [fileToRestore, setFileToRestore] = useState<File | null>(null);


  const handleBackup = () => {
    try {
      const historyItems: Test[] = [];
      let itemsSkipped = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_HISTORY_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsedItem = JSON.parse(item);
              // Basic validation for a test item
              if (parsedItem && parsedItem.id && parsedItem.config && parsedItem.questions && parsedItem.scoreDetails) {
                historyItems.push(parsedItem);
              } else {
                itemsSkipped++;
                console.warn(`Skipping malformed item in localStorage (key: ${key}): Item does not appear to be a valid Test object.`);
              }
            } catch (parseError) {
              itemsSkipped++;
              console.warn(`Skipping corrupted item in localStorage (key: ${key}):`, parseError);
            }
          }
        }
      }

      if (historyItems.length === 0 && itemsSkipped === 0) {
        toast({
          title: "No History Found",
          description: "There is no test history to back up.",
          variant: "default",
        });
        return;
      }
      
      if (historyItems.length === 0 && itemsSkipped > 0) {
         toast({
          title: "Backup Failed",
          description: "No valid test history found to back up. All stored items were corrupted or malformed.",
          variant: "destructive",
        });
        return;
      }


      const jsonData = JSON.stringify(historyItems, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const backupDate = new Date().toISOString().slice(0,10);
      a.download = `neetsheet_history_backup_${backupDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (itemsSkipped > 0) {
        toast({
          title: "Backup Partially Complete",
          description: `${historyItems.length} test(s) backed up. ${itemsSkipped} item(s) were corrupted or malformed and could not be included.`,
          variant: "default",
          duration: 7000,
        });
      } else {
          toast({
            title: "Backup Successful",
            description: `Successfully backed up ${historyItems.length} test(s).`,
          });
      }
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "Could not back up your test history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const proceedWithRestore = async () => {
    if (!fileToRestore) return;

    setIsRestoring(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const restoredData = JSON.parse(text);

        if (!Array.isArray(restoredData)) {
          throw new Error("Invalid backup file format. Expected an array of tests.");
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

        // Add restored data
        let importedCount = 0;
        let skippedCount = 0;
        restoredData.forEach((test: any) => {
          // Basic validation
          if (test && test.id && test.config && test.questions && test.scoreDetails) {
            localStorage.setItem(`${LOCAL_STORAGE_HISTORY_PREFIX}${test.id}`, JSON.stringify(test));
            importedCount++;
          } else {
            skippedCount++;
            console.warn("Skipping malformed test object during restore:", test);
          }
        });
        
        if (importedCount > 0) {
            toast({
                title: "Restore Successful",
                description: `Successfully restored ${importedCount} test(s). ${skippedCount > 0 ? `${skippedCount} items were skipped due to issues.` : ''}`,
            });
        } else if (skippedCount > 0) {
             toast({
                title: "Restore Problem",
                description: `No tests could be restored. ${skippedCount} items in the backup file were malformed or invalid.`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "No Data Restored",
                description: "The backup file was empty or contained no valid test data.",
                variant: "default",
            });
        }
        // Reload the page to reflect changes in history tab or other parts of the app
        // This is a simple way to ensure data consistency across the app after restore.
        // A more sophisticated approach might involve global state management updates.
        window.location.reload();


      } catch (err) {
        console.error("Restore failed:", err);
        toast({
          title: "Restore Failed",
          description: err instanceof Error ? err.message : "Invalid backup file or an error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
        setFileToRestore(null);
      }
    };

    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
      setIsRestoring(false);
       if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      setFileToRestore(null);
    };

    reader.readAsText(fileToRestore);
    setShowRestoreConfirm(false);
  };


  const handleRestoreInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToRestore(file);
      setShowRestoreConfirm(true); // Trigger confirmation dialog
    } else {
        setFileToRestore(null);
    }
     // Reset file input visually so the same file can be selected again if needed after a cancel
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRestoreButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <DownloadCloud className="mr-3 h-6 w-6 text-primary" /> {/* Changed icon */}
          Backup & Restore Test History
        </CardTitle>
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
          <Input
            id="restoreFile"
            type="file"
            accept=".json"
            onChange={handleRestoreInputChange}
            ref={fileInputRef}
            className="hidden" // Keep input hidden, trigger with button
          />
          <Button 
            onClick={handleRestoreButtonClick} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={isRestoring}
          >
            {isRestoring ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileUp className="mr-2 h-5 w-5" />}
            {isRestoring ? "Restoring..." : "Choose File to Restore"}
          </Button>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertCircle className="mr-2 h-6 w-6 text-destructive"/> Confirm Restore
            </AlertDialogTitle>
            <AlertDialogDescription>
              Restoring from the backup file <span className="font-semibold">{fileToRestore?.name}</span> will <strong className="text-destructive-foreground">permanently erase all current test history</strong> in this app. This action cannot be undone.
              <br/><br/>
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToRestore(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithRestore} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, Erase & Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    