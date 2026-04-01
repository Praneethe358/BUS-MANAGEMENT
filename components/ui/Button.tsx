import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantStyles = "bg-blue-600 text-white hover:bg-blue-700 shadow-md";
    if (variant === "destructive") variantStyles = "bg-red-500 text-white hover:bg-red-700 shadow-md";
    else if (variant === "outline") variantStyles = "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900";
    else if (variant === "secondary") variantStyles = "bg-zinc-100 text-zinc-900 hover:bg-zinc-200";
    else if (variant === "ghost") variantStyles = "hover:bg-zinc-100 hover:text-zinc-900";
    else if (variant === "link") variantStyles = "text-zinc-900 underline-offset-4 hover:underline";

    let sizeStyles = "h-9 px-4 py-2";
    if (size === "sm") sizeStyles = "h-8 rounded-md px-3 text-xs";
    else if (size === "lg") sizeStyles = "h-10 rounded-md px-8";
    else if (size === "icon") sizeStyles = "h-9 w-9";

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
