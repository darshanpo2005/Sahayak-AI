"use client";

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/authService';
import { cn } from '@/lib/utils';
import type { Theme } from '@/lib/services';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const session = getSession();
    const userTheme = session?.user?.theme || 'default';
    setTheme(userTheme);
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-green', 'theme-purple');
    if (theme === 'green') {
      document.body.classList.add('theme-green');
    } else if (theme === 'purple') {
      document.body.classList.add('theme-purple');
    }
  }, [theme]);

  // This component doesn't render anything itself, it just manages the theme class.
  // It ensures that on initial load and session changes, the correct theme is applied.
  return <>{children}</>;
}
