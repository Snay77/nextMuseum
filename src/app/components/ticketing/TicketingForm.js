"use client";

import { useMemo, useState } from "react";

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const selectedDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const tickets = [
  {
    id: "adult",
    label: "Entrée adulte",
    detail: "À partir de 26 ans",
    price: 24,
  },
  { id: "child", label: "Entrée -12 ans", detail: "De 5 à 11 ans", price: 12 },
  { id: "young", label: "Entrée jeune", detail: "De 12 à 25 ans", price: 18 },
  {
    id: "jobseeker",
    label: "Demandeur d’emploi",
    detail: "Sur justificatif",
    price: 18,
  },
  {
    id: "reduced-mobility",
    label: "Entrée PMR",
    detail: "Sur justificatif",
    price: 18,
  },
  {
    id: "senior",
    label: "Entrée senior",
    detail: "À partir de 65 ans",
    price: 18,
  },
  {
    id: "group",
    label: "Tarif groupe",
    detail: "Plus de 10 personnes",
    price: 15,
  },
  {
    id: "under-five",
    label: "Moins de 5 ans",
    detail: "Sur justificatif",
    price: 0,
  },
];

const options = [
  {
    id: "audioguide",
    label: "Audioguide",
    detail: "Disponible en 6 langues",
    price: 2,
  },
  {
    id: "paper-guide",
    label: "Guide papier",
    detail: "Édition de la collection",
    price: 4,
  },
];

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
}

function getFirstAvailableDate(dateKey) {
  const date = parseDateKey(dateKey);

  while (date.getDay() === 1) {
    date.setDate(date.getDate() + 1);
  }

  return toDateKey(date);
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = (new Date(year, month, 1, 12).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    const date =
      day > 0 && day <= daysInMonth ? new Date(year, month, day, 12) : null;

    return {
      date,
      key: date
        ? toDateKey(date)
        : `${year}-${month + 1}-${day < 1 ? "before" : "after"}-${Math.abs(day)}`,
    };
  });
}

