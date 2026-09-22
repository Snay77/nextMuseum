import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import Link from "@/app/components/ui/Link";
import { getI18n } from "@/app/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="bg-ink text-paper">
      <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-between overflow-hidden px-3 pb-4 pt-5 sm:min-h-[calc(100svh-4rem)] sm:px-4 sm:pt-7">
        <div className="relative z-20 flex items-start justify-between gap-6">
          <p className="eyebrow">{t("notFound.label")}</p>
          <p className="eyebrow text-right leading-[1.25] text-paper/50">
            Code 404
            <br />
            {t("notFound.page")}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-[5/4] w-[min(72vw,52rem)] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] border border-paper/20"
        >
          <span className="absolute -left-px -top-px size-5 border-l border-t border-blue" />
          <span className="absolute -right-px -top-px size-5 border-r border-t border-blue" />
          <span className="absolute -bottom-px -left-px size-5 border-b border-l border-blue" />
          <span className="absolute -bottom-px -right-px size-5 border-b border-r border-blue" />
        </div>

        <span
          aria-hidden="true"
          className="display-type pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%] select-none text-[clamp(30rem,72vw,68rem)] text-paper/[0.025]"
        >
          *
        </span>

        <AnimatedHeroTitle
          ariaLabel={t("notFound.aria")}
          lines={[{ id: "error-code", text: "404", star: true }]}
          className="display-type relative z-10 self-center text-center text-[clamp(9rem,31vw,31rem)] [perspective:1000px]"
          lineClassName="flex items-start justify-center"
          starClassName="ml-[0.03em] mt-[0.02em] text-[0.28em] leading-none text-blue"
        />

        <div className="relative z-20 grid gap-7 border-t border-paper/35 pt-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-3 text-paper/45">{t("notFound.absent")}</p>
            <h2 className="tight-type max-w-xl text-[clamp(2rem,4vw,4rem)] font-bold">
              {t("notFound.title")}
            </h2>
          </div>

          <p className="max-w-md text-base leading-[1.2] text-paper/65 sm:text-lg">
            {t("notFound.copy")}
          </p>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              href="/paintings"
              className="rounded-full border border-paper px-5 py-3 font-mono text-[0.65rem] font-bold uppercase transition-colors hover:border-blue hover:bg-blue"
            >
              {t("notFound.collection")}
            </Link>
            <Link
              href="/"
              className="rounded-full bg-paper px-5 py-3 font-mono text-[0.65rem] font-bold uppercase text-ink transition-colors hover:bg-blue hover:text-white"
            >
              {t("notFound.home")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
