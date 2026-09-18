import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema"; // la FK pointe vers le user généré

export * from "./auth-schema"; // rend user/session/account/verification disponibles ici

// Feature métier : les tableaux mis en favori
export const favorite = pgTable("favorite", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tableauId: text("tableau_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
