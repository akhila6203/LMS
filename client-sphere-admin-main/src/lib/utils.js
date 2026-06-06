import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ Utility function
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
