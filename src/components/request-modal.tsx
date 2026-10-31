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

  async function verifyRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await fetch("/api/registrations/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), doc_type: form.get("doc_type"), doc_number: form.get("doc_number") }),
      });
      const data = await response.json() as Verification & { error?: string };
      if (!response.ok) { setError(data.error || "No pudimos verificar tu inscripción."); return; }
      setVerification(data);
    } catch { setError("No pudimos conectarnos. Intenta verificar tu inscripción nuevamente."); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const form = new FormData(event.currentTarget);
    form.set("kind", modal.kind);
    if (modal.kind === "registration" && category) form.set("category_id", category.id);
    if (isPaper) {
      if (!verification) { setError("Verifica primero tu inscripción como ponente."); return; }
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
              ? selected ? "Tu inscripción como ponente está verificada. Completa los datos de tu investigación."
                : "Plazo ampliado para recepción de ponencias hasta el 06 de noviembre. Primero verifica tu inscripción como ponente con tu correo y documento registrado (evaluación científica: 7 al 9 de nov; notificación de aptas: 10 y 11 de nov)."
              : category?.fee === 0 ? "Completa tus datos para registrarte como ponente interno. Esta categoría es gratuita."
                : "Completa tus datos y adjunta la constancia de Págalo.pe para validar tu inscripción."}</p>

            {isPaper && !selected ? (
              <form onSubmit={verifyRegistration}>
                <label>Correo de inscripción<input name="email" type="email" placeholder="Ej.: nombre@correo.com" autoComplete="email" maxLength={320} required /></label>
                <label>Tipo de documento<select name="doc_type" required><option>DNI</option><option>CE</option><option>Pasaporte</option><option>Otro</option></select></label>
                <label>Número de documento<input name="doc_number" placeholder="Documento usado en tu inscripción" maxLength={30} required /></label>
                <button className="btn btn-primary btn-full" type="submit" disabled={busy}><Check size={16} />{busy ? "Verificando..." : "Verificar inscripción"}</button>
                <a href="#inscripciones" className="form-link" onClick={onClose}>Aún no estoy inscrito como ponente</a>
              </form>
            ) : (
              <form onSubmit={submit}>
                {selected ? (
                  <>
                    <div className="verification-notice"><Check size={18} /><span>Inscripción de ponente verificada</span></div>
                    <label>Nombre completo<input value={selected.name} readOnly /></label>
                    <label>Correo electrónico<input value={selected.email} readOnly /></label>
                    <label>Documento<input value={selected.doc_type + ": " + selected.doc_number} readOnly /></label>
                    <label>Categoría seleccionada<input value={selected.category} readOnly /></label>
                    <label>Modalidad<input value={selected.mode} readOnly /></label>
                    <button type="button" className="form-link" onClick={() => { setVerification(null); setError(""); }}>Usar otra inscripción</button>
                    <label>Título o eje de la ponencia<input name="topic" placeholder="Título de tu investigación o eje temático" maxLength={300} required /></label>
                    <label>Resumen breve<textarea name="message" rows={4} placeholder="Describe el objetivo, la metodología y los resultados de tu investigación." maxLength={10000} /></label>
                    <label>Investigación en PDF<input name="file" type="file" accept=".pdf,application/pdf" onChange={event => checkUpload(event, PAPER_MAX_BYTES, false)} required /><small className="form-hint">Archivo PDF de hasta 10 MB.</small></label>
                  </>
                ) : category ? (
                  <>
                    <label>Nombre completo<input name="name" placeholder="Ingresa tus nombres y apellidos" autoComplete="name" minLength={2} maxLength={160} required /></label>
                    <label>Correo electrónico<input name="email" type="email" placeholder="Ej.: nombre@correo.com" autoComplete="email" maxLength={320} required /></label>
                    <label>Tipo de documento<select name="doc_type" required><option>DNI</option><option>CE</option><option>Pasaporte</option><option>Otro</option></select></label>
                    <label>Número de documento<input name="doc_number" placeholder="Ingresa tu número de documento" maxLength={30} required /></label>
                    <label>Institución<input name="institution" placeholder="Nombre de tu universidad o institución" autoComplete="organization" maxLength={240} /></label>
                    <label>Categoría seleccionada<input value={categoryLabel(category)} readOnly /></label>
                    <label>Modalidad<input value={category.mode} readOnly /></label>
                    {category.fee === 0 ? (
                      <div className="verification-notice"><Check size={18} /><span>Inscripción gratuita. No necesitas pago ni comprobante.</span></div>
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
