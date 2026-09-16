import { getObjects } from "../_lib/paintings";
import Filter from "../components/filter";

export default async function Page() {
    const objects = await getObjects();

    return (
        <main className="min-h-screen bg-background px-6 py-12 text-foreground lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-foreground/60">
                        Collection
                    </p>

                    <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                        Les œuvres
                    </h1>
                </div>

                <Filter objects={objects} />
            </div>
        </main>
    );
}