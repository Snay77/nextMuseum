"use client";

import gsap from "gsap";
import { useEffect } from "react";

export default function MuseumCursor() {
  useEffect(() => {
    const supportsCursor = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!supportsCursor || prefersReducedMotion) return;

    let cursor;
    let cancelled = false;
    const cursorClass = "has-museum-cursor";

    document.documentElement.classList.add(cursorClass);
    document.body.classList.add(cursorClass);

    const initializeCursor = async () => {
      try {
        const { default: MouseFollower } = await import("mouse-follower");

        if (cancelled) return;

        MouseFollower.registerGSAP(gsap);
        cursor = new MouseFollower({
          className: "mf-cursor nm-cursor",
          speed: 0.13,
          ease: "power3.out",
          skewing: 1.7,
          skewingDelta: 0.0015,
          skewingDeltaMax: 0.22,
          skewingText: 0,
          skewingIcon: 0,
          showTimeout: 50,
          hideTimeout: 180,
          stateDetection: {
            "-pointer":
              "a, button, [role='button'], label, input, select, textarea",
            "-hidden": "iframe, [data-cursor-hidden]",
          },
        });
      } catch {
        document.documentElement.classList.remove(cursorClass);
        document.body.classList.remove(cursorClass);
      }
    };

    initializeCursor();

    return () => {
      cancelled = true;
      document.documentElement.classList.remove(cursorClass);
      document.body.classList.remove(cursorClass);
      cursor?.destroy();
    };
  }, []);

  return null;
}
