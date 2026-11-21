"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

const flyers = Array.from({ length: 8 }, (_, index) => ({
  src: `/speakers/fl${index + 1}.jpeg`,
  alt: `Afiche oficial de conferencista ${index + 1} del IV Congreso`,
}));

export function FlyerCarousel() {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((delta: number) => {
    setOpen(current => (current === null ? null : (current + delta + flyers.length) % flyers.length));
  }, []);

  useEffect(() => {
    if (open === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <section className="flyers-section" aria-labelledby="flyers-title">
      <header className="flyers-header">
        <span className="speakers-eyebrow"><Images size={14} /> Afiches oficiales</span>
        <h2 className="flyers-title" id="flyers-title">Conferencistas del congreso</h2>
      </header>

      <div className="flyers-viewport">
        <ul className="flyers-track">
          {[...flyers, ...flyers].map((flyer, index) => {
            const duplicate = index >= flyers.length;
            return (
              <li key={index} className="flyer-item" aria-hidden={duplicate || undefined}>
                <button
                  type="button"
                  className="flyer-card"
                  onClick={() => setOpen(index % flyers.length)}
                  tabIndex={duplicate ? -1 : undefined}
                  aria-label={"Ampliar " + flyer.alt.toLowerCase()}
                >
                  <Image src={flyer.src} alt={duplicate ? "" : flyer.alt} width={1122} height={1402} sizes="220px" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open !== null && (
        <div className="flyer-lightbox" role="dialog" aria-modal="true" aria-label={flyers[open].alt} onMouseDown={event => event.target === event.currentTarget && close()}>
          <button type="button" className="flyer-lightbox-close" onClick={close} aria-label="Cerrar" autoFocus><X size={22} /></button>
          <button type="button" className="flyer-lightbox-nav prev" onClick={() => step(-1)} aria-label="Afiche anterior"><ChevronLeft size={26} /></button>
          <Image key={open} src={flyers[open].src} alt={flyers[open].alt} width={1122} height={1402} sizes="(max-width: 600px) 92vw, 640px" className="flyer-lightbox-image" priority />
          <button type="button" className="flyer-lightbox-nav next" onClick={() => step(1)} aria-label="Afiche siguiente"><ChevronRight size={26} /></button>
          <span className="flyer-lightbox-count">{open + 1} / {flyers.length}</span>
        </div>
      )}
    </section>
  );
}
