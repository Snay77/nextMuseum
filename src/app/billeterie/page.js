import TicketingForm from "../components/ticketingForm";

export default function TicketingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-4 text-foreground lg:px-6">
      <div className="flex w-full flex-col gap-2">
        <section className="rounded-3xl bg-foreground p-6 text-background md:p-10 lg:p-14">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-background/70">Visiter le musée</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-none md:text-8xl">Billetterie</h1>
          <p className="mt-6 max-w-xl text-lg text-background/75">Choisissez vos billets et préparez votre visite du New Museum.</p>
        </section>
        <TicketingForm />
      </div>
    </main>
  );
}
