"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
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
  ["DÍA 01 · 25 NOV", "Apertura y conferencia magistral", "Acreditación · ceremonia inaugural · panel de investigadores · ponencias paralelas"],
  ["DÍA 02 · 26 NOV", "Investigación e innovación", "Conferencias magistrales · mesas temáticas · simposios · talleres · foro internacional"],
  ["DÍA 03 · 27 NOV", "Conclusiones y clausura", "Conferencias finales · premiación de investigaciones · clausura · fotografía oficial"],
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

const themes: [string, string, string, React.ReactNode][] = [
  ["01", "Investigación educativa y producción científica", "Investigación cuantitativa, cualitativa y mixta; investigación-acción; ética e integridad científica; tesis, publicaciones y divulgación.", <BookOpen size={22} />],
  ["02", "Inteligencia artificial, tecnologías digitales y educación", "IA generativa, competencias digitales, analítica del aprendizaje, entornos virtuales, personalización y uso responsable de la IA.", <BrainCircuit size={22} />],
  ["03", "Innovación pedagógica, currículo y evaluación", "Metodologías activas, ABP, gamificación, aprendizaje colaborativo, currículo por competencias y evaluación formativa.", <Lightbulb size={22} />],
  ["04", "Formación docente, inclusión e interculturalidad", "Formación inicial y continua, desempeño docente, educación inclusiva, diversidad, interculturalidad, EIB y educación rural.", <Heart size={22} />],
  ["05", "Gestión educativa, bienestar y desarrollo sostenible", "Liderazgo, calidad, políticas educativas, convivencia, bienestar socioemocional, ciudadanía y educación ambiental.", <Globe size={22} />],
];

const planningPanels = {
  actividades: ["Planificación · agosto 2026", "Organización académica · agosto a noviembre", "Convocatoria y difusión · agosto a noviembre", "Inscripciones · setiembre a noviembre", "Evaluación de ponencias · octubre a noviembre", "Tecnología híbrida · noviembre", "Logística y protocolo · noviembre", "Desarrollo del congreso · 25 al 27 de noviembre", "Certificación y publicaciones · noviembre a diciembre", "Cierre y evaluación · diciembre 2026"],
  recursos: ["Plataforma Zoom Webinar o Microsoft Teams", "Transmisión simultánea por YouTube o Facebook Live", "Internet dedicado y red de respaldo", "Cámaras, consola de audio, micrófonos y grabación", "UPS o grupo electrógeno", "Credenciales, carpetas, lapiceros y señalética", "Equipos de protocolo, atención, fotografía y video"],
  calidad: ["Ejecución de actividades programadas: meta ≥ 95 %", "Continuidad de transmisión híbrida: meta ≥ 98 %", "Ponencias evaluadas antes de su programación: 100 %", "Satisfacción general: meta ≥ 90 % favorable", "Certificados emitidos y validados: 100 %", "Informe final y memoria académica: 1 de cada producto", "Acciones de mejora priorizadas: al menos 3"],
  gestion: ["Presupuesto referencial total: S/ 4,500.00", "Honorarios o reconocimiento a conferencistas: S/ 2,000.00", "Soporte técnico, streaming y conectividad: S/ 600.00", "Registro audiovisual: S/ 250.00 · diseño e impresión: S/ 250.00", "Materiales, credenciales, señalética y protocolo: S/ 1,300.00", "Financiamiento: ingresos por inscripciones y/o recursos institucionales"],
  riesgos: ["Falla de internet: conexión principal y respaldo, pruebas previas", "Falla de energía: UPS o grupo electrógeno", "Ausencia de conferencista: confirmación 72/24 h antes y alterno", "Problemas de audio o video: pruebas individuales y equipos de respaldo", "Baja participación: difusión segmentada, recordatorios y alianzas", "Falta de evidencias: archivo por coordinación y entrega máx. 48 h"],
};

const costs: [string, string][] = [
  ["Estudiante EPEP · asistente interno", "S/ 20.00"],
  ["Estudiante externo", "S/ 30.00"],
  ["Ponente externo", "S/ 100.00"],
  ["Asistente externo", "S/ 70.00"],
  ["Docente ponente EPEP", "S/ 0.00"],
  ["Estudiante ponente EPEP", "S/ 0.00"],
];

const speakers = [
  ["Dr. Alejandro Silva", "Inteligencia Artificial y Educación del Futuro", "Investigador principal en tecnologías emergentes para el aula. Explorará cómo las herramientas de IA están redefiniendo el rol del docente."],
  ["Dra. Carmen Rosa", "Innovación en el Currículo Escolar", "Especialista en políticas públicas. Abordará las estrategias de adaptación curricular para las nuevas generaciones."],
  ["Mg. Fernando Valle", "Metodologías Activas e Inclusivas", "Docente e investigador. Presentará casos de éxito en la implementación de aprendizaje basado en proyectos en comunidades rurales."],
];

