"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Menu,
  Send,
  Sparkles,
  Users,
  X,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Heart,
  Globe,
} from "lucide-react";

/* ────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────── */

const institutions = [
  "Subdirección de Investigación",
  "Escuela Profesional de Educación Primaria",
  "Facultad de Ciencias de la Educación",
  "Universidad Nacional del Altiplano de Puno",
];

const honorCommittee = [
  "Dr. Efraín Humberto Yupanqui Pino · Decano de la Facultad",
  "Dr. Henry Mark Vilca Apaza · Director de la EPEP",
  "Dra. Ruth Mery Cruz Huisa · Subdirectora de Investigación",
];

const committee = [
  "Dra. Ruth Mery Cruz Huisa · Presidencia",
  "M.Sc. Ofelia Marleny Mamani Apaza · Secretaría técnica",
  "Dr. Vidnay Noel Valero Ancco · Coordinación académica",
  "Dr. Lesy Berly Leon Hancco · Tecnología",
  "Dr. Estanislao Pacompia Cari · Logística",
  "Dra. Zaida Esther Callata Gallegos · Protocolo",
  "Dr. Juan Alexander Condori Palomino · Comunicaciones",
  "M.Sc. Juan Carlos Callomani · Publicaciones",
  "Dr. Wido Willan Condori Castillo · Coordinación financiera",
  "Dra. Katia Perez Argollo · Certificaciones",
  "M.Sc. Milciades Conrado Suaña Calsin · Bienestar",
];

const committeeMembers = [
  "Dr. Humberto Mamani Coaquira",
  "Dra. Danitza Luisa Sardón Ari",
  "Dr. Fredy Sosa Gutierrez",
  "M.Sc. Jose Antonio Supo Gutierrez",
  "Dr. Jose Marcial Mamani Condori",
  "Dra. Damiana Flores Mamani",
  "Dra. Yesica Dominga Diaz Vilcanqui",
];

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
  ["01", "Investigación educativa y producción científica", "Investigación cuantitativa, cualitativa y mixta; investigación-acción; ética e integridad científica; tesis, publicaciones y divulgación.", <BookOpen size={22} />, "/theme_1_v2.jpg"],
  ["02", "Inteligencia artificial, tecnologías digitales y educación", "IA generativa, competencias digitales, analítica del aprendizaje, entornos virtuales, personalización y uso responsable de la IA.", <BrainCircuit size={22} />, "/theme_2_v2.jpg"],
  ["03", "Innovación pedagógica, currículo y evaluación", "Metodologías activas, ABP, gamificación, aprendizaje colaborativo, currículo por competencias y evaluación formativa.", <Lightbulb size={22} />, "/theme_3_v2.jpg"],
  ["04", "Formación docente, inclusión e interculturalidad", "Formación inicial y continua, desempeño docente, educación inclusiva, diversidad, interculturalidad, EIB y educación rural.", <Heart size={22} />, "/theme_4_v2.jpg"],
  ["05", "Gestión educativa, bienestar y desarrollo sostenible", "Liderazgo, calidad, políticas educativas, convivencia, bienestar socioemocional, ciudadanía y educación ambiental.", <Globe size={22} />, "/theme_5_v2.jpg"],
];

