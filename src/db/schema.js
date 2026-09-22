import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema"; // la FK pointe vers le user généré

export * from "./auth-schema"; // rend user/session/account/verification disponibles ici

// Feature métier : les tableaux mis en favori
export const favorite = pgTable(
  "favorite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tableauId: text("tableau_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorite_user_tableau_unique").on(
      table.userId,
      table.tableauId,
    ),
    index("favorite_user_idx").on(table.userId),
  ],
);

export const ticketBooking = pgTable(
  "ticket_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    visitDate: date("visit_date").notNull(),
    tickets: jsonb("tickets").notNull(),
    options: jsonb("options").notNull().default([]),
    ticketCount: integer("ticket_count").notNull(),
    totalCents: integer("total_cents").notNull(),
    status: text("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("ticket_booking_user_created_idx").on(table.userId, table.createdAt),
  ],
);
