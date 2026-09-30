"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, RefreshCw, Users } from "lucide-react";
import type { CongressRequest, RequestStatus } from "@/lib/requests";

const statuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

function statusLabel(status: RequestStatus) {
  return { pending: "Pendiente", reviewing: "En revisión", approved: "Aprobada", rejected: "Rechazada" }[status];
}

export default function AdminPage() {
  const [requests, setRequests] = useState<CongressRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "registration" | "paper">("all");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    const response = await fetch("/api/requests", { cache: "no-store" });
    setRequests(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/requests", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: CongressRequest[]) => {
        if (active) {
          setRequests(data);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  async function changeStatus(id: string, status: RequestStatus) {
    await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadRequests();
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
