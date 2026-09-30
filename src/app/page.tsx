"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Building2, CalendarDays, Check, CircleHelp, ExternalLink, FileText, GraduationCap, MapPin, Menu, Send, Sparkles, Users, X } from "lucide-react";

type ModalKind = "registration" | "paper" | null;
const institutions = ["Universidad Nacional del Altiplano de Puno", "Facultad de Ciencias de la Educación", "Escuela Profesional de Educación Primaria", "Comité de Calidad de la Escuela Profesional de Educación Primaria"];
const committee = ["Dr. Wido Willam Condori Castillo · Presidente", "Dr. Vidnay Noel Valero Ancco · Coordinador general", "M.Sc. Ruth Mery Cruz Huisa · Secretaria", "Lic. Milciades Conrado Suaña Calsin · Tesorero", "Lic. Blademir Cusi Arisaca · Coordinador de ponencias"];
const schedule = [["DÍA 01 · 06 JUL", "Inauguración", "16:00 registro · 16:30 inauguración · 17:00 conferencias · 18:30 ponencias"], ["DÍA 02 · 07 JUL", "Conferencias y ponencias", "17:00 conferencias · 18:30 ponencias · 21:30 cierre"], ["DÍA 03 · 08 JUL", "Ponencias y clausura", "17:00 ponencias · 19:40 conferencias · 21:00 clausura"]];
const committeeMembers = ["Dr. Henry Mark Vilca Apaza", "Dra. Erika Marcia Georgina Jaén Tejada", "Lic. Milciades Conrado Suaña Calsin", "M.Sc. Juan Alexander Condori Palomino", "M.Sc. Ofelia Marleny Mamani Luque", "M.Sc. Nilton César Mayta Jara", "Dra. Zaida Esther Callata Gallegos", "M.Sc. Estanislao Pacompía Cari", "Dra. Damiana Flores Mamani", "Dra. Danitza Luisa Sardón Ari", "Dr. Fredy Sosa Gutiérrez", "Dra. Katia Pérez Argollo", "Dra. Lesy Berly Leon Hancco", "M.Sc. José Antonio Supo Gutiérrez", "Mg. Miryam Pari Orihuela", "M.Sc. Yobana Milagros Calsín Chambilla", "M.Sc. José Marcial Mamani Condori", "M.Sc. Humberto Mamani Coaquira", "Dra. Juana Violeta Chaiña Apaza", "M.Sc. Kleiber Rosendo Vargas Pacosonco", "Lic. Edith Rizalazo Incacutipa", "Lic. Erika Sanches Gomez", "Lic. Marice Melisa Condori Gordillo", "M.Sc. Klidy Mercedes Contreras", "Sra. Nery Marlene Valencia Sanchez", "Sra. Chabuca Palero Velasquez"];

