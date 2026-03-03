import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx.
 * Handles conditional classes and resolves conflicts (e.g., `p-2 p-4` → `p-4`).
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-primary-500', 'px-4')
 * // → 'py-1 px-4 bg-primary-500' (if isActive)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
