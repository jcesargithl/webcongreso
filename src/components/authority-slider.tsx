"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { authorities } from "@/lib/authorities";

const ROTATION_MS = 12000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const preference = window.matchMedia(REDUCED_MOTION_QUERY);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

export function AuthoritySlider() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayPreference, setAutoplayPreference] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const autoplayEnabled = autoplayPreference ?? !reducedMotion;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplayEnabled || isHovered || hasFocus || !isVisible || authorities.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((current) => (current + 1) % authorities.length);
      }
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, autoplayEnabled, hasFocus, isHovered, isVisible]);

  function moveSlide(direction: number) {
    setActiveIndex((current) => (current + direction + authorities.length) % authorities.length);
  }

  return (
    <section
      id="autoridades"
      ref={sectionRef}
      className="authority-slider"
      aria-label="Mensajes de las autoridades del congreso"
      aria-roledescription="carrusel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          moveSlide(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="authority-slides" aria-live={autoplayEnabled ? "off" : "polite"}>
        {authorities.map((authority, index) => (
          <article
            key={authority.id}
            id={`authority-slide-${authority.id}`}
            className={`authority-slide${index === activeIndex ? " is-active" : ""}`}
            data-authority={authority.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${authorities.length}: ${authority.name}`}
            aria-hidden={index !== activeIndex}
            inert={index !== activeIndex}
          >
            <div className="authority-message">
              <h2>{authority.heading}</h2>
              {authority.greeting && <p className="authority-greeting">{authority.greeting}</p>}
              <div className="authority-message-body">
                {authority.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
              <div className="authority-signature">
                <p>Atentamente,</p>
                <p className="authority-signature-name">{authority.name}</p>
                <p>{authority.signatureRole}</p>
                <p>{authority.signatureInstitution}</p>
              </div>
            </div>
            <div className="authority-profile">
              <div className="authority-portrait">
                <Image
                  src={authority.image}
                  alt={authority.name}
                  fill
                  sizes="(max-width: 600px) 220px, 260px"
                  style={{
                    objectFit: "cover",
                    objectPosition: "top",
                    transform: `scale(${authority.portraitScale})`,
                    transformOrigin: "50% 10%",
                  }}
                />
              </div>
              <h3>{authority.name}</h3>
              <p className="authority-role">{authority.role}</p>
              <p className="authority-institution">{authority.institution}</p>
            </div>
          </article>
        ))}
      </div>

      {authorities.length > 1 && (
        <div className="authority-controls">
          <span className="authority-count">Mensaje {activeIndex + 1} de {authorities.length}</span>
          <div className="authority-navigation" role="group" aria-label="Cambiar mensaje">
            <button type="button" className="authority-arrow" aria-label="Mensaje anterior" onClick={() => moveSlide(-1)}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className="authority-dots">
              {authorities.map((authority, index) => (
                <button
                  key={authority.id}
                  type="button"
                  className={`authority-dot${index === activeIndex ? " is-active" : ""}`}
                  aria-label={`Ver mensaje de ${authority.name}`}
                  aria-controls={`authority-slide-${authority.id}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <button type="button" className="authority-arrow" aria-label="Mensaje siguiente" onClick={() => moveSlide(1)}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className="authority-playback"
            aria-label={autoplayEnabled ? "Pausar rotación automática" : "Reanudar rotación automática"}
            onClick={() => setAutoplayPreference(!autoplayEnabled)}
          >
            {autoplayEnabled ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {autoplayEnabled ? "Pausar" : "Reanudar"}
          </button>
        </div>
      )}
    </section>
  );
}
