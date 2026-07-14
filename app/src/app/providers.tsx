'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme';
import { ToastProvider } from '@/components/toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
