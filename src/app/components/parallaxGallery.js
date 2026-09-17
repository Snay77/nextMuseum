"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getWikimediaThumbnail, isWikimediaThumbnail } from "../_lib/paintings";
import Link from "./Link";
import { LOCOMOTIVE_REFRESH_EVENT } from "./smoothScroll";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_LAYOUTS = [
  "md:col-start-1 md:col-span-6 md:translate-x-[1.5vw]",
  "md:col-start-7 md:col-span-6 md:-translate-x-[1.5vw] md:translate-y-[13vw]",
  "md:col-start-1 md:col-span-6 md:translate-x-[2.5vw]",
  "md:col-start-7 md:col-span-6 md:-translate-x-[2.5vw] md:translate-y-[13vw]",
  "md:col-start-1 md:col-span-6 md:translate-x-[2vw]",
  "md:col-start-7 md:col-span-6 md:-translate-x-[2vw] md:translate-y-[13vw]",
];

const MOBILE_OFFSETS = [
  "-translate-x-[3vw]",
  "translate-x-[3vw]",
  "-translate-x-[1vw]",
  "translate-x-[2vw]",
];

const DEFAULT_PARALLAX_SPEEDS = [-0.09, 0.12, -0.06, 0.1, -0.12, 0.07];
const DEFAULT_CAPTION_SHIFTS = [6, -7, 5, -8, 7, -6];

const ORIENTATION_STYLES = {
  landscape: {
    frame: "h-[76%] w-full",
    caption:
      "w-[calc(100%+1.5rem)] -translate-y-6 md:w-[calc(100%+2.5rem)] md:-translate-y-12",
  },
  portrait: {
    frame: "h-full w-[76%]",
    caption: "w-[84%] translate-y-3",
  },
  square: {
    frame: "h-[88%] w-[88%]",
    caption: "w-[96%] -translate-y-2 md:-translate-y-5",
  },
};

function createRandomDirections(count) {
  const directions = Array.from({ length: count }, (_, index) =>
    index % 2 === 0 ? -1 : 1,
  );

  for (let index = directions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [directions[index], directions[randomIndex]] = [
      directions[randomIndex],
      directions[index],
    ];
  }

  return directions;
}

function createRandomMotionSettings(count) {
  const parallaxDirections = createRandomDirections(count);
  const rotationDirections = createRandomDirections(count);

  return Array.from({ length: count }, (_, index) => {
    const speedMagnitude = 0.055 + Math.random() * 0.075;
    const rotationMagnitude = 1.8 + Math.random() * 2;
    const rotationEnd = rotationDirections[index] * rotationMagnitude;
    const inwardDirection = index % 2 === 0 ? 1 : -1;
    const shiftsOutward = Math.random() < 0.25;
    const captionDirection = shiftsOutward ? -inwardDirection : inwardDirection;
    const captionMagnitude = shiftsOutward
      ? 1 + Math.random() * 2
      : 4 + Math.random() * 6;

    return {
      speed: Number((parallaxDirections[index] * speedMagnitude).toFixed(3)),
      rotationStart: Number((-rotationEnd * 0.35).toFixed(2)),
      rotationEnd: Number(rotationEnd.toFixed(2)),
      captionShift: Number((captionDirection * captionMagnitude).toFixed(2)),
    };
  });
}

const getImageSource = (src, width = 1280) =>
  isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, width) : src;

function getOrientation(image) {
  const ratio = image.naturalWidth / image.naturalHeight;

  if (ratio < 0.88) return "portrait";
  if (ratio > 1.14) return "landscape";
  return "square";
}

function ArtworkCaptionContent({ work }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-5">
      <div>
        <h2 className="tight-type text-[clamp(1.45rem,2.15vw,2.25rem)] font-bold">
          {work.title}
        </h2>
        <p className="mt-2 text-sm opacity-60">{work.artist}</p>
      </div>

      <div className="pt-1 text-right">
        <p className="eyebrow">{work.year}</p>
        {work.movement && (
          <p className="mt-2 max-w-36 text-[0.625rem] uppercase leading-tight tracking-[0.04em] opacity-50">
            {work.movement}
          </p>
        )}
      </div>
    </div>
  );
}

