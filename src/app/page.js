
import ShapeGrid from "./components/shapeGrid";
import {
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "./_lib/paintings";

export default async function Home() {
  let imageUrls = [];

  try {
    const objects = await getObjects();
    imageUrls = objects
      .map((object) => object.image)
      .filter(Boolean)
      .map((image) =>
        isWikimediaThumbnail(image) ? getWikimediaThumbnail(image, 500) : image,
      );
  } catch {
    imageUrls = [];
  }

  return (
    <main className="flex flex-col px-4 gap-2">
      <section
        id="hero"
        className="hero relative h-180 w-full overflow-hidden rounded-3xl border border-foreground/20 bg-foreground"
      >
        <ShapeGrid
          speed={1}
          squareSize={180}
          direction="diagonal"
          borderColor="#f5dabf"
          hoverFillColor="#222"
          shape="square"
          hoverTrailAmount={0}
          hoverColor="#222222"
          size={180}
          imageUrls={imageUrls}
          className="absolute inset-0"
        />

        <div className="relative z-10 flex h-full items-center justify-center p-6 text-center">
          <p className="max-w-xl text-3xl font-semibold text-background drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            Welcome to the New Museum
          </p>
        </div>
      </section>

      <section className="flex min-h-screen gap-2">
        <div className="w-1/2 rounded-3xl bg-bordo p-6 text-background">
          <h2 className="text-2xl font-semibold">Left panel</h2>
        </div>
        <div className="w-1/2 rounded-3xl bg-bordo p-6 text-background">
          <h2 className="text-2xl font-semibold">Right panel</h2>
        </div>
      </section>
    </main>
  );
}
