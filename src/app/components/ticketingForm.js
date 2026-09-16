"use client";

import { useMemo, useState } from "react";

const tickets = [
  { id: "adult", label: "Entrée adulte", detail: "À partir de 26 ans", price: 24 },
  { id: "child", label: "Entrée -12 ans", detail: "De 5 à 11 ans", price: 12 },
  { id: "young", label: "Entrée jeune", detail: "De 12 à 25 ans", price: 18 },
  { id: "jobseeker", label: "Personne en recherche d’emploi", detail: "Sur justificatif", price: 18 },
  { id: "reduced-mobility", label: "Entrée PMR", detail: "Sur justificatif", price: 18 },
  { id: "senior", label: "Entrée senior", detail: "À partir de 65 ans", price: 18 },
  { id: "group", label: "Tarif groupe", detail: "+ de 10 personnes", price: 15 },
  { id: "under-five", label: "Moins de 5 ans", detail: "Gratuit, sur justificatif", price: 0 },
];

const options = [
  { id: "audioguide", label: "Audioguide", price: 2 },
  { id: "paper-guide", label: "Guide papier", price: 4 },
];

export default function TicketingForm() {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(tickets.map((ticket) => [ticket.id, 0])),
  );
  const [selectedOptions, setSelectedOptions] = useState({});

  const ticketCount = Object.values(quantities).reduce((sum, value) => sum + value, 0);
  const ticketTotal = tickets.reduce(
    (sum, ticket) => sum + ticket.price * quantities[ticket.id],
    0,
  );
  const optionTotal = options.reduce(
    (sum, option) =>
      sum + (selectedOptions[option.id] ? option.price * ticketCount : 0),
    0,
  );
  const total = ticketTotal + optionTotal;
  const selectedTickets = useMemo(
    () => tickets.filter((ticket) => quantities[ticket.id] > 0),
    [quantities],
  );

  function changeQuantity(id, amount) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, current[id] + amount),
    }));
  }

  return (
    <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="space-y-2">
        <section className="rounded-3xl bg-cream p-6 md:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-foreground/60">Choisir ses billets</p>
            <h2 className="text-3xl font-semibold md:text-5xl">Les tarifs</h2>
          </div>
          <div className="divide-y divide-foreground/10">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
                <div>
                  <h3 className="text-lg font-medium">{ticket.label}</h3>
                  <p className="mt-1 text-sm text-foreground/60">{ticket.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-sm sm:inline">{ticket.price === 0 ? "Gratuit" : `${ticket.price} €`}</span>
                  <div className="flex items-center rounded-3xl border border-foreground/20 bg-background">
                    <button type="button" onClick={() => changeQuantity(ticket.id, -1)} aria-label={`Retirer ${ticket.label}`} className="grid size-9 place-items-center rounded-full text-lg hover:bg-foreground hover:text-background">−</button>
                    <span className="w-7 text-center text-sm">{quantities[ticket.id]}</span>
                    <button type="button" onClick={() => changeQuantity(ticket.id, 1)} aria-label={`Ajouter ${ticket.label}`} className="grid size-9 place-items-center rounded-full text-lg hover:bg-foreground hover:text-background">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-foreground p-6 text-background md:p-10">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-background/60">Compléter la visite</p>
          <h2 className="mb-8 text-3xl font-semibold md:text-5xl">Options</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const active = Boolean(selectedOptions[option.id]);
              return (
                <button key={option.id} type="button" aria-pressed={active} onClick={() => setSelectedOptions((current) => ({ ...current, [option.id]: !active }))} className={`rounded-3xl border p-5 text-left transition ${active ? "border-background bg-background text-foreground" : "border-background/25 hover:border-background"}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-medium">{option.label}</span>
                    <span className="text-sm">{option.price} € / pers.</span>
                  </span>
                  <span className="mt-2 block text-sm opacity-70">Facturé pour chaque billet</span>
                </button>
              );
            })}
          </div>
          <p className="mt-6 border-t border-background/20 pt-5 text-sm text-background/70">Le plan du musée est gratuit et remis à l’accueil.</p>
        </section>
      </div>

      <aside className="sticky top-22 rounded-3xl bg-bordo p-6 text-background">
        <p className="text-xs uppercase tracking-[0.2em] text-background/65">Votre réservation</p>
        <h2 className="mt-3 text-3xl font-semibold">Total</h2>
        <div className="mt-8 space-y-4 border-y border-background/20 py-5">
          {selectedTickets.length > 0 ? selectedTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between gap-4 text-sm"><span>{quantities[ticket.id]} × {ticket.label}</span><span>{ticket.price * quantities[ticket.id]} €</span></div>
          )) : <p className="text-sm text-background/70">Aucun billet sélectionné.</p>}
          {options.filter((option) => selectedOptions[option.id]).map((option) => (
            <div key={option.id} className="flex justify-between gap-4 text-sm"><span>{option.label}</span><span>{option.price * ticketCount} €</span></div>
          ))}
        </div>
        <div className="flex items-end justify-between gap-4 pt-5"><span className="text-sm text-background/70">Montant total</span><span className="text-4xl font-semibold">{total} €</span></div>
        <button type="button" disabled={!ticketCount} className="mt-8 w-full rounded-full bg-background px-5 py-3 font-medium text-foreground transition hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-40">Continuer</button>
      </aside>
    </div>
  );
}
