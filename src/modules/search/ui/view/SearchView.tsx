import {CategoriesSectionSuspense} from "../section/CategoriesSection"

interface searchViewProps {
        category: string | undefined
}

const SearchView = ({category}: searchViewProps) => {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 pt-2.5">
      <CategoriesSectionSuspense categoryId={category} />
    </div>
  )
}

export default SearchView