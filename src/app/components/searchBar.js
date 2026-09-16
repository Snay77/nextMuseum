"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getWikimediaThumbnail,
    isWikimediaThumbnail,
} from "../_lib/paintings";


export default function SearchBar({ paintings }) {
    const [search, setSearch] = useState("");
    const [searchFilter, setSearchFilter] = useState([]);
    const normalizedSearch = search.trim().toLowerCase();

    useEffect(() => {
        if (normalizedSearch.length < 3) {
            setSearchFilter([]);
        } else {
            const filteredPaintings = paintings
                .filter(
                    (painting) =>
                        painting.title?.toLowerCase().includes(normalizedSearch) ||
                        painting.artist?.toLowerCase().includes(normalizedSearch),
                )
                .slice(0, 6);

            setSearchFilter(filteredPaintings);
        }
    }, [paintings, normalizedSearch]);

    function handleChange(event) {
        setSearch(event.target.value);
    }


    return (
        <div className="relative mb-8">
            <input
                type="text"
                value={search}
                onChange={handleChange}
                placeholder="Rechercher une œuvre ou un artiste"
                className="w-full rounded-3xl border border-foreground/20 bg-cream px-5 py-4 text-base text-foreground outline-none transition placeholder:text-foreground/50 focus:border-foreground focus:ring-2 focus:ring-foreground/20"
            />

            {normalizedSearch.length >= 3 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-foreground/10 bg-cream shadow-xl">
                    {searchFilter.length > 0 ? (
                        <div className="divide-y divide-foreground/10">
                            {searchFilter.map((painting) => (
                                <Link
                                    key={painting.id}
                                    href={`/paintings/${painting.slug}`}
                                    onClick={() => setSearch("")}
                                    className="flex items-center gap-4 p-4 transition hover:bg-foreground hover:text-background"
                                >
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-foreground/10">
                                        <Image
                                            src={
                                                isWikimediaThumbnail(painting.image)
                                                    ? getWikimediaThumbnail(painting.image, 120)
                                                    : painting.image
                                            }
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{painting.title}</p>
                                        <p className="truncate text-sm opacity-60">{painting.artist}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="p-5 text-sm text-foreground/60">
                            Aucune œuvre trouvée.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}