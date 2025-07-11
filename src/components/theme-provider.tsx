"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

interface CustomThemeProviderProps extends ThemeProviderProps {
  fontVariable?: string;
}

export function ThemeProvider({ children, fontVariable, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>
    <div className={fontVariable}>
      {children}
    </div>
  </NextThemesProvider>
}
