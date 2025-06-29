import SubscriptionSection from "../section/SubscriptionSection"

const SubscriptionView = () => {
  return (
    <div>
    <div className="flex flex-col gap-y-4 max-w-screen-md mx-auto mb-10 px-4 pt-2.5">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        All Subscriptions
      </h1>
      <p className="text-sm text-muted-foreground">
        All your subscriptions will be available here. You can manage them, view details, and more.
      </p>
      <SubscriptionSection />
    </div>
    </div>
  )
}

export default SubscriptionView