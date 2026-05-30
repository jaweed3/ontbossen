import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-600 bg-green-50";
  if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 80) return "bg-green-500";
  if (accuracy >= 60) return "bg-yellow-500";
  if (accuracy >= 40) return "bg-orange-500";
  return "bg-red-500";
}
