import { getI18n } from "../../i18n/server";
import Link from "../ui/Link";

export default async function SingularityTeaser() {
  const { t } = await getI18n();
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden border-y border-ink bg-paper px-3 text-ink sm:px-4">
      <div
        aria-hidden="true"
        className="display-type pointer-events-none absolute -right-[0.06em] top-1/2 -translate-y-1/2 select-none text-[min(78vw,58rem)] text-ink/[0.035]"
      >
        *
      </div>

      <div className="relative z-10 flex items-start justify-between border-b border-ink py-4 sm:py-5">
        <p className="eyebrow">{t("home.singularity.label")}</p>
        <p className="eyebrow text-right text-ink/50">
          {t("home.singularity.outside")}
          <br />
          {t("home.singularity.sound")}
        </p>
      </div>

      <div className="relative z-10 grid flex-1 content-center py-12 sm:py-16">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(17rem,1fr)] lg:gap-12">
          <h2 className="display-type text-[clamp(3.35rem,10vw,12rem)] uppercase">
            {t("home.singularity.titleFirst")}
            <br />
            {t("home.singularity.titleSecond")}
            <span className="text-blue">*</span>
          </h2>

          <div className="lg:pb-[1.2vw]">
            <p className="tight-type max-w-[14ch] text-[clamp(2rem,3.5vw,4.25rem)] font-bold">
              {t("home.singularity.lead")}
            </p>
            <p className="mt-6 max-w-sm text-base leading-[1.25] text-ink/60 sm:text-lg">
              {t("home.singularity.copy")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid border-t border-ink md:grid-cols-[1fr_auto]">
        <div className="flex items-center justify-between gap-8 py-4 md:pr-8">
          <p className="eyebrow text-ink/50">NM—SNG</p>
          <p className="eyebrow hidden text-ink/50 sm:block">
            {t("home.singularity.immersive")}
          </p>
        </div>

        <Link
          href="/singularity"
          className="group flex min-h-20 items-center justify-between gap-12 border-t border-ink bg-ink px-5 text-paper transition-colors duration-300 hover:bg-blue md:min-w-[24rem] md:border-l md:border-t-0 sm:px-7"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-[0.05em]">
            {t("home.singularity.enter")}
          </span>
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-paper/50 text-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 group-hover:scale-110">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
