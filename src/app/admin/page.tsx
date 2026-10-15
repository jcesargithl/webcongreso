"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, FileText, RefreshCw, Users, Lock, Search } from "lucide-react";
import type { CongressRequest, PaymentStatus, RequestStatus } from "@/lib/requests";
import { categoryLabel, formatCurrency, getCategoryForRequest, registrationCategories } from "@/lib/congress";
import { supabaseClient } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

const statuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];
function statusLabel(status: RequestStatus, kind: CongressRequest["kind"]) {
  if (kind === "paper") return { pending: "Recibida", reviewing: "En revisión académica", approved: "Ponencia aceptada", rejected: "Ponencia rechazada", cash: "Estado anterior" }[status];
  return { pending: "Pendiente", reviewing: "En validación", approved: "Inscripción confirmada", rejected: "Inscripción rechazada", cash: "Pago registrado anteriormente" }[status];
}
function paymentLabel(status?: PaymentStatus | null) {
  return status ? { pending: "Pendiente de validación", approved: "Pago aprobado", rejected: "Pago rechazado", exempt: "Exonerado · gratuito" }[status] : "Sin datos de pago";
}
function formatDate(value?: string | null) {
  return value ? new Date(value + "T12:00:00Z").toLocaleDateString("es-PE", { timeZone: "America/Lima" }) : "No registrada";
}
function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });
}
async function fetchRequests(token: string, signal?: AbortSignal): Promise<CongressRequest[]> {
  const response = await fetch("/api/requests", { headers: { Authorization: "Bearer " + token }, cache: "no-store", signal });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "No pudimos cargar las solicitudes.");
  }
  return response.json();
}

