"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export const LOCOMOTIVE_REFRESH_EVENT = "new-museum:scroll-refresh";
export const LOCOMOTIVE_RESIZE_EVENT = "new-museum:scroll-resize";
export const LOCOMOTIVE_SCROLL_TO_EVENT = "new-museum:scroll-to";
export const LOCOMOTIVE_SCROLL_TOP_EVENT = "new-museum:scroll-top";
export const LOCOMOTIVE_STOP_EVENT = "new-museum:scroll-stop";
export const LOCOMOTIVE_START_EVENT = "new-museum:scroll-start";

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

    const scrollToPosition = (event) => {
      const top = Math.max(0, Number(event.detail?.top) || 0);

      locomotiveRef.current?.scrollTo(top, {
        immediate: true,
        force: true,
      });
      window.scrollTo({ top, left: 0, behavior: "instant" });
      ScrollTrigger.update();
    };

    const resizeLocomotive = () => {
      locomotiveRef.current?.resize();
      ScrollTrigger.refresh();
    };

    const stopLocomotive = () => {
      locomotiveRef.current?.stop();
    };

    const startLocomotive = () => {
      locomotiveRef.current?.start();
    };

    const locomotive = createLocomotive();
    const refreshFrame = requestAnimationFrame(() => {
      locomotive.resize();
      ScrollTrigger.refresh();
    });

    window.addEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);
    window.addEventListener(LOCOMOTIVE_RESIZE_EVENT, resizeLocomotive);
    window.addEventListener(LOCOMOTIVE_SCROLL_TO_EVENT, scrollToPosition);
    window.addEventListener(LOCOMOTIVE_SCROLL_TOP_EVENT, scrollToTop);
    window.addEventListener(LOCOMOTIVE_STOP_EVENT, stopLocomotive);
    window.addEventListener(LOCOMOTIVE_START_EVENT, startLocomotive);

    return () => {
      cancelAnimationFrame(refreshFrame);
      if (rebuildFrameRef.current) {
        cancelAnimationFrame(rebuildFrameRef.current);
      }
      window.removeEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);
      window.removeEventListener(LOCOMOTIVE_RESIZE_EVENT, resizeLocomotive);
      window.removeEventListener(LOCOMOTIVE_SCROLL_TO_EVENT, scrollToPosition);
      window.removeEventListener(LOCOMOTIVE_SCROLL_TOP_EVENT, scrollToTop);
      window.removeEventListener(LOCOMOTIVE_STOP_EVENT, stopLocomotive);
      window.removeEventListener(LOCOMOTIVE_START_EVENT, startLocomotive);
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
