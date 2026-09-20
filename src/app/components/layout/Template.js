"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import ArtworkTransitionOverlay from "../transitions/ArtworkTransitionOverlay";

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
  const overflow = isLocked ? "hidden" : "";

  document.documentElement.style.overflow = overflow;
  document.body.style.overflow = overflow;
};

const getDestinationLabel = (url) => {
  const pathname = url?.split(/[?#]/)[0] || "/";

  if (pathname === "/") return "ACCUEIL";
  if (pathname === "/paintings") return "COLLECTION";
  if (pathname === "/agenda") return "AGENDA";
  if (pathname === "/contact") return "CONTACT";
  if (pathname === "/billeterie") return "BILLETTERIE";
  if (pathname.startsWith("/paintings/")) return "ŒUVRE";

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

export default function Template({ children }) {
  const rootRef = useRef(null);
  const transitionRef = useRef(null);
  const bandsRef = useRef(null);
  const transitionLabelRef = useRef(null);
  const introRef = useRef(null);
  const introTimelineRef = useRef(null);
  const pageRef = useRef(null);
  const pathname = usePathname();
  const isImmersiveRoute = pathname === "/singularity";
  const router = useRouter();
  const destinationUrl = useStore((state) => state.destinationUrl);
  const setDestinationUrl = useStore((state) => state.setDestinationUrl);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const transitionType = useStore((state) => state.transitionType);
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
      gsap.set(skip, { autoAlpha: 0 });

      const timeline = gsap.timeline();
      introTimelineRef.current = timeline;

      timeline
        .to(logo, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.15)
        .to(skip, { autoAlpha: 1, duration: 0.24 }, 0.65)
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
        .to(
          logo,
          {
            scale: 1.02,
            duration: 0.22,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          },
          3.55,
        )
        .addLabel("reveal", 4.15)
        .set(page, { autoAlpha: 1 }, "reveal")
        .to(
          intro,
          { autoAlpha: 0, duration: 0.32, ease: "power2.out" },
          "reveal",
        )
        .to(skip, { autoAlpha: 0, duration: 0.18 }, "reveal")
        .call(() => setIsFirstRender(false), [], 4.28)
        .to(
          logo,
          {
            autoAlpha: 0,
            scale: 1.08,
            duration: 0.5,
            ease: "power3.in",
          },
          3.98,
        );

      addOpeningBands(timeline, bands, 4.26, 0.78);

      timeline
        .set(
          [transition, intro],
          {
            autoAlpha: 0,
            pointerEvents: "none",
            visibility: "hidden",
          },
          5.35,
        )
        .set(page, { clearProps: "opacity,visibility" }, 5.35)
        .call(() => setIsIntroComplete(true), [], 5.35)
        .call(() => setScrollLock(false), [], 5.35);

      return () => {
        introTimelineRef.current = null;
        setScrollLock(false);
      };
    },
    { scope: rootRef, dependencies: [isImmersiveRoute] },
  );

  useGSAP(
    // sortie de page
    () => {
      if (
        isImmersiveRoute ||
        transitionType === "artwork" ||
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
        transitionType === "artwork" ||
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

    if (!timeline || timeline.time() >= timeline.labels.reveal) return;

    timeline.tweenTo("reveal", {
      duration: 0.32,
      ease: "power3.inOut",
      onComplete: () => timeline.play(),
    });
  };

  return (
    <div ref={rootRef}>
      <ArtworkTransitionOverlay />

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
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#8e8e8e] opacity-0"
        >
          ( {getDestinationLabel(destinationUrl)} )
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
          className="eyebrow absolute bottom-5 right-4 z-10 border-b border-paper/50 pb-1 text-paper opacity-0 transition-colors hover:text-blue sm:bottom-7 sm:right-7"
        >
          Passer ↘
        </button>
      </div>

      <div ref={pageRef}>{children}</div>
    </div>
  );
}
