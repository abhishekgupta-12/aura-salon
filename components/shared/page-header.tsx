import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}>
      <div>
        <h2 className="text-3xl font-semibold text-text-primary font-[var(--font-heading)] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
