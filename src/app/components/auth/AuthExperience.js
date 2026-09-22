"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/app/_lib/auth-client";
import { useI18n } from "@/app/i18n/I18nProvider";
import { localizeHref } from "@/app/i18n/routing";
import AnimatedHeroTitle from "../ui/AnimatedHeroTitle";
import Link from "../ui/Link";

export default function AuthExperience({ mode, callbackUrl = "/account" }) {
  const router = useRouter();
  const { dictionary, locale, t } = useI18n();
  const content = dictionary.auth[mode];
  const isRegister = mode === "register";
  const title = content.title.map((text, index) => ({
    id: `${mode}-${index}`,
    text,
    star: index === content.title.length - 1,
  }));
  const marker = isRegister ? "02 / 02" : "01 / 02";
  const alternateHref = isRegister ? "/login" : "/register";
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };

    const callbacks = {
      onSuccess: () => {
        router.push(localizeHref(callbackUrl, locale));
        router.refresh();
      },
      onError: ({ error: authError }) => {
        setError(authError.message || t("auth.genericError"));
      },
    };

    try {
      if (isRegister) {
        await signUp.email(
          {
            ...credentials,
            name: String(form.get("name") ?? "").trim(),
          },
          callbacks,
        );
      } else {
        await signIn.email(credentials, callbacks);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="bg-paper">
      <section className="grid min-h-[calc(100svh-3.5rem)] border-b border-ink sm:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative flex min-h-[52svh] flex-col justify-between overflow-hidden bg-ink p-3 text-paper sm:p-4 lg:min-h-0">
          <div className="relative z-10 flex items-start justify-between gap-8">
            <p className="eyebrow">{content.eyebrow}</p>
            <p className="font-mono text-[0.625rem] font-bold tracking-[0.08em] text-paper/45">
              {marker}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="display-type pointer-events-none absolute left-[52%] top-1/2 -translate-x-1/2 -translate-y-[42%] select-none text-[clamp(26rem,62vw,62rem)] text-paper/[0.035]"
          >
            *
          </span>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[9%] top-[16%] h-[66%] w-[78%] rotate-[-4deg] border border-paper/15"
          >
            <span className="absolute -left-px -top-px size-5 border-l border-t border-blue" />
            <span className="absolute -bottom-px -right-px size-5 border-b border-r border-blue" />
          </div>

          <AnimatedHeroTitle
            ariaLabel={`${content.title.join(" ")}*`}
            lines={title}
            className="display-type relative z-10 text-[clamp(5.2rem,13.4vw,14rem)] [perspective:1000px]"
            lineClassName="overflow-hidden"
            starClassName="ml-[0.04em] align-top text-[0.3em] text-blue"
          />

          <div className="relative z-10 flex items-end justify-between gap-8 border-t border-paper/30 pt-3">
            <p className="max-w-xs text-sm leading-[1.2] text-paper/55">
              {t("auth.collection")}
              <br />
              {t("common.paris")}
            </p>
            <span className="eyebrow text-blue">NM*</span>
          </div>
        </div>

        <div className="flex min-h-[42rem] flex-col p-3 sm:p-4 lg:min-h-0 lg:px-[clamp(2rem,5vw,6rem)] lg:py-8">
          <div className="flex items-start justify-between border-b border-ink pb-3">
            <p className="eyebrow">{t("auth.memberAccess")}</p>
            <p className="eyebrow text-ink/40">{t("auth.secure")}</p>
          </div>

          <div className="my-auto py-16 lg:py-10">
            <div className="mb-12 max-w-xl">
              <h1 className="tight-type text-[clamp(3.8rem,7vw,7.5rem)] font-bold">
                {content.heading}
              </h1>
              <p className="mt-5 max-w-md text-base leading-[1.3] text-ink/55 sm:text-lg">
                {content.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-ink">
              {isRegister ? (
                <label className="block border-b border-ink py-5">
                  <span className="eyebrow mb-3 block text-ink/40">
                    01 · {t("auth.yourName")}
                  </span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    placeholder={t("auth.namePlaceholder")}
                    disabled={isPending}
                    className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/20 disabled:opacity-50 sm:text-3xl"
                  />
                </label>
              ) : null}

              <label className="block border-b border-ink py-5">
                <span className="eyebrow mb-3 block text-ink/40">
                  {isRegister ? "02" : "01"} · {t("auth.emailAddress")}
                </span>
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="vous@email.fr"
                  disabled={isPending}
                  className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/20 disabled:opacity-50 sm:text-3xl"
                />
              </label>

              <label className="block border-b border-ink py-5">
                <span className="eyebrow mb-3 block text-ink/40">
                  {isRegister ? "03" : "02"} · {t("auth.password")}
                </span>
                <input
                  required
                  minLength={8}
                  name="password"
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  placeholder={t("auth.passwordPlaceholder")}
                  disabled={isPending}
                  className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/20 disabled:opacity-50 sm:text-3xl"
                />
              </label>

              <div className="flex min-h-8 items-center pt-3">
                {error ? (
                  <p
                    aria-live="polite"
                    className="font-mono text-[0.6875rem] font-bold uppercase leading-[1.3] text-blue"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className="group mt-4 flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 font-mono text-xs font-bold uppercase text-paper transition-colors hover:bg-blue disabled:cursor-wait disabled:opacity-60"
              >
                <span>{isPending ? t("auth.wait") : content.submit}</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink pt-3">
            <p className="text-sm text-ink/55">{content.alternateText}</p>
            <Link
              href={`${alternateHref}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="eyebrow border-b border-ink pb-1 transition-colors hover:border-blue hover:text-blue"
            >
              {content.alternateLabel} ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
