import AgendaExperience from "../components/agenda/AgendaExperience";

export const metadata = {
  title: "Agenda",
  description:
    "Expositions, performances, ateliers et rencontres au New Museum.",
};

export default function AgendaPage() {
  return (
    <main>
      <AgendaExperience />
    </main>
  );
}
