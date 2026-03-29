"use client";

import { useEffect } from "react";

const LOCK_COUNT_KEY = "data-body-scroll-lock-count";
const SCROLL_Y_KEY = "data-body-scroll-lock-scroll-y";

function getLockCount(body: HTMLElement) {
  const rawValue = body.getAttribute(LOCK_COUNT_KEY);
  const parsedValue = Number(rawValue ?? "0");
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function applyLock() {
  const { body, documentElement } = document;
  const lockCount = getLockCount(body);

  if (lockCount === 0) {
    const scrollY = window.scrollY;

    body.setAttribute(SCROLL_Y_KEY, String(scrollY));
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";
  }

  body.setAttribute(LOCK_COUNT_KEY, String(lockCount + 1));
}

function releaseLock() {
  const { body, documentElement } = document;
  const lockCount = getLockCount(body);

  if (lockCount <= 1) {
    const scrollY = Number(body.getAttribute(SCROLL_Y_KEY) ?? "0");

    body.removeAttribute(LOCK_COUNT_KEY);
    body.removeAttribute(SCROLL_Y_KEY);
    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    documentElement.style.overflow = "";

    if (Number.isFinite(scrollY)) {
      window.scrollTo(0, scrollY);
    }

    return;
  }

  body.setAttribute(LOCK_COUNT_KEY, String(lockCount - 1));
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    applyLock();

    return () => {
      releaseLock();
    };
  }, [locked]);
}
