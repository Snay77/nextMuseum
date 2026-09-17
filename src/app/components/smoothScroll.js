"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export const LOCOMOTIVE_REFRESH_EVENT = "new-museum:scroll-refresh";

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

    const locomotive = createLocomotive();
    const refreshFrame = requestAnimationFrame(() => {
      locomotive.resize();
      ScrollTrigger.refresh();
    });

    window.addEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);

    return () => {
      cancelAnimationFrame(refreshFrame);
      if (rebuildFrameRef.current) {
        cancelAnimationFrame(rebuildFrameRef.current);
      }
      window.removeEventListener(LOCOMOTIVE_REFRESH_EVENT, rebuildLocomotive);
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
