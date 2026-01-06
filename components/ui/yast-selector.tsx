"use client";

import { useEffect, useRef } from "react";

const ALLOWED_PARENTS = new Set([
  "http://localhost:3000",
  "https://www.preview.yast.ai",
  "https://www.yast.ai",
]);

export function SelectorBridge() {
  const enabledRef = useRef(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!ALLOWED_PARENTS.has(event.origin)) return;

      if (event.data?.type === "SELECTOR_ENABLE") enabledRef.current = true;
      if (event.data?.type === "SELECTOR_DISABLE") enabledRef.current = false;
    }

    function onClick(e: MouseEvent) {
      if (!enabledRef.current) return;

      // Prevent navigation / default actions while selecting
      e.preventDefault();
      e.stopPropagation();

      const el = e.target as Element | null;
      const html = el?.outerHTML ?? "";

      window.parent.postMessage(
        { type: "SELECTOR_CLICK_HTML", html },
        eventOriginFallback()
      );
    }

    // We need a targetOrigin. Since click handler doesn't have the parent origin,
    // we'll send to "*" and let the parent validate origin on receive.
    // If you prefer strict targetOrigin, store event.origin from the enable message.
    function eventOriginFallback() {
      return "*";
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}