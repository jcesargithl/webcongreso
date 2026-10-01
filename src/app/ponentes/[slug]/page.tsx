import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/lib/speakers";
import { notFound } from "next/navigation";

export default async function PonentePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const speaker = speakers.find(s => s.slug === slug);
  
  if (!speaker) {
    return notFound();
  }

  return (
    <main style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#F8F9FF', minHeight: '100vh' }}>
      <Link href="/#ponentes" style={{ display: 'inline-block', marginBottom: '40px', color: '#003380', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Volver al inicio
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '250px', height: '250px', borderRadius: '50%', overflow: 'hidden', position: 'relative', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <Image src={speaker.img} alt={speaker.name} fill style={{ objectFit: 'cover' }} />
        </div>
        <h1 style={{ color: '#0F2756', fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>{speaker.name}</h1>
      </div>

      <div style={{ lineHeight: '1.6', color: '#333', fontSize: '18px', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <p style={{ marginBottom: '20px' }}>
          <strong style={{ color: '#0F2756' }}>Título Magistral*:</strong> <em>{speaker.topic}</em>
        </p>
        <p style={{ marginBottom: '40px' }}>
          <strong style={{ color: '#0F2756' }}>Resumen:</strong> {speaker.desc}
        </p>
        
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F2756', marginTop: '40px' }}>
          *Esta conferencia será pregrabada y mostrada durante el Congreso
        </p>
      </div>
    </main>
  );
}