type ModalKind = "registration" | "paper" | null;

/* ────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────── */

export default function Home() {
  const [modal, setModal] = useState<ModalKind>(null);
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

  const renderMember = (member: string) => {
    const parts = member.split("·");
    const name = parts[0].trim();
    const role = parts.length > 1 ? parts[1].trim() : "Miembro";
    const initials = name
      .replace(/(Dr\.|Dra\.|M\.Sc\.)/g, "")
      .trim()
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div className="member-card" key={member}>
        <div className="member-avatar">{initials}</div>
        <div className="member-info">
          <h4>{name}</h4>
          <span>{role}</span>
        </div>
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
          <button className="btn btn-primary btn-compact" onClick={() => setModal("registration")}>
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
            <button className="btn btn-primary" onClick={() => setModal("registration")}>
              <Send size={16} /> Inscribirme ahora
            </button>
            <button className="btn btn-outline" onClick={() => setModal("paper")}>
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

        <div className="committee-section">
          <div className="committee-group">
            <div className="committee-group-header">
              <div>
                <span className="kicker">Comité de honor</span>
                <h3>Autoridades responsables</h3>
              </div>
            </div>
            <div className="committee-grid">
              {honorCommittee.map(renderMember)}
            </div>
          </div>

          <div className="committee-group">
            <div className="committee-group-header">
              <div>
                <span className="kicker">Comité organizador</span>
                <h3>Coordinaciones</h3>
              </div>
            </div>
            <div className="committee-grid">
              {committee.map(renderMember)}
            </div>
          </div>

          <div className="committee-group">
            <div className="committee-group-header">
              <div>
                <span className="kicker">Equipo</span>
                <h3>Miembros</h3>
              </div>
            </div>
            <div className="committee-grid">
              {committeeMembers.map(renderMember)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── AGENDA ─── */}
      <section className="section schedule-section">
        <div className="section-header">
          <div>
            <span className="kicker">Agenda oficial</span>
            <h2>Tres días para<br />compartir <em>saberes</em></h2>
          </div>
          <p>El cronograma oficial combina inauguración, conferencias, ponencias y clausura en la sede de la EPEP.</p>
        </div>

        <div className="schedule-tabs">
          {schedule.map(([day, title, detail], i) => (
            <button
              className={i === activeDay ? "schedule-tab active" : "schedule-tab"}
              key={day}
              onClick={() => setActiveDay(i)}
              aria-pressed={i === activeDay}
            >
              <span>{day}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </button>
          ))}
        </div>

        <div className="timeline">
          {agendaDetails[activeDay].map(([time, title, detail], i) => (
            <div className="timeline-item" key={`${activeDay}-${time}`}>
              <span className="timeline-time">{time}</span>
              <div className="timeline-body">
                <b>{title}</b>
                <small>{detail}</small>
              </div>
              {i === 0 ? <Users size={18} /> : i === 1 ? <Sparkles size={18} /> : <FileText size={18} />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── PONENTES ─── */}
      <section className="section" id="ponentes">
        <div className="section-header">
          <div>
            <span className="kicker">Ponentes magistrales</span>
            <h2>Voces expertas que<br />inspiran el <em>cambio</em></h2>
          </div>
          <p>Conoce a los investigadores y educadores que liderarán las conferencias magistrales.</p>
        </div>

        <div className="speakers-grid">
          {speakers.map(([name, topic, desc]) => (
            <div className="speaker-card" key={name}>
              <div className="speaker-avatar" />
              <div className="speaker-info">
                <h3>{name}</h3>
                <strong>{topic}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
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

        <div className="themes-grid">
          {themes.map(([number, title, desc]) => (
            <div className="theme-card" key={number}>
              <span className="theme-num">{number}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
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

        <div className="tickets-grid">
          {costs.map(([category, cost]) => (
            <div className="ticket-card" key={category} onClick={() => setModal("registration")}>
              <div className="ticket-top">
                <span className="ticket-category">{category}</span>
                <strong className="ticket-price">{cost}</strong>
              </div>
              <div className="ticket-divider" />
              <div className="ticket-action">
                <span>Adquirir entrada</span>
                <ArrowUpRight size={18} />
              </div>
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
      {modal && <RequestModal kind={modal} onClose={() => setModal(null)} />}
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

function RequestModal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const isPaper = kind === "paper";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        name: form.get("name"),
        email: form.get("email"),
        mode: form.get("mode"),
        institution: form.get("institution"),
        topic: form.get("topic"),
        message: form.get("message"),
      }),
    });

    if (!response.ok) {
      setError("No pudimos registrar la solicitud. Revisa tus datos.");
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
                ? "Cuéntanos brevemente sobre tu propuesta para iniciar la revisión."
                : "Déjanos tus datos y te enviaremos los pasos para completar tu inscripción."}
            </p>
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
              {isPaper && <label>Resumen breve<textarea name="message" rows={3} /></label>}
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
