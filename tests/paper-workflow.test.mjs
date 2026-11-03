import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";

test("SQL migration fixes the old upload guard without deleting registrations or weakening payment validation", async t => {
  const db = new PGlite();
  t.after(() => db.close());
  // Build the real application schema, excluding only Supabase roles and Storage.
  const original = fs.readFileSync("supabase/migrations/202610140001_registration_payments_and_papers.sql", "utf8");
  await db.exec(original.split("ALTER TABLE public.congress_requests ENABLE ROW LEVEL SECURITY;")[0] + "\nCOMMIT;");
  await db.exec(fs.readFileSync("supabase/migrations/202610300001_speaker_external_hybrid.sql", "utf8"));
  const insert = async row => {
    const keys = Object.keys(row);
    return (await db.query(
      "INSERT INTO public.congress_requests (" + keys.join(", ") + ") VALUES (" + keys.map((_, i) => "$" + (i + 1)).join(", ") + ") RETURNING *",
      Object.values(row),
    )).rows[0];
  };
  const paper = (overrides = {}) => ({
    kind: "paper", category_id: "speaker_external", name: "Autor de prueba",
    email: "autor@example.test", doc_type: "DNI", doc_number: "12345678", mode: "Híbrido",
    topic: "Aprendizaje cooperativo", file_path: "papers/test.pdf",
    registration_fee: 0, institutional_fee: 0, payment_status: "exempt",
    status: "reviewing", workflow_version: 2, ...overrides,
  });
  const paid = (overrides = {}) => ({
    kind: "registration", category_id: "speaker_external", name: "Autor de prueba",
    email: "autor@example.test", doc_type: "DNI", doc_number: "12345678", mode: "Híbrido",
    registration_fee: 100, institutional_fee: 1, payment_status: "pending", status: "reviewing",
    payment_method: "pagalo_pe", payment_sequence: "012345", payment_date: "2026-11-03",
    payment_amount: 101, payment_document_number: "12345678", receipt_path: "receipts/test.pdf",
    workflow_version: 2, ...overrides,
  });
  const pending = await insert(paid());
  const legacy = await insert({ kind: "paper", name: "Archivo anterior", email: "legacy@example.test", workflow_version: 1, status: "reviewing" });
  const constraintError = { code: "23514" };

  // Reproduce both causes of the reported production error before applying the fix.
  await assert.rejects(insert(paper()), constraintError);
  await assert.rejects(insert(paper({ registration_id: pending.id })), constraintError);
  const migration = fs.readFileSync("supabase/migrations/202611030001_papers_before_payment.sql", "utf8");
  for (let run = 0; run < 2; run++) {
    const result = await db.exec(migration);
    assert.equal(result.at(-1).rows[0].envio_sin_pago_previo_habilitado, true);
  }
  assert.deepEqual((await db.query("SELECT * FROM public.congress_requests ORDER BY id")).rows.map(row => row.id).sort(), [pending.id, legacy.id].sort());

  await t.test("all three speaker categories submit without a prior registration and can receive an academic approval", async () => {
    for (const category of ["speaker_external", "speaker_internal_teacher", "speaker_internal_student"]) {
      const saved = await insert(paper({ category_id: category, mode: category === "speaker_external" ? "Híbrido" : "Presencial" }));
      assert.equal(saved.registration_id, null);
      await db.query("UPDATE public.congress_requests SET status = 'approved' WHERE id = $1", [saved.id]);
    }
  });
  await t.test("linked pending payment does not block submission or academic acceptance", async () => {
    const saved = await insert(paper({ registration_id: pending.id }));
    await db.query("UPDATE public.congress_requests SET status = 'approved' WHERE id = $1", [saved.id]);
    const registration = (await db.query("SELECT * FROM public.congress_requests WHERE id = $1", [pending.id])).rows[0];
    assert.equal(registration.payment_status, "pending");
    assert.equal(registration.status, "reviewing");
  });
  await t.test("invalid links, identities and attendee categories are still rejected", async () => {
    for (const patch of [
      { registration_id: "ffffffff-ffff-4fff-8fff-ffffffffffff" },
      { registration_id: pending.id, email: "otra@example.test" },
      { registration_id: pending.id, doc_number: "87654321" },
      { registration_id: pending.id, category_id: "speaker_internal_teacher", mode: "Presencial" },
      { category_id: "attendee_external" },
    ]) await assert.rejects(insert(paper(patch)), constraintError);
  });
  await t.test("PDF path, title and paper exemption remain mandatory", async () => {
    for (const patch of [
      { topic: "" }, { file_path: null }, { file_path: "receipts/not-a-paper.pdf" },
      { registration_fee: 100 }, { institutional_fee: 1 }, { payment_status: "pending" },
      { receipt_path: "receipts/test.pdf" },
    ]) await assert.rejects(insert(paper(patch)), constraintError);
  });
  await t.test("paid registrations still require complete receipts and audited payment approval", async () => {
    const unique = { doc_number: "87654321", payment_sequence: "012346" };
    await assert.rejects(insert(paid({ ...unique, receipt_path: null })), constraintError);
    await assert.rejects(insert(paid({ ...unique, status: "approved" })), constraintError);
    await assert.rejects(insert(paid({ ...unique, payment_status: "approved" })), constraintError);
    await assert.rejects(insert(paid({ ...unique, payment_amount: 100 })), constraintError);
  });
  await t.test("rejected registrations remain blocked, but their paper can be marked rejected", async () => {
    await db.query("UPDATE public.congress_requests SET status = 'rejected' WHERE id = $1", [pending.id]);
    await assert.rejects(insert(paper({ registration_id: pending.id })), constraintError);
    await insert(paper({ registration_id: pending.id, status: "rejected" }));
  });
  await t.test("only one active workflow trigger remains and legacy records are preserved", async () => {
    const triggers = await db.query("SELECT count(*)::int AS total FROM pg_trigger WHERE tgrelid = 'public.congress_requests'::regclass AND tgfoid = 'public.validate_congress_request_workflow()'::regprocedure AND NOT tgisinternal");
    assert.equal(triggers.rows[0].total, 1);
    assert.equal((await db.query("SELECT name FROM public.congress_requests WHERE id = $1", [legacy.id])).rows[0].name, "Archivo anterior");
  });
});
