import { auth } from "@/app/_lib/auth";
import {
  calculateBooking,
  hasValidTicketQuantities,
} from "@/app/_lib/ticketing";
import { db } from "@/db";
import { ticketBooking } from "@/db/schema";

function parisDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isValidVisitDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    value >= parisDateKey() &&
    date.getUTCDay() !== 1
  );
}

export async function POST(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json(
      { error: "Connectez-vous pour réserver." },
      { status: 401 },
    );

  const payload = await request.json().catch(() => ({}));
  if (!isValidVisitDate(payload.visitDate)) {
    return Response.json(
      { error: "Cette date de visite n’est pas disponible." },
      { status: 400 },
    );
  }

  if (!hasValidTicketQuantities(payload.quantities)) {
    return Response.json(
      {
        error:
          "Les quantités doivent être comprises entre 0 et 20, avec au moins 10 personnes pour le tarif groupe.",
      },
      { status: 400 },
    );
  }

  const booking = calculateBooking(payload.quantities, payload.selectedOptions);
  if (booking.ticketCount < 1 || booking.ticketCount > 20) {
    return Response.json(
      { error: "Choisissez entre 1 et 20 billets." },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(ticketBooking)
    .values({
      userId: session.user.id,
      visitDate: payload.visitDate,
      tickets: booking.tickets,
      options: booking.options,
      ticketCount: booking.ticketCount,
      totalCents: booking.total * 100,
    })
    .returning({ id: ticketBooking.id, createdAt: ticketBooking.createdAt });

  return Response.json(
    {
      booking: {
        ...created,
        visitDate: payload.visitDate,
        ticketCount: booking.ticketCount,
        total: booking.total,
      },
    },
    { status: 201 },
  );
}
