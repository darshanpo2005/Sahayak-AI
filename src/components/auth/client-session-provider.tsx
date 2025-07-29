
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSession } from '@/lib/clientAuth';
import type { Student, Teacher } from '@/lib/services';

type Theme = 'default' | 'green' | 'purple';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs on every route change to update the theme from the session.
    const session = getSession();
    const user = session?.user as (Student | Omit<Teacher, "password"> | undefined);
    const userTheme = user?.theme || 'default';
    setTheme(userTheme);
  }, [pathname]);

  useEffect(() => {
    // This marks the component as mounted, allowing theme classes to be applied safely.
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect applies the theme classes to the body tag, but only after mounting.
    if (isMounted) {
      document.body.classList.remove('theme-green', 'theme-purple');
      if (theme === 'green') {
        document.body.classList.add('theme-green');
      } else if (theme === 'purple') {
        document.body.classList.add('theme-purple');
      }
    }
  }, [theme, isMounted]);

  return <>{children}</>;
}
