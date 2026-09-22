import { getObjects } from "@/app/_lib/paintings";
import Filter from "@/app/components/paintings/Filter";
import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: t("collection.title"),
    description: t("collection.description"),
  };
}

export const dynamic = "force-dynamic";

export default async function PaintingsPage() {
  const { t } = await getI18n();
  const objects = await getObjects();

  return (
    <main
      data-artwork-collection-page
      className="min-h-screen px-3 pb-24 sm:px-4 sm:pb-36"
    >
      <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-between overflow-hidden border-b border-ink py-5 sm:min-h-[calc(100svh-4rem)] sm:py-7">
        <div className="relative z-10 flex items-start justify-between">
          <p className="eyebrow">{t("collection.label")}</p>
          <p className="eyebrow text-right">
            {String(objects.length).padStart(2, "0")} {t("collection.works")}
            <br />
            Index 2026
          </p>
        </div>

        <div
          aria-hidden="true"
          className="display-type pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[44%] select-none text-[clamp(22rem,58vw,54rem)] text-ink/[0.035]"
        >
          *
        </div>

        <AnimatedHeroTitle
          text={t("collection.heroTitle")}
          className="display-type relative z-10 self-center text-center text-[clamp(5rem,23vw,22rem)]"
        />

        <div className="relative z-10 grid gap-8 border-t border-ink pt-3 md:grid-cols-[1fr_1fr]">
          <p className="eyebrow">{t("common.modernContemporary")}</p>
          <p className="max-w-2xl text-xl tracking-[-0.04em] sm:text-3xl">
            {t("collection.lead")}
          </p>
        </div>
      </section>

      <Filter objects={objects} />
    </main>
  );
}
