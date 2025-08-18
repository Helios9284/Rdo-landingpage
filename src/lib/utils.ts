import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge conditional class names
 * Safely combines Tailwind classes without duplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
