"use client";

import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/lib/speakers";
import { registrationCategories, formatCurrency, getInstitutionalFee, getRegistrationTotal } from "@/lib/congress";
import { RequestModal, type ModalState } from "@/components/request-modal";
import { CorporateModal } from "@/components/corporate-modal";
import { AuthoritySlider } from "@/components/authority-slider";
import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Award,
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  MapPin,
  Menu,
  Phone,
  Send,
  Sparkles,
  Users,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Heart,
  Globe,
} from "lucide-react";

/* ────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────── */

const schedule = [
  ["DÍA 01 · 25 NOV", "Apertura y conferencia magistral", "Acreditación · ceremonia inaugural · panel de investigadores · ponencias paralelas", "/dia 1.png"],
  ["DÍA 02 · 26 NOV", "Investigación e innovación", "Conferencias magistrales · mesas temáticas · simposios · talleres · foro internacional", "/dia 2.png"],
  ["DÍA 03 · 27 NOV", "Conclusiones y clausura", "Conferencias finales · premiación de investigaciones · clausura · fotografía oficial", "/dia 3.png"],
];

const agendaDetails = [
  [["09:00", "Acreditación y bienvenida", "Registro de participantes y entrega de materiales"],
  ["11:00", "Conferencia magistral internacional", "Investigación e innovación educativa"],
  ["15:00", "Panel de investigadores", "Preguntas, diálogo y ponencias paralelas"]],
  [["09:00", "Conferencias magistrales", "Inteligencia artificial y tecnologías digitales"],
  ["11:30", "Mesas temáticas", "Presentación y discusión de investigaciones"],
  ["15:00", "Talleres y foro internacional", "Intercambio de experiencias y propuestas"]],
  [["09:00", "Conferencias finales", "Síntesis de aprendizajes y experiencias"],
  ["12:00", "Premiación de investigaciones", "Reconocimiento a los mejores trabajos"],
  ["16:00", "Clausura y fotografía oficial", "Cierre institucional del IV Congreso"]],
];

const themes: [string, string, string, React.ReactNode, string][] = [
  ["01", "Investigación educativa y producción científica", "Investigación cuantitativa, cualitativa y mixta; investigación-acción; ética e integridad científica; tesis, publicaciones y divulgación.", <BookOpen key="theme-1" size={22} />, "/theme_1_v2.jpg"],
  ["02", "Inteligencia artificial, tecnologías digitales y educación", "IA generativa, competencias digitales, analítica del aprendizaje, entornos virtuales, personalización y uso responsable de la IA.", <BrainCircuit key="theme-2" size={22} />, "/theme_2_v2.jpg"],
  ["03", "Innovación pedagógica, currículo y evaluación", "Metodologías activas, ABP, gamificación, aprendizaje colaborativo, currículo por competencias y evaluación formativa.", <Lightbulb key="theme-3" size={22} />, "/theme_3_v2.jpg"],
  ["04", "Formación docente, inclusión e interculturalidad", "Formación inicial y continua, desempeño docente, educación inclusiva, diversidad, interculturalidad, EIB y educación rural.", <Heart key="theme-4" size={22} />, "/theme_4_v2.jpg"],
  ["05", "Gestión educativa, bienestar y desarrollo sostenible", "Liderazgo, calidad, políticas educativas, convivencia, bienestar socioemocional, ciudadanía y educación ambiental.", <Globe key="theme-5" size={22} />, "/theme_5_v2.jpg"],
];

/* ────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────── */

