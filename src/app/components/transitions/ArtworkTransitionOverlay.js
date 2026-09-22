"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import {
  LOCOMOTIVE_RESIZE_EVENT,
  LOCOMOTIVE_SCROLL_TO_EVENT,
  LOCOMOTIVE_SCROLL_TOP_EVENT,
  LOCOMOTIVE_START_EVENT,
  LOCOMOTIVE_STOP_EVENT,
} from "../layout/SmoothScroll";

const setScrollLock = (isLocked) => {
  const overflow = isLocked ? "hidden" : "";

  document.documentElement.style.overflow = overflow;
  document.body.style.overflow = overflow;
};

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

const getArtworkHeroPreviewRect = (naturalWidth, naturalHeight) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isDesktop = viewportWidth >= 1024;
  const isTablet = viewportWidth >= 640;
  const headerHeight = isTablet ? 64 : 56;

  if (isDesktop) {
    const columnWidth = viewportWidth * 0.59;
    const padding = Math.min(96, Math.max(40, viewportWidth * 0.05));

    return getContainedImageRect(
      {
        left: padding,
        top: headerHeight + padding,
        width: Math.max(1, columnWidth - padding * 2),
        height: Math.max(1, viewportHeight - headerHeight - padding * 2),
      },
      naturalWidth,
      naturalHeight,
    );
  }

  const padding = isTablet ? 40 : 24;
  const mediaHeight = viewportHeight * (isTablet ? 0.72 : 0.6);

  return getContainedImageRect(
    {
      left: padding,
      top: headerHeight + padding,
      width: Math.max(1, viewportWidth - padding * 2),
      height: Math.max(1, mediaHeight - padding * 2),
    },
    naturalWidth,
    naturalHeight,
  );
};

const finishArtworkTransition = () => {
  const store = useStore.getState();

  setScrollLock(false);
  store.setIsTransitionActive(false);
  store.setTransitionType("default");
  store.setDestinationUrl("");
  store.setArtworkTransition(null);
  window.dispatchEvent(new Event(LOCOMOTIVE_START_EVENT));
  window.dispatchEvent(new Event(LOCOMOTIVE_RESIZE_EVENT));
};

