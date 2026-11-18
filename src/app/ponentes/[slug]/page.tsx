import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/lib/speakers";
import { notFound } from "next/navigation";
import { Award, Globe, Building2, BookOpen } from "lucide-react";

export function generateStaticParams() {
  return speakers.map(speaker => ({ slug: speaker.slug }));
}

export default async function PonentePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const speaker = speakers.find(s => s.slug === slug);

  if (!speaker) {
    return notFound();
  }

  return (
    <main style={{ padding: '80px 20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#F8F9FF', minHeight: '100vh' }}>
      <Link href="/#ponentes" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '30px', color: '#0F2756', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
        ← Volver a Ponentes del Congreso
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '35px' }}>
        <div style={{ width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', position: 'relative', marginBottom: '20px', boxShadow: '0 8px 24px rgba(15, 39, 86, 0.15)', border: '4px solid #FFF' }}>
          <Image src={speaker.img} alt={speaker.name} fill style={{ objectFit: 'cover' }} />
        </div>

        <span style={{
          backgroundColor: speaker.type === "Conferencista Internacional" ? '#0F2756' : '#B38600',
          color: '#FFFFFF',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Globe size={14} /> {speaker.type} · {speaker.country}
        </span>

        <h1 style={{ color: '#0F2756', fontSize: '32px', margin: '0 0 8px', fontWeight: 'bold' }}>{speaker.name}</h1>
        <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '650px', margin: 0, lineHeight: '1.5' }}>{speaker.role}</p>
      </div>

      <div style={{ lineHeight: '1.6', color: '#333', fontSize: '16px', backgroundColor: '#FFFFFF', padding: '35px clamp(20px, 4vw, 40px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15, 39, 86, 0.06)', border: '1px solid rgba(15, 39, 86, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
          <BookOpen size={24} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', color: '#0F2756', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Eje Temático / Conferencia Magistral
            </strong>
            <p style={{ fontSize: '18px', color: '#0F2756', fontWeight: 600, margin: 0, lineHeight: '1.4' }}>
              «{speaker.topic}»
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
          <Building2 size={24} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', color: '#0F2756', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Filiación Institucional
            </strong>
            <p style={{ color: '#475569', margin: 0 }}>{speaker.institution}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
          <Award size={24} color="#B38600" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', color: '#0F2756', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Perfil Académico y Trayectoria
            </strong>
            <p style={{ color: '#334155', margin: 0, lineHeight: '1.6' }}>{speaker.desc}</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#64748B', borderLeft: '4px solid #B38600' }}>
          <strong>IV Congreso Internacional de Investigación Científica:</strong> Participación en modalidad híbrida (Presencial y Virtual) del <strong>25 al 27 de noviembre de 2026</strong>.
        </div>
      </div>
    </main>
  );
}
