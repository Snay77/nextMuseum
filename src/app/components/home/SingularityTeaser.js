import Link from "../ui/Link";

export default function SingularityTeaser() {
  return (
    <section className="relative flex h-[100svh] min-h-[42rem] items-center justify-center overflow-hidden border-t border-paper/20 bg-ink px-3 text-paper sm:px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(49,85,255,0.22)_0%,rgba(5,5,5,0)_35%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-paper/15" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-paper/15" />

      <div className="absolute inset-x-3 top-5 flex items-start justify-between sm:inset-x-4">
        <p className="eyebrow text-paper/55">( Expérience 031 )</p>
        <p className="eyebrow text-right text-paper/55">
          Collection en fusion
          <br />
          Audio · WebGL
        </p>
      </div>

      <div className="relative grid size-[min(84vw,78svh)] max-h-[52rem] max-w-[52rem] place-items-center">
        <div className="pointer-events-none absolute inset-0 rounded-full border border-paper/20 motion-safe:animate-[spin_36s_linear_infinite]">
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue shadow-[0_0_2rem_0.45rem_rgba(49,85,255,0.65)]" />
        </div>
        <div className="pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-paper/20 motion-safe:animate-[spin_24s_linear_infinite_reverse]">
          <span className="absolute bottom-[8%] right-[8%] size-1.5 rounded-full bg-paper" />
        </div>
        <div className="pointer-events-none absolute inset-[25%] rounded-full border border-blue/55 motion-safe:animate-[spin_18s_linear_infinite]">
          <span className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue" />
        </div>

        <div className="relative z-10 flex size-[min(70vw,31rem)] flex-col items-center justify-center rounded-full border border-paper/25 bg-[radial-gradient(circle_at_50%_42%,rgba(49,85,255,0.28),rgba(5,5,5,0.93)_58%)] px-6 text-center shadow-[0_0_8rem_rgba(49,85,255,0.18)] sm:px-10">
          <span className="display-type mb-5 block text-5xl text-blue sm:text-7xl">
            *
          </span>
          <h2 className="tight-type text-[clamp(2.6rem,7vw,6.8rem)] font-bold uppercase">
            Rencontrez
            <br />
            la singularité
          </h2>
          <p className="mt-5 max-w-sm font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.08em] text-paper/55 sm:mt-7 sm:text-xs">
            39 œuvres. Une orbite. À 31 secondes, la collection s’effondre sur
            elle-même.
          </p>
          <Link
            href="/singularity"
            className="group mt-7 inline-flex items-center gap-5 rounded-full border border-paper bg-paper px-5 py-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink transition-[background-color,color,transform] duration-300 hover:scale-105 hover:bg-blue hover:text-white sm:mt-9 sm:px-6 sm:py-4 sm:text-xs"
          >
            Entrer dans l’expérience
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-4 flex items-end justify-between sm:inset-x-4">
        <p className="eyebrow text-paper/45">NM—SNG/031</p>
        <p className="eyebrow text-right text-paper/45">
          Casque recommandé
          <br />
          Plein écran
        </p>
      </div>
    </section>
  );
}
