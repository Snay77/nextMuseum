"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import SearchBar from "./searchBar";
import {
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "../_lib/paintings";

export default function Filter({ objects }) {
  const [movement, setMovement] = useQueryState("movement");

  const movements = useMemo(
    () =>
      [...new Set(objects.map((object) => object.movement).filter(Boolean))].sort(),
    [objects],
  );

  const filtered = useMemo(
    () =>
      objects.filter((object) => !movement || object.movement === movement),
    [objects, movement],
  );

  return (
    <>
      <SearchBar paintings={objects} />

      <div className="mb-10 border-y border-foreground/15 py-5">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-foreground/60">
          Mouvement artistique
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMovement(null)}
            aria-pressed={!movement}
            className={`rounded-full border px-3 py-1 text-sm transition cursor-pointer ${
              !movement
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 text-foreground/70 hover:border-foreground"
            }`}
          >
            Tous
          </button>

          {movements.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMovement(value)}
              aria-pressed={movement === value}
              className={`rounded-full border px-3 py-1 text-sm transition cursor-pointer ${
                movement === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 text-foreground/70 hover:border-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm text-foreground/60">
        {filtered.length} œuvre{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((object) => (
            <Link
              href={`/paintings/${object.slug}`}
              key={object.id}
              aria-label={`Voir l’œuvre ${object.title}`}
              className="group overflow-hidden rounded-3xl border border-foreground/10 bg-cream shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-foreground/10">
                <Image
                  src={
                    isWikimediaThumbnail(object.image)
                      ? getWikimediaThumbnail(object.image, 960)
                      : object.image
                  }
                  alt={object.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground/60">{object.artist}</p>
                  <span className="shrink-0 rounded-full bg-bordo px-3 py-1 text-xs text-background">
                    {object.year}
                  </span>
                </div>

                <h2 className="mb-3 text-2xl font-semibold text-foreground">
                  {object.title}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {object.movement && (
                    <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs text-foreground/75">
                      {object.movement}
                    </span>
                  )}
                  {object.location && (
                    <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs text-foreground/75">
                      {object.location}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-foreground/60">
          Aucune œuvre ne correspond à ce mouvement.
        </p>
      )}
    </>
  );
}
