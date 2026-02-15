import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge class names with clsx and tailwind-merge to resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