export default function AdminPage() {
  const [requests, setRequests] = useState<CongressRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "registration" | "paper">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return;
      setSession(session);
      if (error) setError("No pudimos comprobar la sesión.");
      setAuthLoading(false);
    }).catch(() => { if (active) { setError("No pudimos conectar con el servicio de acceso."); setAuthLoading(false); } });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) { setRequests([]); setError(""); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    fetchRequests(session.access_token, controller.signal).then(data => {
      if (!controller.signal.aborted) { setRequests(data); setError(""); }
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Error al cargar solicitudes.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [session]);

  const loadRequests = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try { setRequests(await fetchRequests(session.access_token)); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Error al cargar solicitudes."); }
    finally { setLoading(false); }
  }, [session]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loginBusy) return;
    setError(""); setLoginBusy(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) setError("Credenciales inválidas.");
    } catch { setError("No pudimos conectar. Intenta nuevamente."); }
    finally { setLoginBusy(false); }
  }

  async function updateRequest(id: string, changes: Record<string, string>) {
    if (!session || busyId) return;
    setBusyId(id); setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ id, ...changes }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No pudimos actualizar la solicitud.");
      }
      await loadRequests();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos actualizar la solicitud."); }
    finally { setBusyId(null); }
  }

  if (authLoading) return <main className="admin-shell"><div className="empty-state">Cargando...</div></main>;
  if (!session) return (
    <main className="admin-shell admin-login-shell">
      <div className="admin-login-card">
        <Lock size={40} />
        <h1>Acceso restringido</h1>
        <p>Inicia sesión con tu cuenta de administrador.</p>
        <form onSubmit={handleLogin}>
          <label>Correo electrónico<input type="email" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} autoComplete="username" required /></label>
          <label>Contraseña<input type="password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary" disabled={loginBusy}>{loginBusy ? "Ingresando..." : "Ingresar"}</button>
        </form>
        <Link href="/" className="form-link">Volver al sitio público</Link>
      </div>
    </main>
  );

  const visible = requests.filter(request => {
    if (filter !== "all" && request.kind !== filter) return false;
    const payment = request.registration_id ? requests.find(parent => parent.id === request.registration_id) : request;
    if (paymentFilter !== "all" && payment?.payment_status !== paymentFilter) return false;
    const text = [request.name, request.email, request.doc_number, request.category, request.payment_sequence, payment?.payment_sequence].join(" ").toLowerCase();
    return text.includes(searchQuery.toLowerCase().trim());
  });

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-back"><ArrowLeft size={17} />Volver al sitio</Link>
        <div><span className="kicker">Gestión interna</span><h1>Solicitudes</h1></div>
        <div className="admin-session">
          <span>{session.user.email}</span>
          <button className="form-link" onClick={() => void supabaseClient.auth.signOut()}>Salir</button>
          <button className="icon-button" title="Actualizar solicitudes" aria-label="Actualizar solicitudes" disabled={loading || Boolean(busyId)} onClick={() => void loadRequests()}><RefreshCw size={17} /></button>
        </div>
      </header>
      <section className="admin-stats">
        <div><Users size={19} /><span><b>{requests.filter(request => request.kind === "registration").length}</b> inscripciones</span></div>
        <div><FileText size={19} /><span><b>{requests.filter(request => request.kind === "paper").length}</b> ponencias</span></div>
        <div><CreditCard size={19} /><span><b>{requests.filter(request => request.kind === "registration" && request.payment_status === "pending").length}</b> pagos por validar</span></div>
      </section>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-toolbar">
        <div className="filter-tabs">
          <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>Todas</button>
          <button className={filter === "registration" ? "selected" : ""} onClick={() => setFilter("registration")}>Inscripciones</button>
          <button className={filter === "paper" ? "selected" : ""} onClick={() => setFilter("paper")}>Ponencias</button>
        </div>
        <div className="admin-search-controls">
          <label className="admin-search"><Search size={14} /><input placeholder="Nombre, documento o secuencia..." aria-label="Buscar solicitudes" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} /></label>
          <select aria-label="Filtrar por estado de pago" value={paymentFilter} onChange={event => setPaymentFilter(event.target.value)}>
            <option value="all">Todos los pagos</option><option value="pending">Por validar</option><option value="approved">Aprobados</option><option value="rejected">Rechazados</option><option value="exempt">Gratuitos</option>
          </select>
          <span>{loading ? "Actualizando..." : visible.length + " registros"}</span>
        </div>
      </div>
      <section className="request-table">
        {!loading && !visible.length && <div className="empty-state"><Check size={25} /><h2>No hay solicitudes para mostrar</h2><p>Revisa los filtros o actualiza la lista.</p></div>}
        {visible.map(request => {
          const registration = request.kind === "paper" ? requests.find(parent => parent.id === request.registration_id) : request;
          const category = registration ? getCategoryForRequest(registration) : getCategoryForRequest(request);
          const paid = Boolean(category && category.fee > 0);
          const canApprove = request.kind === "paper"
            ? Boolean(registration && category?.speaker && registration.status !== "rejected" && (!paid || registration.payment_status === "approved"))
            : Boolean(category && (!paid || request.payment_status === "approved"));
          return (
            <article className="request-row request-row-expanded" key={request.id}>
              <div className="request-icon">{request.kind === "paper" ? <FileText size={19} /> : <Users size={19} />}</div>
              <div className="request-main">
                <div className="request-title"><h2>{request.name}</h2><span className={"request-kind " + request.kind}>{request.kind === "paper" ? "Ponencia" : "Inscripción"}</span></div>
                <p>{request.email}</p>
                <dl className="request-details">
                  <div><dt>Documento</dt><dd>{request.doc_type || "Documento"}: {request.doc_number || "No registrado"}</dd></div>
                  <div><dt>Institución</dt><dd>{request.institution || "No registrada"}</dd></div>
                  <div><dt>Categoría</dt><dd>{request.category || "Por identificar"}</dd></div>
                  <div><dt>Modalidad</dt><dd>{request.mode}</dd></div>
                </dl>
                {request.kind === "registration" && !request.category_id && <label className="legacy-category">Identificar categoría anterior
                  <select defaultValue="" disabled={Boolean(busyId)} onChange={event => void updateRequest(request.id, { action: "assign_category", category_id: event.target.value })}>
                    <option value="" disabled>Selecciona la categoría correcta</option>
                    {registrationCategories.map(plan => <option key={plan.id} value={plan.id}>{categoryLabel(plan)}</option>)}
                  </select>
                </label>}
                {request.kind === "paper" && (
                  <div className="request-research">
                    <h3>{request.topic || "Investigación"}</h3>
                    {request.message && <p className="request-abstract">{request.message}</p>}
                    {request.file_url && <a href={request.file_url} target="_blank" rel="noreferrer" className="request-file-link"><FileText size={15} />Abrir investigación PDF</a>}
                    <p>{registration ? "Vinculada a la inscripción de " + registration.name + " · " + registration.doc_number : "Ponencia anterior sin inscripción vinculada"}</p>
                  </div>
                )}
                {registration && (
                  <div className="request-payment">
                    <div className="request-payment-header"><strong>Pago de inscripción</strong><span className={"payment-status " + (registration.payment_status || "pending")}>{paymentLabel(registration.payment_status)}</span></div>
                    {registration.payment_status === "exempt" ? <p>Ponente interno: no requiere pago ni comprobante.</p> : (
                      <>
                        <dl className="request-details">
                          <div><dt>Plataforma</dt><dd>{registration.payment_method === "pagalo_pe" ? "Págalo.pe · código 091 · Tasas educativas UNA Puno" : "No registrada"}</dd></div>
                          <div><dt>Concepto</dt><dd>OTROS SERV. EDU. EDU. PRIMARIA</dd></div>
                          <div><dt>Tarifa</dt><dd>{registration.registration_fee != null ? formatCurrency(Number(registration.registration_fee)) : "Por identificar"}</dd></div>
                          <div><dt>Cargo institucional</dt><dd>{formatCurrency(Number(registration.institutional_fee || 0))}</dd></div>
                          <div><dt>Total esperado</dt><dd>{registration.registration_fee != null ? formatCurrency(Number(registration.registration_fee) + Number(registration.institutional_fee || 0)) : "Por identificar"}</dd></div>
                          <div><dt>Documento del comprobante</dt><dd>{registration.payment_document_number || "No registrado"}</dd></div>
                          <div><dt>Secuencia</dt><dd>{registration.payment_sequence || "No registrada"}</dd></div>
                          <div><dt>Monto declarado</dt><dd>{registration.payment_amount != null ? formatCurrency(Number(registration.payment_amount)) : "No registrado"}</dd></div>
                          <div><dt>Fecha de pago</dt><dd>{formatDate(registration.payment_date)}</dd></div>
                        </dl>
                        {registration.receipt_url && <a href={registration.receipt_url} target="_blank" rel="noreferrer" className="request-file-link"><FileText size={15} />Abrir comprobante PDF</a>}
                        {registration.payment_verified_at && <p>Revisado: {formatTimestamp(registration.payment_verified_at)} · {registration.payment_verified_by_email || "Administrador"}</p>}
                        {registration.payment_notes && <p>Observaciones: {registration.payment_notes}</p>}
                      </>
                    )}
                    {request.kind === "registration" && paid && (
                      <div className="payment-review">
                        <label>Observaciones del pago<textarea rows={2} maxLength={2000} placeholder="Observaciones del comprobante (opcional)" value={notes[request.id] ?? request.payment_notes ?? ""} onChange={event => setNotes(current => ({ ...current, [request.id]: event.target.value }))} /></label>
                        <div className="payment-review-actions">
                          <button className="btn btn-primary" disabled={Boolean(busyId) || !request.receipt_url || !request.payment_sequence || request.payment_amount == null || !request.payment_date || !request.payment_document_number} onClick={() => void updateRequest(request.id, { action: "review_payment", decision: "approved", notes: notes[request.id] ?? request.payment_notes ?? "" })}>Aprobar pago</button>
                          <button className="btn btn-outline" disabled={Boolean(busyId)} onClick={() => void updateRequest(request.id, { action: "review_payment", decision: "rejected", notes: notes[request.id] ?? request.payment_notes ?? "" })}>Rechazar pago</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {request.kind === "registration" && request.message && <p className="request-abstract">{request.message}</p>}
                <time dateTime={request.created_at}>Registrado: {formatTimestamp(request.created_at)}</time>
              </div>
              <div className="request-status">
                <select aria-label={"Estado de " + request.name} value={request.status} disabled={Boolean(busyId)} onChange={event => void updateRequest(request.id, { status: event.target.value })}>
                  {request.status === "cash" && <option value="cash" disabled>{statusLabel("cash", request.kind)}</option>}
                  {statuses.map(status => <option key={status} value={status} disabled={status === "approved" && !canApprove}>{statusLabel(status, request.kind)}</option>)}
                </select>
                {busyId === request.id && <small>Guardando...</small>}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
