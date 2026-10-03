"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, RefreshCw, Users, Lock } from "lucide-react";
import type { CongressRequest, RequestStatus } from "@/lib/requests";
import { supabaseClient } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

const statuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

function statusLabel(status: RequestStatus) {
  return { pending: "Pendiente", reviewing: "En revisión", approved: "Aprobada", rejected: "Rechazada" }[status];
}

export default function AdminPage() {
  const [requests, setRequests] = useState<CongressRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "registration" | "paper">("all");
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) setAuthError("Credenciales inválidas o no eres administrador.");
  }

  async function loadRequests() {
    if (!session) return;
    setLoading(true);
    const response = await fetch("/api/requests", { 
      headers: { "Authorization": `Bearer ${session.access_token}` },
      cache: "no-store" 
    });
    if (response.ok) {
      setRequests(await response.json());
    } else {
      if (response.status === 401 || response.status === 403) {
        setAuthError("No tienes permisos de administrador.");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session) {
      loadRequests();
    }
  }, [session]);

  async function changeStatus(id: string, status: RequestStatus) {
    if (!session) return;
    await fetch("/api/requests", {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id, status }),
    });
    await loadRequests();
  }

  if (authLoading) {
    return <main className="admin-shell"><div style={{ padding: "40px", textAlign: "center" }}>Cargando...</div></main>;
  }

  if (!session) {
    return (
      <main className="admin-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F0F0F0' }}>
        <div style={{ background: '#FFF', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Lock size={40} color="#0F2756" style={{ margin: '0 auto 10px' }} />
            <h1 style={{ color: '#0F2756', fontSize: '24px' }}>Acceso Restringido</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Inicia sesión con tu cuenta de administrador</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Correo electrónico
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ padding: '10px', border: '1px solid #CCC', borderRadius: '4px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Contraseña
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ padding: '10px', border: '1px solid #CCC', borderRadius: '4px' }} />
            </label>
            {authError && <p style={{ color: 'red', fontSize: '13px' }}>{authError}</p>}
            <button type="submit" style={{ background: '#0F2756', color: '#FFF', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Ingresar
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#0F2756', fontSize: '14px', textDecoration: 'underline' }}>Volver al sitio público</Link>
          </div>
        </div>
      </main>
    );
  }

  const visibleRequests = filter === "all" ? requests : requests.filter((r) => r.kind === filter);
  const pending = requests.filter((r) => r.status === "pending").length;
  const papers = requests.filter((r) => r.kind === "paper").length;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-back">
          <ArrowLeft size={17} /> Volver al sitio
        </Link>
        <div>
          <span className="kicker">Gestión interna</span>
          <h1>Solicitudes</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>{session.user.email}</span>
          <button 
            onClick={() => supabaseClient.auth.signOut()} 
            style={{ background: 'transparent', border: '1px solid #CCC', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Salir
          </button>
        </div>
        <button
          className="icon-button admin-refresh"
          title="Actualizar solicitudes"
          aria-label="Actualizar solicitudes"
          onClick={() => void loadRequests()}
        >
          <RefreshCw size={19} />
        </button>
      </header>

      <section className="admin-stats">
        <div>
          <Users size={19} />
          <span><b>{requests.length}</b> total recibidas</span>
        </div>
        <div>
          <FileText size={19} />
          <span><b>{papers}</b> ponencias</span>
        </div>
        <div>
          <span className="status-dot" />
          <span><b>{pending}</b> pendientes</span>
        </div>
      </section>

      <div className="admin-toolbar">
        <div className="filter-tabs">
          <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>Todas</button>
          <button className={filter === "registration" ? "selected" : ""} onClick={() => setFilter("registration")}>Inscripciones</button>
          <button className={filter === "paper" ? "selected" : ""} onClick={() => setFilter("paper")}>Ponencias</button>
        </div>
        <span>{loading ? "Actualizando..." : `${visibleRequests.length} registros`}</span>
      </div>

      <section className="request-table">
        {!loading && visibleRequests.length === 0 && (
          <div className="empty-state">
            <Check size={25} />
            <h2>Aún no hay solicitudes</h2>
            <p>Las solicitudes enviadas desde la portada aparecerán aquí.</p>
          </div>
        )}
        {visibleRequests.map((request) => (
          <article className="request-row" key={request.id}>
            <div className="request-icon">
              {request.kind === "paper" ? <FileText size={19} /> : <Users size={19} />}
            </div>
            <div className="request-main">
              <div className="request-title">
                <h2>{request.name}</h2>
                <span className={`request-kind ${request.kind}`}>
                  {request.kind === "paper" ? "Ponencia" : "Inscripción"}
                </span>
              </div>
              <p>{request.email} {request.institution && `· ${request.institution}`}</p>
              {request.topic && <small>{request.topic}</small>}
              <time>
                {new Date(request.created_at).toLocaleString("es-PE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            <div className="request-status">
              <select
                aria-label={`Estado de ${request.name}`}
                value={request.status}
                onChange={(e) => void changeStatus(request.id, e.target.value as RequestStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
