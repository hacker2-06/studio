
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from 'lucide-react'; // Using Zap for a 'spark' of motivation

const quotes = [
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Strive for progress, not perfection.", author: "Unknown" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" }
];

export function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState<{ quote: string; author: string } | null>(null);

  useEffect(() => {
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!currentQuote) {
    return null; // Or a loading skeleton
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-6 w-6 text-yellow-500 mt-1 shrink-0" />
          <div>
            <blockquote className="text-lg font-medium italic text-foreground">
              "{currentQuote.quote}"
            </blockquote>
            <p className="mt-2 text-sm text-muted-foreground text-right">- {currentQuote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
