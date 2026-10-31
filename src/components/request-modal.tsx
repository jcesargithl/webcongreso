"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, CreditCard, ExternalLink, FileText, Send, X } from "lucide-react";
import { categoryLabel, formatCurrency, getCategory, getInstitutionalFee, getRegistrationTotal, PAGALO_URL, PAYMENT_CODE, PAYMENT_ENTITY, PAYMENT_SERVICE, PAPER_MAX_BYTES, RECEIPT_MAX_BYTES, type RegistrationCategoryId } from "@/lib/congress";

export type ModalState =
  | { kind: "registration"; categoryId: RegistrationCategoryId }
  | { kind: "paper" }
  | { kind: "corporate" }
  | null;
type VerifiedRegistration = { id: string; name: string; email: string; doc_type: string; doc_number: string; institution: string; category: string; mode: string };
type Verification = { token: string; registration: VerifiedRegistration };
type SubmissionResult = { id: string; payment_status: string; email_sent: boolean | null; email_status?: "pending" | "unavailable" };

export function RequestModal({ modal, onClose }: { modal: Extract<NonNullable<ModalState>, { kind: "registration" | "paper" }>; onClose: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isPaper = modal.kind === "paper";
  const category = modal.kind === "registration" ? getCategory(modal.categoryId) : undefined;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') || []).filter(element => element.offsetParent !== null);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  function checkUpload(event: ChangeEvent<HTMLInputElement>, limit: number, receipt: boolean) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") || (receipt ? file.size >= limit : file.size > limit)) {
      event.currentTarget.value = "";
      setError(receipt ? "Adjunta un comprobante PDF menor de 2 MB." : "Adjunta una investigación PDF de hasta 10 MB.");
    } else setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const form = new FormData(event.currentTarget);
    form.set("kind", modal.kind);
    if (modal.kind === "registration" && category) form.set("category_id", category.id);
    if (isPaper && verification) {
      form.set("verification_token", verification.token);
    }
    setBusy(true);
    try {
      const response = await fetch("/api/requests", { method: "POST", body: form });
      const data = await response.json() as SubmissionResult & { error?: string };
      if (!response.ok) {
        setError(data.error || "No pudimos registrar tu solicitud.");
        if (isPaper && response.status === 403) setVerification(null);
        return;
      }
      setResult(data);
    } catch { setError("No pudimos conectarnos. Revisa tu conexión y vuelve a intentar."); }
    finally { setBusy(false); }
  }

  const selected = verification?.registration;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
        <button className="icon-button modal-close" title="Cerrar" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
        {result ? (
          <div className="success">
            <span><Check size={28} /></span>
            <h2 id="modal-title">{isPaper ? "Investigación recibida" : "Inscripción registrada"}</h2>
            <p>{isPaper ? "El comité académico revisará tu ponencia. La recepción del archivo no significa que la ponencia ya fue aprobada."
              : result.payment_status === "exempt" ? "Tu inscripción como ponente interno es gratuita. Ya puedes verificarla en «Enviar investigación»."
                : "Guardamos tus datos y tu comprobante. Un administrador revisará el pago antes de confirmar la inscripción."}</p>
            <p>{result.email_status === "pending"
              ? "La confirmación por correo está en proceso. Revisa tu bandeja de entrada y la carpeta de spam."
              : result.email_sent
                ? "Enviamos una confirmación a tu correo. Revisa también la carpeta de spam."
                : "Tu solicitud quedó guardada. No pudimos enviar la confirmación por correo; contacta a la Secretaría si necesitas ayuda."}</p>
            <a className="btn btn-outline btn-full" href="https://wa.me/51982311128?text=Hola%20Dra.%20Ruth%2C%20necesito%20ayuda%20con%20mi%20inscripci%C3%B3n%20al%20IV%20Congreso." target="_blank" rel="noreferrer">Contactar por WhatsApp (Dra. Ruth)</a>
            <button className="btn btn-outline btn-full" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <span className="kicker">{isPaper ? "Envío de investigaciones" : "Inscripción al congreso"}</span>
            <h2 id="modal-title">{isPaper ? "Presenta tu investigación." : "Reserva tu lugar."}</h2>
            <p className="modal-intro">{isPaper
              ? "Recepción de ponencias abierta hasta el 06 de noviembre. No se requiere pago previo para enviar tu trabajo de investigación."
              : category?.fee === 0 ? "Completa tus datos para registrarte como ponente interno. Esta categoría es de libre acceso para la comunidad EPEP."
                : "Completa tus datos y adjunta la constancia de Págalo.pe para validar tu inscripción."}</p>

            {isPaper ? (
              <form onSubmit={submit}>
                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px 16px', color: '#1E40AF', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#1E3A8A' }}>
                    Recepción de ponencias sin pago previo (Hasta el 06 de noviembre)
                  </strong>
                  <p style={{ margin: '0 0 6px 0' }}>
                    Los ponentes no deben realizar el pago de inscripción por adelantado. Presenta tu investigación aquí; el Comité Científico (Dr. Vidnay, Dra. Danitza, Dra. Katia, Dr. Estanislao) la evaluará del <strong>7 al 9 de noviembre</strong>.
                  </p>
                  <p style={{ margin: 0 }}>
                    El dictamen de ponencias aptas se notificará el <strong>10 y 11 de noviembre</strong>. Únicamente tras la aprobación se procederá al pago de inscripción (S/ 100 por cada autor) con plazo hasta el 15 de noviembre.
                  </p>
                </div>

                {selected ? (
                  <>
                    <div className="verification-notice"><Check size={18} /><span>Inscripción de ponente verificada</span></div>
                    <label>Nombre completo<input value={selected.name} readOnly /></label>
                    <label>Correo electrónico<input value={selected.email} readOnly /></label>
                    <label>Documento<input value={selected.doc_type + ": " + selected.doc_number} readOnly /></label>
                    <label>Categoría seleccionada<input value={selected.category} readOnly /></label>
                    <label>Modalidad<input value={selected.mode} readOnly /></label>
                    <button type="button" className="form-link" onClick={() => { setVerification(null); setError(""); }}>Ingresar otros datos de autor</button>
                  </>
                ) : (
                  <>
                    <label>Nombre completo del autor principal<input name="name" placeholder="Nombres y apellidos completos" autoComplete="name" minLength={2} maxLength={160} required /></label>
                    <label>Correo electrónico<input name="email" type="email" placeholder="Ej.: autor@correo.com (para notificaciones)" autoComplete="email" maxLength={320} required /></label>
                    <label>Tipo de documento<select name="doc_type" required><option>DNI</option><option>CE</option><option>Pasaporte</option><option>Otro</option></select></label>
                    <label>Número de documento<input name="doc_number" placeholder="Número de DNI, CE o Pasaporte" maxLength={30} required /></label>
                    <label>Institución / Universidad de procedencia<input name="institution" placeholder="Universidad, instituto o entidad de procedencia" autoComplete="organization" maxLength={240} /></label>
                    <label>Categoría de ponente
                      <select name="category_id" required defaultValue="speaker_external">
                        <option value="speaker_external">Ponente Externo (Nacional / Internacional · Modalidad Híbrida)</option>
                        <option value="speaker_internal_teacher">Docente EPEP (Ponente Interno · Presencial)</option>
                        <option value="speaker_internal_student">Estudiante EPEP (Ponente Interno · Presencial)</option>
                      </select>
                    </label>
                  </>
                )}

                <label>Título o eje de la ponencia<input name="topic" placeholder="Título de tu investigación o eje temático" maxLength={300} required /></label>
                <label>Resumen breve<textarea name="message" rows={4} placeholder="Describe el objetivo, la metodología y los resultados de tu investigación." maxLength={10000} /></label>
                <label>Investigación en PDF<input name="file" type="file" accept=".pdf,application/pdf" onChange={event => checkUpload(event, PAPER_MAX_BYTES, false)} required /><small className="form-hint">Archivo PDF de hasta 10 MB.</small></label>

                <button className="btn btn-primary btn-full" type="submit" disabled={busy}>
                  <FileText size={16} />{busy ? "Enviando investigación..." : "Enviar investigación"}
                </button>
              </form>
            ) : (
              <form onSubmit={submit}>
                {category ? (
                  <>
                    {category.id === "speaker_external" && (
                      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px', padding: '14px 16px', color: '#92400E', fontSize: '13px', lineHeight: '1.5' }}>
                        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Pago de inscripción para ponencias aprobadas</strong>
                        <p style={{ margin: '0 0 8px 0' }}>
                          Los ponentes externos <strong>no deben pagar por adelantado</strong>. Si aún no enviaste tu investigación, hazlo antes del <strong>06 de noviembre</strong> mediante el botón <em>«Enviar investigación»</em>.
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>¿Tu investigación ya fue declarada APTA por el Comité Científico?</strong> Si recibiste el dictamen aprobatorio (10 y 11 de nov), completa tus datos y adjunta tu comprobante a continuación (S/ 100 por cada autor, plazo hasta el 15 de noviembre).
                        </p>
                      </div>
                    )}
                    {category.id === "attendee_external" && (
                      <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px 14px', color: '#0369A1', fontSize: '13px' }}>
                        <strong>Categoría para Egresados y Público General:</strong> Los egresados de la EPEP y otras instituciones participan bajo esta categoría con certificación oficial individual.
                      </div>
                    )}
                    <label>Nombre completo<input name="name" placeholder="Ingresa tus nombres y apellidos" autoComplete="name" minLength={2} maxLength={160} required /></label>
                    <label>Correo electrónico<input name="email" type="email" placeholder="Ej.: nombre@correo.com" autoComplete="email" maxLength={320} required /></label>
                    <label>Tipo de documento<select name="doc_type" required><option>DNI</option><option>CE</option><option>Pasaporte</option><option>Otro</option></select></label>
                    <label>Número de documento<input name="doc_number" placeholder="Ingresa tu número de documento" maxLength={30} required /></label>
                    <label>Institución<input name="institution" placeholder="Nombre de tu universidad o institución" autoComplete="organization" maxLength={240} /></label>
                    <label>Categoría seleccionada<input value={categoryLabel(category)} readOnly /></label>
                    <label>Modalidad<input value={category.mode} readOnly /></label>
                    {category.fee === 0 ? (
                      <div className="verification-notice"><Check size={18} /><span>Inscripción exonerada de pago para miembros de la comunidad EPEP. No se requiere comprobante ni depósito.</span></div>
                    ) : (
                      <fieldset className="payment-panel">
                        <legend><CreditCard size={18} />Pago por Págalo.pe</legend>
                        <ol className="payment-steps">
                          <li>Ingresa a <a href={PAGALO_URL} target="_blank" rel="noreferrer">Págalo.pe <ExternalLink size={12} /></a>.</li>
                          <li>Selecciona el código <strong>{PAYMENT_CODE}</strong>: <strong>{PAYMENT_ENTITY}</strong>.</li>
                          <li>Elige <strong>{PAYMENT_SERVICE}</strong> y realiza el pago.</li>
                          <li>Registra los datos de la constancia y adjunta el PDF.</li>
                        </ol>
                        <dl className="payment-breakdown">
                          <div><dt>Tarifa de inscripción</dt><dd>{formatCurrency(category.fee)}</dd></div>
                          <div><dt>Cargo institucional</dt><dd>{formatCurrency(getInstitutionalFee(category))}</dd></div>
                          <div className="payment-total"><dt>Total a pagar</dt><dd>{formatCurrency(getRegistrationTotal(category))}</dd></div>
                        </dl>
                        <label className="payment-checkbox"><input type="checkbox" name="payment_method" value="pagalo_pe" required />Realicé el pago mediante Págalo.pe</label>
                        <div className="payment-fields">
                          <label>Documento del comprobante<input name="payment_document_number" placeholder="Documento que figura en la constancia" maxLength={30} required /></label>
                          <label>Secuencia de pago<input name="payment_sequence" inputMode="numeric" placeholder="Ej.: 093245" pattern="[0-9]{6}" minLength={6} maxLength={6} required /><small className="form-hint">Los 6 dígitos, incluidos los ceros iniciales.</small></label>
                          <label>Monto total pagado (S/)<input name="payment_amount" type="number" min="0.01" step="0.01" placeholder={getRegistrationTotal(category).toFixed(2)} required /></label>
                          <label>Fecha del comprobante<input name="payment_date" type="date" required /></label>
                        </div>
                        <label>Comprobante de pago (PDF)<input name="receipt" type="file" accept=".pdf,application/pdf" onChange={event => checkUpload(event, RECEIPT_MAX_BYTES, true)} required /><small className="form-hint">Solo PDF, menor de 2 MB. Registra el monto total, incluido el cargo institucional.</small></label>
                        <p className="form-hint">La Secretaría validará los datos y el comprobante antes de aprobar el pago.</p>
                      </fieldset>
                    )}
                  </>
                ) : null}
                <button className="btn btn-primary btn-full" type="submit" disabled={busy || (!selected && !category)}>{isPaper ? <FileText size={16} /> : <Send size={16} />}{busy ? "Enviando..." : isPaper ? "Enviar investigación" : "Registrar inscripción"}</button>
              </form>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
