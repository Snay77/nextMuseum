"use client";

import { useState } from "react";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function ContactForm() {
  const { dictionary, t } = useI18n();
  const subjects = dictionary.contact.subjects;
  const [prepared, setPrepared] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const body = [
      t("contact.hello"),
      "",
      message,
      "",
      `${name} — ${email}`,
    ].join("\n");
    const mailto = `mailto:bonjour@newmuseum.fr?subject=${encodeURIComponent(
      t("contact.emailSubject", { subject, name }),
    )}&body=${encodeURIComponent(body)}`;

    setPrepared(true);
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-ink">
      <div className="grid gap-6 border-b border-ink py-6 sm:grid-cols-2 sm:py-8">
        <label className="block">
          <span className="eyebrow mb-3 block text-ink/50">
            01 · {t("contact.name")}
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            placeholder={t("contact.namePlaceholder")}
            className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/25 sm:text-3xl"
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-3 block text-ink/50">
            02 · {t("contact.email")}
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="vous@email.fr"
            className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/25 sm:text-3xl"
          />
        </label>
      </div>

      <label className="block border-b border-ink py-6 sm:py-8">
        <span className="eyebrow mb-4 block text-ink/50">
          03 · {t("contact.subject")}
        </span>
        <select
          name="subject"
          className="w-full appearance-none border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none sm:text-3xl"
          defaultValue={subjects[0]}
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </label>

      <label className="block border-b border-ink py-6 sm:py-8">
        <span className="eyebrow mb-4 block text-ink/50">
          04 · {t("contact.message")}
        </span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder={t("contact.messagePlaceholder")}
          className="w-full resize-none border-0 bg-transparent p-0 text-[clamp(2rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.055em] outline-none placeholder:text-ink/20"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-5 pt-6 sm:pt-8">
        <p className="max-w-sm text-sm leading-[1.25] text-ink/55">
          {t("contact.privacy")}
        </p>
        <button
          type="submit"
          className="group inline-flex items-center gap-8 rounded-full bg-blue px-6 py-4 font-mono text-xs font-bold uppercase text-white transition-transform hover:scale-105"
        >
          {t("contact.prepareEmail")}
          <span className="text-xl transition-transform group-hover:translate-x-1">
            ↗
          </span>
        </button>
      </div>

      <p
        aria-live="polite"
        className={`mt-5 font-mono text-xs font-bold uppercase text-blue transition-opacity ${prepared ? "opacity-100" : "opacity-0"}`}
      >
        {t("contact.ready")}
      </p>
    </form>
  );
}
