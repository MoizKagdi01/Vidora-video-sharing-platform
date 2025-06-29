import HistorySection from "../section/HistorySection";

export const HistoryView = () => {
  return (
    <div className="flex flex-col gap-y-4 max-w-screen-md mx-auto mb-10 px-4 pt-2.5">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        History
      </h1>
      <p className="text-sm text-muted-foreground">
       All your watched videos will be awailable here
      </p>
      <HistorySection />
    </div>
  );
};
