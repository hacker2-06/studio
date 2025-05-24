
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fadeIn">
        <CardHeader className="items-center text-center">
          <Image
            src="/logo.svg" // Assuming your main logo is suitable here
            alt="NeetSheet Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Welcome to NeetSheet!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Your dedicated partner for mastering NEET OMR sheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image 
            src="https://placehold.co/300x180.png" // Placeholder image
            alt="NEET Aspirant Studying"
            width={300}
            height={180}
            className="mx-auto rounded-lg shadow-md"
            data-ai-hint="medical student motivation"
          />
          <p className="text-md text-foreground px-4">
            Practice effectively, evaluate your performance, and track your progress towards your NEET dream. Let's get you set up!
          </p>
          <Button onClick={onNext} size="lg" className="w-full animate-pulseHover">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
        @keyframes pulseHover {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(var(--primary) / 0.7); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .animate-pulseHover {
          animation: pulseHover 2s infinite;
        }
      `}</style>
    </div>
  );
}
