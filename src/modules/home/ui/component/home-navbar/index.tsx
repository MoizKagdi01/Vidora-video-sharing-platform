"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect } from "react";
import SearchInput from "./SearchInput";
import AuthButton from "@/modules/auth/ui/component/AuthButton";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGridIcon, PaletteIcon, Settings2Icon } from "lucide-react";
import { useView } from "@/app/(home)/ViewContext";
const HomeNavbar = () => {
const themes = [
  'light', 'dark',
  'mint-apple', 'citrus-sherbert', 'retro-raincloud', 'hanami', 'cotton-candy', 'lofi-vibes',
  'desert-khaki', 'chroma-glow', 'forest', 'crimson', 'midnight-blurple', 'mars', 'dusk',
  'under-the-sea', 'retro-storm', 'neon-nights', 'strawberry-lemonade', 'aurora'
];

  const { setTheme } = useTheme();
  const {toggleView} = useView()
  const handleThemeChange = (themeName: string) => {
    Cookies.set("theme", themeName, {
      expires: 30 // Set cookie to expire in 30 days
    });
    setTheme(Cookies.get("theme") || themeName);
  };

  const handleViewChange = (index?: number) => {
    toggleView(index);
  };
  const toggleViewCallback = useCallback(() => {
    toggleView(Number.parseInt(Cookies.get("grid") || "0"));
  },[toggleView])
  useEffect(() => {
    toggleViewCallback()
  }, [toggleViewCallback])
  
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-2 pr-5 z-30 border-b">
      <div className="flex items-center gap-4 w-full">
        {/* Menu and Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link prefetch href="/" className="hidden md:block">
            <div className="flex p-4 items-center gap-1">
              <Image src="/logo.png" alt="logo" style={{backgroundColor:"transparent"}} width={50} height={50} />
              <p className="text-xl font-semibold tracking-tight">Vidora</p>
            </div>
          </Link>
        </div>
        {/* Search Bar  */}
        <div className="flex flex-1 justify-center mx-auto max-w-[720px]">
          <SearchInput />
        </div>

        <div className="flex-shrink-0 items-center flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"}>
              <Settings2Icon /> UI Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleViewChange()}
              className="cursor-pointer"
            >
              <LayoutGridIcon className="size-4" /> Update View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><>
            <PaletteIcon className="size-4" />
            Change Theme</>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-48 overflow-y-hidden hover:overflow-y-scroll scrollbar-thin hover:scrollbar-thumb-rounded-md hover:scrollbar-thumb-background">
          {themes.map((themeName) => (
            <DropdownMenuItem key={themeName} onClick={() => handleThemeChange(themeName)} className="cursor-pointer">
            {/* <DropdownMenuItem key={themeName} onClick={() => setTheme(themeName)} className="cursor-pointer"> */}
              {themeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </DropdownMenuItem>
          ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        <div className="flex-shrink-0 items-center flex gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
