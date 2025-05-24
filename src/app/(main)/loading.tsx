
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))] flex-col items-center justify-center"> {/* Adjust height based on header/footer */}
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading page...</p>
    </div>
  );
}
