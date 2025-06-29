import SearchView from "@/modules/search/ui/view/SearchView";
import { HydrateClient, trpc } from "@/trpc/server";
import ResultSection  from "@/modules/search/ui/section/ResultSection";
export const dynamic = "force-dynamic";
interface pageProps {
    searchParams : Promise<{
        query?: string | undefined
        categoryId?: string | undefined
    }>
}
const page = async ({searchParams}: pageProps) => {
const {query,categoryId} = await searchParams;
void trpc.categories.getAll()
void trpc.search.getMany({query,categoryId,limit: 5})
  return (
    <HydrateClient>
        <SearchView category={categoryId} />
        <ResultSection query={query} categoryId={categoryId} />
        
    </HydrateClient>
  )
}

export default page