export default function ArtworkTransitionOverlay() {
  const overlayRef = useRef(null);
  const backdropRef = useRef(null);
  const frameRef = useRef(null);
  const coverImageRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const destinationUrl = useStore((state) => state.destinationUrl);
  const transitionType = useStore((state) => state.transitionType);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const artworkTransition = useStore((state) => state.artworkTransition);

  useGSAP(
    () => {
      if (
        transitionType !== "artwork" ||
        !isTransitionActive ||
        !artworkTransition ||
        !destinationUrl
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const backdrop = backdropRef.current;
      const frame = frameRef.current;
      const coverImage = coverImageRef.current;
      const isReturn = artworkTransition.direction === "to-collection";
      const isSpiral = artworkTransition.origin === "spiral";
      const sourcePage = document.querySelector(
        isReturn
          ? "[data-artwork-detail-page]"
          : isSpiral
            ? "[data-artwork-spiral-page]"
            : "[data-artwork-collection-page]",
      );
      const sourceCopy = isReturn
        ? Array.from(
            document.querySelectorAll("[data-artwork-hero-copy]"),
          ).find(
            (element) =>
              element.dataset.artworkHeroCopy === artworkTransition.slug,
          )
        : null;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isCollectionEntry = !isReturn && !isSpiral;
      const sourceArtworkFrame = isCollectionEntry
        ? document.querySelector(
            `[data-artwork-frame][data-artwork-slug="${CSS.escape(artworkTransition.slug)}"]`,
          )
        : null;
      const {
        sourceRect,
        sourceRotation = 0,
        objectPosition = "50% 50%",
      } = artworkTransition;

      window.dispatchEvent(new Event(LOCOMOTIVE_STOP_EVENT));
      if (!isSpiral) setScrollLock(true);
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(frame, {
        autoAlpha: 1,
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        rotation: sourceRotation,
        scale: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(coverImage, {
        autoAlpha: 1,
        objectPosition,
        scale: isReturn || isSpiral ? 1 : 1.18,
      });
      if (sourceArtworkFrame) gsap.set(sourceArtworkFrame, { autoAlpha: 0 });

      const timeline = gsap.timeline();

      if (isCollectionEntry) {
        const previewRect = getArtworkHeroPreviewRect(
          artworkTransition.naturalWidth,
          artworkTransition.naturalHeight,
        );
        const travelDuration = reduceMotion ? 0.18 : 1.02;
        const travelStart = reduceMotion ? 0 : 0.08;
        const routeAt = travelStart + travelDuration;

        timeline
          .to(
            frame,
            {
              scale: reduceMotion ? 1 : 1.018,
              duration: reduceMotion ? 0.06 : 0.2,
              ease: "power2.out",
            },
            0,
          )
          .to(
            sourcePage,
            {
              autoAlpha: 0.2,
              duration: reduceMotion ? 0.08 : 0.42,
              ease: "power2.out",
            },
            0,
          )
          .to(
            frame,
            {
              left: previewRect.left,
              top: previewRect.top,
              width: previewRect.width,
              height: previewRect.height,
              rotation: 0,
              scale: 1,
              duration: travelDuration,
              ease: reduceMotion ? "power2.out" : "power4.inOut",
            },
            travelStart,
          )
          .to(
            coverImage,
            {
              scale: 1,
              duration: travelDuration,
              ease: reduceMotion ? "power2.out" : "power4.inOut",
            },
            travelStart,
          )
          .to(
            backdrop,
            {
              autoAlpha: 1,
              duration: reduceMotion ? 0.08 : 0.3,
              ease: "power2.inOut",
            },
            Math.max(0, routeAt - (reduceMotion ? 0.05 : 0.28)),
          )
          .to(
            sourcePage,
            {
              autoAlpha: 0,
              duration: reduceMotion ? 0.08 : 0.24,
              ease: "power2.in",
            },
            Math.max(0, routeAt - (reduceMotion ? 0.04 : 0.2)),
          );

        if (artworkTransition.navigationMode !== "history") {
          timeline.call(
            () => router.push(destinationUrl, { scroll: false }),
            [],
            routeAt,
          );
        }
      } else {
        timeline.to(
          frame,
          {
            scale: reduceMotion || isSpiral ? 1 : 1.015,
            duration: reduceMotion ? 0.06 : 0.18,
            ease: "power2.out",
          },
          0,
        );

        if (isReturn) {
          if (sourceCopy) {
            timeline.to(
              sourceCopy,
              {
                autoAlpha: 0,
                y: 12,
                duration: reduceMotion ? 0.08 : 0.25,
                ease: "power2.in",
              },
              0,
            );
          }
        } else if (sourcePage) {
          timeline.to(
            sourcePage,
            {
              autoAlpha: 0.14,
              duration: reduceMotion ? 0.08 : 0.28,
              ease: "power2.out",
            },
            0,
          );
        }

        if (artworkTransition.navigationMode !== "history") {
          timeline.call(
            () => {
              if (artworkTransition.navigationMode === "back") {
                router.back();
              } else if (isSpiral) {
                window.dispatchEvent(new Event(LOCOMOTIVE_SCROLL_TOP_EVENT));
                router.push(destinationUrl, { scroll: true });
              } else {
                router.push(destinationUrl, { scroll: false });
              }
            },
            [],
            reduceMotion ? 0.04 : isReturn ? 0.1 : 0.16,
          );
        }
      }

      const fallbackTimer = window.setTimeout(() => {
        const store = useStore.getState();

        if (store.artworkTransition?.id !== artworkTransition.id) return;
        if (window.location.pathname === getPathname(destinationUrl)) return;

        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.2,
          onComplete: finishArtworkTransition,
        });
      }, 8000);

      return () => {
        window.clearTimeout(fallbackTimer);
        timeline.kill();
        gsap.set(overlay, {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        });
        if (sourcePage) {
          gsap.set(sourcePage, {
            clearProps: "opacity,visibility,transform",
          });
        }
        if (sourceCopy) {
          gsap.set(sourceCopy, {
            clearProps: "opacity,visibility,transform",
          });
        }
        if (sourceArtworkFrame) {
          gsap.set(sourceArtworkFrame, {
            clearProps: "opacity,visibility",
          });
        }
        if (!isSpiral) setScrollLock(false);
      };
    },
    {
      dependencies: [artworkTransition?.id],
      scope: overlayRef,
    },
  );

  useGSAP(
    () => {
      if (
        transitionType !== "artwork" ||
        !isTransitionActive ||
        !artworkTransition ||
        artworkTransition.direction === "to-collection" ||
        pathname !== getPathname(destinationUrl)
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const backdrop = backdropRef.current;
      const frame = frameRef.current;
      const coverImage = coverImageRef.current;
      const hero = Array.from(
        document.querySelectorAll("[data-artwork-hero]"),
      ).find(
        (element) => element.dataset.artworkHero === artworkTransition.slug,
      );
      const copy = Array.from(
        document.querySelectorAll("[data-artwork-hero-copy]"),
      ).find(
        (element) => element.dataset.artworkHeroCopy === artworkTransition.slug,
      );
      const detailPage = document.querySelector("[data-artwork-detail-page]");

      if (!hero) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.25,
          onComplete: finishArtworkTransition,
        });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 47.99rem)").matches;
      const isCollectionEntry = artworkTransition.origin !== "spiral";
      const morphDuration = reduceMotion
        ? 0.16
        : isCollectionEntry
          ? isMobile
            ? 0.42
            : 0.34
          : isMobile
            ? 0.68
            : 0.82;
      const contentStart = reduceMotion ? morphDuration : morphDuration + 0.04;
      const pageRevealDuration = reduceMotion ? 0.16 : 0.56;
      const imageHandoff = contentStart + pageRevealDuration * 0.78;
      let timeline;
      let firstFrame;
      let secondFrame;
      let isCancelled = false;

      gsap.set(hero, { autoAlpha: 0 });
      if (copy) gsap.set(copy, { autoAlpha: 0, y: 18 });
      if (isCollectionEntry && detailPage) {
        gsap.set(detailPage, { autoAlpha: 0 });
      }

      window.dispatchEvent(new Event(LOCOMOTIVE_SCROLL_TOP_EVENT));

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          const heroImage = hero.querySelector("img");

          const startMorph = () => {
            if (isCancelled) return;

            const heroRect = hero.getBoundingClientRect();
            const targetRect = getContainedImageRect(
              heroRect,
              artworkTransition.naturalWidth,
              artworkTransition.naturalHeight,
            );

            timeline = gsap.timeline();

            timeline
              .to(
                frame,
                {
                  left: targetRect.left,
                  top: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                  rotation: 0,
                  scale: 1,
                  duration: morphDuration,
                  ease: reduceMotion ? "power2.out" : "expo.inOut",
                },
                0,
              )
              .to(
                coverImage,
                {
                  scale: 1,
                  duration: morphDuration,
                  ease: reduceMotion ? "power2.out" : "expo.inOut",
                },
                0,
              )
              .to(
                detailPage,
                {
                  autoAlpha: 1,
                  duration: pageRevealDuration,
                  ease: "power2.out",
                },
                contentStart,
              )
              .to(
                backdrop,
                {
                  autoAlpha: 0,
                  duration: pageRevealDuration,
                  ease: "power2.out",
                },
                contentStart,
              )
              .set(hero, { autoAlpha: 1 }, imageHandoff)
              .set(frame, { autoAlpha: 0 }, imageHandoff + 0.02);

            if (copy) {
              timeline.to(
                copy,
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: reduceMotion ? 0.16 : 0.44,
                  ease: "power3.out",
                },
                contentStart + (reduceMotion ? 0.02 : 0.16),
              );
            }

            timeline
              .set([hero, copy, detailPage].filter(Boolean), {
                clearProps: "opacity,visibility,transform",
              })
              .call(finishArtworkTransition);
          };

          if (!heroImage || (heroImage.complete && heroImage.naturalWidth)) {
            startMorph();
          } else {
            heroImage
              .decode()
              .catch(() => {})
              .finally(startMorph);
          }
        });
      });

      return () => {
        isCancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        timeline?.kill();
        if (detailPage) {
          gsap.set(detailPage, {
            clearProps: "opacity,visibility,transform",
          });
        }
      };
    },
    {
      dependencies: [pathname, artworkTransition?.id],
      scope: overlayRef,
    },
  );

  useGSAP(
    () => {
      if (
        transitionType !== "artwork" ||
        !isTransitionActive ||
        !artworkTransition ||
        artworkTransition.direction !== "to-collection" ||
        pathname !== getPathname(destinationUrl)
      ) {
        return;
      }

      const overlay = overlayRef.current;
      const frame = frameRef.current;
      const coverImage = coverImageRef.current;
      const collectionPage = document.querySelector(
        "[data-artwork-collection-page]",
      );
      const targetFrame = Array.from(
        document.querySelectorAll("[data-artwork-frame]"),
      ).find(
        (element) => element.dataset.artworkSlug === artworkTransition.slug,
      );
      const targetImage = targetFrame?.querySelector("img");
      const targetVisual =
        targetFrame?.closest(".artwork-shadow") || targetFrame;

      if (!collectionPage || !targetFrame || !targetImage || !targetVisual) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.2,
          onComplete: finishArtworkTransition,
        });
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 47.99rem)").matches;
      const morphDuration = reduceMotion ? 0.2 : isMobile ? 0.68 : 0.82;
      const handoffTime = reduceMotion ? morphDuration : morphDuration + 0.02;
      const collectionState = useStore.getState().collectionState;
      const savedScroll = Math.max(0, Number(collectionState?.scrollY) || 0);
      const viewportChanged =
        Math.abs(
          window.innerWidth -
            (Number(collectionState?.viewportWidth) || window.innerWidth),
        ) > 48 ||
        Math.abs(
          window.innerHeight -
            (Number(collectionState?.viewportHeight) || window.innerHeight),
        ) > 48;
      const scheduledFrames = new Set();
      let timeline;
      let prepareTimer;
      let isCancelled = false;

      const scheduleFrame = (callback) => {
        const frameId = window.requestAnimationFrame(() => {
          scheduledFrames.delete(frameId);
          callback();
        });

        scheduledFrames.add(frameId);
      };

      const scrollTo = (top) => {
        window.dispatchEvent(
          new CustomEvent(LOCOMOTIVE_SCROLL_TO_EVENT, { detail: { top } }),
        );
      };

      const startMorph = () => {
        if (isCancelled) return;

        const tilt = targetFrame.closest("[data-artwork-tilt]");
        const scrollTween = tilt
          ? gsap.getTweensOf(tilt).find((tween) => Boolean(tween.scrollTrigger))
          : null;

        scrollTween?.scrollTrigger?.getTween?.()?.progress(1);
        scrollTween?.progress(scrollTween.scrollTrigger.progress);

        const targetBounds = targetFrame.getBoundingClientRect();
        const targetWidth = targetFrame.offsetWidth;
        const targetHeight = targetFrame.offsetHeight;
        const targetRect = {
          left: targetBounds.left + (targetBounds.width - targetWidth) / 2,
          top: targetBounds.top + (targetBounds.height - targetHeight) / 2,
          width: targetWidth,
          height: targetHeight,
        };
        const transform = tilt
          ? window.getComputedStyle(tilt).transform
          : "none";
        let targetRotation = 0;

        if (transform && transform !== "none") {
          const matrix = new DOMMatrixReadOnly(transform);
          targetRotation = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
        }

        timeline = gsap.timeline();
        timeline
          .to(
            frame,
            {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              rotation: targetRotation,
              scale: 1,
              duration: morphDuration,
              ease: reduceMotion ? "power2.out" : "expo.inOut",
            },
            0,
          )
          .to(
            coverImage,
            {
              scale: 1.18,
              objectPosition:
                window.getComputedStyle(targetImage).objectPosition,
              duration: morphDuration,
              ease: reduceMotion ? "power2.out" : "expo.inOut",
            },
            0,
          )
          .to(
            collectionPage,
            {
              autoAlpha: 1,
              duration: reduceMotion ? 0.12 : 0.42,
              ease: "power2.out",
            },
            reduceMotion ? 0 : morphDuration * 0.62,
          )
          .call(
            () => {
              if (!tilt) return;

              const liveTransform = window.getComputedStyle(tilt).transform;
              if (!liveTransform || liveTransform === "none") return;

              const liveMatrix = new DOMMatrixReadOnly(liveTransform);
              const liveRotation =
                (Math.atan2(liveMatrix.b, liveMatrix.a) * 180) / Math.PI;

              gsap.set(frame, { rotation: liveRotation });
            },
            [],
            Math.max(0, handoffTime - 0.01),
          )
          .set(targetVisual, { autoAlpha: 1 }, handoffTime)
          .set(frame, { autoAlpha: 0 }, handoffTime)
          .set([collectionPage, targetVisual], {
            clearProps: "opacity,visibility,transform,transition",
          })
          .call(finishArtworkTransition);
      };

      const measureAfterScroll = () => {
        scheduleFrame(() => {
          scheduleFrame(() => {
            if (isCancelled) return;

            const targetRect = targetFrame.getBoundingClientRect();
            const isOutsideViewport =
              targetRect.bottom < 0 || targetRect.top > window.innerHeight;

            if (isOutsideViewport && viewportChanged) {
              const centeredScroll =
                window.scrollY +
                targetRect.top -
                (window.innerHeight - targetRect.height) / 2;

              scrollTo(centeredScroll);
              scheduleFrame(() => scheduleFrame(startMorph));
              return;
            }

            startMorph();
          });
        });
      };

      const prepareTarget = () => {
        if (isCancelled) return;
        scrollTo(savedScroll);
        measureAfterScroll();
      };

      setScrollLock(true);
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        visibility: "visible",
      });
      gsap.set(frame, {
        autoAlpha: 1,
        left: artworkTransition.sourceRect.left,
        top: artworkTransition.sourceRect.top,
        width: artworkTransition.sourceRect.width,
        height: artworkTransition.sourceRect.height,
        rotation: 0,
        scale: 1,
      });
      gsap.set(coverImage, {
        autoAlpha: 1,
        objectPosition: artworkTransition.objectPosition,
        scale: 1,
      });
      gsap.set(collectionPage, { autoAlpha: 0.14 });
      gsap.set(targetVisual, {
        autoAlpha: 0,
        transition: "none",
        y: 0,
        scale: 1,
      });

      const waitForLayout = () => {
        prepareTimer = window.setTimeout(prepareTarget, reduceMotion ? 0 : 120);
      };

      if (targetImage.complete && targetImage.naturalWidth) {
        waitForLayout();
      } else {
        targetImage
          .decode()
          .catch(() => {})
          .finally(waitForLayout);
      }

      return () => {
        isCancelled = true;
        window.clearTimeout(prepareTimer);
        scheduledFrames.forEach((frameId) => {
          window.cancelAnimationFrame(frameId);
        });
        timeline?.kill();
        gsap.set(collectionPage, {
          clearProps: "opacity,visibility,transform",
        });
        gsap.set(targetVisual, {
          clearProps: "opacity,visibility,transform,transition",
        });
      };
    },
    {
      dependencies: [pathname, artworkTransition?.id],
      scope: overlayRef,
    },
  );

  if (!artworkTransition) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-[15500] opacity-0"
    >
      <div ref={backdropRef} className="fixed inset-0 bg-paper opacity-0" />
      <div
        ref={frameRef}
        className="fixed overflow-hidden bg-transparent shadow-[0_2.5rem_7rem_rgba(5,5,5,0.3)] will-change-[top,left,width,height,transform]"
      >
        {/* The browser-cached currentSrc keeps the moving clone pixel-identical. */}
        {/* biome-ignore lint/performance/noImgElement: a transient clone must reuse the exact browser-cached currentSrc */}
        <img
          ref={coverImageRef}
          src={artworkTransition.image}
          alt=""
          className="absolute inset-0 size-full will-change-transform"
          style={{ objectFit: artworkTransition.objectFit ?? "cover" }}
        />
      </div>
    </div>
  );
}
