import { TextClassContext } from "@/components/core/text";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { View } from "react-native";

const badgeVariants = cva("flex-row items-center rounded-md px-2 py-0.5", {
  variants: {
    variant: {
      default: "bg-muted",
      secondary: "bg-secondary",
      outline: "border border-border bg-transparent",
      success: "bg-green-100 dark:bg-green-900/30",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeTextVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      success: "text-green-700 dark:text-green-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = React.ComponentProps<typeof View> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps };
