"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import { useI18n } from "../../i18n/I18nProvider";
import { localizeHref, stripLocaleFromPathname } from "../../i18n/routing";
import {
  LOCOMOTIVE_SCROLL_TOP_EVENT,
  LOCOMOTIVE_START_EVENT,
  LOCOMOTIVE_STOP_EVENT,
} from "../layout/SmoothScroll";

const getPathname = (url) => url?.split(/[?#]/)[0] || "";

const setScrollLock = (isLocked) => {
  const overflow = isLocked ? "hidden" : "";
  document.documentElement.style.overflow = overflow;
  document.body.style.overflow = overflow;
};

const getTitleLetters = (copy) =>
  Array.from(copy?.querySelectorAll("[data-animated-title-letter]") ?? []);

const getCopyItems = (page) =>
  Array.from(
    page?.querySelectorAll(
      "[data-artwork-copy-item], [data-artwork-hero-ui]",
    ) ?? [],
  );

const clearAnimatedElements = (hero, copyItems, overlay) => {
  gsap.set([hero, ...copyItems].filter(Boolean), {
    clearProps: "opacity,visibility,transform,clipPath",
  });
  gsap.set(overlay, {
    autoAlpha: 0,
    pointerEvents: "none",
    visibility: "hidden",
  });
};

const finishRailTransition = (hero, copyItems, overlay) => {
  const store = useStore.getState();

  clearAnimatedElements(hero, copyItems, overlay);
  setScrollLock(false);
  store.setIsTransitionActive(false);
  store.setTransitionType("default");
  store.setDestinationUrl("");
  store.setArtworkNavigation(null);
  window.dispatchEvent(new Event(LOCOMOTIVE_START_EVENT));
};

export default function ArtworkRailTransition() {
  const overlayRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const transitionType = useStore((state) => state.transitionType);
  const destinationUrl = useStore((state) => state.destinationUrl);
  const localizedDestinationUrl = localizeHref(destinationUrl, locale);
  const routePathname = stripLocaleFromPathname(pathname);
  const destinationPathname = stripLocaleFromPathname(
    getPathname(destinationUrl),
  );
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const artworkNavigation = useStore((state) => state.artworkNavigation);

  useGSAP(
    () => {
      if (
        transitionType !== "artwork-rail" ||
        !isTransitionActive ||
        !artworkNavigation ||
        !destinationUrl ||
        routePathname !== `/paintings/${artworkNavigation.fromSlug}`
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const sourcePage = document.querySelector("[data-artwork-detail-page]");
      const sourceHero = document.querySelector(
        `[data-artwork-hero="${CSS.escape(artworkNavigation.fromSlug)}"]`,
      );
      const sourceCopy = document.querySelector(
        `[data-artwork-hero-copy="${CSS.escape(artworkNavigation.fromSlug)}"]`,
      );

      if (!sourcePage || !sourceHero || !sourceCopy) {
        router.push(localizedDestinationUrl, { scroll: false });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const titleLetters = getTitleLetters(sourceCopy);
      const copyItems = getCopyItems(sourcePage);
      let timeline;
      let firstFrame;
      let secondFrame;
      let arrivalFrame;
      let cancelled = false;

      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });

      const startExit = () => {
        if (cancelled) return;

        window.dispatchEvent(new Event(LOCOMOTIVE_STOP_EVENT));
        setScrollLock(true);
        timeline = gsap.timeline();

        if (reduceMotion) {
          timeline
            .to([sourceHero, sourceCopy], {
              autoAlpha: 0,
              duration: 0.16,
              ease: "power2.out",
            })
            .call(() =>
              router.push(localizedDestinationUrl, { scroll: false }),
            );
          return;
        }

        timeline
          .to(
            titleLetters,
            {
              autoAlpha: 0,
              rotateX: -78,
              yPercent: 135,
              transformOrigin: "50% 100%",
              duration: 0.52,
              ease: "expo.in",
              stagger: { each: 0.018, from: "end" },
            },
            0,
          )
          .to(
            copyItems,
            {
              autoAlpha: 0,
              y: 18,
              duration: 0.42,
              ease: "power3.in",
              stagger: { each: 0.035, from: "end" },
            },
            0.04,
          )
          .to(
            sourceHero,
            {
              clipPath: "inset(0 100% 0 0)",
              duration: 0.82,
              ease: "power4.inOut",
            },
            0.14,
          )
          .call(
            () => router.push(localizedDestinationUrl, { scroll: false }),
            [],
            1.02,
          );
      };

      const startExitAtTop = () => {
        if (cancelled) return;

        if (window.scrollY > 12) {
          arrivalFrame = window.requestAnimationFrame(startExitAtTop);
          return;
        }

        arrivalFrame = window.requestAnimationFrame(startExit);
      };

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (reduceMotion || window.scrollY < 4) {
            window.dispatchEvent(new Event(LOCOMOTIVE_SCROLL_TOP_EVENT));
            startExitAtTop();
            return;
          }

          const scrollDuration = Math.min(
            1.35,
            Math.max(0.85, window.scrollY / 3200),
          );

          window.dispatchEvent(
            new CustomEvent(LOCOMOTIVE_SCROLL_TOP_EVENT, {
              detail: {
                animated: true,
                duration: scrollDuration,
                onComplete: startExitAtTop,
              },
            }),
          );
        });
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        window.cancelAnimationFrame(arrivalFrame);
        timeline?.kill();
      };
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
        routePathname !== destinationPathname
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const detailPage = document.querySelector("[data-artwork-detail-page]");
      const hero = document.querySelector(
        `[data-artwork-hero="${CSS.escape(artworkNavigation.toSlug)}"]`,
      );
      const heroCopy = document.querySelector(
        `[data-artwork-hero-copy="${CSS.escape(artworkNavigation.toSlug)}"]`,
      );
      const heroImage = hero?.querySelector("img");

      if (!detailPage || !hero || !heroCopy || !heroImage) {
        finishRailTransition(hero, getCopyItems(detailPage), overlay);
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const titleLetters = getTitleLetters(heroCopy);
      const copyItems = getCopyItems(detailPage);
      let timeline;
      let firstFrame;
      let secondFrame;
      let cancelled = false;

      window.dispatchEvent(new Event(LOCOMOTIVE_SCROLL_TOP_EVENT));
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });
      gsap.set(hero, {
        autoAlpha: reduceMotion ? 0 : 1,
        clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
      });
      gsap.set(copyItems, { autoAlpha: 0, y: reduceMotion ? 0 : 18 });
      gsap.set(titleLetters, {
        autoAlpha: 0,
        rotateX: -78,
        yPercent: 135,
        transformOrigin: "50% 100%",
      });

      const startEntrance = () => {
        if (cancelled) return;

        timeline = gsap.timeline();
        timeline.call(
          () => useStore.getState().setIsTransitionActive(false),
          [],
          0.02,
        );

        if (reduceMotion) {
          timeline
            .to(hero, {
              autoAlpha: 1,
              duration: 0.18,
              ease: "power2.out",
            })
            .call(() => finishRailTransition(hero, copyItems, overlay));
          return;
        }

        timeline
          .to(
            hero,
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.92,
              ease: "power4.inOut",
            },
            0.3,
          )
          .call(() => finishRailTransition(hero, copyItems, overlay), [], 1.36);
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
        cancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        timeline?.kill();
        clearAnimatedElements(hero, copyItems, overlay);
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
      className="pointer-events-none invisible fixed inset-0 z-[15500] opacity-0"
    />
  );
}
