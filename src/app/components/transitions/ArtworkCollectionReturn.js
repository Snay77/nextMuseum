"use client";

import { useCallback, useEffect } from "react";
import { useStore } from "../../_lib/store";
import { useI18n } from "../../i18n/I18nProvider";
import { stripLocaleFromPathname } from "../../i18n/routing";
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

export default function ArtworkCollectionReturn({
  slug,
  title,
  className = "",
  listenToHistory = false,
  ...props
}) {
  const { t } = useI18n();
  const collectionState = useStore((state) => state.collectionState);
  const canMorphBack = collectionState?.slug === slug;
  const returnUrl = canMorphBack ? collectionState.url : "/paintings";

  const prepareReturn = useCallback(
    (navigationMode) => {
      const store = useStore.getState();

      if (store.isTransitionActive || store.collectionState?.slug !== slug) {
        return false;
      }

      const hero = Array.from(
        document.querySelectorAll("[data-artwork-hero]"),
      ).find((element) => element.dataset.artworkHero === slug);
      const image = hero?.querySelector("img");

      if (!hero || !image || !image.naturalWidth || !image.naturalHeight) {
        return false;
      }

      const sourceRect = getContainedImageRect(
        hero.getBoundingClientRect(),
        image.naturalWidth,
        image.naturalHeight,
      );

      if (
        sourceRect.top + sourceRect.height < 0 ||
        sourceRect.top > window.innerHeight
      ) {
        return false;
      }

      store.setArtworkTransition({
        id: `${slug}-return-${Date.now()}`,
        slug,
        title,
        direction: "to-collection",
        navigationMode,
        image: image.currentSrc || image.src,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        objectPosition: window.getComputedStyle(image).objectPosition,
        sourceRotation: 0,
        sourceRect,
      });
      store.setTransitionType("artwork");
      store.setDestinationUrl(store.collectionState.url);
      store.setIsTransitionActive(true);
      return true;
    },
    [slug, title],
  );

  useEffect(() => {
    if (!canMorphBack || !listenToHistory) return;

    const handlePopState = () => {
      if (stripLocaleFromPathname(window.location.pathname) !== "/paintings")
        return;
      prepareReturn("history");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [canMorphBack, listenToHistory, prepareReturn]);

  const handleClick = (event) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (isModifiedClick || event.currentTarget.target === "_blank") return;
    if (!canMorphBack || !prepareReturn("back")) return;

    event.preventDefault();
  };

  return (
    <Link
      {...props}
      href={returnUrl}
      onClick={handleClick}
      className={className}
      aria-label={t("artwork.backAria")}
    >
      <span aria-hidden="true">←</span>
      {t("artwork.allWorks")}
    </Link>
  );
}
