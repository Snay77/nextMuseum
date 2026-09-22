import AgendaExperience from "@/app/components/agenda/AgendaExperience";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("common.agenda"), description: t("agenda.description") };
}

export default function AgendaPage() {
  return (
    <main>
      <AgendaExperience />
    </main>
  );
}
