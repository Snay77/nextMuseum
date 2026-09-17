"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { getWikimediaThumbnail, isWikimediaThumbnail } from "../_lib/paintings";
import SearchBar from "./searchBar";

const CARD_LAYOUTS = [
  "md:col-span-7",
  "md:col-span-5 md:pt-28",
  "md:col-span-4 md:pt-12",
  "md:col-span-8",
];

export default function Filter({ objects }) {
  const [movement, setMovement] = useQueryState("movement");

  const movements = useMemo(
    () =>
      [
        ...new Set(objects.map((object) => object.movement).filter(Boolean)),
      ].sort(),
    [objects],
  );

  const filtered = useMemo(
    () => objects.filter((object) => !movement || object.movement === movement),
    [objects, movement],
  );

  return (
    <>
      <div className="grid gap-8 border-b border-ink py-6 lg:grid-cols-[1fr_3fr]">
        <p className="eyebrow pt-1">Rechercher / filtrer</p>
        <div>
          <SearchBar paintings={objects} />
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={() => setMovement(null)}
              aria-pressed={!movement}
              className={`eyebrow cursor-pointer border-b pb-1 transition-opacity hover:opacity-50 ${!movement ? "border-ink" : "border-transparent text-ink/45"}`}
            >
              Tout ({objects.length})
            </button>
            {movements.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMovement(value)}
                aria-pressed={movement === value}
                className={`eyebrow cursor-pointer border-b pb-1 transition-opacity hover:opacity-50 ${movement === value ? "border-ink" : "border-transparent text-ink/45"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="eyebrow">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
        <p className="eyebrow text-ink/45">Index visuel · 2026</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-x-4 gap-y-16 md:grid-cols-12 md:gap-y-24">
          {filtered.map((object, index) => (
            <Link
              href={`/paintings/${object.slug}`}
              key={object.id}
              aria-label={`Voir l’œuvre ${object.title}`}
              className={`group block ${CARD_LAYOUTS[index % CARD_LAYOUTS.length]}`}
            >
              <div
                className={`relative overflow-hidden bg-line ${index % 3 === 1 ? "aspect-[4/5]" : "aspect-[5/4]"}`}
              >
                <Image
                  src={
                    isWikimediaThumbnail(object.image)
                      ? getWikimediaThumbnail(object.image, 1280)
                      : object.image
                  }
                  alt={object.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                />
                <span className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-paper text-xl opacity-0 transition-opacity group-hover:opacity-100">
                  ↗
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-5 border-t border-ink py-2">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.045em] sm:text-3xl">
                    {object.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">{object.artist}</p>
                </div>
                <div className="text-right">
                  <p className="eyebrow">{object.year}</p>
                  {object.movement && (
                    <p className="mt-2 text-xs text-ink/55">
                      {object.movement}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[45vh] place-items-center border-b border-ink">
          <p className="tight-type max-w-xl text-center text-4xl font-bold sm:text-6xl">
            Rien ici — essayez un autre mouvement.
          </p>
        </div>
      )}
    </>
  );
}
