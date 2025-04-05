import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "stat" | "glass";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseClasses = "rounded-lg border";
    
    const variantClasses = {
      default: "bg-card text-card-foreground shadow-sm",
      stat: "bg-card text-card-foreground shadow-sm",
      glass: "backdrop-blur-sm bg-black/30 dark:bg-white/10 border-0",
    };
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    return <div className={combinedClasses} ref={ref} {...props} />;
  }
);

Card.displayName = "Card";

export { Card };
