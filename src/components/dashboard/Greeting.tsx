
"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon, CloudSun } from 'lucide-react'; // Using CloudSun as a generic afternoon icon

export function Greeting() {
  const [greeting, setGreeting] = useState<{ text: string; icon: React.ElementType }>({ text: 'Hello!', icon: Sun });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ text: 'Good Morning!', icon: Sun });
    } else if (hour < 18) {
      setGreeting({ text: 'Good Afternoon!', icon: CloudSun });
    } else {
      setGreeting({ text: 'Good Evening!', icon: Moon });
    }
  }, []);

  const GreetingIcon = greeting.icon;

  return (
    <div className="flex items-center space-x-3">
      <GreetingIcon className="h-8 w-8 text-amber-500" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{greeting.text}</h1>
    </div>
  );
}
