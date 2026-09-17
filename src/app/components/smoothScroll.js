"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      lerp: 0.085,
      respectReducedMotion: true,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;

    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(500, 33);

    const refreshFrame = requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const refreshFrame = requestAnimationFrame(() => {
      if (window.location.pathname !== pathname) return;

      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(refreshFrame);
  }, [pathname]);

  return children;
}