export default function Home() {
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      {/* ─── NAVBAR ─── */}
      <header className={`topbar ${menuOpen ? "menu-open" : ""}`} ref={headerRef}>
        <div className="topbar-main">
          <a className="brand-center" href="#inicio" onClick={() => setMenuOpen(false)}>
            <Image src="/logosecu.png" alt="Escudo EPEP" width={80} height={80} className="brand-logo" />
            <span className="brand-center-text">
              <strong>IV Congreso Internacional</strong>
              <small>EPEP · Investigación Científica</small>
            </span>
          </a>

          <nav className={menuOpen ? "nav-links-center open" : "nav-links-center"}>
            <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#fechas" onClick={() => setMenuOpen(false)}>Fechas</a>
            <a href="#organizadores" onClick={() => setMenuOpen(false)}>Organización</a>
            <a href="#programa" onClick={() => setMenuOpen(false)}>Programa</a>
            <a href="#ejes" onClick={() => setMenuOpen(false)}>Ejes</a>
            <a href="#inscripciones" onClick={() => setMenuOpen(false)}>Inscripciones</a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setModal({ kind: "paper" }); }}>Enviar investigación</a>
          </nav>
        </div>

        <div className="top-actions-absolute">
          <button
            className="icon-button mobile-menu"
            title="Abrir menú"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} color="var(--primary)" />
          </button>
        </div>

        <div className="marquee-banner">
          <div className="marquee-content">
            <span>📢 ¡AMPLIACIÓN DE PLAZO! Recepción de ponencias hasta el 06 de noviembre • Inscripción de asistentes hasta el 15 de noviembre &nbsp;&nbsp;•&nbsp;&nbsp; EL MAYOR CONGRESO DE INVESTIGACIÓN CIENTÍFICA DE LA REGIÓN &nbsp;&nbsp;•&nbsp;&nbsp; 📢 ¡AMPLIACIÓN DE PLAZO! Recepción de ponencias hasta el 06 de noviembre • Inscripción de asistentes hasta el 15 de noviembre &nbsp;&nbsp;•&nbsp;&nbsp;</span>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <div className="hero-title-container">
            <div>
              <span style={{ display: 'block', fontSize: 'clamp(20px, 3vw, 28px)', color: '#E8A317', letterSpacing: '0.1em', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' }}>
                ¡Bienvenidos al evento académico del año!
              </span>
              <h1>
                IV CONGRESO INTERNACIONAL<br />
                <span className="hero-title-highlight">DE INVESTIGACIÓN E INNOVACIÓN</span>
              </h1>
            </div>
          </div>

          <div className="hero-meta-clean">
            <span className="hero-meta-item-clean">
              <CalendarDays size={18} /> 25–27 Noviembre, 2026
            </span>
            <span className="hero-meta-item-clean">
              <MapPin size={18} /> UNA Puno, Perú
            </span>
            <span className="hero-meta-item-clean">
              <Users size={18} /> Modalidad Híbrida
            </span>
          </div>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#inscripciones">
              <Send size={16} /> Inscribirme ahora
            </a>
            <button className="btn btn-outline-light" onClick={() => setModal({ kind: "paper" })}>
              <FileText size={16} /> Enviar investigación
            </button>
          </div>
        </div>

        <div className="hero-stats-overlay">
          <div className="hero-stat-item">
            <span className="stat-number">25</span>
            <span className="stat-label">Noviembre<small>Inicio del congreso</small></span>
          </div>
          <div className="hero-stat-item">
            <span className="stat-number">03</span>
            <span className="stat-label">Días de encuentro<small>25 al 27 de nov</small></span>
          </div>
          <div className="hero-stat-item">
            <span className="stat-number" style={{ color: '#D4AF37' }}>06/11</span>
            <span className="stat-label">Recepción ponencias<small>¡Plazo ampliado!</small></span>
          </div>
          <div className="hero-stat-item">
            <span className="stat-number">15/11</span>
            <span className="stat-label">Inscripción asistentes<small>Fecha límite</small></span>
          </div>
        </div>
      </section>

      {/* ─── PONENTES MAGISTRALES ─── */}
      <section className="section" id="ponentes" style={{ backgroundColor: '#F0F0F0', padding: '60px clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', color: '#B38600', fontWeight: 400, marginBottom: '50px' }}>Ponentes Magistrales</h2>

          <div className="speakers-grid">
            {speakers.map((speaker, idx) => (
              <Link href={`/ponentes/${speaker.slug}`} className="speaker-card" key={`${speaker.name}-${idx}`}>
                <div className="speaker-image">
                  <Image src={speaker.img} alt={speaker.name} fill className="object-cover" />
                </div>
                <div className="speaker-name-badge">
                  {speaker.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* ─── EVENT HIGHLIGHTS ─── */}
      <section className="section" id="destacados" style={{ backgroundColor: '#F0F0F0', padding: '0 clamp(20px, 5vw, 80px) 80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', color: '#B38600', fontWeight: 400, marginBottom: '60px' }}>Aspectos Destacados</h2>

          <div className="highlights-list">

            <div className="highlight-row">
              <div className="highlight-left">
                <h3>Programa Integral</h3>
                <a href="#programa">Ver Programa &rarr;</a>
              </div>
              <div className="highlight-right">
                <p>Participa en una amplia gama de sesiones, incluyendo conferencias magistrales, presentaciones de investigaciones y talleres prácticos en la sede de la Escuela Profesional de Educación Primaria.</p>
              </div>
            </div>

            <div className="highlight-row">
              <div className="highlight-left">
                <h3>Ejes de Investigación</h3>
                <a href="#ejes">Ver Ejes &rarr;</a>
                <div className="badge-spot-left">
                  <span>5</span>
                  EJES
                </div>
              </div>
              <div className="highlight-right">
                <p>Participa en nuestras líneas de investigación centradas en innovación, inteligencia artificial y metodologías activas con expertos internacionales como <strong>Dr. Alejandro Silva y Dra. Elena Vargas</strong>.</p>
                <div className="highlight-images">
                  <Image src="/speaker_1.jpg" width={120} height={120} alt="Dr. Alejandro Silva" />
                  <Image src="/speaker_2.jpg" width={120} height={120} alt="Dra. Elena Vargas" />
                  <Image src="/theme_1_v2.jpg" width={120} height={120} alt="Eje 1" />
                  <Image src="/theme_2_v2.jpg" width={120} height={120} alt="Eje 2" />
                </div>
              </div>
            </div>

            <div className="highlight-row">
              <div className="highlight-left">
                <h3>Modalidad Híbrida y Talleres</h3>
                <a href="#inscripciones">Sobre la modalidad &rarr;</a>
              </div>
              <div className="highlight-right">
                <p>Mejora tus competencias a través de sesiones presenciales y virtuales, con salas interactivas para fomentar la colaboración y el debate científico.</p>
                <div className="highlight-images tall">
                  <Image src="/speaker_3.jpg" width={120} height={180} alt="Ph.D. Fernando Valle" />
                  <Image src="/theme_3_v2.jpg" width={120} height={180} alt="Eje 3" />
                  <Image src="/theme_4_v2.jpg" width={120} height={180} alt="Eje 4" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── MENSAJES DE AUTORIDADES ─── */}
      <AuthoritySlider />

      {/* ─── ORGANIZACIÓN ─── */}
      <section className="section" id="organizadores">
        <div className="section-header">
          <div>
            <span className="kicker">Organización</span>
            <h2>Una edición pensada<br />para dejar <em>evidencia</em></h2>
          </div>
          <p>La Subdirección de Investigación de la EPEP coordina la actividad con estándares académicos, organizacionales y tecnológicos.</p>
        </div>

        <div className="org-bento-grid">
          {/* Card 1: EPEP with anniversary image */}
          <article className="org-card-featured">
            <Image src="/aniversario_educacion.jpg" alt="Escuela Profesional de Educación Primaria" fill className="object-cover" />
            <div className="org-card-overlay">
              <span className="org-num-light">01</span>
              <div>
                <h3>Escuela Profesional de Educación Primaria</h3>
                <p>Nuestra escuela, comprometida con la excelencia y la formación integral, es la sede principal de este magno evento. Juntos hacia la acreditación y la innovación constante.</p>
              </div>
            </div>
          </article>

          <div className="org-cards-stack">
            {/* Card 2: UNAP Logo */}
            <article className="org-card-simple org-card-unap">
              <span className="org-num">02</span>
              <div className="org-logo">
                <Image src="/Logo_UNAP.png" alt="UNAP" width={85} height={85} className="object-contain" />
              </div>
              <div className="org-card-text">
                <h3>Universidad Nacional del Altiplano</h3>
                <p>Nuestra casa superior de estudios impulsando la investigación y el desarrollo de la región sur del país.</p>
              </div>
            </article>

            <div className="org-cards-row">
              <article className="org-card-simple">
                <span className="org-num">03</span>
                <div className="org-icon"><Building2 size={24} /></div>
                <div className="org-card-text">
                  <h3>Facultad de Ciencias de la Educación</h3>
                  <p>Fomentando la producción científica e intelectual.</p>
                </div>
              </article>
              <article className="org-card-simple">
                <span className="org-num">04</span>
                <div className="org-icon"><Sparkles size={24} /></div>
                <div className="org-card-text">
                  <h3>Subdirección de Investigación</h3>
                  <p>Coordinación ejecutiva y académica de la actividad investigativa.</p>
                </div>
              </article>
            </div>
          </div>
        </div>


      </section>

      {/* ─── PROGRAMA (TABS) ─── */}
      <section style={{ backgroundColor: '#FDF7E2', padding: '80px clamp(20px, 5vw, 80px)' }} id="programa">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', color: '#0F2756', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif', letterSpacing: '0.05em', marginBottom: '40px', textTransform: 'uppercase', textAlign: 'left' }}>
            PROGRAMA
          </h2>

          <div style={{ backgroundColor: '#FFF', padding: '0' }}>
            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid #EAEAEA', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {schedule.map(([dayStr], i) => {
                const parts = dayStr.toString().split(" · ");
                const dayLabel = parts[0];
                const dateLabel = parts[1];
                return (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{
                      flex: 1,
                      padding: '20px 10px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      color: activeDay === i ? '#B38600' : '#D4AF37',
                      borderBottom: activeDay === i ? '3px solid #B38600' : '3px solid transparent',
                      backgroundColor: 'transparent',
                      borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    {dayLabel} <span style={{ opacity: 0.8, fontSize: '13px' }}>({dateLabel})</span>
                  </button>
                );
              })}
            </div>

            {/* CONTENT */}
            <div style={{ padding: 'clamp(20px, 5vw, 50px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {agendaDetails[activeDay].map(([time, title, detail], idx) => (
                  <div key={idx} style={{ display: 'flex', border: '1px solid #A8B2C1', padding: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: '0 0 150px', borderRight: '1px solid #A8B2C1', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      <span style={{ color: '#B38600', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{time}</span>
                      <span style={{ color: '#B38600', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEDE EPEP</span>
                    </div>
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ color: '#444', fontSize: '18px', marginBottom: '10px' }}>{title}</span>
                      <span style={{ color: '#B38600', fontSize: '15px', fontWeight: 'bold', lineHeight: '1.5', marginBottom: '15px', textTransform: 'uppercase' }}>{detail}</span>
                      <a
                        href="#inscripciones"
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#666', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '14px' }}
                      >
                        Más Información
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ─── EJES TEMÁTICOS ─── */}
      <section className="section" id="ejes">
        <div className="section-header">
          <div>
            <span className="kicker">Ejes temáticos</span>
            <h2>Cinco rutas para<br />transformar la <em>educación</em></h2>
          </div>
          <p>Explora las líneas de investigación que estructuran nuestra convocatoria para ponencias.</p>
        </div>

        <div className="themes-accordion">
          {themes.map(([number, title, desc, icon, img]) => (
            <div className="theme-accordion-item" key={number as string}>
              <div className="theme-accordion-bg-container">
                <Image src={img as string} alt={title as string} fill className="theme-accordion-bg object-cover" />
                <div className="theme-accordion-overlay" />
              </div>
              <div className="theme-accordion-content">
                <div className="theme-accordion-header">
                  <div className="theme-icon-box">{icon}</div>
                  <span className="theme-accordion-num">{number as string}</span>
                </div>
                <div className="theme-accordion-text">
                  <h3>{title as string}</h3>
                  <p>{desc as string}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CRONOGRAMA OFICIAL Y AMPLIACIÓN DE FECHAS ─── */}
      <section style={{ backgroundColor: '#F8F9FA', padding: '80px clamp(20px, 5vw, 80px)', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }} id="fechas">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span className="kicker" style={{ justifyContent: 'center' }}>Convocatoria Oficial · Cronograma de Fechas</span>
            <h2 style={{ fontSize: '36px', color: '#0F2756', fontWeight: 'bold', margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Ampliación de Plazos y Fechas Clave
            </h2>
            <p style={{ color: '#4A5568', fontSize: '15px', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
              Compartimos el cronograma oficial actualizado con la ampliación de plazos para recepción de ponencias, evaluación por el comité científico e inscripción de asistentes y delegaciones.
            </p>
          </div>

          {/* Grid de 4 Hitos Cronológicos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px', textAlign: 'left' }}>
            
            {/* Hito 1: Recepción de Ponencias */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '24px 20px', border: '2px solid #D4AF37', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                ¡Plazo ampliado!
              </div>
              <span style={{ fontSize: '12px', color: '#B38600', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 1 · Envío</span>
              <p style={{ color: '#0F2756', fontSize: '26px', fontWeight: 'bold', margin: '6px 0 4px' }}>Hasta 06 Nov</p>
              <h3 style={{ fontSize: '16px', color: '#0F2756', fontWeight: 600, marginBottom: '8px' }}>Recepción de Ponencias</h3>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                Envío de investigaciones en formato PDF en cualquiera de los 5 ejes temáticos del congreso.
              </p>
            </div>

            {/* Hito 2: Evaluación por Comité Científico */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '24px 20px', border: '1px solid #CBD5E1', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', color: '#0F2756', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 2 · Revisión</span>
              <p style={{ color: '#0F2756', fontSize: '26px', fontWeight: 'bold', margin: '6px 0 4px' }}>07, 08 y 09 Nov</p>
              <h3 style={{ fontSize: '16px', color: '#0F2756', fontWeight: 600, marginBottom: '8px' }}>Evaluación por Comité Científico</h3>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                Revisión académica a cargo de los evaluadores: <strong>Dr. Vidnay, Dra. Danitza, Dra. Katia y Dr. Estanislao</strong>.
              </p>
            </div>

            {/* Hito 3: Notificación de Aptas */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '24px 20px', border: '1px solid #CBD5E1', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', color: '#0F2756', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 3 · Resultados</span>
              <p style={{ color: '#0F2756', fontSize: '26px', fontWeight: 'bold', margin: '6px 0 4px' }}>10 y 11 Nov</p>
              <h3 style={{ fontSize: '16px', color: '#0F2756', fontWeight: 600, marginBottom: '8px' }}>Notificación de Ponencias Aptas</h3>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                Comunicación oficial de resultados a los autores de las ponencias seleccionadas para su exposición.
              </p>
            </div>

            {/* Hito 4: Pagos y Asistentes */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '24px 20px', border: '1px solid #CBD5E1', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 4 · Formalización</span>
              <p style={{ color: '#0F2756', fontSize: '26px', fontWeight: 'bold', margin: '6px 0 4px' }}>Hasta 15 Nov</p>
              <h3 style={{ fontSize: '16px', color: '#0F2756', fontWeight: 600, marginBottom: '8px' }}>Pagos de Ponencias y Asistentes</h3>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                Plazo final para pagos de ponencias aprobadas e inscripción de asistentes individuales y delegaciones corporativas.
              </p>
            </div>

          </div>

          {/* Aviso Destacado: Flujo de Ponentes */}
          <div style={{ backgroundColor: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>📢</span>
            <div>
              <strong style={{ color: '#1E3A8A', fontSize: '15px', display: 'block', marginBottom: '3px' }}>
                Regla para ponentes: Envío de investigación antes del pago
              </strong>
              <p style={{ color: '#1E40AF', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                Todos los ponentes deben enviar primero su trabajo de investigación (plazo hasta el 06 de noviembre). <strong>Únicamente cuando el Comité Científico evalúe y notifique que la investigación es APTA / APROBADA (10 y 11 de noviembre), recién procederán a realizar el pago de inscripción de S/ 100.00</strong> (plazo de pago hasta el 15 de noviembre).
              </p>
            </div>
          </div>

          {/* Banner de Acuerdos y Condiciones */}
          <div style={{ backgroundColor: '#FFF9E6', border: '1px solid #F3C944', borderRadius: '14px', padding: '22px 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Award size={22} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0F2756', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Certificación para todos los autores</strong>
                <p style={{ color: '#555', fontSize: '13px', margin: 0, lineHeight: '1.45' }}>
                  Certificación oficial individual como ponente para cada autor del trabajo de investigación presentado (monto de S/ 100.00 por cada autor).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Globe size={22} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0F2756', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Ponencias en Modalidad Híbrida</strong>
                <p style={{ color: '#555', fontSize: '13px', margin: 0, lineHeight: '1.45' }}>
                  Participación presencial y virtual para ponentes nacionales e internacionales con transmisión en vivo y salas de sustentación interactivas.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Users size={22} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0F2756', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Egresados y Pago Corporativo</strong>
                <p style={{ color: '#555', fontSize: '13px', margin: 0, lineHeight: '1.45' }}>
                  Los egresados se inscriben con la tarifa de asistente externo. Grupos de 10 a más participantes acceden a un 20% de descuento corporativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ backgroundColor: '#EBEBEB', padding: '80px clamp(20px, 5vw, 80px)', textAlign: 'center' }} id="inscripciones">
        <h2 style={{ fontSize: '38px', color: '#0F2756', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif', letterSpacing: '0.05em', marginBottom: '50px', textTransform: 'uppercase' }}>
          TARIFAS DE INSCRIPCIÓN
        </h2>

        <div className="registration-cards-grid">

          {registrationCategories.map((category) => {
            const { title, fee, features, role: badge, mode, image: img } = category;
            const price = fee === 0 ? "Gratuita" : formatCurrency(fee);
            return (
              <div
                key={category.id}
                style={{
                  backgroundColor: '#FFF',
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid var(--border, rgba(15, 39, 86, 0.1))',
                  boxShadow: 'var(--shadow-sm, 0 4px 16px rgba(15, 39, 86, 0.05))',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                <h3 style={{ color: '#B38600', fontSize: '18px', fontWeight: 'bold', minHeight: '50px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  {title}
                </h3>

                <p style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', minHeight: '20px' }}>{badge}</p>
                <span className="registration-mode-badge">
                  {mode === "Presencial" ? <MapPin size={14} aria-hidden="true" /> : <Globe size={14} aria-hidden="true" />}
                  {mode}
                </span>

                <div style={{ flex: 1, position: 'relative', minHeight: '180px', marginBottom: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image src={img} alt={title as string} fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
                </div>

                <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '100px' }}>
                  {features.map((feat, i) => (
                    <p key={i} style={{ color: '#444', fontSize: '14px', marginBottom: '8px', lineHeight: '1.4', display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#B38600' }}>•</span> <span>{feat}</span>
                    </p>
                  ))}
                </div>

                {category.id === "speaker_external" && (
                  <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#92400E', textAlign: 'left', marginBottom: '14px', lineHeight: '1.4' }}>
                    <strong>📢 Flujo de inscripción:</strong> Primero envía tu investigación. El pago se realiza <strong>únicamente si tu ponencia es aprobada</strong> por el Comité Científico (10 y 11 de nov).
                  </div>
                )}

                {category.id === "attendee_external" && (
                  <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#0369A1', textAlign: 'left', marginBottom: '14px', lineHeight: '1.4' }}>
                    <strong>🎓 Incluye a Egresados:</strong> Los egresados de la EPEP / UNAP y otras instituciones participan con esta tarifa y reciben certificación oficial.
                  </div>
                )}

                <p style={{ color: fee === 0 ? '#176244' : '#B38600', fontSize: '24px', fontWeight: 'bold', margin: '10px 0 20px' }}>{price}</p>
                {fee > 0 ? (
                  <p className="registration-fee-note">Cargo institucional: {formatCurrency(getInstitutionalFee(category))} · Total: {formatCurrency(getRegistrationTotal(category))}</p>
                ) : (
                  <p className="registration-fee-note" style={{ color: '#176244', fontWeight: 600 }}>Exonerado de pago · Comunidad EPEP</p>
                )}
                <button
                  type="button"
                  onClick={() => setModal({ kind: "registration", categoryId: category.id })}
                  style={{ border: '1px solid #B38600', backgroundColor: '#FFF', color: '#B38600', padding: '12px', width: '100%', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', marginTop: 'auto' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#B38600'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; e.currentTarget.style.color = '#B38600'; }}
                >
                  Más Información
                </button>
              </div>
            );
          })}

          {/* ─── TARJETA DE PAGO CORPORATIVO ─── */}
          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#FFF',
              padding: '35px clamp(20px, 4vw, 40px)',
              borderRadius: '16px',
              border: '2px solid #D4AF37',
              boxShadow: 'var(--shadow-sm, 0 4px 16px rgba(15, 39, 86, 0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
              <div>
                <span style={{ display: 'inline-block', backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#B38600', fontWeight: 'bold', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Grupos y Delegaciones
                </span>
                <h3 style={{ color: '#0F2756', fontSize: '24px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
                  Pago Corporativo (20% de Descuento)
                </h3>
              </div>
              <span className="registration-mode-badge" style={{ margin: 0 }}>
                <Globe size={14} aria-hidden="true" />
                Presencial / Híbrido
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', alignItems: 'center', borderTop: '1px solid #ECECEC', paddingTop: '20px' }}>
              <div>
                <p style={{ color: '#444', fontSize: '15px', lineHeight: '1.6', marginBottom: '14px' }}>
                  Beneficio especial para instituciones educativas, universidades, colegios profesionales y delegaciones académicas:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#444', fontSize: '14px', margin: 0, display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#B38600', fontWeight: 'bold' }}>•</span>
                    <span><strong>Mínimo de 10 a más participantes:</strong> 20% de descuento sobre el monto total de inscripción.</span>
                  </p>
                  <p style={{ color: '#444', fontSize: '14px', margin: 0, display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#B38600', fontWeight: 'bold' }}>•</span>
                    <span><strong>Delegaciones mayores o convenios:</strong> Si son más participantes o requieren convenio institucional, pueden coordinar directamente con la comisión.</span>
                  </p>
                  <p style={{ color: '#444', fontSize: '14px', margin: 0, display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#B38600', fontWeight: 'bold' }}>•</span>
                    <span>Certificación oficial individual para cada participante de la delegación.</span>
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#FBF9F3', border: '1px solid #EADBBA', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#856400', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarifa especial para grupos</span>
                  <p style={{ color: '#B38600', fontSize: '28px', fontWeight: 'bold', margin: '4px 0 2px' }}>20% DCTO.</p>
                  <small style={{ color: '#666', fontSize: '12px' }}>Válido a partir de 10 participantes registrados</small>
                </div>

                <div style={{ borderTop: '1px dashed #D4AF37', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F2756' }}>Contactos para coordinar pago corporativo:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '13px' }}>
                    <a href="https://wa.me/51982311128?text=Hola%20Dra.%20Ruth%2C%20solicito%20informaci%C3%B3n%20para%20el%20Pago%20Corporativo%20(descuento%20del%2020%25)%20para%20un%20grupo%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ color: '#0D5E36', fontWeight: 600, textDecoration: 'underline' }}>Dra. Ruth: 982 311 128</a>
                    <span>·</span>
                    <a href="https://wa.me/51961441879?text=Hola%20Dra.%20Rossy%2C%20solicito%20informaci%C3%B3n%20para%20el%20Pago%20Corporativo%20(descuento%20del%2020%25)%20para%20un%20grupo%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ color: '#0D5E36', fontWeight: 600, textDecoration: 'underline' }}>Dra. Rossy: 961 441 879</a>
                    <span>·</span>
                    <a href="https://wa.me/51964328207?text=Hola%20Mg.%20Juan%2C%20solicito%20informaci%C3%B3n%20para%20el%20Pago%20Corporativo%20(descuento%20del%2020%25)%20para%20un%20grupo%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ color: '#0D5E36', fontWeight: 600, textDecoration: 'underline' }}>Mg. Juan: 964 328 207</a>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setModal({ kind: "corporate" })}
                    style={{
                      backgroundColor: '#B38600',
                      color: '#FFF',
                      padding: '13px 18px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#8F6B00'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#B38600'; }}
                  >
                    <Users size={17} /> Inscribir Delegación (Formulario)
                  </button>

                  <a
                    href="https://wa.me/51982311128?text=Hola%20Dra.%20Ruth%2C%20solicito%20informaci%C3%B3n%20para%20el%20Pago%20Corporativo%20(descuento%20del%2020%25)%20para%20un%20grupo%20al%20IV%20Congreso."
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      border: '1px solid #B38600',
                      backgroundColor: '#FFF',
                      color: '#B38600',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF8E7'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; }}
                  >
                    <Phone size={14} /> Consultar previamente por WhatsApp (Dra. Ruth)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── CONTACTO ─── */}
      <section className="section contact-section" id="contacto">
        <div>
          <span className="kicker">Mesa de ayuda</span>
          <h2>¿Conversamos?</h2>
          <p>La Subdirección de Investigación y la Comisión Organizadora coordinan las consultas sobre registro, ponencias, pagos corporativos y certificación.</p>
        </div>

        <div className="contact-links">
          <a
            className="contact-link"
            href="https://wa.me/51982311128?text=Hola%20Dra.%20Ruth%2C%20tengo%20una%20consulta%20sobre%20el%20IV%20Congreso."
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={18} /> Dra. Ruth · 982 311 128 (WhatsApp) <ArrowUpRight size={15} />
          </a>
          <a
            className="contact-link"
            href="https://wa.me/51961441879?text=Hola%20Dra.%20Rossy%2C%20tengo%20una%20consulta%20sobre%20el%20IV%20Congreso."
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={18} /> Dra. Rossy · 961 441 879 (WhatsApp) <ArrowUpRight size={15} />
          </a>
          <a
            className="contact-link"
            href="https://wa.me/51964328207?text=Hola%20Mg.%20Juan%2C%20tengo%20una%20consulta%20sobre%20el%20IV%20Congreso."
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={18} /> Mg. Juan · 964 328 207 (WhatsApp) <ArrowUpRight size={15} />
          </a>
          <a className="contact-link" href="mailto:subdireccion.investigacion.epep@unap.edu.pe">
            <Building2 size={18} /> Subdirección de Investigación EPEP <ArrowUpRight size={15} />
          </a>
          <a
            className="contact-link"
            href="https://www.facebook.com/photo?fbid=1657938369673922&set=a.440134708120967"
            target="_blank"
            rel="noreferrer"
          >
            <CircleHelp size={18} /> Publicación oficial del congreso <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <span>© 2026 EPEP · IV Congreso Internacional de Investigación Científica</span>
        <span>25—27 noviembre · Modalidad híbrida</span>
      </footer>

      {/* ─── MODAL ─── */}
      {modal?.kind === "corporate" && (
        <CorporateModal onClose={() => setModal(null)} />
      )}
      {modal && modal.kind !== "corporate" && (
        <RequestModal modal={modal} onClose={() => setModal(null)} />
      )}
    </main>
  );
}
