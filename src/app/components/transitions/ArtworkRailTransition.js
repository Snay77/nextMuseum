"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import { LOCOMOTIVE_SCROLL_TOP_EVENT } from "../layout/SmoothScroll";

const getPathname = (url) => url?.split(/[?#]/)[0] || "";

const getContainedImageRect = (containerRect, naturalWidth, naturalHeight) => {
  if (!naturalWidth || !naturalHeight) return containerRect;

  const imageRatio = naturalWidth / naturalHeight;
  const containerRatio = containerRect.width / containerRect.height;

  if (imageRatio > containerRatio) {
    const width = containerRect.width;
    const height = width / imageRatio;

    return {
      left: containerRect.left,
      top: containerRect.top + (containerRect.height - height) / 2,
      width,
      height,
    };
  }

  const height = containerRect.height;
  const width = height * imageRatio;

  return {
    left: containerRect.left + (containerRect.width - width) / 2,
    top: containerRect.top,
    width,
    height,
  };
};

const setScrollLock = (isLocked) => {
  const overflow = isLocked ? "hidden" : "";
  document.documentElement.style.overflow = overflow;
  document.body.style.overflow = overflow;
};

const finishRailTransition = (hero, copy) => {
  const store = useStore.getState();

  gsap.set([hero, copy].filter(Boolean), {
    clearProps: "opacity,visibility,transform",
  });
  setScrollLock(false);
  store.setIsTransitionActive(false);
  store.setTransitionType("default");
  store.setDestinationUrl("");
  store.setArtworkNavigation(null);
};

export default function ArtworkRailTransition() {
  const overlayRef = useRef(null);
  const backgroundRef = useRef(null);
  const outgoingRef = useRef(null);
  const incomingRef = useRef(null);
  const incomingImageRef = useRef(null);
  const copyRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const transitionType = useStore((state) => state.transitionType);
  const destinationUrl = useStore((state) => state.destinationUrl);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const artworkNavigation = useStore((state) => state.artworkNavigation);

  useGSAP(
    () => {
      if (
        transitionType !== "artwork-rail" ||
        !isTransitionActive ||
        !artworkNavigation ||
        !destinationUrl ||
        pathname !== `/paintings/${artworkNavigation.fromSlug}`
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const background = backgroundRef.current;
      const outgoing = outgoingRef.current;
      const incoming = incomingRef.current;
      const copy = copyRef.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const exitX = artworkNavigation.direction === "previous" ? 18 : -18;
      const exitClip =
        artworkNavigation.direction === "previous"
          ? "inset(0 0 0 16%)"
          : "inset(0 16% 0 0)";

      setScrollLock(true);
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });
      gsap.set(background, { autoAlpha: 1 });
      gsap.set(outgoing, {
        autoAlpha: 1,
        clipPath: "inset(0 0 0 0)",
        left: artworkNavigation.sourceRect.left,
        top: artworkNavigation.sourceRect.top,
        width: artworkNavigation.sourceRect.width,
        height: artworkNavigation.sourceRect.height,
        xPercent: 0,
      });
      gsap.set(incoming, { autoAlpha: 0 });
      gsap.set(copy, { autoAlpha: 1, clipPath: "inset(0 0 0 0)" });

      const timeline = gsap.timeline();

      timeline
        .to(
          copy,
          {
            autoAlpha: 0,
            clipPath: "inset(0 0 100% 0)",
            y: -18,
            duration: reduceMotion ? 0.12 : 0.25,
            ease: "power3.in",
          },
          0,
        )
        .to(
          outgoing,
          {
            autoAlpha: reduceMotion ? 0 : 0.28,
            xPercent: reduceMotion ? 0 : exitX,
            clipPath: reduceMotion ? "inset(0 0 0 0)" : exitClip,
            duration: reduceMotion ? 0.16 : 0.7,
            ease: reduceMotion ? "power2.out" : "expo.inOut",
          },
          reduceMotion ? 0 : 0.05,
        );

      timeline.call(
        () => {
          window.dispatchEvent(new Event(LOCOMOTIVE_SCROLL_TOP_EVENT));
          router.push(destinationUrl, { scroll: false });
        },
        [],
        reduceMotion ? 0.04 : 0.15,
      );

      return () => timeline.kill();
    },
    {
      dependencies: [artworkNavigation?.id],
      scope: overlayRef,
    },
  );

  useGSAP(
    () => {
      if (
        transitionType !== "artwork-rail" ||
        !artworkNavigation ||
        pathname !== getPathname(destinationUrl)
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const background = backgroundRef.current;
      const outgoing = outgoingRef.current;
      const incoming = incomingRef.current;
      const incomingImage = incomingImageRef.current;
      const hero = document.querySelector(
        `[data-artwork-hero="${CSS.escape(artworkNavigation.toSlug)}"]`,
      );
      const heroCopy = document.querySelector(
        `[data-artwork-hero-copy="${CSS.escape(artworkNavigation.toSlug)}"]`,
      );
      const heroImage = hero?.querySelector("img");

      if (!hero || !heroImage) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.2,
          onComplete: () => finishRailTransition(hero, heroCopy),
        });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const enterX = artworkNavigation.direction === "previous" ? -18 : 18;
      const enterClip =
        artworkNavigation.direction === "previous"
          ? "inset(0 16% 0 0)"
          : "inset(0 0 0 16%)";
      let timeline;
      let firstFrame;
      let secondFrame;
      let isCancelled = false;

      gsap.set(hero, { autoAlpha: 0 });
      if (heroCopy) gsap.set(heroCopy, { autoAlpha: 0, y: 20 });

      const startEntrance = () => {
        if (isCancelled) return;

        incomingImage.src = heroImage.currentSrc || heroImage.src;
        const targetRect = getContainedImageRect(
          hero.getBoundingClientRect(),
          heroImage.naturalWidth,
          heroImage.naturalHeight,
        );
        const duration = reduceMotion ? 0.18 : 0.8;
        const handoff = reduceMotion ? 0.18 : 0.82;

        gsap.set(incoming, {
          autoAlpha: reduceMotion ? 0 : 0.08,
          clipPath: reduceMotion ? "inset(0 0 0 0)" : enterClip,
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          height: targetRect.height,
          xPercent: reduceMotion ? 0 : enterX,
        });

        timeline = gsap.timeline();
        timeline
          .to(
            incoming,
            {
              autoAlpha: 1,
              clipPath: "inset(0 0 0 0)",
              xPercent: 0,
              duration,
              ease: reduceMotion ? "power2.out" : "expo.inOut",
            },
            0,
          )
          .to(
            outgoing,
            {
              autoAlpha: 0,
              duration: reduceMotion ? 0.12 : 0.28,
              ease: "power2.out",
            },
            0,
          )
          .to(
            background,
            {
              autoAlpha: 0,
              duration: reduceMotion ? 0.14 : 0.32,
              ease: "power2.out",
            },
            reduceMotion ? 0.08 : 0.66,
          )
          .set(hero, { autoAlpha: 1 }, handoff)
          .set(incoming, { autoAlpha: 0 }, handoff);

        if (heroCopy) {
          timeline.to(
            heroCopy,
            {
              autoAlpha: 1,
              y: 0,
              duration: reduceMotion ? 0.18 : 0.45,
              ease: "power3.out",
            },
            reduceMotion ? 0.12 : 0.75,
          );
        }

        timeline
          .call(
            () => useStore.getState().setIsTransitionActive(false),
            [],
            reduceMotion ? 0.12 : 0.75,
          )
          .call(
            () => finishRailTransition(hero, heroCopy),
            [],
            reduceMotion ? 0.34 : 1.2,
          );
      };

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (heroImage.complete && heroImage.naturalWidth) {
            startEntrance();
          } else {
            heroImage
              .decode()
              .catch(() => {})
              .finally(startEntrance);
          }
        });
      });

      return () => {
        isCancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        timeline?.kill();
        gsap.set([hero, heroCopy].filter(Boolean), {
          clearProps: "opacity,visibility,transform",
        });
      };
    },
    {
      dependencies: [pathname, artworkNavigation?.id],
      scope: overlayRef,
    },
  );

  if (!artworkNavigation) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-45 opacity-0"
    >
      <div ref={backgroundRef} className="absolute inset-0 bg-paper" />

      <div
        ref={outgoingRef}
        className="fixed overflow-hidden bg-transparent shadow-[0_2rem_5rem_rgba(5,5,5,0.24)] will-change-[transform,clip-path,opacity]"
      >
        {/* biome-ignore lint/performance/noImgElement: the rail reuses the browser-cached hero bitmap */}
        <img
          src={artworkNavigation.fromImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div
        ref={incomingRef}
        className="fixed overflow-hidden bg-transparent shadow-[0_2rem_5rem_rgba(5,5,5,0.24)] will-change-[transform,clip-path,opacity]"
      >
        {/* biome-ignore lint/performance/noImgElement: a transient clone must match the decoded destination hero */}
        <img
          ref={incomingImageRef}
          src={artworkNavigation.toImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div
        ref={copyRef}
        className="absolute bottom-0 right-0 top-16 hidden w-[41%] flex-col justify-center border-l border-ink px-4 lg:flex"
      >
        <p className="eyebrow text-blue">{artworkNavigation.fromYear}</p>
        <p className="tight-type mt-7 max-w-[11ch] text-[clamp(3.4rem,6.2vw,7rem)] font-bold leading-[0.88]">
          {artworkNavigation.fromTitle}
        </p>
        <p className="mt-7 text-[clamp(1.3rem,2vw,2rem)] tracking-[-0.04em]">
          {artworkNavigation.fromArtist}
        </p>
        {artworkNavigation.fromMovement && (
          <p className="eyebrow mt-10 w-fit rounded-full border border-ink px-4 py-2.5">
            {artworkNavigation.fromMovement}
          </p>
        )}
      </div>
    </div>
  );
}
