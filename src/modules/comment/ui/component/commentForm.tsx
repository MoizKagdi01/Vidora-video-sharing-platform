import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  videoId: string;
  variant?: "comment" | "reply";
  parentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}
const commentFormSchema = commentInsertSchema.omit({ userId: true });

const CommentForm = ({
  videoId,
  parentId,
  onCancel,
  variant = "comment",
  onSuccess,
}: CommentFormProps) => {
  const { user } = useUser();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      utils.comments.getMany.invalidate({ videoId, parentId });
      form.reset();
      toast.success(`${variant} added`);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      parentId,
      videoId,
      value: "",
    },
  });
  const handleSubmit = (value: z.infer<typeof commentFormSchema>) => {
    create.mutate(value);
  };
  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex group gap-4"
      >
        <UserAvatar
          size={"lg"}
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.username || "User"}
        />
        <div className="flex-1">
          <div>
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={variant === "comment"? "Add a comment" : "Reply to this comment"}
                      className="resize-none bg-transparent overflow-hidden min-h-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-2 justify-end mt-2 flex">
            {onCancel && (
                <Button variant={'ghost'} type="button" onClick={handleCancel} >Cancel</Button>
            )}
            <Button type="submit" size={"sm"} disabled={ !form.formState.isDirty}>
              {variant === "comment" ? "comment": 'Reply'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
