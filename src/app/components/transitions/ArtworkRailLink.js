"use client";

import { useStore } from "../../_lib/store";
import Link from "../ui/Link";

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

export default function ArtworkRailLink({
  href,
  fromSlug,
  fromTitle,
  fromArtist,
  fromYear,
  fromMovement,
  toSlug,
  children,
  ...props
}) {
  const handleClick = (event) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (isModifiedClick || event.currentTarget.target === "_blank") return;

    const store = useStore.getState();
    const hero = document.querySelector(
      `[data-artwork-hero="${CSS.escape(fromSlug)}"]`,
    );
    const sourceImage = hero?.querySelector("img");
    const cardImage = event.currentTarget.querySelector("img");

    if (
      store.isTransitionActive ||
      !hero ||
      !sourceImage?.naturalWidth ||
      !sourceImage?.naturalHeight ||
      !cardImage
    ) {
      return;
    }

    event.preventDefault();

    const heroRect = hero.getBoundingClientRect();
    const stableHeroRect = {
      left: heroRect.left,
      top: heroRect.top + window.scrollY,
      width: heroRect.width,
      height: heroRect.height,
    };

    store.setArtworkNavigation({
      id: `${fromSlug}-${toSlug}-${Date.now()}`,
      fromSlug,
      toSlug,
      fromTitle,
      fromArtist,
      fromYear,
      fromMovement,
      direction: "next",
      fromImage: sourceImage.currentSrc || sourceImage.src,
      toImage: cardImage.currentSrc || cardImage.src,
      sourceRect: getContainedImageRect(
        stableHeroRect,
        sourceImage.naturalWidth,
        sourceImage.naturalHeight,
      ),
    });
    store.setTransitionType("artwork-rail");
    store.setDestinationUrl(href);
    store.setIsTransitionActive(true);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
