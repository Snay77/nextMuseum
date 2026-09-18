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

    const initializeCursor = async () => {
      const { default: MouseFollower } = await import("mouse-follower");

      if (cancelled) return;

      MouseFollower.registerGSAP(gsap);
      cursor = new MouseFollower({
        className: "mf-cursor nm-cursor",
        speed: 0.72,
        ease: "expo.out",
        skewing: 0,
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

      document.body.classList.add("has-museum-cursor");
    };

    initializeCursor();

    return () => {
      cancelled = true;
      document.body.classList.remove("has-museum-cursor");
      cursor?.destroy();
    };
  }, []);

  return null;
}
