import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/app/_lib/auth";
import { db } from "@/db";
import { favorite } from "@/db/schema";

function isValidSlug(value) {
  return (
    typeof value === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
    value.length <= 120
  );
}

async function getUser(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export async function GET(request) {
  const user = await getUser(request);
  if (!user)
    return Response.json({ error: "Non authentifié" }, { status: 401 });

  const rows = await db
    .select({ slug: favorite.tableauId })
    .from(favorite)
    .where(eq(favorite.userId, user.id))
    .orderBy(desc(favorite.createdAt));

  return Response.json({ slugs: rows.map((row) => row.slug) });
}

export async function POST(request) {
  const user = await getUser(request);
  if (!user)
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  const { slug } = await request.json().catch(() => ({}));
  if (!isValidSlug(slug))
    return Response.json({ error: "Œuvre invalide" }, { status: 400 });

  await db
    .insert(favorite)
    .values({ userId: user.id, tableauId: slug })
    .onConflictDoNothing();

  return Response.json({ slug, favorite: true });
}

export async function DELETE(request) {
  const user = await getUser(request);
  if (!user)
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  const { slug } = await request.json().catch(() => ({}));
  if (!isValidSlug(slug))
    return Response.json({ error: "Œuvre invalide" }, { status: 400 });

  await db
    .delete(favorite)
    .where(and(eq(favorite.userId, user.id), eq(favorite.tableauId, slug)));

  return Response.json({ slug, favorite: false });
}
