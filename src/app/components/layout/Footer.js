import Link from "../ui/Link";

export default function Footer() {
  return (
    <footer
      data-site-footer
      className="bg-ink px-3 pb-3 pt-24 text-paper sm:px-4 sm:pt-36"
    >
      <div className="grid gap-12 border-t border-paper/30 pt-4 md:grid-cols-2">
        <h2 className="tight-type max-w-3xl text-[clamp(3.2rem,8vw,8.5rem)] font-bold">
          L’art commence ici.
        </h2>
        <div className="grid grid-cols-2 gap-8 text-sm md:pt-2">
          <div className="space-y-2">
            <p className="eyebrow mb-5 text-paper/50">Visiter</p>
            <p>10 rue du Musée</p>
            <p>75003 Paris</p>
            <p>Mar—Dim · 10h—19h</p>
          </div>
          <div className="space-y-2">
            <p className="eyebrow mb-5 text-paper/50">Explorer</p>
            <Link className="block hover:underline" href="/paintings">
              La collection
            </Link>
            <Link className="block hover:underline" href="/agenda">
              Agenda
            </Link>
            <Link className="block hover:underline" href="/billeterie">
              Billetterie
            </Link>
            <Link className="block hover:underline" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20 flex items-end justify-between border-t border-paper/30 pt-3 sm:mt-32">
        <p className="eyebrow">© 2026 New Museum</p>
        <p className="display-type translate-y-[0.08em] text-[clamp(4.6rem,16vw,15rem)]">
          NM*
        </p>
      </div>
    </footer>
  );
}
