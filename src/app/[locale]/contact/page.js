import ContactForm from "@/app/components/contact/ContactForm";
import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import Link from "@/app/components/ui/Link";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("common.contact"), description: t("contact.description") };
}

export default async function ContactPage() {
  const { dictionary, t } = await getI18n();
  return (
    <main>
      <section className="grid min-h-[calc(100svh-3.5rem)] border-b border-ink sm:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative flex min-h-[68svh] flex-col justify-between overflow-hidden p-3 sm:p-4 lg:min-h-0">
          <div className="flex items-start justify-between gap-8">
            <p className="eyebrow">{t("contact.talk")}</p>
            <p className="eyebrow text-right leading-[1.25]">
              {t("contact.response")}
              <br />
              {t("contact.hours48")}
            </p>
          </div>

          <AnimatedHeroTitle
            ariaLabel="Contact"
            lines={[
              { id: "contact-one", text: "CON" },
              { id: "contact-two", text: "TACT", star: true },
            ]}
            className="display-type relative z-10 text-[clamp(6rem,18vw,18rem)] [perspective:1000px]"
            lineClassName="overflow-hidden"
            starClassName="ml-[0.04em] align-top text-[0.35em] text-blue"
          />

          <p className="max-w-md text-lg leading-[1.15] sm:text-2xl">
            {t("contact.lead")}
          </p>
        </div>

        <div className="relative flex min-h-[32rem] flex-col justify-between overflow-hidden bg-blue p-3 text-white sm:p-4 lg:min-h-0">
          <p className="eyebrow">New Museum · Paris</p>
          <span
            aria-hidden="true"
            className="display-type pointer-events-none absolute -right-[0.15em] top-1/2 -translate-y-1/2 text-[clamp(24rem,45vw,48rem)] text-white/10"
          >
            @
          </span>
          <div className="relative z-10">
            <p className="eyebrow mb-4 text-white/60">
              {t("contact.writeDirectly")}
            </p>
            <a
              href="mailto:bonjour@newmuseum.fr"
              className="tight-type break-all text-[clamp(2.1rem,4.4vw,5rem)] font-bold underline decoration-2 underline-offset-8 transition-opacity hover:opacity-60"
            >
              bonjour@
              <br />
              newmuseum.fr
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-12 px-3 py-24 sm:px-4 sm:py-36 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow">{t("contact.yourMessage")}</p>
          <h2 className="tight-type mt-6 max-w-xl text-[clamp(3.2rem,7vw,7rem)] font-bold">
            {t("contact.writeFirst")}
            <br />
            {t("contact.writeSecond")}
          </h2>
        </div>
        <ContactForm />
      </section>

      <section className="grid border-t border-paper/30 bg-ink text-paper md:grid-cols-3">
        {dictionary.contact.cards.map((item, index) => (
          <article
            key={item.label}
            className="group flex min-h-[22rem] flex-col justify-between border-b border-paper/30 p-3 transition-colors hover:bg-blue sm:p-4 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <div className="flex items-start justify-between">
              <p className="eyebrow text-paper/50">{item.label}</p>
              <p className="font-mono text-[0.65rem]">
                {String(index + 1).padStart(2, "0")}
              </p>
            </div>
            <div>
              <h2 className="tight-type break-words text-[clamp(2rem,3.6vw,4rem)] font-bold">
                {item.title}
              </h2>
              <p className="mt-4 text-sm text-paper/55 group-hover:text-paper/75">
                {item.detail}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="flex flex-col items-start justify-between gap-8 bg-paper px-3 py-20 sm:px-4 sm:py-28 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-5">{t("contact.visiting")}</p>
          <h2 className="tight-type text-[clamp(3rem,7vw,7rem)] font-bold">
            {t("contact.prepareFirst")}
            <br />
            {t("contact.prepareSecond")}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/agenda"
            className="rounded-full border border-ink px-6 py-3 font-mono text-xs font-bold uppercase transition-colors hover:bg-ink hover:text-paper"
          >
            {t("contact.viewAgenda")}
          </Link>
          <Link
            href="/billeterie"
            className="rounded-full bg-blue px-6 py-3 font-mono text-xs font-bold uppercase text-white transition-transform hover:scale-105"
          >
            {t("common.ticketing")} ↗
          </Link>
        </div>
      </section>
    </main>
  );
}
