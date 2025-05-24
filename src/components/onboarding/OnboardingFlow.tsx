
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingProfileSetup } from './OnboardingProfileSetup';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';


export function OnboardingFlow({ children }: { children: ReactNode }) {
  const { isOnboardingComplete, userProfile, completeOnboarding, setUserProfile } = useSettings();
  // Determine initial step based on context. If onboarding is not complete,
  // and userProfile is not set (or name specifically), start with welcome.
  // Otherwise, if userProfile is set (meaning welcome was passed), go to profile.
  const getInitialStep = () => {
    if (isOnboardingComplete) return 'done';
    // Check if minimal profile data exists to skip welcome
    // A simple check for userProfile might not be enough if it's partially filled
    // For now, let's assume if userProfile exists AT ALL, they've passed welcome.
    // This could be refined with a specific flag if needed.
    // A simpler approach: always start with welcome if onboarding isn't complete,
    // or manage step in localStorage too.
    // For this iteration, let's use a local state that transitions.
    return 'welcome'; 
  };

  const [currentStep, setCurrentStep] = useState<'loading' | 'welcome' | 'profile' | 'done'>('loading');

  useEffect(() => {
    // Only run this effect once context is potentially hydrated
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      if (isOnboardingComplete) {
        setCurrentStep('done');
      } else {
        // If not complete, check if profile step was already reached or if profile exists from previous attempt
        const storedProfile = localStorage.getItem("neetSheetUserProfileTemp"); // A temporary marker
        if (storedProfile) { // User might have filled profile but not completed flow
            // Here, we could try to load the temp profile if needed, or just go to profile step
            setCurrentStep('profile');
        } else {
            setCurrentStep('welcome');
        }
      }
    }
  }, [isOnboardingComplete]); // Rerun if context's onboarding status changes externally

  const handleWelcomeNext = () => {
    setCurrentStep('profile');
  };

  const handleProfileSave = (profileData: UserProfile) => {
    setUserProfile(profileData);
    completeOnboarding(); // This will set isOnboardingComplete to true in context
    localStorage.removeItem("neetSheetUserProfileTemp"); // Clean up temp marker
    setCurrentStep('done'); // Trigger re-render, which will show children
  };

  if (currentStep === 'loading') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading NeetSheet...</p>
      </div>
    );
  }

  if (currentStep === 'welcome') {
    return <OnboardingWelcome onNext={handleWelcomeNext} />;
  }
  
  if (currentStep === 'profile') {
    // Pre-fill if profile data exists in context (e.g., from a previous partial attempt loaded by context)
    return <OnboardingProfileSetup onSave={handleProfileSave} initialProfile={userProfile} />;
  }
  
  // If currentStep is 'done' or if isOnboardingComplete became true from context
  if (currentStep === 'done' || isOnboardingComplete) {
     return <>{children}</>;
  }

  // Fallback loading, should ideally be handled by initial 'loading' state
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
