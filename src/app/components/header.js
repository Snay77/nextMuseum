import Link from "./Link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full p-4 overflow-visible bg-cream">
      <nav className="relative flex items-center justify-between overflow-visible rounded-2xl bg-foreground px-8 py-4 text-background">
        <div className="flex space-x-4">
          <Link href="/">Accueil</Link>
          <Link href="/paintings">Œuvres</Link>
        </div>
        <div className="shrink-0">
          <Link href="/">New Museum</Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/billeterie">Billetterie</Link>
        </div>
        <span className="pointer-events-none absolute bottom-[-16] left-[-1] z-[-2] w-6.25 translate-y-full text-cream">
          <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full">
            <path d="M25 1C11.7452 1 1 11.7452 1 25H0V0H25V1Z" fill="currentColor" />
          </svg>
        </span>
        <span className="pointer-events-none absolute bottom-[-16] right-[-1] z-[-2] w-6.25 translate-y-full text-cream">
          <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full">
            <path d="M0 1C13.2548 1 24 11.7452 24 25H25V0H0V1Z" fill="currentColor" />
          </svg>
        </span>
      </nav>
    </header>
  );
}