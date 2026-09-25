export const TICKET_TYPES = [
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
    detail: "À partir de 10 personnes",
    price: 15,
    minimumQuantity: 10,
  },
  {
    id: "under-five",
    label: "Moins de 5 ans",
    detail: "Sur justificatif",
    price: 0,
  },
];

export const TICKET_OPTIONS = [
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
  {
    id: "museum-map",
    label: "Plan du musée",
    detail: "Gratuit et fourni à l’accueil",
    price: 0,
  },
];

export const PENDING_TICKET_KEY = "new-museum:pending-ticket";
export const MAX_TICKET_QUANTITY = 20;

export function normalizeTicketQuantity(ticketId, value) {
  const ticket = TICKET_TYPES.find((candidate) => candidate.id === ticketId);
  const quantity = Math.max(
    0,
    Math.min(MAX_TICKET_QUANTITY, Number.parseInt(value, 10) || 0),
  );

  if (ticket?.minimumQuantity && quantity > 0) {
    return Math.max(ticket.minimumQuantity, quantity);
  }

  return quantity;
}

export function hasValidTicketQuantities(quantities) {
  return TICKET_TYPES.every((ticket) => {
    const rawQuantity = quantities?.[ticket.id] ?? 0;
    const quantity = Number(rawQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > MAX_TICKET_QUANTITY
    ) {
      return false;
    }

    return (
      !ticket.minimumQuantity ||
      quantity === 0 ||
      quantity >= ticket.minimumQuantity
    );
  });
}

export function calculateBooking(quantities, selectedOptions) {
  const normalizedTickets = TICKET_TYPES.map((ticket) => ({
    id: ticket.id,
    label: ticket.label,
    quantity: normalizeTicketQuantity(ticket.id, quantities?.[ticket.id]),
    unitPrice: ticket.price,
  })).filter((ticket) => ticket.quantity > 0);
  const ticketCount = normalizedTickets.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0,
  );
  const normalizedOptions = TICKET_OPTIONS.filter(
    (option) => selectedOptions?.[option.id] === true,
  ).map((option) => ({
    id: option.id,
    label: option.label,
    quantity: ticketCount,
    unitPrice: option.price,
  }));
  const total = [...normalizedTickets, ...normalizedOptions].reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return {
    tickets: normalizedTickets,
    options: normalizedOptions,
    ticketCount,
    total,
  };
}
