"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";

const AUTOPLAY_MS = 5000;
const flyers = Array.from({ length: 8 }, (_, index) => ({
  src: `/speakers/fl${index + 1}.jpeg`,
  alt: `Afiche oficial de conferencista ${index + 1} del IV Congreso`,
}));

/** Distancia circular más corta entre el afiche i y el activo (-4..4). */
function offsetOf(index: number, active: number): number {
  const total = flyers.length;
  let delta = (index - active + total) % total;
  if (delta > total / 2) delta -= total;
  return delta;
}

export function FlyerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const dragStart = useRef<number | null>(null);

  const go = useCallback((delta: number) => setActive(current => (current + delta + flyers.length) % flyers.length), []);
  const stepLightbox = useCallback((delta: number) => {
    setLightbox(current => (current === null ? null : (current + delta + flyers.length) % flyers.length));
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const autoplay = !paused && !reducedMotion && lightbox === null;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, active, go]);

  useEffect(() => {
    if (lightbox === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") stepLightbox(1);
      if (event.key === "ArrowLeft") stepLightbox(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [lightbox, stepLightbox]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStart.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(distance) > 40) go(distance < 0 ? 1 : -1);
  }

  return (
    <section className="showcase-section" aria-roledescription="carrusel" aria-labelledby="showcase-title">
      <div className="showcase-glow" aria-hidden="true" />
      <header className="showcase-header">
        <span className="showcase-eyebrow"><Images size={14} /> Afiches oficiales</span>
        <h2 className="showcase-title" id="showcase-title">Conferencistas del <em>IV Congreso</em></h2>
        <p className="showcase-subtitle">Conoce a quienes compartirán su experiencia del 25 al 27 de noviembre.</p>
      </header>

      <div
        className="showcase-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragStart.current = null; }}
        onKeyDown={event => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        {flyers.map((flyer, index) => {
          const offset = offsetOf(index, active);
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          const style = {
            "--offset": offset,
            "--distance": distance,
            zIndex: 10 - distance,
          } as CSSProperties;
          return (
            <button
              key={flyer.src}
              type="button"
              className={"showcase-card" + (isActive ? " is-active" : "") + (distance > 2 ? " is-hidden" : "")}
              style={style}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={distance > 2 || undefined}
              aria-label={isActive ? "Ampliar " + flyer.alt.toLowerCase() : "Ver afiche " + (index + 1)}
              onClick={() => (isActive ? setLightbox(index) : setActive(index))}
              draggable={false}
            >
              <Image
                src={flyer.src}
                alt={flyer.alt}
                width={1122}
                height={1402}
                sizes="(max-width: 600px) 72vw, 400px"
                priority={distance <= 1}
                draggable={false}
              />
              {isActive && <span className="showcase-expand" aria-hidden="true"><Expand size={16} /></span>}
            </button>
          );
        })}

        <button type="button" className="showcase-nav prev" onClick={() => go(-1)} aria-label="Afiche anterior"><ChevronLeft size={24} /></button>
        <button type="button" className="showcase-nav next" onClick={() => go(1)} aria-label="Afiche siguiente"><ChevronRight size={24} /></button>
      </div>

      <div className="showcase-dots" role="tablist" aria-label="Seleccionar afiche">
        {flyers.map((flyer, index) => (
          <button
            key={flyer.src}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={"Afiche " + (index + 1)}
            className={"showcase-dot" + (index === active ? " is-active" : "")}
            onClick={() => setActive(index)}
          >
            {index === active && <span key={active} className={"showcase-dot-fill" + (autoplay ? " is-running" : "")} style={{ animationDuration: AUTOPLAY_MS + "ms" }} />}
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="flyer-lightbox" role="dialog" aria-modal="true" aria-label={flyers[lightbox].alt} onMouseDown={event => event.target === event.currentTarget && setLightbox(null)}>
          <button type="button" className="flyer-lightbox-close" onClick={() => setLightbox(null)} aria-label="Cerrar" autoFocus><X size={22} /></button>
          <button type="button" className="flyer-lightbox-nav prev" onClick={() => stepLightbox(-1)} aria-label="Afiche anterior"><ChevronLeft size={26} /></button>
          <Image key={lightbox} src={flyers[lightbox].src} alt={flyers[lightbox].alt} width={1122} height={1402} sizes="(max-width: 600px) 92vw, 640px" className="flyer-lightbox-image" priority />
          <button type="button" className="flyer-lightbox-nav next" onClick={() => stepLightbox(1)} aria-label="Afiche siguiente"><ChevronRight size={26} /></button>
          <span className="flyer-lightbox-count">{lightbox + 1} / {flyers.length}</span>
        </div>
      )}
    </section>
  );
}
