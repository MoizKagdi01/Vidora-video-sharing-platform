import { PlaylistView } from '@/modules/playlist/ui/view/PlaylistView'
import { trpc } from '@/trpc/server'
import { HydrateClient } from '@/trpc/server'
import React from 'react'

export const dynamic = "force-dynamic";
const page = () => {
  void trpc.playlist.playlistVideos({
    limit: 5,
  })  
  return (
    <HydrateClient>
        <PlaylistView />
    </HydrateClient>
  )
}

export default page