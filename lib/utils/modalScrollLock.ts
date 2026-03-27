const PRELOCK_SCROLL_KEY = "data-prelocked-scroll-y";

export function lockScrollForModalNavigation() {
  if (typeof document === "undefined") {
    return;
  }

  const { body, documentElement } = document;
  const scrollY = window.scrollY;

  body.setAttribute(PRELOCK_SCROLL_KEY, String(scrollY));
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  documentElement.style.overflow = "hidden";
}

export function getPrelockedScrollY(): number | null {
  if (typeof document === "undefined") {
    return null;
  }

  const rawValue = document.body.getAttribute(PRELOCK_SCROLL_KEY);
  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function clearPrelockedScrollY() {
  if (typeof document === "undefined") {
    return;
  }

  document.body.removeAttribute(PRELOCK_SCROLL_KEY);
}
