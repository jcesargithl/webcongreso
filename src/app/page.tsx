"use client";

import Image from "next/image";
import { useState } from "react";
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

      <section className="hero" id="inicio">
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> 25—27 NOV 2026 · MODALIDAD HÍBRIDA
            </div>
            <h1>Transformando la educación.</h1>
            <p className="hero-lead">IV Congreso Internacional de Investigación Científica</p>
            <p className="hero-text">
              Investigación, innovación e inteligencia artificial para los desafíos del siglo XXI. Un encuentro académico para investigadores, docentes, estudiantes, egresados y profesionales.
            </p>

            <div className="hero-actions">
              <button className="button button-light" onClick={() => setModal("registration")}>
                <CalendarDays size={18} /> Ver inscripciones
              </button>
              <button className="button button-ghost" onClick={() => setModal("paper")}>
                <Send size={18} /> Presentar una ponencia
              </button>
            </div>

            <div className="hero-meta">
              <span><Users size={16} /> Ponentes nacionales e internacionales</span>
              <span><MapPin size={16} /> EPEP · UNA Puno</span>
              <span><Check size={16} /> Asistencia presencial y virtual</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <Image className="hero-logo" src="/logosecu.png" alt="" width={94} height={94} priority />
              <span className="card-chip">Subdirección de Investigación</span>
              <div className="date-stack">
                <span>25</span>
                <small>NOV<br />2026</small>
              </div>

              <div className="mini-stats">
                <div>
                  <strong>03</strong>
                  <span>Jornadas</span>
                </div>
                <div>
                  <strong>05</strong>
                  <span>Ejes</span>
                </div>
                <div>
                  <strong>HÍBRIDO</strong>
                  <span>Modalidad</span>
                </div>
              </div>
            </div>

            <div className="floating-panel">
              <div className="floating-header">
                <span>Agenda destacada</span>
                <small>25—27 NOV</small>
              </div>
              <ul>
                <li>Conferencias virtuales</li>
                <li>Ponencias presenciales</li>
                <li>Memoria y certificación</li>
              </ul>
            </div>
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

        <div className="track-grid">
          {institutions.map((institution, index) => (
            <article className="track-card" key={institution}>
              <span className="track-number">0{index + 1}</span>
              <Building2 size={19} />
              <h3>{institution}</h3>
              <p>Parte de la estructura institucional responsable del congreso 2026.</p>
            </article>
          ))}
        </div>

        <div className="committee-panel">
          <div>
            <span className="kicker">Comité de honor</span>
            <h3>Autoridades responsables</h3>
          </div>
          <ul>{honorCommittee.map((member) => <li key={member}>{member}</li>)}</ul>
          <div>
            <span className="kicker">Comité organizador</span>
            <h3>Coordinaciones</h3>
          </div>
          <ul>{committee.map((member) => <li key={member}>{member}</li>)}</ul>
          <div>
            <span className="kicker">Miembros</span>
          </div>
          <ul className="committee-members">{committeeMembers.map((member) => <li key={member}>{member}</li>)}</ul>
        </div>
      </section>

      <section className="section showcase-section" id="programa">
        <div className="showcase-panel">
          <div className="showcase-copy">
            <span className="kicker">Presentación</span>
            <h2>Investigación, innovación e inteligencia artificial para educar mejor.</h2>
            <p>
              El congreso fortalece la cultura investigativa, la producción científica y el intercambio de conocimientos entre investigadores, docentes, estudiantes y profesionales.
            </p>
          </div>

          <div className="showcase-list">
            <div>
              <Sparkles size={18} />
              <div>
                <strong>Objetivo académico</strong>
                <span>Coordinar actividades académicas, administrativas, logísticas y financieras con estándares de calidad verificables.</span>
              </div>
            </div>
            <div>
              <GraduationCap size={18} />
              <div>
                <strong>Modalidad híbrida</strong>
                <span>Conferencias virtuales, ponencias presenciales y asistencia presencial o virtual con soporte técnico y transmisión.</span>
              </div>
            </div>
            <div>
              <FileText size={18} />
              <div>
                <strong>Resultados esperados</strong>
                <span>Producción académica evaluada, memoria del evento, certificados, medición de satisfacción e informe final.</span>
              </div>
            </div>
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

      <section className="section themes-section" id="ejes">
        <div className="section-heading">
          <div>
            <span className="kicker">Ejes temáticos</span>
            <h2>Cinco rutas para<br /><em>transformar la educación.</em></h2>
          </div>
          <p>Selecciona un eje para consultar las líneas de trabajo incluidas en la convocatoria.</p>
        </div>
        <div className="theme-selector">
          {themes.map(([number, title], index) => <button className={activeTheme === index ? "theme-button active" : "theme-button"} key={number} onClick={() => setActiveTheme(index)} aria-pressed={activeTheme === index}><span>{number}</span>{title}<ChevronDown size={16} /></button>)}
        </div>
        <article className="theme-detail">
          <span className="track-number">EJE {themes[activeTheme][0]}</span>
          <h3>{themes[activeTheme][1]}</h3>
          <p>{themes[activeTheme][2]}</p>
        </article>
      </section>

      <section className="section planning-section" id="planificacion">
        <div className="section-heading">
          <div>
            <span className="kicker">Plan del congreso</span>
            <h2>Una gestión<br /><em>que se puede verificar.</em></h2>
          </div>
          <p>Explora las actividades, recursos e indicadores previstos para el evento.</p>
        </div>
        <div className="planning-tabs" role="tablist" aria-label="Información del plan">
          {(Object.keys(planningPanels) as Array<keyof typeof planningPanels>).map((panel) => <button className={activePanel === panel ? "planning-tab active" : "planning-tab"} key={panel} onClick={() => setActivePanel(panel)} role="tab" aria-selected={activePanel === panel}>{panel === "actividades" ? "Actividades" : panel === "recursos" ? "Recursos" : panel === "calidad" ? "Calidad" : panel === "gestion" ? "Gestión" : "Riesgos"}</button>)}
        </div>
        <div className="planning-list">{planningPanels[activePanel].map((item, index) => <div key={item}><strong>{String(index + 1).padStart(2, "0")}</strong><span>{item}</span></div>)}</div>
      </section>

      <section className="section investment" id="inscripciones">
        <div className="investment-copy">
          <span className="kicker">Inscripciones oficiales</span>
          <h2>Participa en el<br /><em>encuentro académico.</em></h2>
          <p>La recepción de trabajos estará abierta hasta el 30 de octubre de 2026. Los costos se determinaron en acta por acuerdo de los docentes organizadores.</p>
          <button className="button button-dark" onClick={() => setModal("registration")}><ExternalLink size={18} /> Solicitar inscripción</button>
        </div>

        <div className="price-list registration-links">
          {costs.map(([category, cost]) => <div key={category}><span>{category}</span><strong>{cost}</strong></div>)}
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
