
"use client";

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMBED_URL = "https://hoichoidev.netlify.app/";

export default function OttPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // Used to force iframe reload on retry

  useEffect(() => {
    // Reset states if iframeKey changes (on retry)
    setIsLoading(true);
    setHasError(false);
  }, [iframeKey]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIframeKey(prevKey => prevKey + 1);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-xl">Loading content...</p>
        </div>
      )}

      {hasError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 p-8 bg-black/90">
          <AlertTriangle className="h-20 w-20 text-destructive mb-6" />
          <h2 className="text-3xl font-semibold mb-3">Oops! Content Unavailable</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            We couldn't load the content right now. This might be due to a network issue, 
            or the content provider might be temporarily down or not allowing embedding.
          </p>
          <Button onClick={handleRetry} size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </div>
      )}

      <iframe
        key={iframeKey}
        src={EMBED_URL}
        title="Embedded OTT Content"
        className={`h-full w-full border-0 transition-opacity duration-500 ${isLoading || hasError ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts" // Reinstated allow-scripts
      />
    </div>
  );
}
