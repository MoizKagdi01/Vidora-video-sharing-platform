import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

const userInfoVariants = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_p]:text-sm [&_svg]:size-4",
      lg: "[&_p]:text-base [&_p]:text-font-medium [&_p]:text-black [&_svg]:size-5",
      sm: "[&_p]:text-xs [&_svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string;
  className?: string;
}
const UserInfo = ({ name, className, size }: UserInfoProps) => {
  return (
    <div className={cn(userInfoVariants({ size, className }))}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-gray-500 line-clamp-1">{name}</p>
        </TooltipTrigger>
        <TooltipContent align="center" className="bg-gray-100 border-foreground p-1 rounded-full text-foreground">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default UserInfo;
