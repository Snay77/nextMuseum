"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import AnimatedHeroTitle from "../ui/AnimatedHeroTitle";
import Link from "../ui/Link";

export default function HomeHero() {
  const sectionRef = useRef(null);
  const isFirstRender = useStore((state) => state.isFirstRender);
  const setIsHeroAnimationComplete = useStore(
    (state) => state.setIsHeroAnimationComplete,
  );

  useGSAP(
    () => {
      if (isFirstRender) return;

      const section = sectionRef.current;
      const header = document.querySelector("[data-site-header]");
      const backgroundStar = section.querySelector("[data-hero-texture]");
      const chrome = section.querySelectorAll("[data-hero-chrome]");
      const cta = section.querySelector("[data-hero-cta]");
      const animatedElements = [header, backgroundStar, ...chrome, cta].filter(
        Boolean,
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(animatedElements, { clearProps: "all" });
        setIsHeroAnimationComplete(true);
        return;
      }

      setIsHeroAnimationComplete(false);

      gsap.set(backgroundStar, {
        autoAlpha: 0,
        rotation: -16,
        scale: 0.78,
        transformOrigin: "center center",
      });
      gsap.set(header, {
        autoAlpha: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        y: -14,
      });
      gsap.set(chrome, { autoAlpha: 0, y: 18 });
      gsap.set(cta, { autoAlpha: 0, scale: 0.82 });

      const timeline = gsap.timeline({ delay: 0.12 });

      timeline
        .addLabel("texture", 0)
        .to(
          backgroundStar,
          {
            autoAlpha: 1,
            rotation: -8,
            scale: 1,
            duration: 1,
            ease: "power3.out",
          },
          "texture",
        )
        .addLabel("chrome", 2.7)
        .to(
          header,
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 0.72,
            ease: "power4.out",
          },
          "chrome",
        )
        .to(
          chrome,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.1,
          },
          "chrome+=0.1",
        )
        .to(
          cta,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.58,
            ease: "back.out(1.8)",
          },
          "chrome+=0.38",
        )
        .set(header, { clearProps: "transform,clipPath,opacity,visibility" })
        .set([backgroundStar, chrome, cta], {
          clearProps: "transform,clipPath,opacity,visibility",
        })
        .call(() => setIsHeroAnimationComplete(true));
    },
    {
      scope: sectionRef,
      dependencies: [isFirstRender, setIsHeroAnimationComplete],
    },
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-3.5rem)] overflow-hidden px-3 pb-3 pt-4 sm:min-h-[calc(100svh-4rem)] sm:px-4 sm:pt-5"
    >
      <div
        className="relative z-20 flex items-start justify-between gap-6"
        data-hero-chrome
      >
        <p className="tight-type max-w-[15rem] text-lg font-bold sm:max-w-sm sm:text-2xl">
          Un musée vivant pour des regards nouveaux.
        </p>
        <p className="eyebrow text-right leading-[1.25]">
          Art moderne
          <br />& contemporain
        </p>
      </div>

      <div
        aria-hidden="true"
        data-hero-texture
        className="display-type pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/4 select-none text-[clamp(38rem,85vw,90rem)] leading-none text-ink/5"
      >
        *
      </div>

      <AnimatedHeroTitle
        aria-label="New Museum"
        lines={[
          { id: "new", text: "NEW" },
          { id: "museum", text: "MUSEUM", star: true },
        ]}
        active={!isFirstRender}
        delay={1}
        className="display-type pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(6.5rem,21vw,21rem)] [perspective:1000px]"
        lineClassName="flex justify-center overflow-hidden"
        starClassName="ml-[0.04em] self-start pt-[0.02em] text-[0.38em] text-blue"
      />

      <div
        className="absolute inset-x-3 bottom-3 z-20 flex items-end justify-between sm:inset-x-4"
        data-hero-chrome
      >
        <p className="eyebrow">Paris · France</p>
        <Link
          href="/paintings"
          className="eyebrow rounded-full bg-ink px-5 py-3 text-paper transition-colors hover:bg-blue"
          data-hero-cta
        >
          Explorer →
        </Link>
      </div>
    </section>
  );
}
