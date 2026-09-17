import { getObjects } from "../_lib/paintings";
import Filter from "../components/filter";

export const metadata = {
  title: "Collection",
  description:
    "Explorez la collection d'art moderne et contemporain du New Museum.",
};

export const dynamic = "force-dynamic";

export default async function PaintingsPage() {
  const objects = await getObjects();

  return (
    <main className="min-h-screen px-3 pb-24 pt-8 sm:px-4 sm:pb-36 sm:pt-12">
      <div className="grid gap-8 border-b border-ink pb-8 lg:grid-cols-[1fr_3fr]">
        <p className="eyebrow">( Collection permanente )</p>
        <div>
          <h1 className="display-type text-[clamp(5rem,16vw,14rem)]">ŒUVRES</h1>
          <p className="mt-8 max-w-2xl text-xl tracking-[-0.035em] sm:text-3xl">
            Des œuvres majeures, des gestes radicaux et des regards qui
            continuent de déplacer le monde.
          </p>
        </div>
      </div>

      <Filter objects={objects} />
    </main>
  );
}
