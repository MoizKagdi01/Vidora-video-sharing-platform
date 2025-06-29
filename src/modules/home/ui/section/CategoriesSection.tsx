"use client"
interface CategoriesSectionProps {
    categoryId?: string;
}
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import FilterCarousel from "@/components/filter-carousel";
import { useRouter } from "next/navigation";

export const CategoriesSectionSuspense = ({categoryId}: CategoriesSectionProps) => {
  const router = useRouter()

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set("categoryId", value)
    } else {
      url.searchParams.delete("categoryId")
    }
    router.push(url.toString())
  }
    
  return (
    <Suspense fallback={<FilterCarousel data={[]} isLoading onSelect={onSelect} value={categoryId} />}>
      <ErrorBoundary fallback={<div>Error...</div>}>
        <CategoriesSection categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}

function CategoriesSection({categoryId}: CategoriesSectionProps) {
    const [categories] = trpc.categories.getAll.useSuspenseQuery();
    const router = useRouter()
  
    const onSelect = (value: string | null) => {
      const url = new URL(window.location.href)
      if (value) {
        url.searchParams.set("categoryId", value)
      } else {
        url.searchParams.delete("categoryId")
      }
      router.push(url.toString())
    }
    const data = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));
    
    return ( 
        <FilterCarousel data={data} onSelect={onSelect} value={categoryId} />
    );
}