export default function Home() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Image src="/logosecu.png" alt="Escudo de la Facultad de Educación Primaria" width={42} height={42} /></span>
          <span>
            <strong>I Congreso</strong>
            <small>EPEP UNA Puno · Investigación científica</small>
          </span>
        </a>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#organizadores" onClick={() => setMenuOpen(false)}>Organización</a>
          <a href="#programa" onClick={() => setMenuOpen(false)}>Programa</a>
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
              <span className="live-dot" /> 06—08 JUL 2022 · PUNO
            </div>
            <h1>Perspectivas, desafíos y políticas educativas.</h1>
            <p className="hero-lead">I Congreso Internacional de Investigación Científica</p>
            <p className="hero-text">
              Un encuentro académico de la Escuela Profesional de Educación Primaria para compartir investigaciones, conferencias y ponencias sobre educación.
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
              <span><Users size={16} /> Conferencias y ponencias</span>
              <span><MapPin size={16} /> Av. Floral 1153 · Puno</span>
              <span><Check size={16} /> Certificación</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <Image className="hero-logo" src="/logosecu.png" alt="" width={94} height={94} priority />
              <span className="card-chip">EPEP · UNA Puno</span>
              <div className="date-stack">
                <span>06</span>
                <small>JUL<br />2022</small>
              </div>

              <div className="mini-stats">
                <div>
                  <strong>03</strong>
                  <span>Días</span>
                </div>
                <div>
                  <strong>02</strong>
                  <span>Conferencias/día</span>
                </div>
                <div>
                  <strong>PUNO</strong>
                  <span>Sede</span>
                </div>
              </div>
            </div>

            <div className="floating-panel">
              <div className="floating-header">
                <span>Agenda destacada</span>
                <small>06—08 JUL</small>
              </div>
              <ul>
                <li>Conferencias magistrales</li>
                <li>Ponencias de investigación</li>
                <li>Clausura y certificación</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-row" aria-label="Datos destacados">
        <div><strong>06</strong><span>Inicio<br /><small>Julio de 2022</small></span></div>
        <div><strong>03</strong><span>Días de congreso<br /><small>06 al 08 de julio</small></span></div>
        <div><strong>25/05</strong><span>Resúmenes<br /><small>Inicio de postulación</small></span></div>
        <div><strong>08/07</strong><span>Libro de resúmenes<br /><small>Publicación programada</small></span></div>
      </section>

      <section className="section organization-section" id="organizadores">
        <div className="section-heading">
          <div>
            <span className="kicker">Instituciones responsables</span>
            <h2>Una comunidad que<br /><em>investiga y educa.</em></h2>
          </div>
          <p>El congreso fue organizado por la Universidad Nacional del Altiplano, su Facultad de Ciencias de la Educación y la Escuela Profesional de Educación Primaria.</p>
        </div>

        <div className="track-grid">
          {institutions.map((institution, index) => (
            <article className="track-card" key={institution}>
              <span className="track-number">0{index + 1}</span>
              <Building2 size={19} />
              <h3>{institution}</h3>
              <p>Institución responsable de la organización y desarrollo del encuentro académico.</p>
            </article>
          ))}
        </div>

        <div className="committee-panel">
          <div>
            <span className="kicker">Comité organizador</span>
            <h3>Equipo responsable</h3>
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
            <span className="kicker">¿Por qué participar?</span>
            <h2>Un espacio para compartir investigación y pensamiento educativo.</h2>
            <p>
              El programa reúne conferencias, ponencias y experiencias de investigadores de Perú, Cuba, España y Chile.
            </p>
          </div>

          <div className="showcase-list">
            <div>
              <Sparkles size={18} />
              <div>
                <strong>Ponentes invitados</strong>
                <span>Participación académica de la Universidad de Oriente, Cuba; Universidad de Granada, España; Universidad Católica del Maule, Chile; y la UNA Puno.</span>
              </div>
            </div>
            <div>
              <GraduationCap size={18} />
              <div>
                <strong>Temas educativos</strong>
                <span>Psicología educativa, educación matemática, didáctica de las ciencias y formación docente.</span>
              </div>
            </div>
            <div>
              <FileText size={18} />
              <div>
                <strong>Libro de resúmenes</strong>
                <span>La publicación de resúmenes aptos y del libro estuvo contemplada en el calendario oficial.</span>
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
          {schedule.map(([day, title, detail], index) => <div className={index === 0 ? "schedule-day active" : "schedule-day"} key={day}><span>{day}</span><strong>{title}</strong><small>{detail}</small></div>)}
        </div>

        <div className="agenda-list">
          <div>
            <time>16:00</time>
            <span>
              <b>Registro e inauguración del congreso</b>
              <small>Día 01 · 06 de julio · Puno</small>
            </span>
            <Users size={18} />
          </div>
          <div>
            <time>17:00</time>
            <span>
              <b>Conferencias 1 y 2</b>
              <small>17:00–18:20 · Días 01 y 02</small>
            </span>
            <Sparkles size={18} />
          </div>
          <div>
            <time>18:30</time>
            <span>
              <b>Ponencias de investigación</b>
              <small>18:30–21:30 · Días 01 y 02</small>
            </span>
            <FileText size={18} />
          </div>
        </div>
      </section>

      <section className="section investment" id="inscripciones">
        <div className="investment-copy">
          <span className="kicker">Inscripciones oficiales</span>
          <h2>Participa en el<br /><em>encuentro académico.</em></h2>
          <p>La página oficial separa el registro para estudiantes de la UNA Puno, participantes externos y ponentes. También ofrece el formato de resúmenes.</p>
          <a className="button button-dark" href="https://sites.google.com/view/congresoepep/inscripciones" target="_blank" rel="noreferrer"><ExternalLink size={18} /> Abrir página oficial</a>
        </div>

        <div className="price-list registration-links">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfNW1Zo6JkT78xhWpAYI2XFL1mf8MCQA9PWJRdNasciMwnT2A/viewform" target="_blank" rel="noreferrer"><span>Estudiantes UNA Puno</span><ExternalLink size={16} /></a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSeB46kCKugAOrmtAhbSdnHwP1g0sFvaGZTxcxeJJuiib6T19g/viewform" target="_blank" rel="noreferrer"><span>Participantes externos</span><ExternalLink size={16} /></a>
          <a href="https://docs.google.com/document/d/1a5T4RR5YOEdJMba1j8aLAOhxBEEsGHJR/edit" target="_blank" rel="noreferrer"><span>Ponentes y formato de resúmenes</span><ExternalLink size={16} /></a>
        </div>
      </section>

      <section className="section contact-section" id="contacto">
        <div>
          <span className="kicker">Mesa de ayuda</span>
          <h2>¿Conversamos?</h2>
          <p>Informes, contactos y enlaces institucionales del I Congreso Internacional de Investigación Científica.</p>
        </div>

        <div className="contact-actions">
          <a className="contact-link" href="https://www.facebook.com/I-Congreso-de-Investigaci%C3%B3n-Cient%C3%ADfica-102841899107874/" target="_blank" rel="noreferrer">
            <CircleHelp size={19} /> Página de Facebook del Congreso <ArrowUpRight size={16} />
          </a>
          <a className="contact-link" href="https://primaria.unap.edu.pe/" target="_blank" rel="noreferrer">
            <Building2 size={19} /> Web oficial de Educación Primaria <ArrowUpRight size={16} />
          </a>
          <a className="contact-link" href="https://sites.google.com/view/congresoepep/informes" target="_blank" rel="noreferrer">
            <Send size={19} /> Contactos y WhatsApp oficiales <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <footer>
        <span>© 2022 EPEP UNA Puno · I Congreso Internacional de Investigación Científica</span>
        <span>Av. Floral 1153 · Puno</span>
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