function ArtworkCard({ work, index, onImageReady, speed, captionShift }) {
  const [orientation, setOrientation] = useState("landscape");
  const mediaTweens = useRef(new WeakMap());
  const desktopLayout = DESKTOP_LAYOUTS[index % DESKTOP_LAYOUTS.length];
  const mobileOffset = MOBILE_OFFSETS[index % MOBILE_OFFSETS.length];
  const orientationStyles = ORIENTATION_STYLES[orientation];

  const getMediaTweens = (media) => {
    const existing = mediaTweens.current.get(media);
    if (existing) return existing;

    const tweens = {
      x: gsap.quickTo(media, "xPercent", {
        duration: 0.75,
        ease: "power3.out",
      }),
      y: gsap.quickTo(media, "yPercent", {
        duration: 0.75,
        ease: "power3.out",
      }),
    };

    mediaTweens.current.set(media, tweens);
    return tweens;
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;

    const frame = event.currentTarget;
    const media = frame.querySelector("[data-hover-media]");
    if (!media) return;

    const bounds = frame.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const tweens = getMediaTweens(media);

    tweens.x(pointerX * -9);
    tweens.y(pointerY * -7);
  };

  const handlePointerLeave = (event) => {
    const media = event.currentTarget.querySelector("[data-hover-media]");
    if (!media) return;

    const tweens = getMediaTweens(media);
    tweens.x(0);
    tweens.y(0);
  };

  const handleImageLoad = (event) => {
    const nextOrientation = getOrientation(event.currentTarget);
    setOrientation(nextOrientation);
    onImageReady();
  };

  return (
    <article
      className={`relative flex items-start justify-center py-[6svh] md:py-[3vw] ${desktopLayout}`}
    >
      <div className={`w-[min(88vw,38rem)] ${mobileOffset}`}>
        <div data-scroll data-scroll-speed={speed} className="artwork-float">
          <Link
            href={`/paintings/${work.slug}`}
            aria-label={`Voir l’œuvre ${work.title} de ${work.artist}`}
            className="group block"
          >
            <div className="grid aspect-square w-full place-items-center">
              <div
                data-artwork-tilt
                className={`artwork-tilt relative will-change-transform ${orientationStyles.frame}`}
              >
                <div className="artwork-shadow relative h-full w-full">
                  <div
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    className="artwork-card relative h-full w-full overflow-hidden bg-line"
                  >
                    <div
                      data-hover-media
                      className="absolute -inset-[9%] will-change-transform"
                    >
                      <Image
                        src={getImageSource(work.image)}
                        alt={work.title}
                        fill
                        sizes="(max-width: 767px) 88vw, 38rem"
                        onLoad={handleImageLoad}
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5 sm:p-3">
                      <span className="eyebrow bg-paper/95 px-2.5 py-2 text-ink backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="grid size-10 translate-y-2 place-items-center rounded-full bg-paper text-lg text-ink opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:size-12">
                        ↗
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="min-h-32 sm:min-h-36">
          <div className={`relative z-20 mx-auto ${orientationStyles.caption}`}>
            <div
              className="relative border border-ink/15 bg-[#fafaf7] shadow-[0_0.55rem_1.6rem_rgba(5,5,5,0.07)]"
              style={{ transform: `translate3d(${captionShift}%, 0, 0)` }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ink/75" />
              <div className="relative px-4 py-4 text-ink sm:px-5 sm:py-[1.125rem]">
                <ArtworkCaptionContent work={work} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ParallaxGallery({ works }) {
  const galleryRef = useRef(null);
  const loadedImagesRef = useRef(0);
  const [motionSettings, setMotionSettings] = useState(null);

  useEffect(() => {
    setMotionSettings(createRandomMotionSettings(works.length));
  }, [works.length]);

  useEffect(() => {
    if (!motionSettings || !galleryRef.current) return;

    let context;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      context = gsap.context(() => {
        const artworkTilts = gsap.utils.toArray("[data-artwork-tilt]");

        artworkTilts.forEach((artwork, index) => {
          const setting = motionSettings[index];
          if (!setting) return;

          gsap.fromTo(
            artwork,
            {
              rotation: setting.rotationStart,
              transformOrigin: "50% 50%",
              force3D: true,
            },
            {
              rotation: setting.rotationEnd,
              ease: "none",
              scrollTrigger: {
                trigger: artwork,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.15,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }, galleryRef);
    }

    const refreshFrame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event(LOCOMOTIVE_REFRESH_EVENT));
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      context?.revert();
    };
  }, [motionSettings]);

  const handleImageReady = () => {
    loadedImagesRef.current += 1;

    if (loadedImagesRef.current === Math.min(works.length, 6)) {
      window.dispatchEvent(new Event(LOCOMOTIVE_REFRESH_EVENT));
    }
  };

  return (
    <section ref={galleryRef} className="relative border-b border-ink/20">
      <div className="grid grid-cols-1 pb-[24svh] pt-[10svh] md:grid-cols-12 md:gap-x-[3vw] md:px-[2vw] md:pb-[30svh] md:pt-[8vw]">
        {works.map((work, index) => (
          <ArtworkCard
            key={work.id}
            work={work}
            index={index}
            speed={
              motionSettings?.[index]?.speed ??
              DEFAULT_PARALLAX_SPEEDS[index % DEFAULT_PARALLAX_SPEEDS.length]
            }
            captionShift={
              motionSettings?.[index]?.captionShift ??
              DEFAULT_CAPTION_SHIFTS[index % DEFAULT_CAPTION_SHIFTS.length]
            }
            onImageReady={handleImageReady}
          />
        ))}
      </div>
    </section>
  );
}
