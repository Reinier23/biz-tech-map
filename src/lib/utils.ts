import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BRANDFETCH_CLIENT_ID = 'public-demo'; // Replace with your real public key
export const brandfetchLogo = (domain: string) => `https://cdn.brandfetch.io/${domain}?c=${BRANDFETCH_CLIENT_ID}`;
