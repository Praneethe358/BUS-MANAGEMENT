import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, icon, ...props }, ref) => {
    return (
      <div className="relative relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm ${icon ? "pl-10" : ""} ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
