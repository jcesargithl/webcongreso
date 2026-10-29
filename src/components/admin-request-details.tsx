"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink, FileText, LoaderCircle, Mail, RefreshCw, Save, ShieldCheck, X } from "lucide-react";
import type { CongressRequest, RequestStatus } from "@/lib/requests";
import { categoryLabel, formatCurrency, getCategoryForRequest, registrationCategories } from "@/lib/congress";
import { canApproveRequest, formatPaymentDate, formatTimestamp, paymentLabel, registrationFor, requestStatuses, statusLabel, type RequestLookup } from "@/lib/admin-requests";
import styles from "@/app/admin/admin.module.css";

export type AdminNotice = { text: string; warning: boolean };
type DetailProps = {
  request: CongressRequest;
  lookup: RequestLookup;
  busy: boolean;
  note: string;
  notice: AdminNotice | null;
  error: string;
  position: number;
  total: number;
  onClose: () => void;
  onNavigate: (offset: number) => void;
  onOpen: (id: string) => void;
  onNoteChange: (value: string) => void;
  onUpdate: (id: string, changes: Record<string, string>) => Promise<boolean>;
  onRefresh: () => void;
};

export function AdminFeedback({ notice, error, onDismiss }: { notice: AdminNotice | null; error: string; onDismiss?: () => void }) {
  if (!notice && !error) return null;
  return (
    <div className={[styles.feedback, error ? styles.feedbackError : notice?.warning ? styles.feedbackWarning : styles.feedbackSuccess].join(" ")}
      role={error ? "alert" : "status"}>
      <span>{error || notice?.text}</span>
      {onDismiss && <button type="button" aria-label="Cerrar mensaje" onClick={onDismiss}><X size={16} /></button>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children || "No registrado"}</dd></div>;
}

function StatusForm({ request, canApprove, busy, onUpdate }: {
  request: CongressRequest; canApprove: boolean; busy: boolean; onUpdate: DetailProps["onUpdate"];
}) {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  return (
    <form className={styles.decisionForm} onSubmit={event => {
      event.preventDefault();
      if (status !== request.status) void onUpdate(request.id, { status });
    }}>
      <label>Estado de la solicitud
        <select value={status} onChange={event => setStatus(event.target.value as RequestStatus)} disabled={busy}>
          {request.status === "cash" && <option value="cash" disabled>{statusLabel("cash", request.kind)}</option>}
          {requestStatuses.map(value => <option key={value} value={value} disabled={value === "approved" && !canApprove}>{statusLabel(value, request.kind)}</option>)}
        </select>
      </label>
      <button type="submit" className={styles.primaryButton} disabled={busy || status === request.status}>
        {busy ? <LoaderCircle size={16} className={styles.spinning} /> : <Save size={16} />}Guardar estado
      </button>
    </form>
  );
}

export default function AdminRequestDetails(props: DetailProps) {
  const { request, lookup, busy, note, notice, error, onClose, onUpdate } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const registration = registrationFor(request, lookup);
  const category = getCategoryForRequest(registration || request);
  const paid = Boolean(category && category.fee > 0);
  const relatedPapers = request.kind === "registration"
    ? [...lookup.values()].filter(row => row.kind === "paper" && row.registration_id === request.id)
    : [];
  const canApprove = canApproveRequest(request, lookup);
  const receiptComplete = Boolean(registration?.receipt_url && registration.payment_sequence
    && registration.payment_amount != null && registration.payment_date && registration.payment_document_number);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.drawer} aria-labelledby="request-detail-title" onCancel={onClose}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <div className={styles.drawerLayout}>
        <header className={styles.drawerHeader}>
          <div><span className={styles.eyebrow}>{request.kind === "paper" ? "Detalle de ponencia" : "Detalle de inscripción"}</span>
            <h2 id="request-detail-title">{request.name}</h2>
            <span className={[styles.badge, styles[request.status]].join(" ")}>{statusLabel(request.status, request.kind)}</span>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Cerrar detalles" onClick={onClose}><X size={21} /></button>
        </header>

        <div className={styles.drawerBody}>
          <AdminFeedback notice={notice} error={error} />
          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}><h3>Datos del participante</h3><a href={"mailto:" + request.email} className={styles.textButton}><Mail size={14} />Escribir correo</a></div>
            <dl className={styles.detailGrid}>
              <Field label="Correo electrónico">{request.email}</Field>
              <Field label="Documento">{(request.doc_type || "Documento") + ": " + (request.doc_number || "No registrado")}</Field>
              <Field label="Institución">{request.institution}</Field>
              <Field label="Modalidad">{request.mode}</Field>
              <Field label="Categoría">{request.category || (category ? categoryLabel(category) : "Por identificar")}</Field>
              <Field label="Registrado">{formatTimestamp(request.created_at)}</Field>
            </dl>
            {request.kind === "registration" && !request.category_id && (
              <label className={styles.fieldLabel}>Identificar categoría anterior
                <select defaultValue="" disabled={busy} onChange={event => void onUpdate(request.id, { action: "assign_category", category_id: event.target.value })}>
                  <option value="" disabled>Selecciona la categoría</option>
                  {registrationCategories.map(plan => <option key={plan.id} value={plan.id}>{categoryLabel(plan)}</option>)}
                </select>
              </label>
            )}
          </section>

          {request.kind === "paper" && <section className={styles.detailSection}>
            <div className={styles.sectionHeading}><h3>Investigación</h3><FileText size={17} /></div>
            <h4 className={styles.researchTitle}>{request.topic || "Sin título registrado"}</h4>
            {request.message && <p className={styles.abstract}>{request.message}</p>}
            {request.file_url
              ? <a className={styles.fileLink} href={request.file_url} target="_blank" rel="noreferrer"><FileText size={18} /><span>Abrir investigación PDF<small>Documento adjunto por el ponente</small></span><ExternalLink size={16} /></a>
              : <p className={styles.muted}>No hay un archivo disponible para esta ponencia.</p>}
            {registration
              ? <button type="button" className={styles.relatedLink} onClick={() => props.onOpen(registration.id)}><ArrowDownLeft size={16} /><span>Ver inscripción vinculada</span><ChevronRight size={16} /></button>
              : <p className={styles.muted}>Ponencia anterior sin inscripción vinculada.</p>}
          </section>}

          {relatedPapers.length > 0 && <section className={styles.detailSection}>
            <div className={styles.sectionHeading}><h3>Ponencias vinculadas</h3><span className={styles.count}>{relatedPapers.length}</span></div>
            {relatedPapers.map(paper => <button type="button" key={paper.id} className={styles.relatedLink} onClick={() => props.onOpen(paper.id)}>
              <FileText size={16} /><span>{paper.topic || "Investigación"}<small>{statusLabel(paper.status, "paper")}</small></span><ArrowUpRight size={16} />
            </button>)}
          </section>}

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}><h3>Pago de inscripción</h3>
              <span className={[styles.badge, styles[registration?.payment_status || "unknown"]].join(" ")}>{paymentLabel(registration?.payment_status, true)}</span>
            </div>
            {!registration ? <p className={styles.muted}>No hay una inscripción vinculada para consultar el pago.</p>
              : registration.payment_status === "exempt"
                ? <div className={styles.exemptNote}><ShieldCheck size={20} /><p><strong>Inscripción gratuita</strong>El ponente interno no requiere pago ni comprobante.</p></div>
                : <>
                  <div className={styles.amounts}>
                    <div><span>Tarifa</span><strong>{registration.registration_fee != null ? formatCurrency(Number(registration.registration_fee)) : "Por identificar"}</strong></div>
                    <div><span>Cargo institucional</span><strong>{formatCurrency(Number(registration.institutional_fee || 0))}</strong></div>
                    <div><span>Total esperado</span><strong>{registration.registration_fee != null ? formatCurrency(Number(registration.registration_fee) + Number(registration.institutional_fee || 0)) : "Por identificar"}</strong></div>
                  </div>
                  <dl className={styles.detailGrid}>
                    <Field label="Método">{registration.payment_method === "pagalo_pe" ? "Págalo.pe · código 091" : "No registrado"}</Field>
                    <Field label="Documento del comprobante">{registration.payment_document_number}</Field>
                    <Field label="Secuencia">{registration.payment_sequence}</Field>
                    <Field label="Monto declarado">{registration.payment_amount != null ? formatCurrency(Number(registration.payment_amount)) : "No registrado"}</Field>
                    <Field label="Fecha de pago">{formatPaymentDate(registration.payment_date)}</Field>
                    <Field label="Concepto">OTROS SERV. EDU. EDU. PRIMARIA</Field>
                  </dl>
                  {registration.receipt_url && <a className={styles.fileLink} href={registration.receipt_url} target="_blank" rel="noreferrer">
                    <FileText size={18} /><span>Abrir comprobante PDF<small>Revisar antes de aprobar el pago</small></span><ExternalLink size={16} />
                  </a>}
                  {registration.payment_verified_at && <p className={styles.auditNote}>Revisado el {formatTimestamp(registration.payment_verified_at)} por {registration.payment_verified_by_email || "Administrador"}.</p>}
                  {registration.payment_notes && <p className={styles.savedNotes}>{registration.payment_notes}</p>}
                  {request.kind === "registration" && paid && <div className={styles.paymentReview}>
                    <label className={styles.fieldLabel}>Observaciones del pago<textarea rows={3} maxLength={2000} value={note} onChange={event => props.onNoteChange(event.target.value)} placeholder="Anota el resultado de la revisión del comprobante…" disabled={busy} /></label>
                    <div className={styles.paymentActions}>
                      <button type="button" className={styles.primaryButton} disabled={busy || !receiptComplete}
                        onClick={() => void onUpdate(request.id, { action: "review_payment", decision: "approved", notes: note })}><Check size={16} />Aprobar pago</button>
                      <button type="button" className={styles.dangerButton} disabled={busy}
                        onClick={() => void onUpdate(request.id, { action: "review_payment", decision: "rejected", notes: note })}>Rechazar pago</button>
                    </div>
                    {!receiptComplete && <p className={styles.muted}>Para aprobar se requiere el PDF y todos los datos del comprobante.</p>}
                  </div>}
                </>}
          </section>

          {request.kind === "registration" && request.message && <section className={styles.detailSection}><h3>Mensaje</h3><p className={styles.abstract}>{request.message}</p></section>}

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}><h3>Gestión de la solicitud</h3></div>
            {!canApprove && request.status !== "approved" && <p className={styles.requirements}>La aprobación requiere una categoría válida y, cuando corresponda, un pago aprobado.</p>}
            <StatusForm key={request.id + ":" + request.status} request={request} canApprove={canApprove} busy={busy} onUpdate={onUpdate} />
            <div className={styles.secondaryActions}>
              <button type="button" className={styles.textButton} disabled={busy} onClick={() => void onUpdate(request.id, { action: "resend_notification" })}><Mail size={15} />Reenviar correo</button>
              <button type="button" className={styles.textButton} disabled={busy} onClick={props.onRefresh}><RefreshCw size={14} />Actualizar archivos</button>
            </div>
            {busy && <p className={styles.processing} role="status"><LoaderCircle size={14} className={styles.spinning} />Guardando y procesando la notificación…</p>}
          </section>
          <p className={styles.recordId}>ID de solicitud: {request.id}</p>
        </div>

        <footer className={styles.drawerFooter}>
          <button type="button" className={styles.secondaryButton} disabled={busy || props.position <= 0} onClick={() => props.onNavigate(-1)}><ChevronLeft size={16} />Anterior</button>
          <span>{props.position >= 0 ? (props.position + 1) + " de " + props.total : "Registro vinculado"}</span>
          <button type="button" className={styles.secondaryButton} disabled={busy || props.position < 0 || props.position >= props.total - 1} onClick={() => props.onNavigate(1)}>Siguiente<ChevronRight size={16} /></button>
        </footer>
      </div>
    </dialog>
  );
}
