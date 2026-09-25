import TicketingForm from "@/app/components/ticketing/TicketingForm";
import AnimatedHeroTitle from "@/app/components/ui/AnimatedHeroTitle";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: t("ticketing.title"),
    description: t("ticketing.description"),
  };
}

export const dynamic = "force-dynamic";

function getParisDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export default async function TicketingPage() {
  const { t } = await getI18n();
  return (
    <main className="min-h-screen px-3 pb-24 pt-8 sm:px-4 sm:pb-36 sm:pt-12">
      <div className="grid gap-8 border-b border-ink pb-8 lg:grid-cols-[1fr_3fr]">
        <p className="eyebrow">{t("ticketing.label")}</p>
        <div>
          <AnimatedHeroTitle
            text={t("ticketing.hero")}
            className="display-type text-[clamp(4.6rem,15vw,14rem)]"
          />
          <div className="mt-8 grid gap-8 text-lg sm:grid-cols-2 sm:text-xl">
            <p className="max-w-lg">{t("ticketing.intro")}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="eyebrow mb-2 text-ink/45">
                  {t("ticketing.hours")}
                </p>
                <p>Mar—Dim</p>
                <p>10h—19h</p>
              </div>
              <div>
                <p className="eyebrow mb-2 text-ink/45">
                  {t("ticketing.address")}
                </p>
                <p>10 rue du Musée</p>
                <p>75003 Paris</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TicketingForm initialDate={getParisDateKey()} />
    </main>
  );
}
