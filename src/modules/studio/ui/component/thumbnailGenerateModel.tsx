import ResponsiveDilogue from "@/components/responsive-dilogue";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ThumbnailGenerateModelProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const formSchema = z.object({
  prompt: z.string().min(10),
});

export const ThumbnailGenerateModel = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModelProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });
  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Background Job Started",{description: "This may take a while"});
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({ id:videoId, prompt: values.prompt });
    onOpenChange(false);
  };
  return (
    <>
    <ResponsiveDilogue
      title="Generate Thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    cols={30}
                    rows={5}
                    placeholder="Enter a prompt"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            
          />
          <div className="flex justify-end">
            <Button type="submit">Generate</Button>
          </div>
        </form>
      </Form>
    </ResponsiveDilogue>
    </>
  );
};
