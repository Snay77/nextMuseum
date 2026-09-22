CREATE TABLE "ticket_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"visit_date" date NOT NULL,
	"tickets" jsonb NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ticket_count" integer NOT NULL,
	"total_cents" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_booking" ADD CONSTRAINT "ticket_booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_user_tableau_unique" ON "favorite" USING btree ("user_id","tableau_id");
--> statement-breakpoint
CREATE INDEX "favorite_user_idx" ON "favorite" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "ticket_booking_user_created_idx" ON "ticket_booking" USING btree ("user_id","created_at");
