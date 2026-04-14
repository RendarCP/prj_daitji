"use client";

export function useMounted() {
  return typeof document !== "undefined";
}
