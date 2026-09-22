"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "../../_lib/paintings";
import { useI18n } from "../../i18n/I18nProvider";

export default function SearchBar({ paintings }) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const results = useMemo(() => {
    if (normalizedSearch.length < 3) return [];

    return paintings
      .filter(
        (painting) =>
          painting.title?.toLowerCase().includes(normalizedSearch) ||
          painting.artist?.toLowerCase().includes(normalizedSearch),
      )
      .slice(0, 6);
  }, [paintings, normalizedSearch]);

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="collection-search">
        {t("collection.searchLabel")}
      </label>
      <div className="flex items-center border-b-2 border-ink">
        <span className="text-2xl" aria-hidden="true">
          ⌕
        </span>
        <input
          id="collection-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("collection.searchPlaceholder")}
          className="w-full bg-transparent px-3 py-2 text-xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/30 sm:text-3xl"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="eyebrow cursor-pointer py-3"
          >
            {t("collection.clear")}
          </button>
        )}
      </div>

      {normalizedSearch.length >= 3 && (
        <div className="absolute inset-x-0 top-full z-30 border-x border-b border-ink bg-paper">
          {results.length > 0 ? (
            results.map((painting) => (
              <Link
                key={painting.id}
                href={`/paintings/${painting.slug}`}
                onClick={() => setSearch("")}
                className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 border-b border-ink p-2 last:border-b-0 hover:bg-ink hover:text-paper"
              >
                <div className="relative aspect-square overflow-hidden bg-line">
                  <Image
                    src={
                      isWikimediaThumbnail(painting.image)
                        ? getWikimediaThumbnail(painting.image, 120)
                        : painting.image
                    }
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-[-0.035em]">
                    {painting.title}
                  </p>
                  <p className="truncate text-sm opacity-55">
                    {painting.artist}
                  </p>
                </div>
                <span className="text-xl">↗</span>
              </Link>
            ))
          ) : (
            <p className="p-5 text-sm">{t("collection.noSearchResult")}</p>
          )}
        </div>
      )}
    </div>
  );
}
