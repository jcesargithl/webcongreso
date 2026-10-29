"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, CheckCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, Download, FileText, LayoutDashboard, LoaderCircle, Lock, LogOut, RefreshCw, Search, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { CongressRequest } from "@/lib/requests";
import { getCategoryForRequest, registrationCategories } from "@/lib/congress";
import { buildRequestsCsv, defaultAdminFilters, filterAdminRequests, formatTimestamp, paginateRequests, paymentLabel, registrationFor, statusLabel, type AdminFilters, type AdminSort } from "@/lib/admin-requests";
import { supabaseClient } from "@/lib/supabase-client";
import AdminRequestDetails, { AdminFeedback, type AdminNotice } from "@/components/admin-request-details";
import styles from "./admin.module.css";

async function fetchRequests(token: string, signal?: AbortSignal): Promise<CongressRequest[]> {
  const response = await fetch("/api/requests", { headers: { Authorization: "Bearer " + token }, cache: "no-store", signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "No pudimos cargar las solicitudes.");
  if (!Array.isArray(data)) throw new Error("La respuesta del servidor no contiene una lista de solicitudes.");
  return data;
}

export default function AdminPage() {
  const [requests, setRequests] = useState<CongressRequest[]>([]);
  const [filters, setFilters] = useState<AdminFilters>(defaultAdminFilters);
  const [sort, setSort] = useState<AdminSort>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return;
      setSession(session);
      if (error) setError("No pudimos comprobar la sesión.");
      setAuthLoading(false);
    }).catch(() => {
      if (active) { setError("No pudimos conectar con el servicio de acceso."); setAuthLoading(false); }
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) { setRequests([]); setSelectedId(null); setNotes({}); setError(""); setNotice(null); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    fetchRequests(session.access_token, controller.signal).then(data => {
      if (!controller.signal.aborted) { setRequests(data); setLastLoaded(new Date()); setError(""); }
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Error al cargar solicitudes.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [session]);

  const loadRequests = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try { setRequests(await fetchRequests(session.access_token)); setLastLoaded(new Date()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Error al cargar solicitudes."); }
    finally { setLoading(false); }
  }, [session]);

  const lookup = useMemo(() => new Map(requests.map(request => [request.id, request])), [requests]);
  const visible = useMemo(() => filterAdminRequests(requests, lookup, filters, sort), [requests, lookup, filters, sort]);
  const paginated = paginateRequests(visible, page, pageSize);
  const selected = selectedId ? lookup.get(selectedId) : undefined;
  const selectedPosition = selected ? visible.findIndex(request => request.id === selected.id) : -1;
  const registrations = requests.filter(request => request.kind === "registration");
  const papers = requests.filter(request => request.kind === "paper");
  const pendingPayments = registrations.filter(request => request.payment_status === "pending").length;
  const confirmed = registrations.filter(request => request.status === "approved").length;
  const hasFilters = filters.kind !== "all" || filters.payment !== "all" || filters.status !== "all" || filters.category !== "all" || Boolean(filters.query.trim());
  const pageStart = Math.max(1, Math.min(paginated.page - 2, paginated.pageCount - 4));
  const pageNumbers = Array.from({ length: Math.min(5, paginated.pageCount) }, (_, index) => pageStart + index);

  function changeFilter<K extends keyof AdminFilters>(key: K, value: AdminFilters[K]) {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  }

  function presetFilters(overrides: Partial<AdminFilters>) {
    setFilters({ ...defaultAdminFilters, ...overrides });
    setPage(1);
  }

  function openRequest(id: string) {
    setSelectedId(id);
    setError("");
    setNotice(null);
  }

  function navigateRequest(offset: number) {
    const nextIndex = selectedPosition + offset;
    const next = visible[nextIndex];
    if (!next) return;
    openRequest(next.id);
    setPage(Math.floor(nextIndex / pageSize) + 1);
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loginBusy) return;
    setError(""); setLoginBusy(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
      if (error) setError("Credenciales inválidas.");
      else setLoginPassword("");
    } catch { setError("No pudimos conectar. Intenta nuevamente."); }
    finally { setLoginBusy(false); }
  }

  async function updateRequest(id: string, changes: Record<string, string>): Promise<boolean> {
    if (!session || busyId) return false;
    setBusyId(id); setError(""); setNotice(null);
    try {
      const response = await fetch("/api/requests", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ id, ...changes }),
      });
      const data = await response.json().catch(() => null) as (CongressRequest & { email_sent?: boolean | null }) | null;
      if (!response.ok || !data) {
        throw new Error(data && "error" in data ? String(data.error) : "No pudimos actualizar la solicitud.");
      }
      const resend = changes.action === "resend_notification";
      setNotice({
        warning: data.email_sent === false,
        text: data.email_sent === false
          ? (resend ? "" : "Cambio guardado. ") + "No se pudo enviar el correo a " + data.email + ". Puedes reenviarlo desde este panel."
          : data.email_sent === true
            ? (resend ? "Correo reenviado a " : "Cambio guardado y notificación enviada a ") + data.email + "."
            : changes.action === "assign_category" ? "Categoría actualizada correctamente." : "Solicitud guardada correctamente.",
      });
      if (!resend) {
        // Keep current signed links: PATCH returns persisted fields, not new signed URLs.
        setRequests(current => current.map(row => row.id === id
          ? { ...row, ...data, receipt_url: row.receipt_url, file_url: row.file_url }
          : row));
      }
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos actualizar la solicitud.");
      return false;
    } finally { setBusyId(null); }
  }

  function exportCsv() {
    if (!visible.length) return;
    const url = URL.createObjectURL(new Blob([buildRequestsCsv(visible, lookup)], { type: "text/csv;charset=utf-8;" }));
    const dateParts = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Lima" }).formatToParts(new Date());
    const datePart = (type: string) => dateParts.find(part => part.type === type)?.value;
    const link = document.createElement("a");
    link.href = url;
    link.download = "congreso-solicitudes-" + [datePart("year"), datePart("month"), datePart("day")].join("-") + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (authLoading) return <main className="admin-shell"><div className={styles.loadingState}><LoaderCircle size={24} className={styles.spinning} /><p>Comprobando acceso…</p></div></main>;
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
          <button className="btn btn-primary" disabled={loginBusy}>{loginBusy ? "Ingresando…" : "Ingresar"}</button>
        </form>
        <Link href="/" className="form-link">Volver al sitio público</Link>
      </div>
    </main>
  );

  const summaries = [
    { label: "Inscripciones", value: registrations.length, description: "Participantes registrados", icon: Users, tone: styles.blueIcon, preset: { kind: "registration" as const } },
    { label: "Ponencias", value: papers.length, description: papers.filter(request => request.status === "pending" || request.status === "reviewing").length + " por evaluar", icon: FileText, tone: styles.purpleIcon, preset: { kind: "paper" as const } },
    { label: "Pagos por validar", value: pendingPayments, description: "Comprobantes pendientes", icon: CreditCard, tone: styles.goldIcon, preset: { kind: "registration" as const, payment: "pending" as const } },
    { label: "Confirmadas", value: confirmed, description: "Inscripciones aprobadas", icon: CheckCheck, tone: styles.greenIcon, preset: { kind: "registration" as const, status: "approved" as const } },
  ];

  return (
    <main className={styles.workspace}>
      <div className={styles.topline}>
        <Link href="/" className={styles.backLink}><ArrowLeft size={14} />Volver al sitio</Link>
        <span><LayoutDashboard size={14} />CONINCI 2026<span className={styles.toplineDivider}>/</span>Administración</span>
        <button type="button" className={styles.textButton} onClick={() => void supabaseClient.auth.signOut()}><LogOut size={14} />Cerrar sesión</button>
      </div>

      <header className={styles.masthead}>
        <div><span className={styles.eyebrow}>Gestión del congreso</span><h1>Solicitudes</h1><p>Revisa inscripciones, valida pagos y gestiona las investigaciones.</p></div>
        <div className={styles.headerActions}>
          <span className={styles.sessionEmail}><span className={styles.sessionDot} />{session.user.email}</span>
          <button type="button" className={styles.secondaryButton} onClick={exportCsv} disabled={loading || !visible.length} title={"Exportar " + visible.length + " resultados filtrados"}><Download size={16} />Exportar CSV</button>
          <button type="button" className={styles.iconButton} disabled={loading || Boolean(busyId)} onClick={() => void loadRequests()} aria-label="Actualizar solicitudes" title="Actualizar solicitudes"><RefreshCw size={18} className={loading ? styles.spinning : undefined} /></button>
        </div>
      </header>

      <section className={styles.summaryGrid} aria-label="Resumen de solicitudes">
        {summaries.map(({ label, value, description, icon: Icon, tone, preset }) => (
          <button type="button" className={styles.summaryCard} key={label} onClick={() => presetFilters(preset)} disabled={loading}>
            <span className={[styles.summaryIcon, tone].join(" ")}><Icon size={20} /></span>
            <span className={styles.summaryContent}><span>{label}</span><strong>{loading ? "—" : value}</strong><small>{description}</small></span>
            <ChevronRight size={16} className={styles.summaryArrow} />
          </button>
        ))}
      </section>

      {!selected && <AdminFeedback notice={notice} error={error} onDismiss={() => { setError(""); setNotice(null); }} />}

      <section className={styles.tablePanel} aria-label="Listado de solicitudes">
        <div className={styles.panelTop}>
          <nav className={styles.tabs} aria-label="Tipo de solicitud">
            {([
              ["all", "Todas", requests.length],
              ["registration", "Inscripciones", registrations.length],
              ["paper", "Ponencias", papers.length],
            ] as const).map(([kind, label, count]) => (
              <button type="button" key={kind} aria-pressed={filters.kind === kind} className={filters.kind === kind ? styles.activeTab : undefined} onClick={() => changeFilter("kind", kind)}>{label}<span>{count}</span></button>
            ))}
          </nav>
          <span className={styles.updatedAt}>{lastLoaded ? "Actualizado " + lastLoaded.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }) : "Cargando solicitudes…"}</span>
        </div>

        <div className={styles.filters}>
          <label className={styles.search}><Search size={17} /><input type="search" placeholder="Buscar nombre, documento, correo o título…" aria-label="Buscar solicitudes" value={filters.query} onChange={event => changeFilter("query", event.target.value)} /></label>
          <select aria-label="Filtrar por estado" value={filters.status} onChange={event => changeFilter("status", event.target.value as AdminFilters["status"])}>
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes / recibidas</option>
            <option value="reviewing">En validación / revisión</option>
            <option value="approved">Confirmadas / aceptadas</option>
            <option value="rejected">Rechazadas</option>
            {requests.some(request => request.status === "cash") && <option value="cash">Estados anteriores</option>}
          </select>
          <select aria-label="Filtrar por estado de pago" value={filters.payment} onChange={event => changeFilter("payment", event.target.value as AdminFilters["payment"])}>
            <option value="all">Todos los pagos</option><option value="pending">Por validar</option><option value="approved">Aprobados</option><option value="rejected">Rechazados</option><option value="exempt">Exonerados</option>
          </select>
          <select aria-label="Filtrar por categoría" value={filters.category} onChange={event => changeFilter("category", event.target.value)}>
            <option value="all">Todas las categorías</option>
            {registrationCategories.map(category => <option key={category.id} value={category.id}>{category.title + " · " + category.role}</option>)}
          </select>
        </div>

        <div className={styles.resultsBar}>
          <div aria-live="polite"><strong>{visible.length}</strong> {visible.length === 1 ? "resultado" : "resultados"}
            {hasFilters && <button type="button" onClick={() => presetFilters({})} className={styles.clearFilters}><X size={13} />Limpiar filtros</button>}
          </div>
          <label className={styles.sortControl}><ArrowUpDown size={14} /><span className={styles.srOnly}>Ordenar solicitudes</span>
            <select value={sort} onChange={event => { setSort(event.target.value as AdminSort); setPage(1); }}>
              <option value="newest">Más recientes</option><option value="oldest">Más antiguas</option><option value="name_asc">Nombre: A–Z</option><option value="name_desc">Nombre: Z–A</option>
            </select>
          </label>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>Solicitudes del congreso. Selecciona un participante para abrir sus detalles.</caption>
            <thead><tr>
              <th scope="col">Participante</th><th scope="col" className={styles.documentColumn}>Documento</th>
              <th scope="col" className={styles.kindColumn}>Tipo</th><th scope="col" className={styles.categoryColumn}>Categoría</th>
              <th scope="col">Pago</th><th scope="col">Estado</th><th scope="col" className={styles.dateColumn}>Registro</th>
              <th scope="col"><span className={styles.srOnly}>Detalles</span></th>
            </tr></thead>
            <tbody aria-busy={loading}>
              {!paginated.rows.length && <tr><td colSpan={8}>
                <div className={styles.emptyState}>
                  {loading ? <LoaderCircle size={26} className={styles.spinning} /> : <Search size={28} />}
                  <h2>{loading ? "Cargando solicitudes…" : requests.length ? "No encontramos coincidencias" : "Todavía no hay solicitudes"}</h2>
                  <p>{loading ? "Estamos preparando el listado." : requests.length ? "Prueba con otro término o elimina los filtros." : "Las inscripciones y ponencias aparecerán aquí cuando se registren."}</p>
                  {!loading && hasFilters && <button type="button" className={styles.secondaryButton} onClick={() => presetFilters({})}>Limpiar filtros</button>}
                </div>
              </td></tr>}
              {paginated.rows.map(request => {
                const registration = registrationFor(request, lookup);
                const category = getCategoryForRequest(registration || request);
                return <tr key={request.id} className={selectedId === request.id ? styles.selectedRow : undefined}>
                  <td>
                    <div className={styles.participantCell}>
                      <span className={[styles.avatar, request.kind === "paper" ? styles.paperAvatar : ""].join(" ")}>{request.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()}</span>
                      <div><button type="button" className={styles.rowButton} onClick={() => openRequest(request.id)} aria-label={"Ver detalles de " + request.name + ", " + (request.kind === "paper" ? "ponencia" : "inscripción")}>{request.name}</button>
                        <span className={styles.participantEmail}>{request.email}</span><span className={styles.mobileKind}>{request.kind === "paper" ? "Ponencia" : "Inscripción"} · {request.doc_number || "Sin documento"}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.documentColumn}><span className={styles.cellPrimary}>{request.doc_number || "Sin documento"}</span><span className={styles.cellSecondary}>{request.doc_type || "No registrado"}</span></td>
                  <td className={styles.kindColumn}><span className={[styles.kindBadge, request.kind === "paper" ? styles.paperKind : styles.registrationKind].join(" ")}>{request.kind === "paper" ? <FileText size={12} /> : <Users size={12} />}{request.kind === "paper" ? "Ponencia" : "Inscripción"}</span></td>
                  <td className={styles.categoryColumn}><span className={styles.cellPrimary}>{category?.title || request.category || "Por identificar"}</span><span className={styles.cellSecondary}>{category?.role || request.mode}</span></td>
                  <td><span className={[styles.badge, styles[registration?.payment_status || "unknown"]].join(" ")}>{paymentLabel(registration?.payment_status, true)}</span></td>
                  <td><span className={[styles.badge, styles[request.status]].join(" ")}><span className={styles.statusDot} />{statusLabel(request.status, request.kind, true)}</span></td>
                  <td className={styles.dateColumn}><time dateTime={request.created_at}>{formatTimestamp(request.created_at, true)}</time></td>
                  <td className={styles.rowActionCell}><button type="button" className={styles.rowAction} aria-label={"Abrir solicitud de " + request.name} onClick={() => openRequest(request.id)}><ChevronRight size={18} /></button></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <footer className={styles.pagination}>
          <div><span>Mostrando <strong>{paginated.from}–{paginated.to}</strong> de <strong>{visible.length}</strong></span>
            <label>Filas<select aria-label="Registros por página" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
          </div>
          <nav aria-label="Páginas de solicitudes" className={styles.pageControls}>
            <button type="button" aria-label="Primera página" disabled={paginated.page === 1} onClick={() => setPage(1)}><ChevronsLeft size={16} /></button>
            <button type="button" aria-label="Página anterior" disabled={paginated.page === 1} onClick={() => setPage(paginated.page - 1)}><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => <button type="button" key={number} aria-label={"Página " + number} aria-current={paginated.page === number ? "page" : undefined} className={paginated.page === number ? styles.currentPage : undefined} onClick={() => setPage(number)}>{number}</button>)}
            <button type="button" aria-label="Página siguiente" disabled={paginated.page === paginated.pageCount} onClick={() => setPage(paginated.page + 1)}><ChevronRight size={16} /></button>
            <button type="button" aria-label="Última página" disabled={paginated.page === paginated.pageCount} onClick={() => setPage(paginated.pageCount)}><ChevronsRight size={16} /></button>
          </nav>
        </footer>
      </section>
      <p className={styles.tableHint}>Selecciona una fila para ver los detalles y realizar acciones. Todos los horarios corresponden a Perú.</p>

      {selected && <AdminRequestDetails key={selected.id} request={selected} lookup={lookup} busy={Boolean(busyId)}
        note={notes[selected.id] ?? selected.payment_notes ?? ""} notice={notice} error={error}
        position={selectedPosition} total={visible.length} onClose={() => setSelectedId(null)} onNavigate={navigateRequest}
        onOpen={openRequest} onNoteChange={value => setNotes(current => ({ ...current, [selected.id]: value }))}
        onUpdate={updateRequest} onRefresh={() => void loadRequests()} />}
    </main>
  );
}
