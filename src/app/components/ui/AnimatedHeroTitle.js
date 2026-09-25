"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useStore } from "../../_lib/store";
import { ARTWORK_TITLE_REVEAL_EVENT } from "../artwork/ArtworkHeroCopy";

function normalizeLines(text, lines) {
  if (lines?.length) {
    return lines.map((line, index) =>
      typeof line === "string"
        ? { id: `line-${index + 1}`, text: line, star: false }
        : {
            id: line.id ?? `line-${index + 1}`,
            text: line.text,
            star: Boolean(line.star),
            className: line.className ?? "",
          },
    );
  }

  return String(text ?? "")
    .split("\n")
    .map((line, index) => ({
      id: `line-${index + 1}`,
      text: line,
      star: false,
      className: "",
    }));
}

export default function AnimatedHeroTitle({
  as: Tag = "h1",
  text,
  lines,
  className = "",
  lineClassName = "",
  starClassName = "text-blue",
  delay = 0.15,
  active = true,
  instant = false,
  ariaLabel,
}) {
  const titleRef = useRef(null);
  const isFirstRender = useStore((state) => state.isFirstRender);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const transitionType = useStore((state) => state.transitionType);
  const artworkNavigation = useStore((state) => state.artworkNavigation);
  const normalizedLines = normalizeLines(text, lines);
  const accessibleLabel =
    ariaLabel ??
    normalizedLines
      .map((line) => `${line.text}${line.star ? "*" : ""}`)
      .join(" ");

  useGSAP(
    () => {
      const letters = titleRef.current.querySelectorAll(
        "[data-animated-title-letter]",
      );
      const stars = titleRef.current.querySelectorAll(
        "[data-animated-title-star]",
      );
      const animatedElements = [...letters, ...stars];
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const artworkSlug = titleRef.current.closest("[data-artwork-hero-copy]")
        ?.dataset.artworkHeroCopy;
      const isRailSource =
        isTransitionActive &&
        transitionType === "artwork-rail" &&
        artworkNavigation?.fromSlug === artworkSlug;

      if (instant) {
        gsap.set(animatedElements, {
          autoAlpha: 1,
          clearProps: "transform",
        });
        return;
      }

      if (isRailSource) return;

      if (!active || isFirstRender || isTransitionActive) {
        gsap.set(letters, {
          autoAlpha: 0,
          rotateX: -78,
          transformOrigin: "50% 100%",
          yPercent: 135,
        });
        if (stars.length) {
          gsap.set(stars, {
            autoAlpha: 0,
            rotation: -40,
            scale: 0,
            transformOrigin: "50% 50%",
          });
        }
        return;
      }

      if (reduceMotion) {
        gsap.set(animatedElements, {
          autoAlpha: 1,
          clearProps: "transform",
        });
        titleRef.current.dispatchEvent(
          new CustomEvent(ARTWORK_TITLE_REVEAL_EVENT, { bubbles: true }),
        );
        return;
      }

      gsap.set(letters, {
        autoAlpha: 0,
        rotateX: -78,
        transformOrigin: "50% 100%",
        yPercent: 135,
      });
      if (stars.length) {
        gsap.set(stars, {
          autoAlpha: 0,
          rotation: -40,
          scale: 0,
          transformOrigin: "50% 50%",
        });
      }

      const timeline = gsap.timeline({ delay });

      timeline.call(() => {
        titleRef.current?.dispatchEvent(
          new CustomEvent(ARTWORK_TITLE_REVEAL_EVENT, { bubbles: true }),
        );
      });

      timeline.to(letters, {
        autoAlpha: 1,
        rotateX: 0,
        yPercent: 0,
        duration: 1.05,
        ease: "expo.out",
        stagger: 0.06,
      });

      if (stars.length) {
        timeline.to(
          stars,
          {
            autoAlpha: 1,
            rotation: 0,
            scale: 1,
            duration: 0.68,
            ease: "back.out(2.2)",
          },
          "-=0.62",
        );
      }

      timeline.set(animatedElements, { clearProps: "transform" });
    },
    {
      scope: titleRef,
      // The rail transition clears its navigation metadata after the reveal
      // has started. Those cleanup values must not restart this timeline.
      dependencies: [
        active,
        accessibleLabel,
        delay,
        instant,
        isFirstRender,
        isTransitionActive,
      ],
    },
  );

  return (
    <Tag ref={titleRef} aria-label={accessibleLabel} className={className}>
      {normalizedLines.map((line) => (
        <span
          key={line.id}
          aria-hidden="true"
          className={`block ${lineClassName} ${line.className}`}
        >
          {line.text.split(" ").map((word, wordIndex, words) => (
            <span
              key={`${line.id}-${word}-${wordIndex + 1}`}
              className="-mx-[0.08em] -mb-[0.12em] inline-flex overflow-hidden px-[0.08em] pb-[0.2em]"
            >
              {Array.from(word).map((letter, letterIndex) => (
                <span
                  key={`${line.id}-${wordIndex + 1}-${letter}-${letterIndex + 1}`}
                  data-animated-title-letter
                  className="inline-block"
                >
                  {letter}
                </span>
              ))}
              {wordIndex < words.length - 1 ? (
                <span className="inline-block w-[0.22em]" />
              ) : null}
            </span>
          ))}
          {line.star ? (
            <span
              data-animated-title-star
              className={`inline-block ${starClassName}`}
            >
              *
            </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}
