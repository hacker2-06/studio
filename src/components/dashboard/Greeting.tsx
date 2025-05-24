"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon, CloudSun, Flame } from 'lucide-react'; // Added Flame
import { useSettings } from '@/contexts/SettingsContext';

export function Greeting() {
  const { userProfile } = useSettings();
  const [greetingText, setGreetingText] = useState('Hello!');
  const [greetingIcon, setGreetingIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDayText = 'Hello';
    let Icon = Sun;

    if (hour < 12) {
      timeOfDayText = 'Good Morning';
      Icon = Sun;
    } else if (hour < 18) {
      timeOfDayText = 'Good Afternoon';
      Icon = CloudSun;
    } else {
      timeOfDayText = 'Good Evening';
      Icon = Moon;
    }

    if (userProfile && userProfile.name) {
      setGreetingText(`${timeOfDayText}, ${userProfile.name}!`);
    } else {
      setGreetingText(`${timeOfDayText}!`);
    }
    setGreetingIcon(() => Icon); 
  }, [userProfile]);

  const GreetingIconComponent = greetingIcon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
            <GreetingIconComponent className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{greetingText}</h1>
        </div>
        {userProfile && userProfile.dailyStreak > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-accent/20 rounded-lg border border-accent/50">
                <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
                <span className="text-lg font-semibold text-foreground">
                    {userProfile.dailyStreak} Day Streak!
                </span>
            </div>
        )}
    </div>
  );
}