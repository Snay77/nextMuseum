"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/_lib/auth-client";
import { useI18n } from "@/app/i18n/I18nProvider";
import { localizeHref } from "@/app/i18n/routing";

export default function AccountSignOut() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(localizeHref("/", locale));
          router.refresh();
        },
        onError: () => setIsPending(false),
      },
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleSignOut}
      className="group flex w-full items-center justify-between rounded-full border border-ink px-6 py-4 font-mono text-xs font-bold uppercase transition-colors hover:border-blue hover:bg-blue hover:text-white disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:min-w-64"
    >
      <span>{isPending ? t("auth.signingOut") : t("auth.signOut")}</span>
      <span className="text-lg transition-transform group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