const planningPanels = {
  actividades: ["Planificación · agosto 2026", "Organización académica · agosto a noviembre", "Convocatoria y difusión · agosto a noviembre", "Inscripciones · setiembre a noviembre", "Evaluación de ponencias · octubre a noviembre", "Tecnología híbrida · noviembre", "Logística y protocolo · noviembre", "Desarrollo del congreso · 25 al 27 de noviembre", "Certificación y publicaciones · noviembre a diciembre", "Cierre y evaluación · diciembre 2026"],
  recursos: ["Plataforma Zoom Webinar o Microsoft Teams", "Transmisión simultánea por YouTube o Facebook Live", "Internet dedicado y red de respaldo", "Cámaras, consola de audio, micrófonos y grabación", "UPS o grupo electrógeno", "Credenciales, carpetas, lapiceros y señalética", "Equipos de protocolo, atención, fotografía y video"],
  calidad: ["Ejecución de actividades programadas: meta ≥ 95 %", "Continuidad de transmisión híbrida: meta ≥ 98 %", "Ponencias evaluadas antes de su programación: 100 %", "Satisfacción general: meta ≥ 90 % favorable", "Certificados emitidos y validados: 100 %", "Informe final y memoria académica: 1 de cada producto", "Acciones de mejora priorizadas: al menos 3"],
  gestion: ["Presupuesto referencial total: S/ 4,500.00", "Honorarios o reconocimiento a conferencistas: S/ 2,000.00", "Soporte técnico, streaming y conectividad: S/ 600.00", "Registro audiovisual: S/ 250.00 · diseño e impresión: S/ 250.00", "Materiales, credenciales, señalética y protocolo: S/ 1,300.00", "Financiamiento: ingresos por inscripciones y/o recursos institucionales"],
  riesgos: ["Falla de internet: conexión principal y respaldo, pruebas previas", "Falla de energía: UPS o grupo electrógeno", "Ausencia de conferencista: confirmación 72/24 h antes y alterno", "Problemas de audio o video: pruebas individuales y equipos de respaldo", "Baja participación: difusión segmentada, recordatorios y alianzas", "Falta de evidencias: archivo por coordinación y entrega máx. 48 h"],
};

const costs: [string, string, string[], string][] = [
  ["Estudiante EPEP", "S/ 20.00", ["Acceso a todas las conferencias", "Certificado de asistente", "Material del congreso"], "Asistente Interno"],
  ["Estudiante Externo", "S/ 30.00", ["Acceso a todas las conferencias", "Certificado de asistente", "Material del congreso"], "Público General"],
  ["Ponente Externo", "S/ 100.00", ["Derecho a ponencia", "Certificado de ponente", "Publicación en la memoria del congreso"], "Investigadores"],
  ["Asistente Externo", "S/ 70.00", ["Acceso a todas las conferencias", "Certificado de asistente", "Kit de bienvenida"], "Público General"],
  ["Docente EPEP", "S/ 0.00", ["Derecho a ponencia", "Certificado de ponente", "Acceso prioritario"], "Ponente Interno"],
  ["Estudiante EPEP", "S/ 0.00", ["Derecho a ponencia", "Certificado de ponente", "Mentoría académica"], "Ponente Interno"],
];

const speakers = [
  [
    "Dr. Alejandro Silva", 
    "Doctor en Tecnologías Educativas, Universidad de Barcelona.", 
    "Investigador principal en tecnologías emergentes para el aula. Explorará cómo las herramientas de IA están redefiniendo el rol del docente.",
    "/speaker_1.jpg",
    "Inteligencia Artificial y Educación del Futuro"
  ],
  [
    "Dra. Elena Vargas", 
    "Especialista en Innovación Pedagógica, Tecnológico de Monterrey.", 
    "Experta en políticas públicas y adaptación curricular para las nuevas generaciones. Presentará estrategias clave para la inclusión.",
    "/speaker_2.jpg",
    "Innovación en el Currículo Escolar"
  ],
  [
    "Ph.D. Fernando Valle", 
    "Catedrático e Investigador Senior, Universidad de Buenos Aires.", 
    "Reconocido educador con más de 30 años de experiencia. Compartirá casos de éxito en la implementación de aprendizaje basado en proyectos.",
    "/speaker_3.jpg",
    "Metodologías Activas e Inclusivas"
  ]
];

type ModalState = { kind: "registration" | "paper"; category?: string } | null;

/* ────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────── */

