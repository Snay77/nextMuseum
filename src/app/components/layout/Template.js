"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import { useI18n } from "../../i18n/I18nProvider";
import { stripLocaleFromPathname } from "../../i18n/routing";
import ArtworkRailTransition from "../transitions/ArtworkRailTransition";
import ArtworkTransitionOverlay from "../transitions/ArtworkTransitionOverlay";
import { HERO_SCROLL_LOCK_ATTRIBUTE } from "./SmoothScroll";

const BAND_COUNT = 10;
const TRANSITION_BANDS = Array.from(
  { length: BAND_COUNT },
  (_, index) => `transition-band-${index + 1}`,
);

const getVisibleBands = (container) =>
  Array.from(
    container?.querySelectorAll("[data-transition-band]") ?? [],
  ).filter((band) => window.getComputedStyle(band).display !== "none");

const setScrollLock = (isLocked) => {
  const keepHeroLocked =
    !isLocked &&
    document.documentElement.hasAttribute(HERO_SCROLL_LOCK_ATTRIBUTE);
  const overflow = isLocked || keepHeroLocked ? "hidden" : "";

  document.documentElement.style.overflow = overflow;
  document.body.style.overflow = overflow;
};

const getDestinationLabel = (url, t) => {
  const pathname = stripLocaleFromPathname(url?.split(/[?#]/)[0] || "/");

  if (pathname === "/") return t("template.destination.home");
  if (pathname === "/paintings") return t("template.destination.collection");
  if (pathname === "/agenda") return t("template.destination.agenda");
  if (pathname === "/contact") return t("template.destination.contact");
  if (pathname === "/billeterie") return t("template.destination.ticketing");
  if (pathname.startsWith("/paintings/"))
    return t("template.destination.artwork");

  return "NEW MUSEUM";
};

const addClosingBands = (timeline, bands, position = 0.05) => {
  bands.forEach((band, index) => {
    timeline.to(
      band,
      {
        scaleY: 1,
        duration: 0.55,
        ease: "expo.inOut",
      },
      position + Math.floor(index / 2) * 0.04,
    );
  });
};

const addOpeningBands = (timeline, bands, position, duration = 0.68) => {
  const middle = (bands.length - 1) / 2;

  bands.forEach((band, index) => {
    const distanceFromMiddle = Math.floor(Math.abs(index - middle));

    timeline.to(
      band,
      {
        scaleY: 0,
        duration,
        ease: "power4.inOut",
      },
      position + distanceFromMiddle * 0.06,
    );
  });
};

const waitForImage = (source, signal) =>
  new Promise((resolve) => {
    if (!source || signal.aborted) {
      resolve();
      return;
    }

    const image = new Image();
    const timeout = window.setTimeout(finish, 12000);

    function finish() {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve();
    }

    image.onload = finish;
    image.onerror = finish;
    signal.addEventListener("abort", finish, { once: true });
    image.src = source;

    if (image.complete) finish();
  });

function preloadInitialPage({ page, includeSpiral, onProgress }) {
  const controller = new AbortController();
  const { signal } = controller;
  const imageSources = Array.from(page.querySelectorAll("img"))
    .map((image) => image.currentSrc || image.src)
    .filter(Boolean);
  const uniqueImageSources = Array.from(new Set(imageSources));
  let loadedImages = 0;
  let fontsReady = !document.fonts;
  let windowReady = document.readyState === "complete";
  let spiralLoaded = Number(
    document.documentElement.dataset.artSpiralLoaded ?? 0,
  );
  let spiralTotal = Number(
    document.documentElement.dataset.artSpiralTotal ?? (includeSpiral ? 1 : 0),
  );
  let spiralReady =
    !includeSpiral ||
    document.documentElement.dataset.artSpiralReady === "true";

  const report = () => {
    const imageProgress = uniqueImageSources.length
      ? loadedImages / uniqueImageSources.length
      : 1;
    const spiralProgress = includeSpiral
      ? spiralReady
        ? 1
        : spiralLoaded / Math.max(1, spiralTotal)
      : 1;
    const progress = includeSpiral
      ? imageProgress * 0.35 +
        Number(fontsReady) * 0.1 +
        Number(windowReady) * 0.1 +
        spiralProgress * 0.45
      : imageProgress * 0.75 +
        Number(fontsReady) * 0.15 +
        Number(windowReady) * 0.1;

    onProgress(Math.min(0.99, Math.max(0, progress)));
  };

  const onSpiralProgress = (event) => {
    spiralLoaded = Number(event.detail?.loaded ?? spiralLoaded);
    spiralTotal = Number(event.detail?.total ?? spiralTotal);
    spiralReady = Boolean(event.detail?.ready);
    report();
  };

  if (includeSpiral) {
    window.addEventListener("museum:art-spiral-progress", onSpiralProgress);
  }

  const imagesPromise = Promise.allSettled(
    uniqueImageSources.map((source) =>
      waitForImage(source, signal).then(() => {
        loadedImages += 1;
        report();
      }),
    ),
  );
  const fontsPromise = document.fonts
    ? document.fonts.ready.then(() => {
        fontsReady = true;
        report();
      })
    : Promise.resolve();
  const windowPromise = new Promise((resolve) => {
    if (windowReady) {
      resolve();
      return;
    }

    window.addEventListener(
      "load",
      () => {
        windowReady = true;
        report();
        resolve();
      },
      { once: true },
    );
  });
  const spiralPromise = includeSpiral
    ? new Promise((resolve) => {
        if (spiralReady) {
          resolve();
          return;
        }

        const timeout = window.setTimeout(resolve, 15000);
        const onReady = (event) => {
          if (!event.detail?.ready) return;
          window.clearTimeout(timeout);
          window.removeEventListener("museum:art-spiral-progress", onReady);
          resolve();
        };
        window.addEventListener("museum:art-spiral-progress", onReady);
        signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(timeout);
            window.removeEventListener("museum:art-spiral-progress", onReady);
            resolve();
          },
          { once: true },
        );
      })
    : Promise.resolve();

  report();

  return {
    cancel: () => {
      controller.abort();
      window.removeEventListener(
        "museum:art-spiral-progress",
        onSpiralProgress,
      );
    },
    promise: Promise.all([
      imagesPromise,
      fontsPromise,
      windowPromise,
      spiralPromise,
    ]).finally(() => {
      window.removeEventListener(
        "museum:art-spiral-progress",
        onSpiralProgress,
      );
    }),
  };
}

export default function Template({ children }) {
  const { t } = useI18n();
  const rootRef = useRef(null);
  const transitionRef = useRef(null);
  const bandsRef = useRef(null);
  const transitionLabelRef = useRef(null);
  const introRef = useRef(null);
  const introTimelineRef = useRef(null);
  const introProgressFillRef = useRef(null);
  const introProgressValueRef = useRef(null);
  const pageRef = useRef(null);
  const pathname = usePathname();
  const routePathname = stripLocaleFromPathname(pathname);
  const isImmersiveRoute = routePathname === "/singularity";
  const router = useRouter();
  const destinationUrl = useStore((state) => state.destinationUrl);
  const setDestinationUrl = useStore((state) => state.setDestinationUrl);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const transitionType = useStore((state) => state.transitionType);
  const isArtworkTransition =
    transitionType === "artwork" || transitionType === "artwork-rail";
  const setIsTransitionActive = useStore(
    (state) => state.setIsTransitionActive,
  );
  const isFirstRender = useStore((state) => state.isFirstRender);
  const setIsFirstRender = useStore((state) => state.setIsFirstRender);
  const setIsIntroComplete = useStore((state) => state.setIsIntroComplete);

  useGSAP(
    // intro
    () => {
      const transition = transitionRef.current;
      const intro = introRef.current;
      const page = pageRef.current;
      const bands = getVisibleBands(bandsRef.current);

      if (isImmersiveRoute) {
        setScrollLock(false);
        gsap.set(page, { autoAlpha: 1, clearProps: "all" });
        gsap.set([transition, intro], {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        });
        setIsFirstRender(false);
        setIsIntroComplete(true);
        return;
      }

      if (!isFirstRender) {
        setIsIntroComplete(true);
        setScrollLock(false);
        gsap.set(page, { autoAlpha: 1, clearProps: "transform" });
        gsap.set([transition, intro], {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        });
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setScrollLock(false);
        gsap.set(page, { autoAlpha: 1 });
        gsap.set([transition, intro], {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        });
        setIsFirstRender(false);
        setIsIntroComplete(true);
        return;
      }

      const logoStrokes = intro.querySelectorAll("[data-logo-stroke]");
      const star = intro.querySelector("[data-intro-star]");
      const logo = intro.querySelector("[data-intro-logo]");
      const skip = intro.querySelector("[data-intro-skip]");
      const progressBar = intro.querySelector("[data-intro-progress]");
      const progressFill = introProgressFillRef.current;
      const progressValue = introProgressValueRef.current;
      const progressState = { value: 0 };
      let targetProgress = 0;
      let progressFrame;
      let progressStartedAt;
      let previousProgressTimestamp;
      let cancelled = false;
      let finalTimeline;

      const renderProgress = () => {
        const roundedProgress = Math.round(progressState.value);
        if (progressFill) progressFill.style.width = `${roundedProgress}%`;
        if (progressValue) {
          progressValue.textContent = String(roundedProgress).padStart(2, "0");
        }
      };

      const setProgress = (progress) => {
        targetProgress = Math.max(targetProgress, progress * 100);
      };

      const updateProgress = (timestamp) => {
        if (cancelled) return;

        progressStartedAt ??= timestamp;
        const elapsed = timestamp - progressStartedAt;

        if (elapsed > 380 && progressState.value < targetProgress) {
          const previousTimestamp = previousProgressTimestamp ?? timestamp;
          const elapsedSeconds = Math.min(
            0.1,
            (timestamp - previousTimestamp) / 1000,
          );

          progressState.value = Math.min(
            targetProgress,
            progressState.value + elapsedSeconds * 31.5,
          );
          renderProgress();
        }

        previousProgressTimestamp = timestamp;
        progressFrame = window.requestAnimationFrame(updateProgress);
      };

      const startProgress = () => {
        progressStartedAt = undefined;
        previousProgressTimestamp = undefined;
        progressFrame = window.requestAnimationFrame(updateProgress);
      };

      const stopProgress = () => {
        window.cancelAnimationFrame(progressFrame);
      };

      setScrollLock(true);
      gsap.set(page, { autoAlpha: 0 });
      gsap.set(transition, {
        autoAlpha: 1,
        pointerEvents: "none",
        visibility: "visible",
      });
      gsap.set(bands, { scaleY: 1 });
      gsap.set(logo, { autoAlpha: 0 });
      gsap.set(logoStrokes, {
        attr: { "stroke-dasharray": 1, "stroke-dashoffset": 1 },
      });
      gsap.set(star, {
        autoAlpha: 0,
        rotation: -30,
        scale: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set([skip, progressBar], { autoAlpha: 0 });
      gsap.set(progressFill, { width: "0%" });
      renderProgress();

      const timeline = gsap.timeline();
      introTimelineRef.current = timeline;

      const drawingPromise = new Promise((resolve) => {
        timeline.call(resolve, [], 3.3);
      });
      const preloader = preloadInitialPage({
        page,
        includeSpiral: routePathname === "/",
        onProgress: setProgress,
      });

      timeline
        .to(logo, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.12)
        .to([skip, progressBar], { autoAlpha: 1, duration: 0.28 }, 0.12)
        .call(startProgress, [], 0.12)
        .to(
          logoStrokes,
          {
            attr: { "stroke-dashoffset": 0 },
            duration: 2.2,
            ease: "power2.inOut",
            stagger: 0.35,
          },
          0.25,
        )
        .to(
          star,
          {
            autoAlpha: 1,
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(2.2)",
          },
          2.6,
        )
        .addLabel("drawn", 3.3);

      Promise.all([drawingPromise, preloader.promise]).then(() => {
        if (cancelled) return;

        stopProgress();
        finalTimeline = gsap.timeline();
        introTimelineRef.current = finalTimeline;
        finalTimeline
          .to(progressState, {
            value: 100,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: renderProgress,
          })
          .to(
            logo,
            {
              scale: 1.04,
              duration: 0.2,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
            },
            0.26,
          )
          .to([skip, progressBar], { autoAlpha: 0, duration: 0.18 }, 0.36)
          .set(page, { autoAlpha: 1 }, 0.58)
          .to(intro, { autoAlpha: 0, duration: 0.34, ease: "power2.out" }, 0.58)
          .call(() => setIsFirstRender(false), [], 0.7)
          .to(
            logo,
            {
              autoAlpha: 0,
              scale: 1.1,
              duration: 0.48,
              ease: "power3.in",
            },
            0.48,
          );

        addOpeningBands(finalTimeline, bands, 0.72, 0.78);

        finalTimeline
          .set(
            [transition, intro],
            {
              autoAlpha: 0,
              pointerEvents: "none",
              visibility: "hidden",
            },
            1.78,
          )
          .set(page, { clearProps: "opacity,visibility" }, 1.78)
          .call(() => setIsIntroComplete(true), [], 1.78)
          .call(() => setScrollLock(false), [], 1.78);
      });

      return () => {
        cancelled = true;
        stopProgress();
        preloader.cancel();
        finalTimeline?.kill();
        introTimelineRef.current = null;
        setScrollLock(false);
      };
    },
    { scope: rootRef, dependencies: [isImmersiveRoute, pathname] },
  );

  useGSAP(
    // sortie de page
    () => {
      if (
        isImmersiveRoute ||
        isArtworkTransition ||
        !isTransitionActive ||
        isFirstRender ||
        !destinationUrl
      ) {
        return;
      }

      const transition = transitionRef.current;
      const bands = getVisibleBands(bandsRef.current);
      const label = transitionLabelRef.current;
      const page = pageRef.current;

      setScrollLock(true);
      gsap.set(transition, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });
      gsap.set(bands, { scaleY: 0 });
      gsap.set(label, { autoAlpha: 0 });

      const timeline = gsap.timeline();

      timeline
        .to(
          page,
          {
            autoAlpha: 0.96,
            y: -12,
            duration: 0.56,
            ease: "power3.inOut",
          },
          0.05,
        )
        .to(label, { autoAlpha: 1, duration: 0.2 }, 0.5);

      addClosingBands(timeline, bands);

      timeline.call(() => router.push(destinationUrl), [], 0.68);
    },
    {
      dependencies: [
        destinationUrl,
        isFirstRender,
        isImmersiveRoute,
        isTransitionActive,
        transitionType,
      ],
      scope: rootRef,
    },
  );

  useGSAP(
    // entrée de page
    () => {
      if (
        isImmersiveRoute ||
        isArtworkTransition ||
        !isTransitionActive ||
        isFirstRender ||
        !destinationUrl
      ) {
        return;
      }

      const transition = transitionRef.current;
      const bands = getVisibleBands(bandsRef.current);
      const label = transitionLabelRef.current;
      const page = pageRef.current;
      const pageTitle = page.querySelector("h1");
      const timeline = gsap.timeline();

      gsap.set(page, { autoAlpha: 0.96, y: 12 });
      if (pageTitle) gsap.set(pageTitle, { autoAlpha: 0, y: 24 });

      timeline.to(label, { autoAlpha: 0, duration: 0.22 }, 0.22).to(
        page,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          ease: "power3.out",
        },
        0.24,
      );

      addOpeningBands(timeline, bands, 0.3);

      if (pageTitle) {
        timeline.to(
          pageTitle,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.78,
            ease: "expo.out",
          },
          0.48,
        );
      }

      timeline
        .set(transition, {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        })
        .set([page, pageTitle].filter(Boolean), { clearProps: "all" })
        .call(() => setScrollLock(false))
        .call(() => setIsTransitionActive(false))
        .call(() => setDestinationUrl(""));
    },
    {
      dependencies: [pathname],
      scope: rootRef,
    },
  );

  const skipIntro = () => {
    const timeline = introTimelineRef.current;
    const drawnAt = timeline?.labels?.drawn;

    if (!timeline || typeof drawnAt !== "number" || timeline.time() >= drawnAt)
      return;

    timeline.tweenTo("drawn", {
      duration: 0.32,
      ease: "power3.inOut",
      onComplete: () => timeline.play(),
    });
  };

  return (
    <div ref={rootRef}>
      <ArtworkTransitionOverlay />
      <ArtworkRailTransition />

      <div
        ref={transitionRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed inset-0 z-15000 opacity-0"
      >
        <div ref={bandsRef} className="absolute inset-0 overflow-hidden">
          {TRANSITION_BANDS.map((band, index) => (
            <span
              key={band}
              data-transition-band
              className="transition-band absolute top-0 h-full bg-ink"
              style={{
                "--band-index": index,
                transformOrigin:
                  index % 2 === 0 ? "center top" : "center bottom",
              }}
            />
          ))}
        </div>

        <p
          ref={transitionLabelRef}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#8e8e8e] opacity-0 sm:text-sm"
        >
          ( {getDestinationLabel(destinationUrl, t)} )
          <span className="ml-1.5 text-blue">*</span>
        </p>
      </div>

      <div
        ref={introRef}
        className="fixed inset-0 z-16000 overflow-hidden bg-ink text-paper"
      >
        <div
          data-intro-logo
          className="absolute left-1/2 top-1/2 flex w-[min(78vw,44rem)] -translate-x-1/2 -translate-y-1/2 items-start opacity-0"
          aria-label="NM*"
          role="img"
        >
          <svg
            className="w-[88%] shrink-0 overflow-visible"
            viewBox="0 0 490 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <g
              stroke="currentColor"
              strokeWidth="28"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path
                data-logo-stroke
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                d="M 42 160 V 40 L 218 160 V 40"
              />
              <path
                data-logo-stroke
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                d="M 286 160 V 40 L 374 132 L 462 40 V 160"
              />
            </g>
          </svg>
          <span
            data-intro-star
            aria-hidden="true"
            className="display-type -ml-[0.01em] -mt-[0.08em] inline-block text-[clamp(4.5rem,11vw,8rem)] text-blue"
          >
            *
          </span>
        </div>

        <button
          type="button"
          data-intro-skip
          onClick={skipIntro}
          className="eyebrow absolute right-4 top-5 z-10 border-b border-paper/50 pb-1 text-paper opacity-0 transition-colors hover:text-blue sm:right-7 sm:top-7"
        >
          {t("template.skip")}
        </button>

        <div
          data-intro-progress
          className="absolute inset-x-4 bottom-5 z-10 opacity-0 sm:inset-x-7 sm:bottom-7"
        >
          <div className="mb-3 flex items-end justify-between gap-6 font-mono text-[0.625rem] font-bold uppercase tracking-[0.1em] text-paper/55">
            <span>{t("template.preparing")}</span>
            <span
              ref={introProgressValueRef}
              className="text-2xl tracking-[-0.06em] text-paper sm:text-3xl"
            >
              00
            </span>
          </div>
          <div className="h-px overflow-hidden bg-paper/25">
            <span
              ref={introProgressFillRef}
              className="block h-full w-0 bg-blue"
            />
          </div>
        </div>
      </div>

      <div ref={pageRef}>{children}</div>
    </div>
  );
}
