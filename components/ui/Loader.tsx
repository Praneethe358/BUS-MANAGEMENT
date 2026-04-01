import * as React from "react"

export type LoaderProps = React.HTMLAttributes<HTMLDivElement>;

function Loader({ className = "", ...props }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
    </div>
  )
}

export { Loader }
