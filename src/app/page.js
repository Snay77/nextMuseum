import {
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "./_lib/paintings";
import ArtSpiral from "./components/artSpiral";
import HomeHero from "./components/homeHero";
import Link from "./components/Link";

export const dynamic = "force-dynamic";

function imageSource(src, width = 1280) {
  if (!src) return null;
  return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, width) : src;
}

function prepareWork(object, width = 1280) {
  if (!object) return null;

  return {
    id: object.id,
    slug: object.slug,
    title: object.title,
    artist: object.artist,
    year: object.year,
    image: imageSource(object.image, width),
  };
}

export default async function Home() {
  let objects = [];

  try {
    objects = (await getObjects()).filter(
      (object) => object.image && object.slug,
    );
  } catch {
    objects = [];
  }

  const spiralWorks = objects.map((object) => prepareWork(object, 960));

  return (
    <main>
      <HomeHero />

      <section className="border-t border-ink px-3 py-20 sm:px-4 sm:py-28 lg:py-40">
        <div className="grid gap-8 lg:grid-cols-[1fr_3fr]">
          <p className="eyebrow">( Notre manifeste )</p>
          <div>
            <h2 className="tight-type max-w-[72rem] text-[clamp(3rem,7.5vw,8rem)] font-bold">
              Nous n’exposons pas des objets. Nous ouvrons des perspectives.
            </h2>
            <div className="mt-12 grid gap-8 border-t border-ink pt-4 text-base sm:grid-cols-2 sm:text-lg lg:ml-auto lg:max-w-3xl">
              <p>
                Le New Museum rassemble des œuvres qui déplacent le regard et
                font dialoguer les époques, les gestes et les idées.
              </p>
              <p>
                Une collection en mouvement, pensée pour celles et ceux qui
                préfèrent la curiosité aux certitudes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ArtSpiral works={spiralWorks} />

      <section id="agenda" className="px-3 py-24 sm:px-4 sm:py-36">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-6">( Aujourd’hui au musée )</p>
            <h2 className="tight-type text-[clamp(4rem,10vw,10rem)] font-bold">
              VENEZ
              <br />
              VOIR.
            </h2>
          </div>
          <div className="border-t border-ink">
            {[
              ["10:30", "Visite guidée", "Les essentiels de la collection"],
              ["14:00", "Atelier", "Formes, matières, mouvement"],
              ["18:30", "Rencontre", "Un autre regard sur le moderne"],
            ].map(([time, type, title]) => (
              <div
                key={time}
                className="grid grid-cols-[4rem_1fr] gap-4 border-b border-ink py-5 sm:grid-cols-[6rem_1fr_auto] sm:items-center"
              >
                <p className="font-mono text-sm">{time}</p>
                <div>
                  <p className="eyebrow mb-2 text-ink/50">{type}</p>
                  <p className="text-xl font-bold tracking-[-0.035em] sm:text-2xl">
                    {title}
                  </p>
                </div>
                <span className="hidden text-2xl sm:block">↗</span>
              </div>
            ))}
            <Link
              className="mt-6 inline-flex rounded-full bg-blue px-6 py-3 text-sm font-bold text-white"
              href="/billeterie"
            >
              Préparer ma visite →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
