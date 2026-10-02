"use client";

import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/lib/speakers";
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
            <span>EL MAYOR CONGRESO DE INVESTIGACIÓN CIENTÍFICA DE LA REGIÓN &nbsp;&nbsp;•&nbsp;&nbsp; EL MAYOR CONGRESO DE INVESTIGACIÓN CIENTÍFICA DE LA REGIÓN &nbsp;&nbsp;•&nbsp;&nbsp; EL MAYOR CONGRESO DE INVESTIGACIÓN CIENTÍFICA DE LA REGIÓN &nbsp;&nbsp;•&nbsp;&nbsp; EL MAYOR CONGRESO DE INVESTIGACIÓN CIENTÍFICA DE LA REGIÓN &nbsp;&nbsp;•&nbsp;&nbsp;</span>
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
            <button className="btn btn-primary" onClick={() => setModal({ kind: "registration" })}>
              <Send size={16} /> Inscribirme ahora
            </button>
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
            <span className="stat-number">30/10</span>
            <span className="stat-label">Recepción de trabajos<small>Fecha límite</small></span>
          </div>
          <div className="hero-stat-item">
            <span className="stat-number">05</span>
            <span className="stat-label">Ejes temáticos<small>Investigación e innovación</small></span>
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

      {/* ─── MENSAJE DEL DECANO ─── */}
      <section style={{ display: 'flex', flexWrap: 'wrap', minHeight: '500px' }}>
        {/* Left Side: Message */}
        <div style={{ flex: '1 1 60%', backgroundColor: '#EBEBEB', padding: '80px clamp(30px, 8vw, 100px)', color: '#444', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '38px', color: '#B38600', fontWeight: 400, marginBottom: '40px' }}>Mensaje de Presidencia</h2>
          
          <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#333' }}>
            <p style={{ marginBottom: '25px', color: '#B38600' }}>Estimados colegas y estudiantes,</p>
            <p style={{ marginBottom: '25px' }}>
              Al asumir este rol como Decano de la Facultad, me emociona extenderles una cordial invitación para unirse a nosotros en el IV Congreso Internacional de Investigación e Innovación, que tendrá lugar en noviembre de 2026. Este extraordinario evento es un testimonio de nuestra pasión colectiva por avanzar en la comprensión de la educación y su profundo impacto en el desarrollo de la sociedad.
            </p>
            <p style={{ marginBottom: '25px' }}>
              Nuestro congreso siempre ha sido un faro de colaboración e innovación, reuniendo a una diversa comunidad de investigadores, educadores y profesionales de cada rincón de la región. Este año, estamos comprometidos a crear una experiencia aún más inclusiva y dinámica. Nuestro programa contará con un rico tapiz de presentaciones, talleres y discusiones, mostrando los últimos avances en la investigación educativa y sus aplicaciones prácticas.
            </p>
            <p style={{ marginBottom: '40px' }}>
              Este evento es más que una simple conferencia académica; es una celebración de nuestra pasión compartida por el descubrimiento y nuestro compromiso de mejorar la educación a través de la ciencia. ¡Espero darles la bienvenida a cada uno de ustedes para conectar, colaborar y forjar juntos el futuro de la investigación!
            </p>
            
            <p style={{ marginBottom: '0', color: '#555' }}>Atentamente,</p>
            <p style={{ fontWeight: 'bold', color: '#B38600', marginBottom: '0', fontSize: '18px' }}>Dr. Efraín Humberto Yupanqui Pino</p>
            <p style={{ marginBottom: '0', color: '#555' }}>Decano</p>
            <p style={{ marginBottom: '0', color: '#555' }}>Facultad de Ciencias de la Educación - UNAP</p>
          </div>
        </div>
        
        {/* Right Side: Portrait */}
        <div style={{ flex: '1 1 40%', backgroundColor: '#D6AE47', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '400px' }}>
          <div style={{ width: '250px', height: '250px', borderRadius: '50%', position: 'relative', overflow: 'hidden', border: '5px solid rgba(255,255,255,0.2)', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <Image src="/autoridades/efrain_yupanqui.jpg" alt="Dr. Efraín Humberto Yupanqui Pino" fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
          </div>
          <h3 style={{ color: '#FFF', fontSize: '26px', fontWeight: 'bold', marginBottom: '5px' }}>Dr. Efraín Yupanqui</h3>
          <p style={{ color: '#FFF', fontSize: '20px', margin: '0 0 5px 0' }}>Decano FCEDUC</p>
          <p style={{ color: '#FFF', fontSize: '20px', margin: 0 }}>Universidad Nacional del Altiplano</p>
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
                      <button 
                        onClick={() => setModal({ kind: "registration" })}
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#666', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '14px' }}
                      >
                        Más Información
                      </button>
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




      {/* ─── TARIFAS DE INSCRIPCIÓN (CARDS) ─── */}
      <section style={{ backgroundColor: '#EBEBEB', padding: '80px clamp(20px, 5vw, 80px)', textAlign: 'center' }} id="inscripciones">
        <h2 style={{ fontSize: '38px', color: '#0F2756', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif', letterSpacing: '0.05em', marginBottom: '50px', textTransform: 'uppercase' }}>
          TARIFAS DE INSCRIPCIÓN
        </h2>
        
        <div className="registration-cards-grid">
          
          {costs.map(([title, price, features, badge], idx) => {
            const cardImages = [
              "/enseedu.jpg",
              "/integrantes.jpeg",
              "/tutoria.jpg",
              "/interior.jpg",
              "/docentes.jpg",
              "/estudiantesedudes.jpg"
            ];
            const img = cardImages[idx % cardImages.length];
            return (
              <div key={idx} style={{ backgroundColor: '#FFF', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#B38600', fontSize: '18px', fontWeight: 'bold', minHeight: '50px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  {title}
                </h3>
                
                <p style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', minHeight: '20px' }}>{badge}</p>

                <div style={{ flex: 1, position: 'relative', minHeight: '180px', marginBottom: '25px' }}>
                  <Image src={img} alt={title as string} fill style={{ objectFit: 'cover' }} />
                </div>
                
                <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '100px' }}>
                  {features.map((feat, i) => (
                    <p key={i} style={{ color: '#444', fontSize: '14px', marginBottom: '8px', lineHeight: '1.4', display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#B38600' }}>•</span> <span>{feat}</span>
                    </p>
                  ))}
                </div>

                <p style={{ color: '#B38600', fontSize: '24px', fontWeight: 'bold', margin: '10px 0 20px' }}>{price}</p>
                <button 
                  onClick={() => setModal({ kind: "registration", category: title as string })}
                  style={{ border: '1px solid #B38600', backgroundColor: '#FFF', color: '#B38600', padding: '12px', width: '100%', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#B38600'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; e.currentTarget.style.color = '#B38600'; }}
                >
                  Más Información
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Text and Buttons */}
        <div style={{ maxWidth: '850px', margin: '60px auto 0' }}>
          <p style={{ fontSize: '19px', color: '#B38600', lineHeight: '1.6', marginBottom: '40px' }}>
            Las entradas son extremadamente limitadas y se espera una alta demanda para estas modalidades. Reserva tu entrada ahora para asegurar tu participación en el congreso y acceder a todas las sesiones, ponencias y networking.
          </p>

          <button style={{ backgroundColor: '#D4AF37', color: '#FFF', border: 'none', padding: '20px', width: '100%', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '50px' }} onClick={() => setModal({ kind: "registration" })}>
            Inscribirse Ahora
          </button>


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

            <form onSubmit={submit}>
              <label>Nombre completo<input name="name" required /></label>
              <label>Correo electrónico<input name="email" type="email" required /></label>
              <label>Tipo de documento
                <select name="doc_type" required>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
              <label>Nro de documento<input name="doc_number" required /></label>
              <label>Institución<input name="institution" /></label>
              <label>Categoría
                <select name="category" defaultValue={modal.category || ""} required>
                  <option value="" disabled>Selecciona una categoría</option>
                  <option value="Asistente Interno">Asistente Interno</option>
                  <option value="Público General">Público General</option>
                  <option value="Investigadores">Investigadores</option>
                  <option value="Asistente Externo">Asistente Externo</option>
                  <option value="Docente EPEP">Docente EPEP</option>
                  <option value="Estudiante EPEP">Estudiante EPEP</option>
                </select>
              </label>
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
