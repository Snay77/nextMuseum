import Image from "next/image";
import {
  getObject,
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "../../_lib/paintings";
import Link from "../../components/Link";

function getImageSource(src, width = 1920) {
  if (!src) return null;
  return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, width) : src;
}

export default async function PaintingPage({ params }) {
  const { slug } = await params;
  const [painting, objects] = await Promise.all([
    getObject(slug.join("/")),
    getObjects(),
  ]);
  const gallery = painting.gallery?.filter(Boolean) ?? [];
  const otherPaintings = objects
    .filter(
      (object) => object.id !== painting.id && object.slug && object.image,
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      <section className="grid min-h-[calc(100svh-3.5rem)] border-b border-ink lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-between px-3 py-6 sm:px-4 sm:py-8 lg:order-1">
          <div className="flex items-start justify-between gap-6">
            <p className="eyebrow">{painting.type ?? "Œuvre"}</p>
            <p className="eyebrow">{painting.year}</p>
          </div>
          <div className="py-20 lg:py-10">
            <h1 className="tight-type text-[clamp(3.8rem,8.5vw,9rem)] font-bold">
              {painting.title}
            </h1>
            <p className="mt-6 text-xl tracking-[-0.035em] sm:text-3xl">
              {painting.artist}
            </p>
          </div>
          <div className="flex items-end justify-between gap-6 border-t border-ink pt-3">
            <p className="max-w-xs text-sm text-ink/60">
              {painting.movement ?? "Collection du New Museum"}
            </p>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue text-2xl text-white">
              ↓
            </span>
          </div>
        </div>

        <div className="relative min-h-[62svh] overflow-hidden bg-line lg:min-h-full">
          <Image
            src={getImageSource(painting.image)}
            alt={painting.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="grid gap-10 px-3 py-20 sm:px-4 sm:py-28 lg:grid-cols-[1fr_3fr] lg:py-36">
        <p className="eyebrow">( À propos de l’œuvre )</p>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <p className="tight-type max-w-4xl text-[clamp(2rem,4.2vw,4.6rem)] font-bold">
            {plainText(
              painting.description ??
                "Une œuvre majeure de la collection du New Museum.",
            )}
          </p>
          <dl className="border-t border-ink text-sm">
            <Info label="Artiste" value={painting.artist} />
            <Info label="Année" value={painting.year} />
            <Info label="Type" value={painting.type} />
            <Info label="Mouvement" value={painting.movement} />
            <Info label="Couleur" value={painting.color} />
            <Info label="Lieu" value={painting.location} />
            {painting.locationLink && (
              <a
                href={painting.locationLink}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 font-bold text-paper hover:bg-blue"
              >
                Visiter le musée ↗
              </a>
            )}
          </dl>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-ink px-3 py-4 text-paper sm:px-4">
          <div className="flex items-end justify-between border-b border-paper/40 pb-3">
            <h2 className="display-type text-[clamp(4rem,13vw,12rem)]">
              DÉTAILS
            </h2>
            <p className="eyebrow mb-1">
              {String(gallery.length).padStart(2, "0")} images
            </p>
          </div>
          <div className="grid gap-4 py-12 md:grid-cols-2 md:py-20">
            {gallery.map((image, index) => (
              <div
                key={image}
                className={`relative overflow-hidden bg-paper/10 ${index % 3 === 0 ? "aspect-[5/4] md:col-span-2" : "aspect-[4/5]"}`}
              >
                <Image
                  src={getImageSource(image, 1920)}
                  alt={`${painting.title}, vue ${index + 1}`}
                  fill
                  sizes={index % 3 === 0 ? "100vw" : "50vw"}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-3 py-24 sm:px-4 sm:py-36">
        <div className="flex items-end justify-between border-b border-ink pb-3">
          <div>
            <p className="eyebrow mb-4">( À suivre )</p>
            <h2 className="tight-type text-[clamp(3rem,7vw,7rem)] font-bold">
              Continuez à regarder.
            </h2>
          </div>
          <Link
            href="/paintings"
            className="eyebrow hidden rounded-full bg-ink px-5 py-3 text-paper hover:bg-blue sm:block"
          >
            Toute la collection →
          </Link>
        </div>
        <div className="grid gap-4 pt-8 md:grid-cols-3">
          {otherPaintings.map((object) => (
            <Link
              key={object.id}
              href={`/paintings/${object.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-line">
                <Image
                  src={getImageSource(object.image, 960)}
                  alt={object.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="flex justify-between gap-4 border-t border-ink py-2">
                <div>
                  <h3 className="text-xl font-bold tracking-[-0.04em]">
                    {object.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink/55">{object.artist}</p>
                </div>
                <span>↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-2 gap-4 border-b border-ink py-3">
      <dt className="eyebrow text-ink/50">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function plainText(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
