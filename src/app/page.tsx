"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, Check, ChevronRight, CircleHelp, FileText, GraduationCap, Layers3, Menu, Monitor, Send, Sparkles, Users, X } from "lucide-react";

type ModalKind = "registration" | "paper" | null;
const tracks = [["01", "Investigación educativa", "Metodologías mixtas, epistemología pedagógica y publicaciones científicas."], ["02", "IA y tecnologías digitales", "IA generativa, analítica del aprendizaje y alfabetización algorítmica."], ["03", "Innovación pedagógica", "ABP, STEAM, gamificación y evaluación auténtica por competencias."], ["04", "Inclusión e interculturalidad", "DUA, educación bilingüe, ruralidad e identidad docente."], ["05", "Gestión y bienestar", "Liderazgo pedagógico, convivencia y desarrollo sostenible."]];

export default function Home() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <a href="#ejes" onClick={() => setMenuOpen(false)}>Ejes</a>
          <a href="#programa" onClick={() => setMenuOpen(false)}>Programa</a>
          <a href="#tarifas" onClick={() => setMenuOpen(false)}>Tarifas</a>
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
              <span className="live-dot" /> Modalidad híbrida · 25—27 NOV 2026
            </div>
            <h1>Investigación que transforma la educación.</h1>
            <p className="hero-lead">IV Congreso Internacional de Investigación Científica</p>
            <p className="hero-text">
              Tres jornadas para compartir evidencia, innovación e inteligencia artificial al servicio de los desafíos educativos del siglo XXI.
            </p>

            <div className="hero-actions">
              <button className="button button-light" onClick={() => setModal("registration")}>
                <CalendarDays size={18} /> Reservar mi lugar
              </button>
              <button className="button button-ghost" onClick={() => setModal("paper")}>
                <Send size={18} /> Presentar una ponencia
              </button>
            </div>

            <div className="hero-meta">
              <span><Users size={16} /> +15 ponentes internacionales</span>
              <span><Monitor size={16} /> Presencial + virtual</span>
              <span><Check size={16} /> 120 horas certificadas</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <Image className="hero-logo" src="/logosecu.png" alt="" width={94} height={94} priority />
              <span className="card-chip">Congreso internacional</span>
              <div className="date-stack">
                <span>25</span>
                <small>NOV<br />2026</small>
              </div>

              <div className="mini-stats">
                <div>
                  <strong>05</strong>
                  <span>Ejes</span>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Días</span>
                </div>
                <div>
                  <strong>120h</strong>
                  <span>Certif.</span>
                </div>
              </div>
            </div>

            <div className="floating-panel">
              <div className="floating-header">
                <span>Agenda destacada</span>
                <small>3 días</small>
              </div>
              <ul>
                <li>Plenaria inaugural</li>
                <li>Mesas de investigación</li>
                <li>Innovación y IA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-row" aria-label="Datos destacados">
        <div><strong>01</strong><span>Convocatoria abierta<br /><small>Hasta el 30 de octubre</small></span></div>
        <div><strong>120</strong><span>Horas académicas<br /><small>Certificación oficial</small></span></div>
        <div><strong>05</strong><span>Ejes temáticos<br /><small>Una agenda transversal</small></span></div>
        <div><strong>03</strong><span>Días de encuentro<br /><small>Debate y conexión</small></span></div>
      </section>

      <section className="section tracks" id="ejes">
        <div className="section-heading">
          <div>
            <span className="kicker">Líneas EPEP</span>
            <h2>Una conversación,<br /><em>cinco perspectivas.</em></h2>
          </div>
          <p>Un programa construido para cruzar investigación, práctica docente y tecnología con una mirada rigurosa y humana.</p>
        </div>

        <div className="track-grid">
          {tracks.map(([number, title, description]) => (
            <article className="track-card" key={number}>
              <span className="track-number">{number}</span>
              <Layers3 size={19} />
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="#programa" aria-label={`Ver programa de ${title}`}>
                <ChevronRight size={18} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section showcase-section" id="programa">
        <div className="showcase-panel">
          <div className="showcase-copy">
            <span className="kicker">¿Por qué participar?</span>
            <h2>Un espacio para visibilizar ideas, metodologías y soluciones.</h2>
            <p>
              En tres jornadas combinamos ponencias magistrales, talleres y mesas de discusión para conectar evidencia, práctica y transformación educativa.
            </p>
          </div>

          <div className="showcase-list">
            <div>
              <Sparkles size={18} />
              <div>
                <strong>Agenda internacional</strong>
                <span>Expertos, investigadores y docentes de distintos contextos.</span>
              </div>
            </div>
            <div>
              <GraduationCap size={18} />
              <div>
                <strong>Red de colaboración</strong>
                <span>Espacios de networking, conexión y proyectos entre equipos.</span>
              </div>
            </div>
            <div>
              <FileText size={18} />
              <div>
                <strong>Memorias y evidencia</strong>
                <span>Publicación, impacto académico y aprendizaje aplicable.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section schedule-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Agenda oficial</span>
            <h2>Tres días para<br /><em>mover ideas.</em></h2>
          </div>
          <p>Plenarias, talleres, mesas de ponencias y espacios de networking académico.</p>
        </div>

        <div className="schedule">
          <div className="schedule-day active">
            <span>DÍA 01</span>
            <strong>Miércoles 25 NOV</strong>
            <small>Inauguración · IA · Ponencias</small>
          </div>
          <div className="schedule-day">
            <span>DÍA 02</span>
            <strong>Jueves 26 NOV</strong>
            <small>Inclusión · Políticas · Talleres</small>
          </div>
          <div className="schedule-day">
            <span>DÍA 03</span>
            <strong>Viernes 27 NOV</strong>
            <small>Prospectiva · Reconocimientos</small>
          </div>
        </div>

        <div className="agenda-list">
          <div>
            <time>08:00</time>
            <span>
              <b>Acreditación y entrega de credenciales</b>
              <small>Registro institucional · Auditorio Central</small>
            </span>
            <Users size={18} />
          </div>
          <div>
            <time>10:30</time>
            <span>
              <b>El futuro de la educación frente a la IA generativa</b>
              <small>Conferencia magistral internacional</small>
            </span>
            <Sparkles size={18} />
          </div>
          <div>
            <time>14:00</time>
            <span>
              <b>Mesas de ponencias de investigadores</b>
              <small>Ejes 01 y 02 · Salas paralelas</small>
            </span>
            <FileText size={18} />
          </div>
        </div>
      </section>

      <section className="section investment" id="tarifas">
        <div className="investment-copy">
          <span className="kicker">Participación</span>
          <h2>Encuentra tu<br /><em>forma de estar.</em></h2>
          <p>Accede a las plenarias, talleres y memorias digitales. La comunidad EPEP cuenta con tarifas especiales.</p>
          <button className="button button-dark" onClick={() => setModal("registration")}>
            <ArrowUpRight size={18} /> Ver opciones de inscripción
          </button>
        </div>

        <div className="price-list">
          <div><span>Estudiante EPEP</span><strong>S/ 20</strong><small>Acceso completo · 120 horas</small></div>
          <div><span>Estudiante externo</span><strong>S/ 30</strong><small>Presencial o virtual</small></div>
          <div><span>Profesional / docente</span><strong>S/ 70</strong><small>Certificado escalafonario</small></div>
          <div className="featured"><span>Ponente EPEP</span><strong>Gratis</strong><small>Publicación en libro de actas</small></div>
        </div>
      </section>

      <section className="section contact-section" id="contacto">
        <div>
          <span className="kicker">Mesa de ayuda</span>
          <h2>¿Conversamos?</h2>
          <p>La Secretaría del Congreso responde consultas sobre registro, ponencias y convenios.</p>
        </div>

        <div className="contact-actions">
          <a className="contact-link" href="mailto:investigacion.epep@universidad.edu.pe">
            <CircleHelp size={19} /> investigacion.epep@universidad.edu.pe <ArrowUpRight size={16} />
          </a>
          <a className="contact-link" href="https://wa.me/51987654321" target="_blank" rel="noreferrer">
            <Send size={19} /> WhatsApp de la Secretaría <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <footer>
        <span>© 2026 EPEP · IV Congreso Internacional de Investigación Científica</span>
        <span>Auditorio Central · Ciudad Universitaria</span>
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
