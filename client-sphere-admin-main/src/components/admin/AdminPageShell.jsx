import { cn } from "@/lib/utils";

/**
 * Admin page body: description + actions sit below the fixed header title.
 * Page title is shown only in TopHeader — not duplicated here.
 */
export function AdminPageShell({
  description,
  actions,
  children,
  className,
}) {
  return (
    <div className={cn("space-y-6 pb-6", className)}>
      {(description || actions) && (
        <div
          className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-5"
        >
          {description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : (
            <span />
          )}
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default AdminPageShell;
