'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
interface ThemeProviderProps {
  children: React.ReactNode;
}
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="midnight-blurple"
      enableSystem
  themes={[
    "light", "dark", "dawn", "sunrise", "midnight", "dracula",
    "retro-raincloud", "hanami", "cotton-candy", "desert-khaki",
    "forest", "crimson", "dusk", "retro-storm", 
    "strawberry-lemonade", "mint-apple", "citrus-sherbert",
    "lofi-vibes", "chroma-glow", "midnight-blurple", "neon-nights",
    "under-the-sea", "aurora"
  ]}
    >
      {children}
    </NextThemesProvider>
  );
}
