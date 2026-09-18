"use client";

import { useQueryState } from "nuqs";
import { useMemo } from "react";
import ParallaxGallery from "./ParallaxGallery";
import SearchBar from "./SearchBar";

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
      <div className="relative z-40 grid gap-8 border-b border-ink py-8 lg:grid-cols-[1fr_3fr] lg:py-10">
        <p className="eyebrow pt-1">Rechercher / filtrer</p>
        <div>
          <SearchBar paintings={objects} />
          <div className="mt-6 flex gap-x-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:gap-y-3 md:overflow-visible md:pb-0">
            <button
              type="button"
              onClick={() => setMovement(null)}
              aria-pressed={!movement}
              className={`eyebrow shrink-0 cursor-pointer border-b pb-1 transition-opacity hover:opacity-50 ${!movement ? "border-ink" : "border-transparent text-ink/45"}`}
            >
              Tout ({objects.length})
            </button>
            {movements.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMovement(value)}
                aria-pressed={movement === value}
                className={`eyebrow shrink-0 cursor-pointer border-b pb-1 transition-opacity hover:opacity-50 ${movement === value ? "border-ink" : "border-transparent text-ink/45"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-30 -mx-3 flex items-center justify-between border-b border-ink/30 bg-paper/90 px-3 py-3 backdrop-blur-md sm:top-16 sm:-mx-4 sm:px-4">
        <p className="eyebrow" aria-live="polite">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
        <p className="eyebrow text-ink/45">Défilez pour explorer ↓</p>
      </div>

      {filtered.length > 0 ? (
        <ParallaxGallery
          key={filtered.map((work) => work.id).join("-")}
          works={filtered}
        />
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
