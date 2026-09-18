"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef, useState } from "react";
import AnimatedHeroTitle from "../ui/AnimatedHeroTitle";
import Link from "../ui/Link";

gsap.registerPlugin(ScrollTrigger);

const FILTERS = ["Tout", "Exposition", "Performance", "Rencontre", "Atelier"];

const EVENTS = [
  {
    id: "regard-mouvement",
    day: "17",
    month: "SEP",
    year: "2026",
    time: "19:00",
    type: "Exposition",
    title: "Le regard en mouvement",
    subtitle: "Vernissage · Grande galerie",
    description:
      "Une traversée de la collection où les œuvres ne sont plus classées par époque, mais par gestes, rythmes et tensions.",
    duration: "Entrée libre",
  },
  {
    id: "nuit-formes",
    day: "25",
    month: "SEP",
    year: "2026",
    time: "20:30",
    type: "Performance",
    title: "La nuit des formes",
    subtitle: "Live · Atrium",
    description:
      "Une performance lumineuse et sonore imaginée pour l’architecture du musée. Le public circule au cœur de la pièce.",
    duration: "75 min",
    featured: true,
  },
  {
    id: "voir-autrement",
    day: "04",
    month: "OCT",
    year: "2026",
    time: "11:00",
    type: "Atelier",
    title: "Voir autrement",
    subtitle: "Atelier famille · Studio 02",
    description:
      "Observer, cadrer, découper : un atelier pour fabriquer de nouvelles images à partir des œuvres de la collection.",
    duration: "90 min · 6—12 ans",
  },
  {
    id: "image-memoire",
    day: "10",
    month: "OCT",
    year: "2026",
    time: "18:30",
    type: "Rencontre",
    title: "L’image et la mémoire",
    subtitle: "Conversation · Auditorium",
    description:
      "Artistes et historiennes de l’art questionnent ce que les images gardent, transforment et finissent par effacer.",
    duration: "60 min",
  },
  {
    id: "corps-espace",
    day: "22",
    month: "OCT",
    year: "2026",
    time: "19:30",
    type: "Performance",
    title: "Corps / espace",
    subtitle: "Danse · Galerie haute",
    description:
      "Trois danseuses activent les vides du musée et déplacent notre perception des œuvres, du sol et des distances.",
    duration: "45 min",
  },
  {
    id: "matiere-couleur",
    day: "07",
    month: "NOV",
    year: "2026",
    time: "14:00",
    type: "Atelier",
    title: "Matière couleur",
    subtitle: "Pratique · Studio 01",
    description:
      "Pigments, papiers et transparences : une séance d’expérimentation plastique ouverte à tous les niveaux.",
    duration: "120 min",
  },
  {
    id: "musee-demain",
    day: "19",
    month: "NOV",
    year: "2026",
    time: "19:00",
    type: "Rencontre",
    title: "À quoi sert un musée demain ?",
    subtitle: "Table ronde · Auditorium",
    description:
      "Une conversation sans langue de bois sur le rôle public, social et écologique d’un musée au XXIe siècle.",
    duration: "90 min",
  },
  {
    id: "constellations",
    day: "03",
    month: "DÉC",
    year: "2026",
    time: "18:00",
    type: "Exposition",
    title: "Constellations",
    subtitle: "Ouverture · Niveau −1",
    description:
      "Des œuvres éloignées dans le temps composent une constellation provisoire autour de la nuit et de l’invisible.",
    duration: "Jusqu’au 28.02.27",
  },
];

function AgendaPoster() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[4/5] min-h-[30rem] overflow-hidden bg-blue text-white sm:min-h-[38rem]"
    >
      <div className="absolute inset-0 grid grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={`poster-column-${index + 1}`}
            className="border-r border-white/20 last:border-r-0"
          />
        ))}
      </div>
      <div
        data-poster-ring
        className="absolute -right-[32%] top-[8%] aspect-square w-[94%] rounded-full border-[clamp(3rem,7vw,7rem)] border-white"
      />
      <div
        data-poster-ring
        className="absolute -bottom-[24%] -left-[31%] aspect-square w-[88%] rounded-full border-[clamp(2rem,5vw,5rem)] border-ink"
      />
      <p className="absolute left-4 top-4 font-mono text-[0.65rem] font-bold uppercase tracking-[0.08em]">
        NM* / Performance 02
      </p>
      <p className="display-type absolute bottom-4 left-3 text-[clamp(8rem,21vw,20rem)] text-white sm:left-4">
        25
      </p>
      <p className="absolute bottom-5 right-4 font-mono text-xs font-bold leading-[1.15]">
        SEP
        <br />
        20:30
      </p>
    </div>
  );
}

