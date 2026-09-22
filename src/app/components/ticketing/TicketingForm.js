"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/app/_lib/auth-client";
import {
  TICKET_OPTIONS as baseOptions,
  TICKET_TYPES as baseTickets,
  PENDING_TICKET_KEY,
} from "@/app/_lib/ticketing";
import { useI18n } from "@/app/i18n/I18nProvider";
import { localizeHref } from "@/app/i18n/routing";

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
  const { dictionary, locale, t } = useI18n();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-GB";
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }),
    [dateLocale],
  );
  const selectedDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [dateLocale],
  );
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
          <p className="eyebrow mb-3 text-ink/45">01 · {t("ticketing.date")}</p>
          <h2 className="tight-type text-4xl font-bold sm:text-6xl">
            {t("ticketing.yourArrival")}
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
              aria-label={t("ticketing.previousMonth")}
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-ink text-lg transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-20"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              disabled={!canGoForward}
              aria-label={t("ticketing.nextMonth")}
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-ink text-lg transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-20"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-ink bg-ink text-paper">
          {dictionary.ticketing.weekDays.map((day) => (
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
                aria-label={`${selectedDateFormatter.format(date)}${isClosed ? `, ${t("ticketing.museumClosed")}` : ""}`}
                title={isClosed ? t("ticketing.closedMonday") : undefined}
                onClick={() => onSelect(dateKey)}
                className={`group relative flex aspect-square cursor-pointer flex-col justify-between border-b border-r border-ink/15 p-2 text-left transition-colors sm:aspect-auto sm:min-h-24 sm:p-3 ${
                  isSelected
                    ? "bg-blue text-white"
                    : "hover:bg-ink hover:text-paper"
                } disabled:cursor-not-allowed disabled:bg-ink/[0.035] disabled:text-ink/25`}
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em] opacity-60">
                  {isClosed ? t("ticketing.closed") : t("ticketing.open")}
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
  const router = useRouter();
  const { dictionary, locale, t } = useI18n();
  const { data: session, isPending: isSessionPending } = useSession();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-GB";
  const selectedDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [dateLocale],
  );
  const tickets = useMemo(
    () =>
      baseTickets.map((ticket) => {
        const [label, detail] = dictionary.ticketing.types[ticket.id];
        return { ...ticket, label, detail };
      }),
    [dictionary],
  );
  const options = useMemo(
    () =>
      baseOptions.map((option) => {
        const [label, detail] = dictionary.ticketing.optionTypes[option.id];
        return { ...option, label, detail };
      }),
    [dictionary],
  );
  const firstAvailableDate = getFirstAvailableDate(initialDate);
  const [selectedDate, setSelectedDate] = useState(firstAvailableDate);
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(tickets.map((ticket) => [ticket.id, 0])),
  );
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_TICKET_KEY));
      if (!pending || pending.version !== 1) return;

      const restoredDate =
        typeof pending.selectedDate === "string" &&
        pending.selectedDate >= initialDate &&
        parseDateKey(pending.selectedDate).getDay() !== 1
          ? pending.selectedDate
          : firstAvailableDate;
      setSelectedDate(restoredDate);
      setQuantities(
        Object.fromEntries(
          tickets.map((ticket) => [
            ticket.id,
            Math.max(
              0,
              Math.min(
                20,
                Number.parseInt(pending.quantities?.[ticket.id], 10) || 0,
              ),
            ),
          ]),
        ),
      );
      setSelectedOptions(
        Object.fromEntries(
          options.map((option) => [
            option.id,
            pending.selectedOptions?.[option.id] === true,
          ]),
        ),
      );
    } catch {
      sessionStorage.removeItem(PENDING_TICKET_KEY);
    }
  }, [firstAvailableDate, initialDate, options, tickets]);

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
    [quantities, tickets],
  );

  function changeQuantity(id, amount) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, current[id] + amount),
    }));
  }

  async function handleBooking() {
    if (!ticketCount || isSubmitting || isSessionPending) return;
    setSubmitError("");
    const selection = {
      version: 1,
      selectedDate,
      quantities,
      selectedOptions,
    };

    if (!session) {
      sessionStorage.setItem(PENDING_TICKET_KEY, JSON.stringify(selection));
      router.push(
        `${localizeHref("/login", locale)}?callbackUrl=%2Fbilleterie%3Fresume%3D1`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitDate: selectedDate,
          quantities,
          selectedOptions,
        }),
      });
      const payload = await response.json();

      if (response.status === 401) {
        sessionStorage.setItem(PENDING_TICKET_KEY, JSON.stringify(selection));
        router.push(
          `${localizeHref("/login", locale)}?callbackUrl=%2Fbilleterie%3Fresume%3D1`,
        );
        return;
      }
      if (!response.ok) throw new Error(t("ticketing.failed"));

      sessionStorage.removeItem(PENDING_TICKET_KEY);
      setConfirmedBooking(payload.booking);
      router.refresh();
    } catch (error) {
      setSubmitError(error.message || t("ticketing.failed"));
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="eyebrow mb-3 text-ink/45">
              02 · {t("ticketing.entries")}
            </p>
            <h2 className="tight-type text-4xl font-bold sm:text-6xl">
              {t("ticketing.yourTickets")}
            </h2>
          </div>
          <p className="eyebrow hidden sm:block">
            {t("ticketing.pricePerPerson")}
          </p>
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
                  {ticket.price === 0
                    ? t("ticketing.free")
                    : `${ticket.price} €`}
                </p>
              </div>
              <div className="flex items-center rounded-full border border-ink">
                <button
                  type="button"
                  onClick={() => changeQuantity(ticket.id, -1)}
                  aria-label={t("ticketing.remove", { ticket: ticket.label })}
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-xl transition-colors hover:bg-ink hover:text-paper"
                >
                  −
                </button>
                <output
                  className="w-8 text-center text-sm font-bold"
                  aria-label={t("ticketing.quantity", { ticket: ticket.label })}
                >
                  {quantities[ticket.id]}
                </output>
                <button
                  type="button"
                  onClick={() => changeQuantity(ticket.id, 1)}
                  aria-label={t("ticketing.add", { ticket: ticket.label })}
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-xl transition-colors hover:bg-blue hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <p className="eyebrow mb-3 text-ink/45">
            03 · {t("ticketing.options")}
          </p>
          <h2 className="tight-type mb-6 text-4xl font-bold sm:text-6xl">
            {t("ticketing.moreVisit")}
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
                        {active
                          ? t("ticketing.added")
                          : t("ticketing.addOption")}
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
          <p className="eyebrow">{t("ticketing.yourVisit")}</p>
          <p className="eyebrow">
            {String(ticketCount).padStart(2, "0")}{" "}
            {ticketCount === 1 ? t("ticketing.ticket") : t("ticketing.tickets")}
          </p>
        </div>
        <h2 className="tight-type mt-8 text-5xl font-bold">
          {t("ticketing.recap")}
        </h2>

        <div className="mt-6 border-y border-white/50 py-4">
          <p className="eyebrow mb-2 text-white/60">
            {t("ticketing.visitDate")}
          </p>
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
              {t("ticketing.selectTickets")}
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
          <span className="eyebrow">{t("ticketing.total")}</span>
          <output className="text-5xl font-bold tracking-[-0.06em]">
            {total} €
          </output>
        </div>
        {confirmedBooking ? (
          <div className="border-y border-white/50 py-5">
            <p className="eyebrow text-white/60">{t("ticketing.confirmed")}</p>
            <p className="mt-2 text-2xl font-bold">
              NM—{confirmedBooking.id.slice(0, 8).toUpperCase()}
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(localizeHref("/account#mes-billets", locale))
              }
              className="mt-5 w-full cursor-pointer rounded-full bg-white px-5 py-4 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              {t("ticketing.account")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!ticketCount || isSubmitting || isSessionPending}
            onClick={handleBooking}
            aria-busy={isSubmitting}
            className="w-full cursor-pointer rounded-full bg-white px-5 py-4 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            {isSubmitting
              ? t("ticketing.confirmation")
              : session
                ? t("ticketing.confirm")
                : t("ticketing.signIn")}
          </button>
        )}
        {submitError ? (
          <p className="mt-3 text-center text-xs font-bold" role="alert">
            {submitError}
          </p>
        ) : null}
        <p className="mt-4 text-center text-xs text-white/55">
          {t("ticketing.secure")}
        </p>
      </aside>
    </div>
  );
}
