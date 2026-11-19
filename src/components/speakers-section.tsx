"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, Globe2, MapPin, Mic2 } from "lucide-react";
import { speakers, type Speaker } from "@/lib/speakers";

type Filter = "todos" | "internacional" | "nacional";

const isInternational = (s: Speaker) => s.type === "Conferencista Internacional";

export function SpeakersSection() {
  const [filter, setFilter] = useState<Filter>("todos");

  const internationalCount = speakers.filter(isInternational).length;
  const nationalCount = speakers.length - internationalCount;
  const countryCount = new Set(
    speakers.map((s) => s.country.split("/")[0].trim())
  ).size;

  const visible = speakers.filter((s) =>
    filter === "todos" ? true : filter === "internacional" ? isInternational(s) : !isInternational(s)
  );

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "todos", label: "Todos", count: speakers.length },
    { id: "internacional", label: "Internacionales", count: internationalCount },
    { id: "nacional", label: "Nacionales", count: nationalCount },
  ];

  return (
    <section className="section speakers-section" id="ponentes">
      <div className="speakers-inner">
        <header className="speakers-header">
          <span className="speakers-eyebrow">
            <Mic2 size={14} /> Conferencias magistrales
          </span>
          <h2 className="speakers-title">Ponentes Magistrales</h2>
          <p className="speakers-subtitle">
            Investigadores y docentes de {countryCount} países comparten su experiencia en
            investigación, innovación y educación superior.
          </p>

          <div className="speakers-stats">
            <div><strong>{speakers.length}</strong><span>Ponentes</span></div>
            <div><strong>{internationalCount}</strong><span>Internacionales</span></div>
            <div><strong>{countryCount}</strong><span>Países</span></div>
          </div>

          <div className="speakers-tabs" role="tablist" aria-label="Filtrar ponentes">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                className={`speakers-tab${filter === t.id ? " is-active" : ""}`}
                onClick={() => setFilter(t.id)}
              >
                {t.label} <span className="speakers-tab-count">{t.count}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="speakers-grid">
          {visible.map((speaker) => {
            const intl = isInternational(speaker);
            return (
              <Link
                href={`/ponentes/${speaker.slug}`}
                className={`speaker-card${intl ? " is-intl" : " is-national"}`}
                key={speaker.slug}
              >
                <div className="speaker-photo">
                  <Image
                    src={speaker.img}
                    alt={speaker.name}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px"
                    style={{ objectFit: "cover", objectPosition: speaker.imgPosition ?? "center top" }}
                  />
                  <span className="speaker-chip">
                    {intl ? <Globe2 size={12} /> : <MapPin size={12} />}
                    {intl ? "Internacional" : "Nacional"} · {speaker.country.replace(/\s*\/\s*Internacional$/i, "")}
                  </span>
                  <div className="speaker-photo-caption">
                    <h3 className="speaker-name">{speaker.name}</h3>
                    <p className="speaker-institution">
                      <Building2 size={13} /> {speaker.institution}
                    </p>
                  </div>
                </div>

                <div className="speaker-body">
                  <span className="speaker-topic-label">Conferencia magistral</span>
                  <p className="speaker-topic-text">«{speaker.topic}»</p>
                  <p className="speaker-role-text">{speaker.role}</p>
                  <span className="speaker-cta">
                    Ver perfil académico <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
