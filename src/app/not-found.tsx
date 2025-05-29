
"use client";

import { Button } from "@/components/ui/button";
import { Frown, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4 py-12">
      <Image
        src="https://placehold.co/400x300.png"
        alt="Lost and Found"
        width={400}
        height={300}
        className="mb-8 rounded-lg shadow-xl opacity-70"
        data-ai-hint="lost direction confusion"
      />
      <Frown className="mb-6 h-20 w-20 text-primary/80" />
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
        404 - Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-lg text-muted-foreground md:text-xl">
        Oops! It seems like the page you're looking for has taken a detour or doesn't exist.
      </p>
      <Link href="/" passHref legacyBehavior>
        <Button size="lg" className="text-lg">
          <Home className="mr-2 h-5 w-5" />
          Go Back to Home
        </Button>
      </Link>
    </div>
  );
}
