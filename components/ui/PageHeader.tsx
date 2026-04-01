import * as React from "react"

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{title}</h1>
        {description && <p className="text-zinc-600 text-sm mt-1">{description}</p>}
      </div>
      {children && (
        <div className="self-start sm:self-auto w-full sm:w-auto flex items-center">
          {children}
        </div>
      )}
    </div>
  )
}
