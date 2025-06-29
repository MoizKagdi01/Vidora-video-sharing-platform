import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface useSubscriptionProps {
    userId: string,
    isSubscribed: boolean,
    fromVideoId?: string
}

export const useSubscription = ({
    userId,
    isSubscribed,
    fromVideoId

}:useSubscriptionProps) =>{
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess: ()=>{
            utils.users.getOne.invalidate({id: userId })
            utils.videos.subscribed.invalidate()
            utils.subscriptions.getMany.invalidate()
            if (fromVideoId) {
                utils.videos.getOne.invalidate({id: fromVideoId })
            }
            toast.success("Subscribed")
        },
        onError: (error)=>{
            toast.error("Somethin went wrong")
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn()
            }
        }
    })
    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: ()=>{
            utils.videos.subscribed.invalidate()
            utils.subscriptions.getMany.invalidate()
            utils.users.getOne.invalidate({id: userId })
            if (fromVideoId) {
                utils.videos.getOne.invalidate({id: fromVideoId })
            }
            toast.success("Unsubscribed")
        },
        onError: (error)=>{
            toast.error("Somethin went wrong")
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn()
            }
        }
    })

    const isPending = subscribe.isPending|| unsubscribe.isPending

    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({userId})
        }
        else {
            subscribe.mutate({userId})
        }
    }

    return {isPending, onClick}
}