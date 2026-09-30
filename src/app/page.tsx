"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowUpRight, Building2, CalendarDays, Check, ChevronDown, CircleHelp, ExternalLink, FileText, GraduationCap, MapPin, Menu, Send, Sparkles, Users, X } from "lucide-react";

type ModalKind = "registration" | "paper" | null;
const institutions = ["Subdirección de Investigación", "Escuela Profesional de Educación Primaria", "Facultad de Ciencias de la Educación", "Universidad Nacional del Altiplano de Puno"];
const honorCommittee = ["Dr. Efraín Humberto Yupanqui Pino · Decano de la Facultad", "Dr. Henry Mark Vilca Apaza · Director de la EPEP", "Dra. Ruth Mery Cruz Huisa · Subdirectora de Investigación"];
const committee = ["Dra. Ruth Mery Cruz Huisa · Presidencia", "M.Sc. Ofelia Marleny Mamani Apaza · Secretaría técnica", "Dr. Vidnay Noel Valero Ancco · Coordinación académica", "Dr. Lesy Berly Leon Hancco · Tecnología", "Dr. Estanislao Pacompia Cari · Logística", "Dra. Zaida Esther Callata Gallegos · Protocolo", "Dr. Juan Alexander Condori Palomino · Comunicaciones", "M.Sc. Juan Carlos Callomani · Publicaciones", "Dr. Wido Willan Condori Castillo · Coordinación financiera", "Dra. Katia Perez Argollo · Certificaciones", "M.Sc. Milciades Conrado Suaña Calsin · Bienestar"];
const schedule = [["DÍA 01 · 25 NOV", "Apertura y conferencia magistral", "Acreditación · ceremonia inaugural · panel de investigadores · ponencias paralelas"], ["DÍA 02 · 26 NOV", "Investigación e innovación", "Conferencias magistrales · mesas temáticas · simposios · talleres · foro internacional"], ["DÍA 03 · 27 NOV", "Conclusiones y clausura", "Conferencias finales · premiación de investigaciones · clausura · fotografía oficial"]];
const agendaDetails = [[["09:00", "Acreditación y bienvenida", "Registro de participantes y entrega de materiales"], ["11:00", "Conferencia magistral internacional", "Investigación e innovación educativa"], ["15:00", "Panel de investigadores", "Preguntas, diálogo y ponencias paralelas"]], [["09:00", "Conferencias magistrales", "Inteligencia artificial y tecnologías digitales"], ["11:30", "Mesas temáticas", "Presentación y discusión de investigaciones"], ["15:00", "Talleres y foro internacional", "Intercambio de experiencias y propuestas"]], [["09:00", "Conferencias finales", "Síntesis de aprendizajes y experiencias"], ["12:00", "Premiación de investigaciones", "Reconocimiento a los mejores trabajos"], ["16:00", "Clausura y fotografía oficial", "Cierre institucional del IV Congreso"]]];
const themes = [["01", "Investigación educativa y producción científica", "Investigación cuantitativa, cualitativa y mixta; investigación-acción; ética e integridad científica; tesis, publicaciones y divulgación."], ["02", "Inteligencia artificial, tecnologías digitales y educación", "IA generativa, competencias digitales, analítica del aprendizaje, entornos virtuales, personalización y uso responsable de la IA."], ["03", "Innovación pedagógica, currículo y evaluación", "Metodologías activas, ABP, gamificación, aprendizaje colaborativo, currículo por competencias y evaluación formativa."], ["04", "Formación docente, inclusión e interculturalidad", "Formación inicial y continua, desempeño docente, educación inclusiva, diversidad, interculturalidad, EIB y educación rural."], ["05", "Gestión educativa, bienestar y desarrollo sostenible", "Liderazgo, calidad, políticas educativas, convivencia, bienestar socioemocional, ciudadanía y educación ambiental."]];
const committeeMembers = ["Dr. Humberto Mamani Coaquira", "Dra. Danitza Luisa Sardón Ari", "Dr. Fredy Sosa Gutierrez", "M.Sc. Jose Antonio Supo Gutierrez", "Dr. Jose Marcial Mamani Condori", "Dra. Damiana Flores Mamani", "Dra. Yesica Dominga Diaz Vilcanqui"];
const planningPanels = { actividades: ["Planificación · agosto 2026", "Organización académica · agosto a noviembre", "Convocatoria y difusión · agosto a noviembre", "Inscripciones · setiembre a noviembre", "Evaluación de ponencias · octubre a noviembre", "Tecnología híbrida · noviembre", "Logística y protocolo · noviembre", "Desarrollo del congreso · 25 al 27 de noviembre", "Certificación y publicaciones · noviembre a diciembre", "Cierre y evaluación · diciembre 2026"], recursos: ["Plataforma Zoom Webinar o Microsoft Teams", "Transmisión simultánea por YouTube o Facebook Live", "Internet dedicado y red de respaldo", "Cámaras, consola de audio, micrófonos y grabación", "UPS o grupo electrógeno", "Credenciales, carpetas, lapiceros y señalética", "Equipos de protocolo, atención, fotografía y video"], calidad: ["Ejecución de actividades programadas: meta igual o superior al 95 %", "Continuidad de transmisión híbrida: meta igual o superior al 98 %", "Ponencias evaluadas antes de su programación: 100 %", "Satisfacción general: meta igual o superior al 90 % favorable", "Certificados emitidos y validados: 100 % de participantes que cumplen requisitos", "Informe final y memoria académica: 1 de cada producto", "Acciones de mejora priorizadas: al menos 3"], gestion: ["Presupuesto referencial total: S/ 4,500.00", "Honorarios o reconocimiento a conferencistas: S/ 2,000.00", "Soporte técnico, streaming y conectividad: S/ 600.00", "Registro audiovisual: S/ 250.00 · diseño e impresión: S/ 250.00", "Materiales, credenciales, señalética y protocolo: S/ 1,300.00", "Financiamiento: ingresos por inscripciones y/o recursos institucionales", "Evidencias: plan aprobado, actas, presupuesto, programa, fichas, grabaciones, encuestas, comprobantes e informe final"], riesgos: ["Falla de internet: conexión principal y respaldo, pruebas previas y grabación local", "Falla de energía: UPS o grupo electrógeno", "Ausencia de conferencista: confirmación 72/24 horas antes y alterno", "Problemas de audio o video: pruebas individuales y equipos de respaldo", "Baja participación: difusión segmentada, recordatorios y alianzas", "Desorden en acreditación: preregistro, listas y señalización", "Falta de evidencias: archivo por coordinación y entrega máxima en 48 horas"] };
const costs = [["Estudiante EPEP · asistente interno", "S/ 20.00"], ["Estudiante externo", "S/ 30.00"], ["Ponente externo", "S/ 100.00"], ["Asistente externo", "S/ 70.00"], ["Docente ponente EPEP", "S/ 0.00"], ["Estudiante ponente EPEP", "S/ 0.00"]];

