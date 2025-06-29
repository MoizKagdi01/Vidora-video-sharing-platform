"use client"
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PlaylistCreateModal } from "../components/PlaylistCreateModal";
import { useState } from "react";
import PlaylistSection from "../section/PlaylistSection";

export const PlaylistView = () => {
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
  return (
    <div className="flex flex-col gap-y-4 max-w-screen-[2400px] mx-auto mb-10 px-4 pt-2.5">
      <PlaylistCreateModal open={openPlaylistModal} onOpenChange={() => setOpenPlaylistModal(false)}  />
      <div className="flex justify-between items-center">
        <div className="">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        Playlists 
      </h1>
      <p className="text-sm text-muted-foreground">
       Collections you have created
      </p>
      </div>
      <Button variant={"outline"} size={"icon"} className="rounded-full" onClick={() => setOpenPlaylistModal(true)} ><PlusIcon /></Button>
      </div>
      <PlaylistSection />
    </div>
  );
};
