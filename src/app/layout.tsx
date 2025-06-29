import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from '@/components/ui/theme-provider';

import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import ViewProvider from "./(home)/ViewContext";
const inter = Inter({subsets: ["latin"]});
export const metadata: Metadata = {
  title: "Vidora",
  description: "The best place to watch videos.",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body
          className={`${inter.className} `}
          //  style={{backgroundColor:"#ff0",color:"red"}}
          //    UPDATE THEME HERE
        >
          <TRPCProvider>
        <ThemeProvider >
          <ViewProvider>
            <Toaster />
          {children}
          </ViewProvider>
        </ThemeProvider>
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
