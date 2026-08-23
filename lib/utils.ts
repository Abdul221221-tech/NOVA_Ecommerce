import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null, email?: string | null) {
  const str = name || email || 'US';
  return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function calculateAge(dob: string | Date | null | undefined) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}