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
  if (accuracy >= 80) return "text-healthy";
  if (accuracy >= 60) return "text-mild";
  return "text-severe";
}

export function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 80) return "bg-healthy";
  if (accuracy >= 60) return "bg-mild";
  if (accuracy >= 40) return "bg-moderate";
  return "bg-severe";
}
