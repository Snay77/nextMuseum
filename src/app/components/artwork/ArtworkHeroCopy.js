"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useStore } from "../../_lib/store";

export const ARTWORK_TITLE_REVEAL_EVENT = "artwork-title-reveal";

export default function ArtworkHeroCopy({ slug, className = "", children }) {
  const copyRef = useRef(null);
  const isFirstRender = useStore((state) => state.isFirstRender);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const transitionType = useStore((state) => state.transitionType);
  const artworkNavigation = useStore((state) => state.artworkNavigation);

  useGSAP(
    () => {
      const copy = copyRef.current;
      const items = gsap.utils.toArray(
        copy?.querySelectorAll("[data-artwork-copy-item]") ?? [],
      );
      const isRailSource =
        isTransitionActive &&
        transitionType === "artwork-rail" &&
        artworkNavigation?.fromSlug === slug;

      if (!copy || items.length === 0) return;
      if (isRailSource) return;

      gsap.set(items, {
        autoAlpha: 0,
        y: 16,
      });

      if (isFirstRender || isTransitionActive) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let timeline;
      let fallbackTimer;
      let hasStarted = false;

      const revealItems = () => {
        if (hasStarted) return;
        hasStarted = true;
        window.clearTimeout(fallbackTimer);

        timeline = gsap.timeline({ delay: reduceMotion ? 0 : 0.22 });
        timeline.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0.16 : 0.52,
          ease: "power3.out",
          stagger: reduceMotion ? 0 : 0.065,
        });
      };

      copy.addEventListener(ARTWORK_TITLE_REVEAL_EVENT, revealItems);
      fallbackTimer = window.setTimeout(revealItems, reduceMotion ? 40 : 1100);

      return () => {
        copy.removeEventListener(ARTWORK_TITLE_REVEAL_EVENT, revealItems);
        window.clearTimeout(fallbackTimer);
        timeline?.kill();
      };
    },
    {
      scope: copyRef,
      // Keep the reveal tied to the artwork and active transition state only.
      // Clearing rail metadata after arrival must not replay the animation.
      dependencies: [isFirstRender, isTransitionActive, slug],
    },
  );

  return (
    <div ref={copyRef} data-artwork-hero-copy={slug} className={className}>
      {children}
    </div>
  );
}