export default function Home() {
  const [modal, setModal] = useState<ModalKind>(null);

  const renderMember = (member: string) => {
    const parts = member.split('·');
    const name = parts[0].trim();
    const role = parts.length > 1 ? parts[1].trim() : 'Miembro';
    const initials = name.replace(/(Dr\.|Dra\.|M\.Sc\.)/g, '').trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTheme, setActiveTheme] = useState(0);
  const [activePanel, setActivePanel] = useState<keyof typeof planningPanels>("actividades");

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Image src="/logosecu.png" alt="Escudo de la Facultad de Educación Primaria" width={42} height={42} /></span>
          <span>
            <strong>IV Congreso</strong>
            <small>EPEP · Investigación científica</small>
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
          <button className="icon-button mobile-menu" title="Abrir menú" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={20} />
          </button>
          <button className="button button-dark compact" onClick={() => setModal("registration")}>
            <ArrowUpRight size={17} /> Inscribirme
          </button>
        </div>
      </header>

      <div className="marquee-container">
        <div className="marquee-content">
          EL CONGRESO DE INVESTIGACIÓN MÁS GRANDE · IV CONGRESO INTERNACIONAL DE INVESTIGACIÓN CIENTÍFICA · EL CONGRESO DE INVESTIGACIÓN MÁS GRANDE · IV CONGRESO INTERNACIONAL DE INVESTIGACIÓN CIENTÍFICA
        </div>
      </div>

      <section className="hero" id="inicio">
        <div className="hero-inner" style={{ alignItems: 'center', textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>IV CONGRESO INTERNACIONAL<br/>DE INVESTIGACIÓN</h1>
          
          <div className="hero-location" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
            Puno, Perú<br/>
            Universidad Nacional del Altiplano<br/>
            Agosto 10-14, 2026
          </div>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginTop: '30px' }}>
            <Image src="/logosecu.png" alt="Logo SECU" width={140} height={140} style={{ objectFit: 'contain' }} />
            <button className="red-btn large" onClick={() => setModal("registration")}>
              Ver Programa Final
            </button>
          </div>
        </div>
      </section>

      <section className="signal-row" aria-label="Datos destacados">
        <div><strong>25</strong><span>Noviembre<br /><small>Inicio del congreso</small></span></div>
        <div><strong>03</strong><span>Días de encuentro<br /><small>25 al 27 de noviembre</small></span></div>
        <div><strong>30/10</strong><span>Recepción de trabajos<br /><small>Fecha límite</small></span></div>
        <div><strong>05</strong><span>Ejes temáticos<br /><small>Investigación e innovación</small></span></div>
      </section>

      <section className="section organization-section" id="organizadores">
        <div className="section-heading">
          <div>
            <span className="kicker">Organización</span>
            <h2>Una edición pensada para<br /><em>dejar evidencia.</em></h2>
          </div>
          <p>La Subdirección de Investigación de la Escuela Profesional de Educación Primaria coordina la actividad con estándares académicos, organizacionales y tecnológicos.</p>
        </div>

        <div className="org-bento">
          {institutions.map((institution, index) => (
            <article className={`org-bento-card card-${index + 1}`} key={institution}>
              <div className="org-bento-header">
                <span className="org-bento-number">0{index + 1}</span>
                <div className="org-bento-icon">
                  <Building2 size={22} />
                </div>
              </div>
              <div className="org-bento-content">
                <h3>{institution}</h3>
                <p>Parte de la estructura institucional responsable del congreso 2026.</p>
              </div>
            </article>
          ))}
        </div>

        <div className="committee-panel">
          <div className="committee-group">
            <div className="committee-header">
              <span className="kicker">Comité de honor</span>
              <h3>Autoridades responsables</h3>
            </div>
            <div className="committee-grid">
              {honorCommittee.map(renderMember)}
            </div>
          </div>
          
          <div className="committee-group">
            <div className="committee-header">
              <span className="kicker">Comité organizador</span>
              <h3>Coordinaciones</h3>
            </div>
            <div className="committee-grid">
              {committee.map(renderMember)}
            </div>
          </div>
          
          <div className="committee-group">
            <div className="committee-header">
              <span className="kicker">Equipo</span>
              <h3>Miembros</h3>
            </div>
            <div className="committee-grid">
              {committeeMembers.map(renderMember)}
            </div>
          </div>
        </div>
      </section>

      <section className="section showcase-section" id="programa">
        <div className="showcase-panel">
          <div className="showcase-copy">
            <span className="kicker">Presentación</span>
            <h2>Investigación, innovación e IA para educar mejor.</h2>
            <p>
              El congreso fortalece la cultura investigativa, la producción científica y el intercambio de conocimientos entre investigadores, docentes, estudiantes y profesionales.
            </p>
          </div>

          <div className="showcase-features">
            <article className="feature-card">
              <div className="feature-icon">
                <Sparkles size={28} />
              </div>
              <div className="feature-content">
                <strong>Objetivo académico</strong>
                <p>Coordinar actividades académicas, administrativas, logísticas y financieras con estándares de calidad verificables.</p>
              </div>
            </article>
            
            <article className="feature-card">
              <div className="feature-icon">
                <GraduationCap size={28} />
              </div>
              <div className="feature-content">
                <strong>Modalidad híbrida</strong>
                <p>Conferencias virtuales, ponencias presenciales y asistencia presencial o virtual con soporte técnico y transmisión.</p>
              </div>
            </article>
            
            <article className="feature-card">
              <div className="feature-icon">
                <FileText size={28} />
              </div>
              <div className="feature-content">
                <strong>Resultados esperados</strong>
                <p>Producción académica evaluada, memoria del evento, certificados, medición de satisfacción e informe final.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section schedule-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Agenda oficial</span>
            <h2>Tres días para<br /><em>compartir saberes.</em></h2>
          </div>
          <p>El cronograma oficial combina inauguración, conferencias, ponencias y clausura en la sede de la Escuela Profesional de Educación Primaria.</p>
        </div>

        <div className="schedule">
          {schedule.map(([day, title, detail], index) => <button className={index === activeDay ? "schedule-day active" : "schedule-day"} key={day} onClick={() => setActiveDay(index)} aria-pressed={index === activeDay}><span>{day}</span><strong>{title}</strong><small>{detail}</small></button>)}
        </div>

        <div className="agenda-list">
          {agendaDetails[activeDay].map(([time, title, detail], index) => <div key={time}><time>{time}</time><span><b>{title}</b><small>{detail}</small></span>{index === 0 ? <Users size={18} /> : index === 1 ? <Sparkles size={18} /> : <FileText size={18} />}</div>)}
        </div>
      </section>

      <section className="section speakers-section" id="ponentes">
        <div className="section-heading">
          <div>
            <span className="kicker">Ponentes Magistrales</span>
            <h2>Voces expertas que<br /><em>inspiran el cambio.</em></h2>
          </div>
          <p>Conoce a los investigadores y educadores que liderarán las conferencias magistrales.</p>
        </div>
        <div className="speakers-grid">
          {[
            ["Dr. Alejandro Silva", "Inteligencia Artificial y Educación del Futuro", "Investigador principal en tecnologías emergentes para el aula. Explorará cómo las herramientas de IA están redefiniendo el rol del docente."],
            ["Dra. Carmen Rosa", "Innovación en el Currículo Escolar", "Especialista en políticas públicas. Abordará las estrategias de adaptación curricular para las nuevas generaciones."],
            ["Mg. Fernando Valle", "Metodologías Activas e Inclusivas", "Docente e investigador. Presentará casos de éxito en la implementación de aprendizaje basado en proyectos en comunidades rurales."]
          ].map(([name, topic, desc]) => (
            <div className="speaker-card" key={name}>
              <div className="speaker-avatar"></div>
              <div className="speaker-info">
                <h3>{name}</h3>
                <strong>{topic}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section themes-section" id="ejes">
        <div className="section-heading">
          <div>
            <span className="kicker">Ejes temáticos</span>
            <h2>Cinco rutas para<br /><em>transformar la educación.</em></h2>
          </div>
          <p>Explora las líneas de investigación que estructuran nuestra convocatoria para ponencias.</p>
        </div>
        <div className="themes-grid-new">
          {themes.map(([number, title, desc]) => (
            <div className="theme-card-new" key={number}>
              <div className="theme-card-bg"></div>
              <div className="theme-card-content">
                <span className="theme-number-new">{number}</span>
                <h3 className="theme-title-new">{title}</h3>
                <p className="theme-desc-new">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section planning-section" id="planificacion">
        <div className="section-heading">
          <div>
            <span className="kicker">Plan del congreso</span>
            <h2>Una gestión<br /><em>que se puede verificar.</em></h2>
          </div>
          <p>Explora las actividades, recursos e indicadores previstos para el evento.</p>
        </div>
        <div className="planning-split">
          <div className="planning-sidebar" role="tablist" aria-label="Información del plan">
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
          <div className="planning-content-area">
            <div className="planning-content-card" key={activePanel}>
              {planningPanels[activePanel].map((item, index) => (
                <div className="planning-item" key={item}>
                  <div className="planning-index">{String(index + 1).padStart(2, "0")}</div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section investment-new" id="inscripciones">
        <div className="section-heading" style={{ justifyContent: 'center', textAlign: 'center', alignItems: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="kicker">Inscripciones oficiales</span>
            <h2 style={{ textAlign: 'center' }}>Participa en el<br /><em>encuentro académico.</em></h2>
            <p style={{ maxWidth: '600px', marginTop: '20px', textAlign: 'center' }}>
              La recepción de trabajos estará abierta hasta el 30 de octubre de 2026. 
              Selecciona tu categoría para iniciar la inscripción.
            </p>
          </div>
        </div>

        <div className="tickets-grid">
          {costs.map(([category, cost]) => (
            <div className="ticket-card" key={category} onClick={() => setModal("registration")}>
               <div className="ticket-content">
                  <span className="ticket-category">{category}</span>
                  <strong className="ticket-price">{cost}</strong>
               </div>
               <div className="ticket-divider">
                 <div className="ticket-notch left"></div>
                 <div className="ticket-notch right"></div>
               </div>
               <div className="ticket-action">
                  <span>Adquirir entrada</span>
                  <ArrowUpRight size={18} />
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section contact-section" id="contacto">
        <div>
          <span className="kicker">Mesa de ayuda</span>
          <h2>¿Conversamos?</h2>
          <p>La Subdirección de Investigación coordina las consultas sobre registro, ponencias, soporte y certificación.</p>
        </div>

        <div className="contact-actions">
          <a className="contact-link" href="https://www.facebook.com/photo?fbid=1657938369673922&set=a.440134708120967" target="_blank" rel="noreferrer">
            <CircleHelp size={19} /> Publicación oficial del congreso <ArrowUpRight size={16} />
          </a>
          <a className="contact-link" href="mailto:subdireccion.investigacion.epep@unap.edu.pe">
            <Building2 size={19} /> Subdirección de Investigación EPEP <ArrowUpRight size={16} />
          </a>
          <a className="contact-link" href="#inscripciones">
            <Send size={19} /> Consultar inscripción y ponencias <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <footer>
        <span>© 2026 EPEP · IV Congreso Internacional de Investigación Científica</span>
        <span>25—27 noviembre · Modalidad híbrida</span>
      </footer>

      {modal && <RequestModal kind={modal} onClose={() => setModal(null)} />}
    </main>
  );
}

function RequestModal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const [sent, setSent] = useState(false); const [error, setError] = useState(""); const isPaper = kind === "paper";
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, name: form.get("name"), email: form.get("email"), mode: form.get("mode"), institution: form.get("institution"), topic: form.get("topic"), message: form.get("message") }) }); if (!response.ok) { setError("No pudimos registrar la solicitud. Revisa tus datos."); return; } setSent(true); }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="icon-button modal-close" title="Cerrar" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>{sent ? <div className="success"><span><Check size={28} /></span><h2>Solicitud recibida</h2><p>La Secretaría revisará tus datos y te contactará pronto en el correo indicado.</p><button className="button button-dark" onClick={onClose}>Cerrar</button></div> : <><span className="kicker">{isPaper ? "Call for papers" : "Registro"}</span><h2 id="modal-title">{isPaper ? "Presenta tu investigación." : "Reserva tu lugar."}</h2><p className="modal-intro">{isPaper ? "Cuéntanos brevemente sobre tu propuesta para iniciar la revisión." : "Déjanos tus datos y te enviaremos los pasos para completar tu inscripción."}</p><form onSubmit={submit}><label>Nombre completo<input name="name" required /></label><label>Correo electrónico<input name="email" type="email" required /></label><label>Institución<input name="institution" /></label>{isPaper && <label>Título o eje de la ponencia<input name="topic" required /></label>}<label>Modalidad<select name="mode"><option>Presencial</option><option>Virtual</option></select></label>{isPaper && <label>Resumen breve<textarea name="message" rows={3} /></label>}<button className="button button-dark full" type="submit"><Send size={17} /> Enviar solicitud</button>{error && <p className="form-error">{error}</p>}</form></>}</div></div>;
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-11-25T09:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-container">
      <div className="countdown-item">
        <svg className="countdown-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="bg-circle" />
          <circle cx="50" cy="50" r="45" className="progress-circle" style={{ strokeDashoffset: 283 - (283 * timeLeft.days) / 365 }} />
        </svg>
        <div className="countdown-value">{timeLeft.days}</div>
        <div className="countdown-label">Días</div>
      </div>
      <div className="countdown-item">
        <svg className="countdown-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="bg-circle" />
          <circle cx="50" cy="50" r="45" className="progress-circle" style={{ strokeDashoffset: 283 - (283 * timeLeft.hours) / 24 }} />
        </svg>
        <div className="countdown-value">{timeLeft.hours}</div>
        <div className="countdown-label">Horas</div>
      </div>
      <div className="countdown-item">
        <svg className="countdown-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="bg-circle" />
          <circle cx="50" cy="50" r="45" className="progress-circle" style={{ strokeDashoffset: 283 - (283 * timeLeft.minutes) / 60 }} />
        </svg>
        <div className="countdown-value">{timeLeft.minutes}</div>
        <div className="countdown-label">Min</div>
      </div>
      <div className="countdown-item">
        <svg className="countdown-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="bg-circle" />
          <circle cx="50" cy="50" r="45" className="progress-circle" style={{ strokeDashoffset: 283 - (283 * timeLeft.seconds) / 60 }} />
        </svg>
        <div className="countdown-value">{timeLeft.seconds}</div>
        <div className="countdown-label">Seg</div>
      </div>
    </div>
  );
}