function EventRow({ event, index, expanded, onToggle }) {
  return (
    <article
      data-agenda-row
      className="group border-t border-ink last:border-b"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`event-details-${event.id}`}
        onClick={onToggle}
        className="grid w-full grid-cols-[4.3rem_1fr_auto] gap-x-3 py-5 text-left transition-colors duration-300 group-hover:bg-ink group-hover:px-3 group-hover:text-paper sm:grid-cols-[7rem_1fr_9rem_3rem] sm:items-start sm:gap-x-5 sm:py-7"
      >
        <div className="flex items-start gap-2">
          <span className="tight-type text-[2.3rem] font-bold leading-none sm:text-[3.5rem]">
            {event.day}
          </span>
          <span className="font-mono text-[0.6rem] font-bold uppercase leading-none sm:mt-1">
            {event.month}
          </span>
        </div>

        <div>
          <p className="tight-type max-w-3xl text-[clamp(1.75rem,4vw,4.7rem)] font-bold">
            {event.title}
          </p>
          <p className="mt-2 text-sm text-ink/55 transition-colors group-hover:text-paper/60 sm:text-base">
            {event.subtitle}
          </p>
        </div>

        <div className="hidden font-mono text-[0.65rem] font-bold uppercase leading-[1.35] sm:block">
          <p>{event.type}</p>
          <p className="mt-2 opacity-50 group-hover:opacity-70">{event.time}</p>
        </div>

        <span
          className={`mt-1 text-2xl leading-none transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
        >
          +
        </span>

        <span className="col-start-2 mt-3 font-mono text-[0.6rem] font-bold uppercase sm:hidden">
          {event.type} · {event.time}
        </span>
      </button>

      <div
        id={`event-details-${event.id}`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-6 border-t border-ink/20 py-6 pl-[4.3rem] sm:grid-cols-[1fr_auto] sm:pl-[7rem] sm:pr-3">
            <p className="max-w-2xl text-base leading-[1.25] sm:text-lg">
              {event.description}
            </p>
            <div className="flex items-end justify-between gap-6 sm:block sm:text-right">
              <p className="font-mono text-[0.65rem] font-bold uppercase">
                {event.duration}
              </p>
              <Link
                href="/billeterie"
                className="mt-4 inline-flex rounded-full bg-blue px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.04em] text-white transition-transform hover:scale-105"
              >
                Réserver ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Événement {index + 1}</span>
    </article>
  );
}

export default function AgendaExperience() {
  const rootRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [expandedId, setExpandedId] = useState(null);

  const filteredEvents = useMemo(
    () =>
      activeFilter === "Tout"
        ? EVENTS
        : EVENTS.filter((event) => event.type === activeFilter),
    [activeFilter],
  );

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) return;

      const heroMeta = rootRef.current.querySelectorAll("[data-agenda-meta]");
      const posterRings =
        rootRef.current.querySelectorAll("[data-poster-ring]");

      gsap.set(heroMeta, { autoAlpha: 0, y: 16 });

      gsap.to(heroMeta, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        delay: 1.35,
        ease: "power3.out",
        stagger: 0.08,
      });

      gsap.to(posterRings, {
        rotation: (index) => (index % 2 === 0 ? 28 : -22),
        yPercent: (index) => (index % 2 === 0 ? -8 : 7),
        ease: "none",
        scrollTrigger: {
          trigger: "[data-featured-event]",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.utils.toArray("[data-reveal-section]").forEach((section) => {
        gsap.from(section, {
          autoAlpha: 0,
          y: 48,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });
      });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const rows = rootRef.current.querySelectorAll("[data-agenda-row]");
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.055,
          clearProps: "opacity,visibility,transform",
        },
      );
    },
    { scope: rootRef, dependencies: [activeFilter] },
  );

  return (
    <div ref={rootRef} className="overflow-hidden">
      <section className="relative min-h-[calc(100svh-3.5rem)] border-b border-ink px-3 pb-4 pt-5 sm:min-h-[calc(100svh-4rem)] sm:px-4 sm:pt-7">
        <div className="flex items-start justify-between" data-agenda-meta>
          <p className="eyebrow">( Programme public )</p>
          <p className="eyebrow text-right leading-[1.25]">
            Septembre—Décembre
            <br />
            Saison 2026
          </p>
        </div>

        <AnimatedHeroTitle
          aria-label="Agenda"
          text="AGENDA"
          className="display-type absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 justify-center overflow-hidden text-[clamp(5.3rem,20vw,20rem)]"
        />

        <div
          className="absolute inset-x-3 bottom-4 grid grid-cols-2 items-end gap-4 sm:inset-x-4 sm:grid-cols-3"
          data-agenda-meta
        >
          <p className="max-w-[18rem] text-sm leading-[1.2] sm:text-base">
            Des rendez-vous pour regarder, écouter, faire et débattre autrement.
          </p>
          <p className="eyebrow hidden text-center sm:block">08 rendez-vous</p>
          <a
            href="#programme"
            className="eyebrow justify-self-end border-b border-ink pb-1 transition-colors hover:border-blue hover:text-blue"
          >
            Voir le programme ↓
          </a>
        </div>
      </section>

      <section
        data-featured-event
        className="grid border-b border-ink lg:grid-cols-2"
      >
        <div className="order-2 flex min-h-[34rem] flex-col justify-between p-3 sm:p-4 lg:order-1 lg:min-h-0">
          <div data-reveal-section>
            <div className="flex items-center justify-between border-b border-ink pb-3">
              <p className="eyebrow">( À la une )</p>
              <p className="font-mono text-[0.65rem] font-bold">02 / 08</p>
            </div>
            <h2 className="tight-type mt-5 max-w-4xl text-[clamp(4rem,9.4vw,9.5rem)] font-bold">
              LA NUIT
              <br />
              DES FORMES
              <span className="text-blue">*</span>
            </h2>
          </div>

          <div className="grid gap-7 border-t border-ink pt-4 sm:grid-cols-2">
            <p className="max-w-md text-lg leading-[1.15] sm:text-xl">
              Une performance lumineuse et sonore qui transforme le musée après
              la fermeture.
            </p>
            <div className="grid grid-cols-2 gap-4 font-mono text-[0.65rem] font-bold uppercase leading-[1.4]">
              <div>
                <p className="mb-2 text-ink/45">Quand</p>
                <p>Ven. 25 sept.</p>
                <p>20:30</p>
              </div>
              <div>
                <p className="mb-2 text-ink/45">Où</p>
                <p>Atrium</p>
                <p>75 minutes</p>
              </div>
              <Link
                href="/billeterie"
                className="col-span-2 mt-2 inline-flex w-fit rounded-full bg-ink px-5 py-3 text-paper transition-colors hover:bg-blue"
              >
                Prendre un billet ↗
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <AgendaPoster />
        </div>
      </section>

      <section id="programme" className="px-3 py-20 sm:px-4 sm:py-28">
        <div
          data-reveal-section
          className="mb-14 grid gap-8 lg:grid-cols-[1fr_3fr]"
        >
          <p className="eyebrow">( Tous les rendez-vous )</p>
          <div>
            <h2 className="tight-type text-[clamp(3.8rem,9vw,9rem)] font-bold">
              PROGRAMME
            </h2>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-ink pt-4">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setExpandedId(null);
                  }}
                  className={`rounded-full border border-ink px-4 py-2 font-mono text-[0.65rem] font-bold uppercase transition-colors ${
                    activeFilter === filter
                      ? "bg-ink text-paper"
                      : "hover:bg-blue hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:ml-[25%]">
          {filteredEvents.map((event, index) => (
            <EventRow
              key={event.id}
              event={event}
              index={index}
              expanded={expandedId === event.id}
              onToggle={() =>
                setExpandedId((current) =>
                  current === event.id ? null : event.id,
                )
              }
            />
          ))}
        </div>
      </section>

      <section className="grid border-t border-ink bg-blue text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-[34rem] flex-col justify-between p-3 sm:p-4 lg:min-h-[42rem]">
          <p className="eyebrow">( Votre visite )</p>
          <div data-reveal-section>
            <h2 className="tight-type text-[clamp(4rem,9vw,9rem)] font-bold">
              UN JOUR
              <br />
              AU MUSÉE.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-[1.2] sm:text-xl">
              Toutes les expositions sont accessibles avec le billet d’entrée.
              Certains rendez-vous nécessitent une réservation.
            </p>
          </div>
        </div>

        <div className="grid border-t border-white lg:border-l lg:border-t-0">
          {[
            ["Horaires", "Mar—Dim", "10:00—19:00"],
            ["Nocturne", "Vendredi", "Jusqu’à 22:00"],
            ["Adresse", "10 rue du Musée", "75003 Paris"],
          ].map(([label, lineOne, lineTwo]) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_2fr] items-start border-b border-white p-3 last:border-b-0 sm:p-4"
            >
              <p className="eyebrow text-white/60">{label}</p>
              <p className="tight-type text-[clamp(1.8rem,4vw,3.8rem)] font-bold">
                {lineOne}
                <br />
                {lineTwo}
              </p>
            </div>
          ))}
          <Link
            href="/billeterie"
            className="group flex items-end justify-between bg-ink p-3 text-paper transition-colors hover:bg-paper hover:text-ink sm:p-4"
          >
            <span className="tight-type text-[clamp(2.4rem,5vw,5rem)] font-bold">
              RÉSERVER
            </span>
            <span className="text-4xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
