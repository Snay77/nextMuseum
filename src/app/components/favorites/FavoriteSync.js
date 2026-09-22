"use client";

import { useEffect } from "react";
import { useSession } from "@/app/_lib/auth-client";
import { useStore } from "@/app/_lib/store";

export default function FavoriteSync() {
  const { data: session, isPending } = useSession();
  const setFavoriteSlugs = useStore((state) => state.setFavoriteSlugs);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setFavoriteSlugs([]);
      return;
    }

    const controller = new AbortController();

    fetch("/api/favorites", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { slugs: [] }))
      .then((payload) => setFavoriteSlugs(payload.slugs ?? []))
      .catch((error) => {
        if (error.name !== "AbortError") setFavoriteSlugs([]);
      });

    return () => controller.abort();
  }, [isPending, session, setFavoriteSlugs]);

  return null;
}
