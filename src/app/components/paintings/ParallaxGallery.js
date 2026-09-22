"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "../../_lib/paintings";
import { useStore } from "../../_lib/store";
import FavoriteButton from "../favorites/FavoriteButton";
import { LOCOMOTIVE_REFRESH_EVENT } from "../layout/SmoothScroll";
import Link from "../ui/Link";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_LAYOUTS = [
  "md:col-start-1 md:col-span-6 md:left-[1.5vw]",
  "md:col-start-7 md:col-span-6 md:left-[-1.5vw] md:top-[13vw]",
  "md:col-start-1 md:col-span-6 md:left-[2.5vw]",
  "md:col-start-7 md:col-span-6 md:left-[-2.5vw] md:top-[13vw]",
  "md:col-start-1 md:col-span-6 md:left-[2vw]",
  "md:col-start-7 md:col-span-6 md:left-[-2vw] md:top-[13vw]",
];

const MOBILE_OFFSETS = [
  "left-[-3vw]",
  "left-[3vw]",
  "left-[-1vw]",
  "left-[2vw]",
];

const DEFAULT_PARALLAX_SPEEDS = [0.09, 0.12, 0.06, 0.1, 0.12, 0.07];

const ORIENTATION_STYLES = {
  landscape: {
    frame: "h-[76%] w-full",
    caption: "-translate-y-6 md:-translate-y-10",
  },
  portrait: {
    frame: "h-full w-[76%]",
    caption: "translate-y-3",
  },
  square: {
    frame: "h-[88%] w-[88%]",
    caption: "-translate-y-2 md:-translate-y-4",
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
  const rotationDirections = createRandomDirections(count);

  return Array.from({ length: count }, (_, index) => {
    const speedMagnitude = 0.055 + Math.random() * 0.075;
    const rotationMagnitude = 1.8 + Math.random() * 2;
    const rotationEnd = rotationDirections[index] * rotationMagnitude;

    return {
      speed: Number(speedMagnitude.toFixed(3)),
      rotationStart: Number((-rotationEnd * 0.35).toFixed(2)),
      rotationEnd: Number(rotationEnd.toFixed(2)),
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

function ArtworkCaptionContent({ work, index }) {
  return (
    <div className="text-ink">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.625rem] font-bold tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px flex-1 bg-ink/40" />
        <span className="font-mono text-sm font-bold leading-none text-blue">
          *
        </span>
      </div>

      <h2 className="tight-type mt-3 text-[clamp(1.25rem,1.65vw,1.65rem)] font-bold">
        {work.title}
      </h2>

      <div className="mt-4 flex items-start justify-between gap-5 font-mono text-[0.6rem] uppercase leading-[1.25] tracking-[0.035em]">
        <p className="max-w-[58%] opacity-60">{work.artist}</p>
        <div className="text-right">
          <p>{work.year}</p>
          {work.movement && <p className="mt-1 opacity-50">{work.movement}</p>}
        </div>
      </div>
    </div>
  );
}

function ArtworkCard({ work, index, onArtworkClick, onImageReady, speed }) {
  const [orientation, setOrientation] = useState("landscape");
  const mediaTweens = useRef(new WeakMap());
  const desktopLayout = DESKTOP_LAYOUTS[index % DESKTOP_LAYOUTS.length];
  const mobileOffset = MOBILE_OFFSETS[index % MOBILE_OFFSETS.length];
  const orientationStyles = ORIENTATION_STYLES[orientation];
  const captionPlacement =
    index % 2 === 0
      ? "md:ml-auto md:mr-0 md:translate-x-[22%]"
      : "md:ml-0 md:mr-auto md:-translate-x-[22%]";

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
      <div className={`relative w-[min(88vw,38rem)] ${mobileOffset}`}>
        <div
          data-scroll
          data-scroll-speed={speed}
          className="artwork-float relative z-20"
        >
          <div className="grid aspect-square w-full place-items-center">
            <div
              data-artwork-tilt
              className={`artwork-tilt group/card relative will-change-transform ${orientationStyles.frame}`}
            >
              <Link
                href={`/paintings/${work.slug}`}
                aria-label={`Voir l’œuvre ${work.title} de ${work.artist}`}
                className="relative z-10 block h-full w-full"
                onClick={(event) => onArtworkClick(event, work)}
              >
                <div className="artwork-shadow relative h-full w-full">
                  <div
                    data-artwork-frame
                    data-artwork-slug={work.slug}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    className="artwork-card relative h-full w-full overflow-hidden bg-transparent"
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
                        className="object-cover transition-transform duration-1000 ease-out group-hover/card:scale-[1.025]"
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5 sm:p-3">
                      <span className="eyebrow bg-paper/95 px-2.5 py-2 text-ink backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="grid size-10 translate-y-2 place-items-center rounded-full bg-paper text-lg text-ink opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100 sm:size-12">
                        ↗
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <FavoriteButton
                slug={work.slug}
                revealOnHover
                className="absolute bottom-3 left-3 z-30 sm:bottom-4 sm:left-4"
              />
            </div>
          </div>
        </div>

        <div className="min-h-40 sm:min-h-44">
          <div
            className={`relative z-0 mx-auto w-[min(78vw,17rem)] ${orientationStyles.caption} ${captionPlacement}`}
          >
            <ArtworkCaptionContent work={work} index={index} />
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
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const setArtworkTransition = useStore((state) => state.setArtworkTransition);
  const setCollectionState = useStore((state) => state.setCollectionState);
  const setDestinationUrl = useStore((state) => state.setDestinationUrl);
  const setIsTransitionActive = useStore(
    (state) => state.setIsTransitionActive,
  );
  const setTransitionType = useStore((state) => state.setTransitionType);

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

  const handleArtworkClick = (event, work) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (isModifiedClick || event.currentTarget.target === "_blank") return;

    const frame = event.currentTarget.querySelector("[data-artwork-frame]");
    const image = frame?.querySelector("img");

    if (!frame || !image || isTransitionActive) return;

    event.preventDefault();

    const bounds = frame.getBoundingClientRect();
    const tilt = frame.closest("[data-artwork-tilt]");
    const transform = tilt ? window.getComputedStyle(tilt).transform : "none";
    let sourceRotation = 0;

    if (transform && transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      sourceRotation = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    }

    const destination = `/paintings/${work.slug}`;

    setCollectionState({
      url: `${window.location.pathname}${window.location.search}`,
      scrollY: window.scrollY,
      slug: work.slug,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    });

    setArtworkTransition({
      id: `${work.slug}-${Date.now()}`,
      slug: work.slug,
      title: work.title,
      direction: "to-artwork",
      image: image.currentSrc || image.src || getImageSource(work.image),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      objectPosition: window.getComputedStyle(image).objectPosition,
      sourceRotation,
      sourceRect: {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      },
    });
    setTransitionType("artwork");
    setDestinationUrl(destination);
    setIsTransitionActive(true);
  };

  return (
    <section
      ref={galleryRef}
      data-artwork-gallery
      className="relative border-b border-ink/20"
    >
      <div className="grid grid-cols-1 pb-[24svh] pt-[10svh] md:grid-cols-12 md:gap-x-[3vw] md:px-[2vw] md:pb-[30svh] md:pt-[8vw]">
        {works.map((work, index) => (
          <ArtworkCard
            key={work.id}
            work={work}
            index={index}
            onArtworkClick={handleArtworkClick}
            speed={
              motionSettings?.[index]?.speed ??
              DEFAULT_PARALLAX_SPEEDS[index % DEFAULT_PARALLAX_SPEEDS.length]
            }
            onImageReady={handleImageReady}
          />
        ))}
      </div>
    </section>
  );
}
