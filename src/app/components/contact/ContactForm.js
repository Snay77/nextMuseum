"use client";

import { useState } from "react";

const SUBJECTS = [
  "Question générale",
  "Visite & accessibilité",
  "Presse & partenariats",
  "Groupes & scolaires",
  "Autre demande",
];

export default function ContactForm() {
  const [prepared, setPrepared] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const body = [`Bonjour,`, "", message, "", `${name} — ${email}`].join("\n");
    const mailto = `mailto:bonjour@newmuseum.fr?subject=${encodeURIComponent(
      `[${subject}] Message de ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    setPrepared(true);
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-ink">
      <div className="grid gap-6 border-b border-ink py-6 sm:grid-cols-2 sm:py-8">
        <label className="block">
          <span className="eyebrow mb-3 block text-ink/50">01 · Nom</span>
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Votre nom"
            className="w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none placeholder:text-ink/25 sm:text-3xl"
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-3 block text-ink/50">02 · E-mail</span>
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
        <span className="eyebrow mb-4 block text-ink/50">03 · Sujet</span>
        <select
          name="subject"
          className="w-full appearance-none border-0 bg-transparent p-0 text-2xl font-bold tracking-[-0.04em] outline-none sm:text-3xl"
          defaultValue={SUBJECTS[0]}
        >
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </label>

      <label className="block border-b border-ink py-6 sm:py-8">
        <span className="eyebrow mb-4 block text-ink/50">04 · Message</span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Dites-nous tout."
          className="w-full resize-none border-0 bg-transparent p-0 text-[clamp(2rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.055em] outline-none placeholder:text-ink/20"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-5 pt-6 sm:pt-8">
        <p className="max-w-sm text-sm leading-[1.25] text-ink/55">
          Le bouton ouvre votre messagerie avec le message déjà préparé. Aucune
          donnée n’est stockée sur le site.
        </p>
        <button
          type="submit"
          className="group inline-flex items-center gap-8 rounded-full bg-blue px-6 py-4 font-mono text-xs font-bold uppercase text-white transition-transform hover:scale-105"
        >
          Préparer l’e-mail
          <span className="text-xl transition-transform group-hover:translate-x-1">
            ↗
          </span>
        </button>
      </div>

      <p
        aria-live="polite"
        className={`mt-5 font-mono text-xs font-bold uppercase text-blue transition-opacity ${prepared ? "opacity-100" : "opacity-0"}`}
      >
        Votre messagerie est prête.
      </p>
    </form>
  );
}
