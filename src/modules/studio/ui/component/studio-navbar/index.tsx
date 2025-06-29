"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AuthButton from "@/modules/auth/ui/component/AuthButton";
import StudioUploadModel from "../studioUploadModel";
import { useTheme } from "next-themes";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const StudioNavbar = () => {
const themes = [
  'light', 'dark',
  'mint-apple', 'citrus-sherbert', 'retro-raincloud', 'hanami', 'cotton-candy', 'lofi-vibes',
  'desert-khaki', 'chroma-glow', 'forest', 'crimson', 'midnight-blurple', 'mars', 'dusk',
  'under-the-sea', 'retro-storm', 'neon-nights', 'strawberry-lemonade', 'aurora'
];

  const { theme, setTheme } = useTheme();
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-2 pr-5 z-30 border-b shadow-md">
      <div className="flex items-center gap-4 w-full">
        {/* Menu and Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link prefetch href="/studio">
            <div className="flex p-4 items-center gap-1">
              <Image src="/logo.png" alt="logo" width={32} height={32} />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>
        {/* Search Bar  */}
        <div className="flex-1">
        </div>

        <div className="flex-shrink-0 items-center flex gap-4">   
      <Select onValueChange={setTheme} defaultValue={theme}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((themeName) => (
            <SelectItem key={themeName} value={themeName}>
              {themeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
          <StudioUploadModel />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default StudioNavbar;
