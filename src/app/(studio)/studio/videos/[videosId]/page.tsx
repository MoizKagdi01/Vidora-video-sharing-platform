import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{videosId: string}>
}

const page = async ({params}: PageProps) => {
    const {videosId} = await params;
    
    try {
        // Prefetch both video and categories data
        await Promise.all([
            trpc.studio.getOne.prefetch({id: videosId}),
            trpc.categories.getAll.prefetch()
        ]);
        
        return (
            <HydrateClient>
                <VideoView videoId={videosId} />
            </HydrateClient>
        );
    } catch (error) {
        // If video is not found, return 404 page
        if (error && typeof error === 'object' && 'code' in error && error.code === 'NOT_FOUND') {
            notFound();
        }
        // Re-throw other errors to be caught by error boundary
        throw error;
    }
}

export default page;