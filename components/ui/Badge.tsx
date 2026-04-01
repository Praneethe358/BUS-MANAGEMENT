import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let variantStyles = "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80";
  if (variant === "success") variantStyles = "border-transparent bg-green-500 text-white";
  else if (variant === "warning") variantStyles = "border-transparent bg-yellow-500 text-white";
  else if (variant === "destructive") variantStyles = "border-transparent bg-red-500 text-white";
  else if (variant === "outline") variantStyles = "text-zinc-950 border-zinc-200";

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 ${variantStyles} ${className}`} {...props} />
  )
}

export { Badge }
