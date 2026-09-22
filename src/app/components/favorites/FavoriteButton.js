"use client";

import { useState } from "react";
import { useSession } from "@/app/_lib/auth-client";
import { useStore } from "@/app/_lib/store";
import { useI18n } from "@/app/i18n/I18nProvider";

function HeartIcon({ filled }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.15rem]">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill={filled ? "var(--blue)" : "none"}
        stroke={filled ? "var(--blue)" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoriteButton({
  slug,
  className = "",
  revealOnHover = false,
  ...props
}) {
  const { t } = useI18n();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const favoriteSlugs = useStore((state) => state.favoriteSlugs);
  const setFavoriteSlug = useStore((state) => state.setFavoriteSlug);
  const isFavorite = favoriteSlugs.includes(slug);

  if (isSessionPending || !session) return null;

  async function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    if (isSaving) return;

    const nextFavorite = !isFavorite;
    setFavoriteSlug(slug, nextFavorite);
    setIsSaving(true);

    try {
      const response = await fetch("/api/favorites", {
        method: nextFavorite ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("favorite-request-failed");
    } catch {
      setFavoriteSlug(slug, !nextFavorite);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      {...props}
      type="button"
      aria-label={
        isFavorite ? t("artwork.removeFavorite") : t("artwork.addFavorite")
      }
      aria-pressed={isFavorite}
      aria-busy={isSaving}
      onClick={toggleFavorite}
      className={`grid size-11 place-items-center rounded-full border border-ink/10 bg-white text-ink/35 shadow-[0_0.65rem_1.6rem_rgba(0,0,0,0.12)] transition-[color,opacity,transform] duration-300 hover:scale-105 hover:text-blue focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60 ${isFavorite ? "text-blue" : ""} ${revealOnHover ? "translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100" : ""} ${className}`}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );
}
