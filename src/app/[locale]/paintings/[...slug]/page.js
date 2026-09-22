import Image from "next/image";
import {
  getObject,
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "@/app/_lib/paintings";
import ArtworkHeroCopy from "@/app/components/artwork/ArtworkHeroCopy";
import FavoriteButton from "@/app/components/favorites/FavoriteButton";
import ArtworkCollectionReturn from "@/app/components/transitions/ArtworkCollectionReturn";
import ArtworkRailLink from "@/app/components/transitions/ArtworkRailLink";
import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import { getI18n } from "@/app/i18n/server";

function getImageSource(src, width = 1920) {
  if (!src) return null;
  return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, width) : src;
}

export default async function PaintingPage({ params }) {
  const { t } = await getI18n();
  const { slug } = await params;
  const [painting, objects] = await Promise.all([
    getObject(slug.join("/")),
    getObjects(),
  ]);
  const gallery = painting.gallery?.filter(Boolean) ?? [];
  const detailImages = gallery.filter(
    (image, index) =>
      image !== painting.image && gallery.indexOf(image) === index,
  );
  const description = descriptionParagraphs(
    painting.description ?? t("artwork.fallbackDescription"),
  );
  const otherPaintings = objects
    .filter(
      (object) => object.id !== painting.id && object.slug && object.image,
    )
    .slice(0, 3);

  return (
    <main data-artwork-detail-page className="min-h-screen">
      <section className="grid min-h-[calc(100svh-3.5rem)] border-b border-ink lg:grid-cols-[minmax(0,1.18fr)_minmax(25rem,0.82fr)]">
        <div className="relative grid min-h-[60svh] place-items-center overflow-hidden border-b border-ink bg-ink/[0.035] p-6 sm:min-h-[72svh] sm:p-10 lg:min-h-[calc(100svh-3.5rem)] lg:border-b-0 lg:border-r lg:p-[clamp(2.5rem,5vw,6rem)]">
          <ArtworkCollectionReturn
            data-artwork-hero-ui
            slug={painting.slug}
            title={painting.title}
            listenToHistory
            className="eyebrow absolute left-3 top-3 z-20 inline-flex items-center gap-3 rounded-full border border-ink bg-paper/90 px-4 py-3 backdrop-blur-md transition-colors hover:bg-ink hover:text-paper sm:left-4 sm:top-4"
          />

          <FavoriteButton
            data-artwork-hero-ui
            slug={painting.slug}
            className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4"
          />

          <div
            data-artwork-hero={painting.slug}
            className="relative size-full min-h-[48svh] sm:min-h-[60svh] lg:min-h-0"
          >
            <Image
              src={getImageSource(painting.image)}
              alt={painting.title}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 59vw"
              className="object-contain drop-shadow-[0_2rem_3.5rem_rgba(5,5,5,0.2)]"
            />
          </div>

          <div
            data-artwork-hero-ui
            className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between sm:inset-x-4 sm:bottom-4"
          >
            <p className="eyebrow text-ink/45">
              NM—{String(painting.id).padStart(3, "0")}
            </p>
            <p className="eyebrow text-ink/45">{t("artwork.fullView")}</p>
          </div>
        </div>

        <ArtworkHeroCopy
          slug={painting.slug}
          className="flex min-h-[42rem] flex-col justify-between px-3 py-5 sm:px-4 sm:py-7 lg:min-h-full"
        >
          <div
            data-artwork-copy-item
            className="flex items-start justify-between gap-6 border-b border-ink/25 pb-3"
          >
            <p className="eyebrow">{painting.type ?? t("artwork.artwork")}</p>
            <p className="eyebrow text-blue">{painting.year}</p>
          </div>

          <div className="py-20 sm:py-24 lg:py-12">
            <AnimatedHeroTitle
              text={painting.title}
              className="tight-type max-w-[11ch] text-[clamp(3.4rem,6.2vw,7rem)] font-bold [perspective:1000px]"
              lineClassName="leading-[0.88]"
            />
            <p
              data-artwork-copy-item
              className="mt-7 text-[clamp(1.3rem,2vw,2rem)] tracking-[-0.04em]"
            >
              {painting.artist}
            </p>

            <div data-artwork-copy-item className="mt-10 flex flex-wrap gap-2">
              {painting.movement && (
                <span className="eyebrow rounded-full border border-ink px-4 py-2.5">
                  {painting.movement}
                </span>
              )}
              {painting.location && (
                <span className="eyebrow rounded-full border border-ink/25 px-4 py-2.5 text-ink/55">
                  {painting.location}
                </span>
              )}
            </div>
          </div>

          <div
            data-artwork-copy-item
            className="flex items-end justify-between gap-6 border-t border-ink pt-3"
          >
            <p className="eyebrow text-ink/50">{t("artwork.discover")}</p>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue text-2xl text-white">
              ↓
            </span>
          </div>
        </ArtworkHeroCopy>
      </section>

      <section className="px-3 py-20 sm:px-4 sm:py-28 lg:py-36">
        <div className="grid gap-12 border-t border-ink pt-4 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-3">
            <p className="eyebrow">{t("artwork.about")}</p>
            <p className="mt-4 max-w-[15rem] text-sm leading-[1.4] text-ink/50">
              {t("artwork.context")}
            </p>
          </div>

          <article className="lg:col-span-6">
            {description[0] && (
              <p className="tight-type text-[clamp(1.55rem,2.15vw,2.35rem)] font-bold leading-[1.02]">
                {description[0]}
              </p>
            )}

            {description.length > 1 && (
              <div className="mt-12 space-y-7 border-t border-ink/25 pt-7 text-[1.05rem] leading-[1.5] tracking-[-0.018em] sm:text-lg">
                {description.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
          </article>

          <dl className="h-fit border-t border-ink text-sm lg:sticky lg:top-20 lg:col-span-3">
            <Info label={t("artwork.artist")} value={painting.artist} />
            <Info label={t("artwork.year")} value={painting.year} />
            <Info label={t("artwork.type")} value={painting.type} />
            <Info label={t("artwork.movement")} value={painting.movement} />
            <Info label={t("artwork.color")} value={painting.color} />
            <Info label={t("artwork.location")} value={painting.location} />
            {painting.locationLink && (
              <a
                href={painting.locationLink}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 font-bold text-paper transition-colors hover:bg-blue"
              >
                {t("artwork.visitMuseum")}
              </a>
            )}
          </dl>
        </div>
      </section>

      {detailImages.length > 0 && (
        <section className="bg-ink px-3 py-5 text-paper sm:px-4 sm:py-7">
          <div className="grid items-end gap-8 border-b border-paper/35 pb-4 md:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-4 text-paper/45">
                {t("artwork.closer")}
              </p>
              <h2 className="tight-type text-[clamp(3.5rem,9vw,9rem)] font-bold">
                {t("artwork.details")}
                <span className="text-blue">.</span>
              </h2>
            </div>
            <p className="eyebrow md:mb-2">
              {String(detailImages.length).padStart(2, "0")}{" "}
              {t(detailImages.length === 1 ? "artwork.view" : "artwork.views")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-20 py-16 md:grid-cols-12 md:gap-x-4 md:gap-y-28 md:py-28">
            {detailImages.map((image, index) => (
              <figure key={image} className={detailLayout(index)}>
                <div className="relative h-[min(68svh,46rem)] w-full border border-paper/10 bg-paper/[0.035] p-3 sm:p-5">
                  <Image
                    src={getImageSource(image, 1920)}
                    alt={`${painting.title}, ${t("artwork.view").toLowerCase()} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 72vw"
                    className="object-contain p-3 sm:p-5"
                  />
                </div>
                <figcaption className="mt-3 flex justify-between border-t border-paper/30 pt-2">
                  <span className="eyebrow text-paper/55">
                    {t("artwork.view")} {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="eyebrow">{painting.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="px-3 py-24 sm:px-4 sm:py-36">
        <div className="flex items-end justify-between border-b border-ink pb-3">
          <div>
            <p className="eyebrow mb-4">{t("artwork.next")}</p>
            <h2 className="tight-type text-[clamp(3rem,7vw,7rem)] font-bold">
              {t("artwork.continue")}
            </h2>
          </div>
          <ArtworkCollectionReturn
            slug={painting.slug}
            title={painting.title}
            className="eyebrow hidden rounded-full bg-ink px-5 py-3 text-paper hover:bg-blue sm:block"
          />
        </div>
        <div className="grid gap-4 pt-8 md:grid-cols-3">
          {otherPaintings.map((object) => (
            <ArtworkRailLink
              key={object.id}
              href={`/paintings/${object.slug}`}
              fromSlug={painting.slug}
              fromTitle={painting.title}
              fromArtist={painting.artist}
              fromYear={painting.year}
              fromMovement={painting.movement}
              toSlug={object.slug}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.035] p-4 sm:p-6">
                <Image
                  src={getImageSource(object.image, 960)}
                  alt={object.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-4 transition duration-700 group-hover:scale-[1.025] sm:p-6"
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
            </ArtworkRailLink>
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

function detailLayout(index) {
  const layouts = [
    "md:col-span-9 md:col-start-1",
    "md:col-span-7 md:col-start-6",
    "md:col-span-8 md:col-start-2",
  ];

  return layouts[index % layouts.length];
}

function descriptionParagraphs(value) {
  const matches = String(value).match(/<p(?:\s[^>]*)?>(.*?)<\/p>/gis);
  const blocks = matches?.length ? matches : [String(value)];

  return blocks.map(toPlainText).filter(Boolean);
}

function toPlainText(value) {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
