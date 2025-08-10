import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Use Brandfetch Logo Link API (free, no key)
export const brandfetchLogo = (domain: string) => `https://logo.brandfetch.io/${domain}`;
