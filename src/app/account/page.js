import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import {
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "@/app/_lib/paintings";
import AccountSignOut from "@/app/components/auth/AccountSignOut";
import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import Link from "@/app/components/ui/Link";
import { db } from "@/db";
import { favorite, ticketBooking } from "@/db/schema";

export const metadata = {
  title: "Mon compte",
  description: "Votre espace personnel New Museum.",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const displayName = session.user.name || "Membre";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const membershipDate = session.user.createdAt
    ? new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(new Date(session.user.createdAt))
    : "Aujourd’hui";
  const [bookings, favoriteRows, objects] = await Promise.all([
    db
      .select()
      .from(ticketBooking)
      .where(eq(ticketBooking.userId, session.user.id))
      .orderBy(desc(ticketBooking.createdAt)),
    db
      .select({ slug: favorite.tableauId })
      .from(favorite)
      .where(eq(favorite.userId, session.user.id))
      .orderBy(desc(favorite.createdAt)),
    getObjects().catch(() => []),
  ]);
  const favoriteOrder = new Map(
    favoriteRows.map((item, index) => [item.slug, index]),
  );
  const favoriteWorks = objects
    .filter((work) => favoriteOrder.has(work.slug))
    .sort(
      (first, second) =>
        favoriteOrder.get(first.slug) - favoriteOrder.get(second.slug),
    );

  return (
    <main className="bg-paper">
      <section className="relative flex min-h-[calc(82svh-3.5rem)] flex-col justify-between overflow-hidden bg-ink p-3 text-paper sm:min-h-[calc(82svh-4rem)] sm:p-4">
        <div className="relative z-10 flex items-start justify-between gap-8">
          <p className="eyebrow">( Espace membre )</p>
          <p className="eyebrow text-right leading-[1.25] text-paper/45">
            Session active
            <br />
            New Museum · Paris
          </p>
        </div>

        <span
          aria-hidden="true"
          className="display-type pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%] select-none text-[clamp(31rem,68vw,67rem)] text-paper/[0.035]"
        >
          *
        </span>

        <AnimatedHeroTitle
          ariaLabel="Mon compte"
          lines={[
            { id: "account-one", text: "MON" },
            { id: "account-two", text: "COMPTE", star: true },
          ]}
          className="display-type relative z-10 self-center text-center text-[clamp(6rem,19vw,19rem)] [perspective:1000px]"
          lineClassName="overflow-hidden"
          starClassName="ml-[0.035em] align-top text-[0.28em] text-blue"
        />

        <div className="relative z-10 grid gap-5 border-t border-paper/30 pt-3 sm:grid-cols-2 sm:items-end">
          <div>
            <p className="eyebrow mb-2 text-paper/40">Bienvenue</p>
            <p className="tight-type text-[clamp(2rem,4vw,4.5rem)] font-bold">
              {displayName}
            </p>
          </div>
          <p className="max-w-md text-base leading-[1.2] text-paper/55 sm:justify-self-end sm:text-right sm:text-lg">
            Votre point de départ pour explorer la collection et préparer vos
            prochaines visites.
          </p>
        </div>
      </section>

      <section className="grid border-b border-ink lg:grid-cols-[0.78fr_1.22fr]">
        <div className="flex min-h-[28rem] flex-col justify-between bg-blue p-3 text-white sm:p-4 lg:min-h-[38rem]">
          <div className="flex items-start justify-between">
            <p className="eyebrow">Carte membre</p>
            <p className="font-mono text-[0.625rem] font-bold tracking-[0.08em]">
              NM / 2026
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-8">
            <div className="grid size-24 shrink-0 place-items-center rounded-full border border-white text-4xl font-bold tracking-[-0.06em] sm:size-32 sm:text-5xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="tight-type truncate text-[clamp(2.2rem,5vw,5.5rem)] font-bold">
                {displayName}
              </p>
              <p className="mt-2 truncate font-mono text-xs uppercase text-white/65">
                {session.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-white/35 pt-3">
            <p className="eyebrow text-white/65">Membre actif</p>
            <p className="display-type text-5xl">NM*</p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-3 sm:p-4 lg:px-[clamp(2rem,6vw,7rem)] lg:py-10">
          <div>
            <p className="eyebrow mb-8">( Vos informations )</p>
            <dl className="border-t border-ink">
              <div className="grid gap-2 border-b border-ink py-6 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="eyebrow text-ink/40">Nom</dt>
                <dd className="tight-type text-2xl font-bold sm:text-3xl">
                  {displayName}
                </dd>
              </div>
              <div className="grid gap-2 border-b border-ink py-6 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="eyebrow text-ink/40">E-mail</dt>
                <dd className="break-all text-lg sm:text-xl">
                  {session.user.email}
                </dd>
              </div>
              <div className="grid gap-2 border-b border-ink py-6 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="eyebrow text-ink/40">Membre depuis</dt>
                <dd className="text-lg capitalize sm:text-xl">
                  {membershipDate}
                </dd>
              </div>
              <div className="grid gap-2 border-b border-ink py-6 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="eyebrow text-ink/40">Statut</dt>
                <dd className="flex items-center gap-3 text-lg sm:text-xl">
                  <span className="size-2 rounded-full bg-blue" /> Actif
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-ink pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-sm leading-[1.25] text-ink/50">
              Vos données de connexion restent privées et sécurisées.
            </p>
            <AccountSignOut />
          </div>
        </div>
      </section>

      <section
        id="mes-billets"
        className="border-b border-ink px-3 py-20 sm:px-4 sm:py-28"
      >
        <div className="grid gap-8 lg:grid-cols-[0.35fr_1fr]">
          <div>
            <p className="eyebrow text-ink/45">( Votre visite )</p>
            <h2 className="tight-type mt-4 text-[clamp(3rem,7vw,7rem)] font-bold">
              Mes billets<span className="text-blue">.</span>
            </h2>
          </div>

          {bookings.length ? (
            <div className="border-t border-ink">
              {bookings.map((booking, index) => (
                <article
                  key={booking.id}
                  className="grid gap-5 border-b border-ink py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                >
                  <p className="font-mono text-[0.625rem] font-bold text-ink/40">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <p className="tight-type text-2xl font-bold capitalize sm:text-4xl">
                      {formatVisitDate(booking.visitDate)}
                    </p>
                    <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.05em] text-ink/50">
                      {booking.ticketCount} billet
                      {booking.ticketCount > 1 ? "s" : ""} · NM—
                      {booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-3xl font-bold tracking-[-0.05em]">
                      {(booking.totalCents / 100).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                    <p className="eyebrow mt-2 text-blue">Confirmé</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col justify-between border border-ink p-5">
              <p className="max-w-md text-xl text-ink/55">
                Aucun billet pour le moment. Votre prochaine visite peut
                commencer ici.
              </p>
              <Link
                href="/billeterie"
                className="eyebrow self-start rounded-full bg-ink px-5 py-3 text-paper hover:bg-blue"
              >
                Prendre un billet →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section
        id="mes-favoris"
        className="border-b border-ink px-3 py-20 sm:px-4 sm:py-28"
      >
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-ink pb-4">
          <div>
            <p className="eyebrow text-ink/45">( Collection personnelle )</p>
            <h2 className="tight-type mt-4 text-[clamp(3rem,7vw,7rem)] font-bold">
              Mes favoris<span className="text-blue">.</span>
            </h2>
          </div>
          <p className="eyebrow">
            {String(favoriteWorks.length).padStart(2, "0")} œuvre
            {favoriteWorks.length > 1 ? "s" : ""}
          </p>
        </div>

        {favoriteWorks.length ? (
          <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteWorks.map((work, index) => (
              <Link
                key={work.slug}
                href={`/paintings/${work.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.035]">
                  <Image
                    src={accountImageSource(work.image)}
                    alt={work.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-5 transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <span className="eyebrow absolute left-3 top-3 bg-paper px-2.5 py-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex justify-between gap-5 border-t border-ink py-3">
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.04em]">
                      {work.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink/50">{work.artist}</p>
                  </div>
                  <span className="text-blue">♥</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col justify-between border border-ink p-5">
            <p className="max-w-md text-xl text-ink/55">
              Survolez les œuvres de la collection et composez ici votre propre
              sélection.
            </p>
            <Link
              href="/paintings"
              className="eyebrow self-start rounded-full bg-ink px-5 py-3 text-paper hover:bg-blue"
            >
              Explorer la collection →
            </Link>
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-3">
        {[
          {
            number: "01",
            label: "Collection",
            title: "VOIR LES ŒUVRES",
            href: "/paintings",
          },
          {
            number: "02",
            label: "Programmation",
            title: "EXPLORER L’AGENDA",
            href: "/agenda",
          },
          {
            number: "03",
            label: "Votre visite",
            title: "PRENDRE UN BILLET",
            href: "/billeterie",
          },
        ].map((item) => (
          <Link
            key={item.number}
            href={item.href}
            className="group flex min-h-[20rem] flex-col justify-between border-b border-ink p-3 transition-colors hover:bg-ink hover:text-paper sm:p-4 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <div className="flex items-start justify-between">
              <p className="eyebrow opacity-50">{item.label}</p>
              <p className="font-mono text-[0.625rem] font-bold">
                {item.number}
              </p>
            </div>
            <div className="flex items-end justify-between gap-6">
              <h2 className="tight-type max-w-md text-[clamp(2.2rem,4vw,4.5rem)] font-bold">
                {item.title}
              </h2>
              <span className="text-3xl transition-transform group-hover:translate-x-1">
                ↗
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

function formatVisitDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${value}T12:00:00+02:00`));
}

function accountImageSource(src) {
  return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, 960) : src;
}
