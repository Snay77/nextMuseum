"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export const LOCOMOTIVE_REFRESH_EVENT = "new-museum:scroll-refresh";
export const LOCOMOTIVE_SCROLL_TOP_EVENT = "new-museum:scroll-top";

export default function SmoothScroll({ children }) {
  const locomotiveRef = useRef(null);
  const rebuildFrameRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const createLocomotive = () => {
      const locomotive = new LocomotiveScroll({
        lenisOptions: {
          anchors: true,
          lerp: 0.085,
          smoothWheel: true,
          stopInertiaOnNavigate: true,
        },
        scrollCallback: ScrollTrigger.update,
        initCustomTicker: (render) => gsap.ticker.add(render),
        destroyCustomTicker: (render) => gsap.ticker.remove(render),
      });

      locomotiveRef.current = locomotive;
      return locomotive;
    };

    const rebuildLocomotive = () => {
      if (rebuildFrameRef.current) {
        cancelAnimationFrame(rebuildFrameRef.current);
      }

      rebuildFrameRef.current = requestAnimationFrame(() => {
        locomotiveRef.current?.destroy();
        const locomotive = createLocomotive();

        requestAnimationFrame(() => {
          locomotive.resize();
          ScrollTrigger.refresh();
        });
      });
    };

    const scrollToTop = () => {
      locomotiveRef.current?.scrollTo(0, {
        immediate: true,
        force: true,
      });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      ScrollTrigger.update();
    };

    const locomotive = createLocomotive();
    const refreshFrame = requestAnimationFrame(() => {
      locomotive.resize();
      ScrollTrigger.refresh();
    });

    window.addEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);
    window.addEventListener(LOCOMOTIVE_SCROLL_TOP_EVENT, scrollToTop);

    return () => {
      cancelAnimationFrame(refreshFrame);
      if (rebuildFrameRef.current) {
        cancelAnimationFrame(rebuildFrameRef.current);
      }
      window.removeEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);
      window.removeEventListener(LOCOMOTIVE_SCROLL_TOP_EVENT, scrollToTop);
      locomotiveRef.current?.destroy();
      locomotiveRef.current = null;
    };
  }, []);

  useEffect(() => {
    const refreshFrame = requestAnimationFrame(() => {
      if (window.location.pathname !== pathname) return;

      locomotiveRef.current?.resize();
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(refreshFrame);
  }, [pathname]);

  return children;
}
