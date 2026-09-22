"use client";

import { useSession } from "../../_lib/auth-client";
import { useI18n } from "../../i18n/I18nProvider";
import Link from "../ui/Link";

export default function AuthButton() {
  const { data: session, isPending } = useSession();
  const { t } = useI18n();

  if (isPending) {
    return (
      <span
        aria-hidden="true"
        className="h-3 w-14 animate-pulse rounded-full bg-ink/10"
      />
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        aria-label={t("header.loginAria")}
        className="eyebrow transition-colors hover:text-blue"
      >
        {t("common.login")}
      </Link>
    );
  }

  const initial = (session.user.name || session.user.email || "M")
    .charAt(0)
    .toUpperCase();

  return (
    <Link
      href="/account"
      aria-label={t("header.accountAria")}
      className="group flex items-center gap-2"
    >
      <span className="eyebrow hidden transition-colors group-hover:text-blue xl:block">
        {t("common.account")}
      </span>
      <span className="grid size-7 place-items-center rounded-full border border-ink font-mono text-[0.625rem] font-bold transition-colors group-hover:border-blue group-hover:bg-blue group-hover:text-white">
        {initial}
      </span>
    </Link>
  );
}
