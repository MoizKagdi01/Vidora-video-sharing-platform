import { CategoriesSectionSuspense } from "../section/CategoriesSection";
import HomeVideoSection from "../section/HomeVideoSection";

interface HomeViewProps {
    categoryId?: string;
}

export const HomeView = ({categoryId}: HomeViewProps) => {
    return (
        <div className="flex flex-col gap-y-4 max-w-[2400px] mx-auto mb-10 px-4 pt-2.5">
            <CategoriesSectionSuspense categoryId={categoryId} />
            <HomeVideoSection categoryId={categoryId} />
        </div>
    )
}