export default function Home() {
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [activePanel, setActivePanel] = useState<keyof typeof planningPanels>("actividades");
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

  const renderListMember = (member: string) => {
    const parts = member.split("·");
    const name = parts[0].trim();
    const role = parts.length > 1 ? parts[1].trim() : "Miembro";
    return (
      <div className="directory-item" key={member}>
        <h4>{name}</h4>
        <span>{role}</span>
      </div>
    );
  };

  return (
    <main>
      {/* ─── NAVBAR ─── */}
      <header className="topbar" ref={headerRef}>
        <a className="brand" href="#inicio" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Image src="/logosecu.png" alt="Escudo EPEP" width={36} height={36} />
          </span>
          <span className="brand-text">
            <strong>IV Congreso Internacional</strong>
            <small>EPEP · Investigación Científica</small>
          </span>
        </a>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#organizadores" onClick={() => setMenuOpen(false)}>Organización</a>
          <a href="#programa" onClick={() => setMenuOpen(false)}>Programa</a>
          <a href="#ejes" onClick={() => setMenuOpen(false)}>Ejes</a>
          <a href="#inscripciones" onClick={() => setMenuOpen(false)}>Inscripciones</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
        </nav>

        <div className="top-actions">
          <button
            className="icon-button mobile-menu"
            title="Abrir menú"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={20} />
          </button>
          <button className="btn btn-primary btn-compact" onClick={() => setModal({ kind: "registration" })}>
            <ArrowUpRight size={16} />
            <span>Inscribirme</span>
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="hero" id="inicio">
        <div className="mesh-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            <span>Convocatoria abierta · 2026</span>
          </div>

          <h1>
            IV Congreso Internacional<br />
            de <em>Investigación Científica</em>
          </h1>

          <p className="hero-subtitle">
            Transformando la educación: investigación, innovación e inteligencia artificial
            para los desafíos del siglo XXI.
          </p>

          <Countdown />

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setModal({ kind: "registration" })}>
              <Send size={16} /> Inscribirme ahora
            </button>
            <button className="btn btn-outline" onClick={() => setModal({ kind: "paper" })}>
              <FileText size={16} /> Enviar ponencia
            </button>
          </div>

          <div className="hero-meta">
            <span className="hero-meta-item">
              <CalendarDays size={15} /> 25–27 noviembre 2026
            </span>
            <span className="hero-meta-item">
              <MapPin size={15} /> UNA Puno, Perú
            </span>
            <span className="hero-meta-item">
              <Users size={15} /> Modalidad híbrida
            </span>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="stats-row" aria-label="Datos destacados">
        <div>
          <span className="stat-number">25</span>
          <span className="stat-label">Noviembre<small>Inicio del congreso</small></span>
        </div>
        <div>
          <span className="stat-number">03</span>
          <span className="stat-label">Días de encuentro<small>25 al 27 de noviembre</small></span>
        </div>
        <div>
          <span className="stat-number">30/10</span>
          <span className="stat-label">Recepción de trabajos<small>Fecha límite</small></span>
        </div>
        <div>
          <span className="stat-number">05</span>
          <span className="stat-label">Ejes temáticos<small>Investigación e innovación</small></span>
        </div>
      </section>

      {/* ─── SHOWCASE / PRESENTACIÓN ─── */}
      <section className="section showcase" id="programa">
        <div className="showcase-inner showcase-split">
          <div className="showcase-content">
            <span className="kicker">Presentación</span>
            <h2>Investigación, innovación e IA<br />para educar <em>mejor</em></h2>
            <p>
              El congreso fortalece la cultura investigativa, la producción científica y el
              intercambio de conocimientos entre investigadores, docentes, estudiantes y profesionales.
            </p>
            <div className="features-list">
              <article className="feature-list-item">
                <div className="feature-icon"><Sparkles size={20} /></div>
                <div>
                  <strong>Objetivo académico</strong>
                  <p>Coordinar actividades con estándares de calidad verificables.</p>
                </div>
              </article>
              <article className="feature-list-item">
                <div className="feature-icon"><GraduationCap size={20} /></div>
                <div>
                  <strong>Modalidad híbrida</strong>
                  <p>Conferencias y ponencias presenciales y virtuales con soporte.</p>
                </div>
              </article>
              <article className="feature-list-item">
                <div className="feature-icon"><FileText size={20} /></div>
                <div>
                  <strong>Resultados esperados</strong>
                  <p>Producción evaluada, memoria, certificados e informe final.</p>
                </div>
              </article>
            </div>
          </div>
          
          <div className="showcase-visual">
            <div className="showcase-image-wrapper">
              <Image src="/congreso.png" alt="Presentación Congreso" fill className="object-cover" />
              <div className="showcase-badge">
                <span className="dot"></span>
                <span>Innovación Educativa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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

        <section className="team-section glass-team-section" id="equipo">
          <div className="team-mesh-bg" />
          
          <div className="section-header" style={{ alignItems: "center", textAlign: "center", marginBottom: "40px", position: "relative", zIndex: 10 }}>
            <span className="kicker">Nuestro Equipo</span>
            <h2>Autoridades y Coordinación</h2>
          </div>
          
          <div className="glass-team-layout">
             {/* Panel Izquierdo */}
             <div className="glass-panel left-panel">
                <h3 className="glass-title">Comité Organizador</h3>
                <div className="glass-list">
                   {committee.map(renderListMember)}
                </div>
             </div>

             {/* Centro: Decano */}
             <div className="glass-center-portrait">
                <div className="dean-glass-avatar">
                   <Image src="/autoridades/efrain_yupanqui.jpg" alt="Dr. Efraín Humberto Yupanqui Pino" fill className="object-cover object-top" />
                </div>
                <div className="dean-glass-info">
                   <span className="kicker" style={{ color: "var(--teal)" }}>Presidencia Honoraria</span>
                   <h2>Dr. Efraín Humberto Yupanqui Pino</h2>
                   <p>Decano de la Facultad</p>
                </div>
             </div>

             {/* Panel Derecho */}
             <div className="glass-panel right-panel">
                <h3 className="glass-title">Equipo y Comité de Honor</h3>
                <div className="glass-list">
                   {honorCommittee.slice(1).map(renderListMember)}
                   {committeeMembers.map(renderListMember)}
                </div>
             </div>
          </div>
        </section>
      </section>

      {/* ─── AGENDA (CARRUSEL) ─── */}
      <section className="section schedule-carousel-section" id="programa">
        <div className="section-header" style={{ alignItems: "center", textAlign: "center", marginBottom: "48px" }}>
          <span className="kicker">Agenda oficial</span>
          <h2>Tres días para compartir <em>saberes</em></h2>
          <p style={{ maxWidth: "600px", marginTop: "16px" }}>El cronograma oficial combina inauguración, conferencias, ponencias y clausura en la sede de la EPEP.</p>
        </div>

        <div className="carousel-container">
          <div className="carousel-slide">
            <div className="carousel-image">
              <Image 
                key={`img-${activeDay}`} 
                src={schedule[activeDay][3] as string} 
                alt="Día del Congreso" 
                fill 
                className="object-cover fade-in" 
              />
              <div className="day-overlay-gradient" />
              
              {/* Navigation overlaying the image */}
              <div className="carousel-nav-overlay">
                {schedule.map(([dayStr], i) => (
                  <button 
                    key={`nav-${i}`} 
                    className={`carousel-dot ${i === activeDay ? 'active' : ''}`}
                    onClick={() => setActiveDay(i)}
                  >
                    {dayStr.toString().split("·")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="carousel-details fade-in" key={`det-${activeDay}`}>
              <span className="slide-date">{schedule[activeDay][0]}</span>
              <h3 className="slide-title">{schedule[activeDay][1]}</h3>
              <p className="slide-desc">{schedule[activeDay][2]}</p>
              
              <div className="slide-timeline">
                {agendaDetails[activeDay].map(([time, title, detail]) => (
                  <div className="slide-timeline-item" key={time as string}>
                    <span className="slide-time">{time}</span>
                    <div className="slide-timeline-content">
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PONENTES ─── */}
      <section className="section" id="ponentes">
        <div className="section-header" style={{ marginBottom: "60px", textAlign: "center", alignItems: "center" }}>
          <span className="kicker">Ponentes magistrales</span>
          <h2>Voces expertas que<br />inspiran el <em>cambio</em></h2>
          <p style={{ maxWidth: "600px", marginTop: "16px" }}>Conoce a los investigadores y educadores internacionales que liderarán las conferencias magistrales del congreso.</p>
        </div>

        <div className="speakers-marquee-container">
          <div className="speakers-marquee-track">
            {[...speakers, ...speakers].map(([name, role, desc, img, topic], idx) => (
              <div className="speaker-runway-card" key={`${name}-${idx}`}>
                <div className="speaker-runway-image">
                  <Image src={img as string} alt={name as string} fill className="object-cover" />
                </div>
                <div className="speaker-runway-info">
                  <span className="speaker-topic">{topic as string}</span>
                  <h3>{name as string}</h3>
                  <strong className="speaker-role">{role as string}</strong>
                  <p className="speaker-desc">{desc as string}</p>
                </div>
              </div>
            ))}
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

      {/* ─── PLAN DEL CONGRESO ─── */}
      <section className="section planning-section" id="planificacion">
        <div className="section-header">
          <div>
            <span className="kicker">Plan del congreso</span>
            <h2>Una gestión que se<br />puede <em>verificar</em></h2>
          </div>
          <p>Explora las actividades, recursos e indicadores previstos para el evento.</p>
        </div>

        <div className="planning-layout">
          <div className="planning-nav" role="tablist" aria-label="Información del plan">
            {(Object.keys(planningPanels) as Array<keyof typeof planningPanels>).map((panel) => (
              <button
                className={activePanel === panel ? "planning-nav-btn active" : "planning-nav-btn"}
                key={panel}
                onClick={() => setActivePanel(panel)}
                role="tab"
                aria-selected={activePanel === panel}
              >
                {panel === "actividades" ? "Actividades" : panel === "recursos" ? "Recursos" : panel === "calidad" ? "Calidad" : panel === "gestion" ? "Gestión" : "Riesgos"}
              </button>
            ))}
          </div>
          <div className="planning-items" key={activePanel}>
            {planningPanels[activePanel].map((item, i) => (
              <div className="planning-item" key={item}>
                <span className="planning-idx">{String(i + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSCRIPCIONES ─── */}
      <section className="section pricing-section" id="inscripciones">
        <div className="pricing-header">
          <span className="kicker">Inscripciones oficiales</span>
          <h2>Participa en el<br />encuentro <em>académico</em></h2>
          <p>
            La recepción de trabajos estará abierta hasta el 30 de octubre de 2026.
            Selecciona tu categoría para iniciar la inscripción.
          </p>
        </div>

        <div className="pricing-plans-grid">
          {costs.map(([title, price, features, badge], idx) => (
            <div className="pricing-plan-card" key={`${title}-${idx}`} onClick={() => setModal({ kind: "registration", category: title })}>
              <div className="pricing-plan-header">
                <span className="pricing-plan-badge">{badge}</span>
                <h3 className="pricing-plan-title">{title}</h3>
                <div className="pricing-plan-price">
                  <span className="currency">S/</span>
                  <span className="amount">{price.replace("S/ ", "")}</span>
                </div>
              </div>
              <ul className="pricing-plan-features">
                {features.map((feat, i) => (
                  <li key={i}><CheckCircle2 size={18} className="feature-icon" /> {feat}</li>
                ))}
              </ul>
              <button className="pricing-plan-btn">
                Inscribirse ahora <ArrowUpRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACTO ─── */}
      <section className="section contact-section" id="contacto">
        <div>
          <span className="kicker">Mesa de ayuda</span>
          <h2>¿Conversamos?</h2>
          <p>La Subdirección de Investigación coordina las consultas sobre registro, ponencias, soporte y certificación.</p>
        </div>

        <div className="contact-links">
          <a
            className="contact-link"
            href="https://www.facebook.com/photo?fbid=1657938369673922&set=a.440134708120967"
            target="_blank"
            rel="noreferrer"
          >
            <CircleHelp size={18} /> Publicación oficial del congreso <ArrowUpRight size={15} />
          </a>
          <a className="contact-link" href="mailto:subdireccion.investigacion.epep@unap.edu.pe">
            <Building2 size={18} /> Subdirección de Investigación EPEP <ArrowUpRight size={15} />
          </a>
          <a className="contact-link" href="#inscripciones">
            <Send size={18} /> Consultar inscripción y ponencias <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <span>© 2026 EPEP · IV Congreso Internacional de Investigación Científica</span>
        <span>25—27 noviembre · Modalidad híbrida</span>
      </footer>

      {/* ─── MODAL ─── */}
      {modal && <RequestModal modal={modal} onClose={() => setModal(null)} />}
    </main>
  );
}

/* ────────────────────────────────────────────────
   COUNTDOWN
   ──────────────────────────────────────────────── */

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-11-25T09:00:00").getTime();
    const update = () => {
      const now = Date.now();
      const distance = target - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown">
      {[
        [timeLeft.days, "Días"],
        [timeLeft.hours, "Horas"],
        [timeLeft.minutes, "Min"],
        [timeLeft.seconds, "Seg"],
      ].map(([value, label]) => (
        <div className="countdown-unit" key={label as string}>
          <div className="value">{String(value).padStart(2, "0")}</div>
          <span className="label">{label as string}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   REGISTRATION MODAL
   ──────────────────────────────────────────────── */

function RequestModal({ modal, onClose }: { modal: NonNullable<ModalState>; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const isPaper = modal.kind === "paper";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.append("kind", modal.kind);
    if (modal.category) formData.append("category", modal.category);

    const response = await fetch("/api/requests", {
      method: "POST",
      body: formData, // Enviar FormData directamente (browser pone el boundary)
    });

    if (!response.ok) {
      const resData = await response.json().catch(() => ({}));
      setError(resData.error || "No pudimos registrar la solicitud. Revisa tus datos y el archivo (PDF).");
      return;
    }
    setSent(true);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="icon-button modal-close" title="Cerrar" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>

        {sent ? (
          <div className="success">
            <span><Check size={28} /></span>
            <h2>Solicitud recibida</h2>
            <p>La Secretaría revisará tus datos y te contactará pronto en el correo indicado.</p>
            <button className="btn btn-primary btn-full" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <span className="kicker">{isPaper ? "Call for papers" : "Registro"}</span>
            <h2 id="modal-title">{isPaper ? "Presenta tu investigación." : "Reserva tu lugar."}</h2>
            <p className="modal-intro">
              {isPaper
                ? "Cuéntanos brevemente sobre tu propuesta y sube tu investigación (PDF)."
                : "Déjanos tus datos y te enviaremos los pasos para completar tu inscripción."}
            </p>
            {modal.category && (
               <div style={{ marginBottom: "16px", padding: "12px", background: "var(--primary-dim)", borderRadius: "var(--radius-sm)", color: "var(--primary)", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(15,39,86,0.1)" }}>
                 Entrada: {modal.category}
               </div>
            )}
            <form onSubmit={submit}>
              <label>Nombre completo<input name="name" required /></label>
              <label>Correo electrónico<input name="email" type="email" required /></label>
              <label>Institución<input name="institution" /></label>
              {isPaper && <label>Título o eje de la ponencia<input name="topic" required /></label>}
              <label>
                Modalidad
                <select name="mode">
                  <option>Presencial</option>
                  <option>Virtual</option>
                </select>
              </label>
              {isPaper && (
                <>
                  <label>Resumen breve<textarea name="message" rows={3} /></label>
                  <label>
                    Sube tu investigación (PDF)
                    <input type="file" name="file" accept=".pdf" required style={{ border: "none", padding: "12px 0" }} />
                  </label>
                </>
              )}
              <button className="btn btn-primary btn-full" type="submit">
                <Send size={16} /> Enviar solicitud
              </button>
              {error && <p className="form-error">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
