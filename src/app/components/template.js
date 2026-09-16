"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../_lib/store";

const TRANSITION_DEFAULTS = {
  duration: 1,
  ease: "expo.inOut",
};

const setPageRevealState = (target) => {
  gsap.set(target, {
    autoAlpha: 1,
    filter: "brightness(0.6) blur(24px)",
    scale: 0.9,
    y: 200,
    transformOrigin: "top center",
  });
};

export default function Template({ children }) {
  const curtainRef = useRef(null);
  const pageRef = useRef(null);
  const preloaderRef = useRef(null);
  const {
    destinationUrl,
    setDestinationUrl,
    isTransitionActive,
    setIsTransitionActive,
    isFirstRender,
    setIsFirstRender,
  } = useStore();
  const router = useRouter();

  useGSAP(() => {
    if (isFirstRender) return;

    gsap.set(curtainRef.current, { opacity: 1 });
    setPageRevealState(pageRef.current);

    const tl = gsap.timeline({ defaults: TRANSITION_DEFAULTS });

    tl.to(curtainRef.current, {
      clipPath: "inset(0% 0% 100% 0%)",
    }).to(
      pageRef.current,
      {
        filter: "brightness(1) blur(0px)",
        scale: 1,
        y: 0,
      },
      "<0.1",
    );
  }, []);

  useGSAP(() => {
    if (!isTransitionActive) return;

    gsap.set(curtainRef.current, {
      clipPath: "inset(100% 0% 0% 0%)",
      opacity: 1,
    });

    const tl = gsap.timeline({
      defaults: TRANSITION_DEFAULTS,
      onComplete: () => {
        router.push(destinationUrl);
        setIsTransitionActive(false);
        setDestinationUrl("");
      },
    });

    tl.to(pageRef.current, {
      y: -200,
      filter: "brightness(0.6) blur(24px)",
      scale: 0.9,
    }).to(
      curtainRef.current,
      {
        clipPath: "inset(0% 0% 0% 0%)",
      },
      "<0.1",
    );
  }, [destinationUrl, isTransitionActive]);

  useGSAP(() => {
    if (!isFirstRender) {
      gsap.set(preloaderRef.current, { autoAlpha: 0 });
      return;
    }

    const lines = Array.from(preloaderRef.current.querySelectorAll("div"));

    gsap.set(lines, {
      scaleY: 0,
      opacity: 1,
      transformOrigin: "top center",
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloaderRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "expo.inOut",
          onComplete: () => {
            setIsFirstRender(false);
          },
        });

        setPageRevealState(pageRef.current);

        gsap.to(pageRef.current, {
          filter: "brightness(1) blur(0px)",
          scale: 1,
          y: 0,
          duration: 1,
          ease: "expo.inOut",
          delay: 0.1,
        });
      },
    });

    tl.to(lines, {
      scaleY: 1,
      ease: "expo.inOut",
      duration: 0.8,
      stagger: 0.08,
    });
  }, [isFirstRender]);

  return (
    <>
      <div
        ref={curtainRef}
        className="fixed top-0 left-0 w-screen h-screen z-15000 bg-white opacity-0 pointer-events-none"
      />
      <div
        ref={preloaderRef}
        className="fixed top-0 left-0 w-screen h-screen bg-white z-14000 pointer-events-none "
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="w-px bg-black absolute h-full top-0 opacity-0"
            style={{ left: `${index * 10}%` }}
          />
        ))}
      </div>
      <div ref={pageRef} className="opacity-0">
        {children}
      </div>
    </>
  );
}
