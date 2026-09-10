import { useState } from 'react';

export function NewsletterForm() {
  const [message, setMessage] = useState('');

  return (
    <form
      className="mt-10"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(
          'El registro todavía no está habilitado. Tus datos no fueron enviados ni almacenados.',
        );
      }}
      aria-describedby="newsletter-consent newsletter-status"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="newsletter-name">
          Nombre
        </label>
        <input
          id="newsletter-name"
          name="name"
          autoComplete="name"
          placeholder="Nombre"
          required
          className="min-h-13 border border-[#B39A6A]/30 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/46 focus:border-champagne focus:ring-1 focus:ring-champagne"
        />
        <label className="sr-only" htmlFor="newsletter-email">
          Correo electrónico
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          required
          className="min-h-13 border border-[#B39A6A]/30 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/46 focus:border-champagne focus:ring-1 focus:ring-champagne"
        />
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/58">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-[#b39a6a]"
        />
        <span id="newsletter-consent">
          Acepto recibir Salud Forte por correo. Esta autorización será
          independiente de cualquier comunicación relacionada con una cita.
        </span>
      </label>
      <button
        type="submit"
        className="mt-7 min-h-12 border border-champagne bg-champagne px-7 text-xs font-semibold uppercase tracking-widest text-[#111820] transition-colors hover:bg-[#c4ab7b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-4 focus-visible:ring-offset-navy cursor-pointer"
      >
        Quiero recibir Salud Forte
      </button>
      <output
        id="newsletter-status"
        aria-live="polite"
        className="mt-4 block min-h-5 text-xs leading-relaxed text-white/64"
      >
        {message}
      </output>
    </form>
  );
}

export const NewsletterSignup = NewsletterForm;