function DateSelector({ initialDate, selectedDate, onSelect }) {
  const initialMonth = useMemo(
    () => startOfMonth(parseDateKey(initialDate)),
    [initialDate],
  );
  const lastMonth = useMemo(() => addMonths(initialMonth, 6), [initialMonth]);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const canGoBack = visibleMonth.getTime() > initialMonth.getTime();
  const canGoForward = visibleMonth.getTime() < lastMonth.getTime();

  return (
    <section className="mb-16 border-b border-ink pb-16">
      <div className="mb-7 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="eyebrow mb-3 text-ink/45">01 · Date</p>
          <h2 className="tight-type text-4xl font-bold sm:text-6xl">
            Votre venue
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-snug text-ink/55 sm:text-right">
          {selectedDateFormatter.format(parseDateKey(selectedDate))}
        </p>
      </div>

      <div className="border border-ink bg-paper">
        <div className="flex items-center justify-between border-b border-ink px-4 py-3 sm:px-5">
          <p className="text-lg font-bold capitalize tracking-[-0.035em] sm:text-2xl">
            {monthFormatter.format(visibleMonth)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              disabled={!canGoBack}
              aria-label="Mois précédent"
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-ink text-lg transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-20"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              disabled={!canGoForward}
              aria-label="Mois suivant"
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-ink text-lg transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-20"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-ink bg-ink text-paper">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center font-mono text-[0.6rem] uppercase tracking-[0.08em]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((cell) => {
            const { date } = cell;

            if (!date) {
              return (
                <span
                  key={cell.key}
                  aria-hidden="true"
                  className="aspect-square border-b border-r border-ink/15 sm:aspect-auto sm:min-h-24"
                />
              );
            }

            const dateKey = toDateKey(date);
            const isPast = dateKey < initialDate;
            const isClosed = date.getDay() === 1;
            const isDisabled = isPast || isClosed;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isDisabled}
                aria-pressed={isSelected}
                aria-label={`${selectedDateFormatter.format(date)}${isClosed ? ", musée fermé" : ""}`}
                title={isClosed ? "Musée fermé le lundi" : undefined}
                onClick={() => onSelect(dateKey)}
                className={`group relative flex aspect-square cursor-pointer flex-col justify-between border-b border-r border-ink/15 p-2 text-left transition-colors sm:aspect-auto sm:min-h-24 sm:p-3 ${
                  isSelected
                    ? "bg-blue text-white"
                    : "hover:bg-ink hover:text-paper"
                } disabled:cursor-not-allowed disabled:bg-ink/[0.035] disabled:text-ink/25`}
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em] opacity-60">
                  {isClosed ? "Fermé" : "Ouvert"}
                </span>
                <span className="self-end text-xl font-bold tracking-[-0.05em] sm:text-3xl">
                  {date.getDate()}
                </span>
                {isSelected && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xl sm:left-3">
                    *
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function TicketingForm({ initialDate }) {
  const firstAvailableDate = getFirstAvailableDate(initialDate);
  const [selectedDate, setSelectedDate] = useState(firstAvailableDate);
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(tickets.map((ticket) => [ticket.id, 0])),
  );
  const [selectedOptions, setSelectedOptions] = useState({});

  const ticketCount = Object.values(quantities).reduce(
    (sum, value) => sum + value,
    0,
  );
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
    <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-4">
      <div>
        <DateSelector
          initialDate={initialDate}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3 text-ink/45">02 · Entrées</p>
            <h2 className="tight-type text-4xl font-bold sm:text-6xl">
              Vos billets
            </h2>
          </div>
          <p className="eyebrow hidden sm:block">Prix / personne</p>
        </div>

        <div className="border-t border-ink">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-ink py-4 sm:grid-cols-[2rem_1fr_auto] sm:py-5"
            >
              <p className="eyebrow hidden text-ink/35 sm:block">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="text-lg font-bold tracking-[-0.035em] sm:text-2xl">
                  {ticket.label}
                </h3>
                <p className="mt-1 text-sm text-ink/50">
                  {ticket.detail} ·{" "}
                  {ticket.price === 0 ? "Gratuit" : `${ticket.price} €`}
                </p>
              </div>
              <div className="flex items-center rounded-full border border-ink">
                <button
                  type="button"
                  onClick={() => changeQuantity(ticket.id, -1)}
                  aria-label={`Retirer ${ticket.label}`}
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-xl transition-colors hover:bg-ink hover:text-paper"
                >
                  −
                </button>
                <output
                  className="w-8 text-center text-sm font-bold"
                  aria-label={`Quantité ${ticket.label}`}
                >
                  {quantities[ticket.id]}
                </output>
                <button
                  type="button"
                  onClick={() => changeQuantity(ticket.id, 1)}
                  aria-label={`Ajouter ${ticket.label}`}
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-xl transition-colors hover:bg-blue hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <p className="eyebrow mb-3 text-ink/45">03 · Options</p>
          <h2 className="tight-type mb-6 text-4xl font-bold sm:text-6xl">
            Plus de visite
          </h2>
          <div className="grid border-l border-t border-ink sm:grid-cols-2">
            {options.map((option) => {
              const active = Boolean(selectedOptions[option.id]);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSelectedOptions((current) => ({
                      ...current,
                      [option.id]: !active,
                    }))
                  }
                  className={`min-h-48 cursor-pointer border-b border-r border-ink p-5 text-left transition-colors ${active ? "bg-ink text-paper" : "hover:bg-blue hover:text-white"}`}
                >
                  <span className="flex h-full flex-col justify-between gap-10">
                    <span className="flex justify-between gap-4">
                      <span className="eyebrow">
                        {active ? "Ajouté" : "Ajouter"}
                      </span>
                      <span className="eyebrow">+ {option.price} €</span>
                    </span>
                    <span>
                      <span className="block text-2xl font-bold tracking-[-0.04em]">
                        {option.label}
                      </span>
                      <span className="mt-2 block text-sm opacity-55">
                        {option.detail}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="sticky top-20 bg-blue p-5 text-white sm:p-6">
        <div className="flex items-center justify-between border-b border-white/50 pb-3">
          <p className="eyebrow">Votre visite</p>
          <p className="eyebrow">
            {String(ticketCount).padStart(2, "0")} billet
            {ticketCount !== 1 ? "s" : ""}
          </p>
        </div>
        <h2 className="tight-type mt-8 text-5xl font-bold">Récap.</h2>

        <div className="mt-6 border-y border-white/50 py-4">
          <p className="eyebrow mb-2 text-white/60">Date de visite</p>
          <p className="text-sm capitalize leading-snug">
            {selectedDateFormatter.format(parseDateKey(selectedDate))}
          </p>
        </div>

        <div className="min-h-36 space-y-3 border-b border-white/50 py-5">
          {selectedTickets.length > 0 ? (
            selectedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span>
                  {quantities[ticket.id]} × {ticket.label}
                </span>
                <span>{ticket.price * quantities[ticket.id]} €</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/65">
              Sélectionnez vos billets pour commencer.
            </p>
          )}
          {options
            .filter((option) => selectedOptions[option.id])
            .map((option) => (
              <div
                key={option.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span>{option.label}</span>
                <span>{option.price * ticketCount} €</span>
              </div>
            ))}
        </div>

        <div className="flex items-end justify-between gap-4 py-5">
          <span className="eyebrow">Total</span>
          <output className="text-5xl font-bold tracking-[-0.06em]">
            {total} €
          </output>
        </div>
        <button
          type="button"
          disabled={!ticketCount}
          className="w-full cursor-pointer rounded-full bg-white px-5 py-4 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          Continuer →
        </button>
        <p className="mt-4 text-center text-xs text-white/55">
          Paiement sécurisé · Billets échangeables
        </p>
      </aside>
    </div>
  );
}
