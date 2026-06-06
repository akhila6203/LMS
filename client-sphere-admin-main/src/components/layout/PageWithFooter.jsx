import Footer from "@/pages/Footer";
import { cn } from "@/lib/utils";

/**
 * Page shell: middle content is inset from header/footer; footer stays full width.
 * @param {"public" | "user"} variant — padding around the main section
 */
export function PageWithFooter({ children, className, variant = "public" }) {
  const content =
    variant === "user" ? (
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </div>
    ) : (
      <div className="mx-auto w-full max-w-7xl flex-1 px-2 pt-6 pb-10 sm:px-3 sm:pt-8 sm:pb-12 lg:px-4 lg:pt-10 lg:pb-14">
        {children}
      </div>
    );

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-3.5rem)] w-full flex-col bg-background",
        className
      )}
    >
      {content}
      <Footer />
    </div>
  );
}

export default PageWithFooter;
