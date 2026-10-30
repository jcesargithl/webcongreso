"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, FileText, Phone, Users, X, AlertCircle } from "lucide-react";
import { registrationCategories, formatCurrency, getInstitutionalFee, RECEIPT_MAX_BYTES } from "@/lib/congress";

export type CorporateParticipantInput = {
  name: string;
  doc_type: string;
  doc_number: string;
  category_id: string;
  mode: string;
};

const defaultCategories = registrationCategories.filter(c => c.fee > 0);

export function CorporateModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Manager data
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerInstitution, setManagerInstitution] = useState("");

  // Participant count (min 10)
  const [count, setCount] = useState<number>(10);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [participants, setParticipants] = useState<CorporateParticipantInput[]>(() =>
    Array.from({ length: 10 }, () => ({
      name: "",
      doc_type: "DNI",
      doc_number: "",
      category_id: defaultCategories[0]?.id || "student_external",
      mode: "Híbrido",
    }))
  );

  // Payment
  const [paymentOption, setPaymentOption] = useState<"coordination" | "pagalo_pe">("coordination");
  const [paymentSequence, setPaymentSequence] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Success summary
  const [submittedEmail, setSubmittedEmail] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Adjust participants array when count changes
  function updateCount(newCount: number) {
    const validCount = Math.max(10, Math.min(50, newCount));
    setCount(validCount);
    setParticipants(prev => {
      if (validCount > prev.length) {
        const added = Array.from({ length: validCount - prev.length }, () => ({
          name: "",
          doc_type: "DNI",
          doc_number: "",
          category_id: defaultCategories[0]?.id || "student_external",
          mode: "Híbrido",
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, validCount);
    });
    if (currentIdx >= validCount) {
      setCurrentIdx(validCount - 1);
    }
  }

  // Handle keypress & backdrop lock
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  // Participant update helper
  function updateParticipant(idx: number, changes: Partial<CorporateParticipantInput>) {
    setParticipants(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...changes };
      return copy;
    });
  }

  // Calculate pricing
  const subtotal = participants.reduce((acc, p) => {
    const cat = registrationCategories.find(c => c.id === p.category_id);
    const fee = cat ? cat.fee : 0;
    const inst = cat ? getInstitutionalFee(cat) : 0;
    return acc + fee + inst;
  }, 0);
  const discount = Math.round(subtotal * 0.2 * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;

  // Validation step 1
  function handleNextStep1(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!managerName.trim() || !managerEmail.trim() || !managerPhone.trim() || !managerInstitution.trim()) {
      setError("Por favor completa todos los datos del encargado y la institución.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail)) {
      setError("El correo del encargado no tiene un formato válido.");
      return;
    }
    if (count < 10) {
      setError("El pago corporativo requiere un mínimo de 10 participantes.");
      return;
    }
    setStep(2);
  }

  // Validation step 2
  function isParticipantComplete(p: CorporateParticipantInput): boolean {
    return Boolean(p.name.trim().length >= 2 && p.doc_number.trim().length >= 4);
  }

  function handleNextParticipant() {
    setError("");
    const p = participants[currentIdx];
    if (p.name.trim().length < 2) {
      setError(`Integrante #${currentIdx + 1}: ingresa sus nombres y apellidos.`);
      return;
    }
    if (!p.doc_number.trim() || (p.doc_type === "DNI" && !/^\d{8}$/.test(p.doc_number.trim()))) {
      setError(`Integrante #${currentIdx + 1}: el DNI debe tener 8 dígitos.`);
      return;
    }
    if (currentIdx < count - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  }

  function handleGoToSummary() {
    setError("");
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (p.name.trim().length < 2) {
        setError(`Integrante #${i + 1}: ingresa un nombre y apellidos válidos.`);
        setCurrentIdx(i);
        return;
      }
      if (!p.doc_number.trim() || (p.doc_type === "DNI" && !/^\d{8}$/.test(p.doc_number.trim()))) {
        setError(`Integrante #${i + 1} (${p.name}): el DNI debe tener 8 dígitos.`);
        setCurrentIdx(i);
        return;
      }
    }
    setStep(3);
  }

  function handleReceiptChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") || file.size >= RECEIPT_MAX_BYTES) {
      e.currentTarget.value = "";
      setError("Adjunta un comprobante PDF menor de 2 MB.");
      setReceiptFile(null);
    } else {
      setError("");
      setReceiptFile(file);
    }
  }

  // Submit all
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    try {
      const form = new FormData();
      form.set("manager_name", managerName);
      form.set("manager_email", managerEmail);
      form.set("manager_phone", managerPhone);
      form.set("manager_institution", managerInstitution);
      form.set("participants_json", JSON.stringify(participants));
      form.set("payment_method", paymentOption);

      if (paymentOption === "pagalo_pe") {
        if (!paymentSequence.trim() || !paymentDate) {
          setError("Ingresa la secuencia y fecha del comprobante.");
          setBusy(false);
          return;
        }
        form.set("payment_sequence", paymentSequence);
        form.set("payment_date", paymentDate);
        if (receiptFile) {
          form.set("receipt", receiptFile);
        }
      }

      const res = await fetch("/api/corporate", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo registrar la delegación.");
      }

      setSubmittedEmail(managerEmail);
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar la delegación.");
    } finally {
      setBusy(false);
    }
  }

  const currentP = participants[currentIdx] || participants[0];
  const completedCount = participants.filter(isParticipantComplete).length;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '780px' }} role="dialog" aria-modal="true" ref={dialogRef}>
        <button className="icon-button modal-close" title="Cerrar" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>

        {/* STEP 4: SUCCESS */}
        {step === 4 ? (
          <div className="success">
            <span style={{ backgroundColor: '#25D366' }}>
              <Check size={32} />
            </span>
            <h2 id="modal-title">¡Inscripción Corporativa Registrada!</h2>
            <p>
              Hemos registrado la delegación de <strong>{managerInstitution}</strong> con un total de{" "}
              <strong>{participants.length} participantes</strong>.
            </p>
            <p>
              Se envió el resumen y la constancia de registro al correo del encargado:{" "}
              <strong>{submittedEmail}</strong>. Por favor revisa la bandeja de entrada y spam.
            </p>

            <div style={{ backgroundColor: '#F0FBF4', border: '1px solid #BCE6CB', borderRadius: '10px', padding: '16px', margin: '20px 0', textAlign: 'left' }}>
              <strong style={{ color: '#0D5E36', display: 'block', marginBottom: '6px' }}>¿Dudas o validación de pagos?</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#244C35', lineHeight: '1.5' }}>
                Comunícate directamente con la comisión organizadora para confirmar la recepción de tus comprobantes:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                <a className="btn btn-outline" href="https://wa.me/51982311128?text=Hola%20Dra.%20Ruth%2C%20acabo%20de%20registrar%20una%20delegaci%C3%B3n%20corporativa%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <Phone size={14} /> Dra. Ruth (982 311 128)
                </a>
                <a className="btn btn-outline" href="https://wa.me/51961441879?text=Hola%20Dra.%20Rossy%2C%20acabo%20de%20registrar%20una%20delegaci%C3%B3n%20corporativa%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <Phone size={14} /> Dra. Rossy (961 441 879)
                </a>
                <a className="btn btn-outline" href="https://wa.me/51964328207?text=Hola%20Mg.%20Juan%2C%20acabo%20de%20registrar%20una%20delegaci%C3%B3n%20corporativa%20al%20IV%20Congreso." target="_blank" rel="noreferrer" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <Phone size={14} /> Mg. Juan (964 328 207)
                </a>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={onClose}>
              Finalizar y Cerrar
            </button>
          </div>
        ) : (
          <>
            <span className="kicker">Inscripción Corporativa · Grupos</span>
            <h2 id="modal-title" style={{ marginBottom: '6px' }}>Registro de Delegación (20% Dcto.)</h2>
            <p className="modal-intro" style={{ marginBottom: '20px' }}>
              Registra los datos de tu delegación. Un solo encargado recibirá las confirmaciones y coordinará el proceso.
            </p>

            {/* Stepper tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#B38600' : '#64748B' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 1 ? '#B38600' : '#E2E8F0', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
                <span>Encargado</span>
              </div>
              <ChevronRight size={16} color="#CBD5E1" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#B38600' : '#64748B' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 2 ? '#B38600' : '#E2E8F0', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
                <span>Integrantes ({completedCount}/{count})</span>
              </div>
              <ChevronRight size={16} color="#CBD5E1" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? '#B38600' : '#64748B' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 3 ? '#B38600' : '#E2E8F0', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
                <span>Resumen y Pago</span>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: ENCARGADO Y CANTIDAD */}
            {step === 1 && (
              <form onSubmit={handleNextStep1}>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#0F2756' }}>
                    Cantidad de participantes de la delegación (mínimo 10):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => updateCount(count - 1)}
                      disabled={count <= 10}
                      style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: count <= 10 ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F2756', minWidth: '40px', textAlign: 'center' }}>
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCount(count + 1)}
                      disabled={count >= 50}
                      style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: count >= 50 ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                      ✓ 20% de descuento aplicado al total
                    </span>
                  </div>
                </div>

                <label>
                  Institución / Universidad de procedencia
                  <input
                    value={managerInstitution}
                    onChange={e => setManagerInstitution(e.target.value)}
                    placeholder="Ej.: Universidad Nacional del Altiplano"
                    required
                  />
                </label>

                <label>
                  Nombre completo del encargado(a)
                  <input
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    placeholder="Nombres y apellidos de la persona responsable"
                    required
                  />
                </label>

                <label>
                  Correo electrónico del encargado(a) (aquí se enviarán todos los correos)
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={e => setManagerEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  <small className="form-hint">Un solo correo que recibirá la confirmación y la lista oficial de la delegación.</small>
                </label>

                <label>
                  Teléfono / WhatsApp de contacto
                  <input
                    value={managerPhone}
                    onChange={e => setManagerPhone(e.target.value)}
                    placeholder="Ej.: 982 311 128"
                    required
                  />
                </label>

                <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: '16px' }}>
                  Continuar a datos de integrantes ({count}) <ChevronRight size={16} />
                </button>
              </form>
            )}

            {/* STEP 2: INTEGRANTES POCO A POCO */}
            {step === 2 && (
              <div>
                {/* Horizontal progress buttons */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0F2756' }}>
                      Selecciona un integrante para llenar sus datos:
                    </span>
                    <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>
                      {completedCount} de {count} completados
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {participants.map((p, idx) => {
                      const isComplete = isParticipantComplete(p);
                      const isCurrent = idx === currentIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIdx(idx)}
                          style={{
                            minWidth: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            border: isCurrent ? '2px solid #B38600' : '1px solid #CBD5E1',
                            backgroundColor: isCurrent ? '#FFF9E6' : isComplete ? '#F0FDF4' : '#FFF',
                            color: isCurrent ? '#B38600' : isComplete ? '#166534' : '#64748B',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                          }}
                        >
                          {idx + 1}
                          {isComplete && <span style={{ fontSize: '10px' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Participant Card */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0F2756', fontWeight: 'bold' }}>
                      Integrante #{currentIdx + 1} de {count}
                    </h3>
                    {isParticipantComplete(currentP) ? (
                      <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>✓ Datos completos</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#B38600' }}>Pendiente de completar</span>
                    )}
                  </div>

                  <label>
                    Nombres y Apellidos
                    <input
                      value={currentP.name}
                      onChange={e => updateParticipant(currentIdx, { name: e.target.value })}
                      placeholder="Nombres completos del integrante"
                      required
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <label>
                      Documento
                      <select
                        value={currentP.doc_type}
                        onChange={e => updateParticipant(currentIdx, { doc_type: e.target.value })}
                      >
                        <option>DNI</option>
                        <option>CE</option>
                        <option>Pasaporte</option>
                        <option>Otro</option>
                      </select>
                    </label>
                    <label>
                      Número de documento
                      <input
                        value={currentP.doc_number}
                        onChange={e => updateParticipant(currentIdx, { doc_number: e.target.value })}
                        placeholder={currentP.doc_type === "DNI" ? "8 dígitos" : "N° de documento"}
                        maxLength={30}
                        required
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Categoría de inscripción
                      <select
                        value={currentP.category_id}
                        onChange={e => updateParticipant(currentIdx, { category_id: e.target.value })}
                      >
                        {defaultCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.title} ({formatCurrency(cat.fee)})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Modalidad
                      <select
                        value={currentP.mode}
                        onChange={e => updateParticipant(currentIdx, { mode: e.target.value })}
                      >
                        <option>Híbrido</option>
                        <option>Presencial</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Subtotal preview banner */}
                <div style={{ backgroundColor: '#FBF9F3', border: '1px solid #EADBBA', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
                  <span>Total estimado ({count} integrantes con 20% dcto.):</span>
                  <strong style={{ color: '#B38600', fontSize: '16px' }}>{formatCurrency(total)}</strong>
                </div>

                {/* Navigation actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
                      else setStep(1);
                    }}
                    style={{ flex: 1 }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>

                  {currentIdx < count - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNextParticipant}
                      style={{ flex: 1.5 }}
                    >
                      Siguiente integrante ({currentIdx + 2}) <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGoToSummary}
                      style={{ flex: 1.5 }}
                    >
                      Revisar resumen y pago <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: RESUMEN Y PAGO */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '16px' }}>
                  <table width="100%" style={{ fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '8px' }}>#</th>
                        <th style={{ padding: '8px' }}>Nombre</th>
                        <th style={{ padding: '8px' }}>Doc</th>
                        <th style={{ padding: '8px' }}>Categoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p, idx) => {
                        const cat = registrationCategories.find(c => c.id === p.category_id);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '6px 8px', color: '#64748B' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 8px', fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: '6px 8px' }}>{p.doc_type}: {p.doc_number}</td>
                            <td style={{ padding: '6px 8px' }}>{cat?.title}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial breakdown */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>
                    <span>Subtotal normal ({count} integrantes):</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>Descuento Corporativo (20%):</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#0F2756', borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
                    <span>Total a Pagar:</span>
                    <span style={{ color: '#B38600' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0F2756', marginBottom: '10px' }}>
                    Modalidad de pago de la delegación:
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: paymentOption === 'coordination' ? '2px solid #B38600' : '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: paymentOption === 'coordination' ? '#FFF9E6' : '#FFF', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="pay_opt"
                        checked={paymentOption === "coordination"}
                        onChange={() => setPaymentOption("coordination")}
                        style={{ marginTop: '3px', width: 'auto' }}
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#0F2756' }}>Coordinar pago con la comisión organizadora (Recomendado)</strong>
                        <small style={{ color: '#64748B', fontSize: '12px' }}>
                          Registraremos la lista de integrantes y la comisión (Dra. Ruth, Dra. Rossy o Mg. Juan) se comunicará con el encargado para emitir la orden o coordinar el abono.
                        </small>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: paymentOption === 'pagalo_pe' ? '2px solid #B38600' : '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: paymentOption === 'pagalo_pe' ? '#FFF9E6' : '#FFF', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="pay_opt"
                        checked={paymentOption === "pagalo_pe"}
                        onChange={() => setPaymentOption("pagalo_pe")}
                        style={{ marginTop: '3px', width: 'auto' }}
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#0F2756' }}>Ya cuento con la constancia de pago de Págalo.pe</strong>
                        <small style={{ color: '#64748B', fontSize: '12px' }}>
                          Adjunta la constancia en PDF y la secuencia del voucher para que el administrador la valide.
                        </small>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentOption === "pagalo_pe" && (
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label>
                        Secuencia de pago
                        <input
                          value={paymentSequence}
                          onChange={e => setPaymentSequence(e.target.value)}
                          placeholder="Ej.: 093245"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                        />
                      </label>
                      <label>
                        Fecha del comprobante
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={e => setPaymentDate(e.target.value)}
                          required
                        />
                      </label>
                    </div>
                    <label>
                      Comprobante en PDF (máximo 2 MB)
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleReceiptChange}
                        required
                      />
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(2)}
                    disabled={busy}
                    style={{ flex: 1 }}
                  >
                    <ChevronLeft size={16} /> Modificar integrantes
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={busy}
                    style={{ flex: 1.5 }}
                  >
                    {busy ? "Enviando delegación..." : "Confirmar e Inscribir Delegación"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

