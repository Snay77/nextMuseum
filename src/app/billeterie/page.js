import TicketingForm from "../components/ticketingForm";

export const metadata = {
  title: "Billetterie",
  description: "Réservez vos billets et préparez votre visite au New Museum.",
};

export default function TicketingPage() {
  return (
    <main className="min-h-screen px-3 pb-24 pt-8 sm:px-4 sm:pb-36 sm:pt-12">
      <div className="grid gap-8 border-b border-ink pb-8 lg:grid-cols-[1fr_3fr]">
        <p className="eyebrow">( Réserver sa visite )</p>
        <div>
          <h1 className="display-type text-[clamp(4.6rem,15vw,14rem)]">
            BILLETS
          </h1>
          <div className="mt-8 grid gap-8 text-lg sm:grid-cols-2 sm:text-xl">
            <p className="max-w-lg">
              Choisissez votre tarif, composez votre visite et venez voir l’art
              autrement.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="eyebrow mb-2 text-ink/45">Horaires</p>
                <p>Mar—Dim</p>
                <p>10h—19h</p>
              </div>
              <div>
                <p className="eyebrow mb-2 text-ink/45">Adresse</p>
                <p>10 rue du Musée</p>
                <p>75003 Paris</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TicketingForm />
    </main>
  );
}
