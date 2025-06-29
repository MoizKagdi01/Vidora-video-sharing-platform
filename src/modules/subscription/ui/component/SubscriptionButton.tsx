import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface SubscriptionButtonProps {
  isSubscribed: boolean;
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

const SubscriptionButton = ({
  isSubscribed,
  onClick,
  disabled,
  className,
  size,
}: SubscriptionButtonProps) => {
  return(
    <Button
    size={size}
    variant={isSubscribed === true ? "secondary" : "default"}
    disabled={disabled}
    onClick={onClick}
    className={cn("rounded-full",className)}
    >
      {isSubscribed === true ? "UnSubscribed" : "Subscribe"}
    </Button>
  )
};

export default SubscriptionButton;
