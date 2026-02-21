/**
 * @file utils.ts
 * @description Shared utility — merges Tailwind CSS class names safely.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, resolving conflicts (e.g. `p-2` vs `p-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
