import { getI18n } from "../../i18n/server";
import AuthButton from "../auth/AuthButton";
import Link from "../ui/Link";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const { t } = await getI18n();

  return (
    <header
      data-site-header
      className="sticky top-0 z-50 border-b border-ink bg-paper"
    >
      <nav className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-3 sm:h-16 sm:px-4">
        <div className="flex items-center gap-4 sm:gap-7">
          <Link
            className="eyebrow transition-opacity hover:opacity-50"
            href="/"
          >
            {t("common.home")}
          </Link>
          <Link
            className="eyebrow transition-opacity hover:opacity-50"
            href="/paintings"
          >
            {t("common.collection")}
          </Link>
          <Link
            className="eyebrow hidden transition-opacity hover:opacity-50 sm:block"
            href="/agenda"
          >
            {t("common.agenda")}
          </Link>
        </div>

        <Link
          href="/"
          aria-label={t("header.homeAria")}
          className="text-[1.45rem] font-black tracking-[-0.12em]"
        >
          NM<span className="text-blue">*</span>
        </Link>

        <div className="flex items-center justify-end gap-4 sm:gap-7">
          <LanguageSwitcher />
          <Link
            className="eyebrow hidden transition-opacity hover:opacity-50 xl:block"
            href="/contact"
          >
            {t("common.contact")}
          </Link>
          <Link
            className="eyebrow rounded-full bg-ink px-3 py-2 text-paper transition-colors hover:bg-blue sm:px-4"
            href="/billeterie"
          >
            {t("common.tickets")} ↗
          </Link>
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
