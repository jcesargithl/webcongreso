import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { createRequire } from "node:module";
const requireDependency = createRequire(import.meta.url);

const KEY = "local-test-secret-not-a-real-credential";
const ADMIN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const REGISTRATION_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function harness(initial = [], options = {}) {
  const state = { records: initial.map(row => ({ ...row })), uploads: [], removed: [], failInsert: null, sentEmails: [], failMail: false, rejectRecipient: false, afterWork: [] };
  class Query {
    constructor() { this.filters = []; this.operation = "select"; this.cap = Infinity; this.offset = 0; }
    select() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    ilike(key, value) { const literal = value.replace(/\\([\\%_])/g, "$1").toLowerCase(); this.filters.push(row => (row[key] || "").toLowerCase() === literal); return this; }
    order() { return this; }
    limit(value) { this.cap = value; return this; }
    range(from, to) { this.offset = from; this.cap = to - from + 1; return this; }
    insert(value) { this.operation = "insert"; this.value = value; return this; }
    update(value) { this.operation = "update"; this.value = value; return this; }
    rows() { return state.records.filter(row => this.filters.every(filter => filter(row))).slice(this.offset, this.offset + this.cap); }
    async maybeSingle() { return { data: this.rows()[0] || null, error: null }; }
    async single() {
      if (this.operation === "insert") {
        if (state.failInsert) return { data: null, error: state.failInsert };
        const row = { id: crypto.randomUUID(), created_at: "2026-10-14T15:00:00Z", ...this.value };
        state.records.push(row);
        return { data: row, error: null };
      }
      const row = this.rows()[0];
      if (!row) return { data: null, error: { code: "PGRST116" } };
      Object.assign(row, this.value);
      return { data: row, error: null };
    }
    then(resolve, reject) { return Promise.resolve({ data: this.rows(), error: null }).then(resolve, reject); }
  }
  const supabase = {
    from: () => new Query(),
    auth: { getUser: async token => ({ data: { user: token === "test-admin" ? { id: ADMIN_ID, email: "admin@example.test" } : null }, error: null }) },
    storage: { from: bucket => {
      assert.equal(bucket, "congress-files");
      return {
        upload: async key => { state.uploads.push(key); return { data: { path: key }, error: null }; },
        remove: async keys => { state.removed.push(...keys); return { error: null }; },
        createSignedUrls: async keys => ({ data: keys.map(key => ({ path: key, signedUrl: "https://files.example.invalid/" + key })), error: null }),
      };
    } },
  };
  const cache = new Map();
  function load(request, parent = path.join(process.cwd(), "tests/registration-flow.test.mjs")) {
    if (request === "server-only") return {};
    if (request === "next/server") return { after: callback => {
      if (options.failSchedule) throw new Error("Simulated scheduling failure");
      state.afterWork.push(callback);
    } };
    if (request === "node:fs/promises" && options.missingLogos) return { readFile: async () => { throw new Error("Missing test logo"); } };
    if (request === "nodemailer") return { createTransport: () => ({ sendMail: async message => {
      await options.waitForMail;
      if (state.failMail) throw Object.assign(new Error("Simulated SMTP failure"), { code: "ECONNECTION" });
      state.sentEmails.push(message);
      return { accepted: state.rejectRecipient ? [] : [message.to.address] };
    } }) };
    if (!request.startsWith(".") && !request.startsWith("@/") && !path.isAbsolute(request)) return requireDependency(request);
    let filename = request.startsWith("@/") ? path.join(process.cwd(), "src", request.slice(2)) : path.resolve(path.dirname(parent), request);
    if (!path.extname(filename)) filename += ".ts";
    if (filename === path.join(process.cwd(), "src/lib/supabase.ts")) return { supabase };
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiledModule = { exports: {} };
    cache.set(filename, compiledModule);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const environment = { cwd: () => process.cwd(), env: { ADMIN_EMAILS: "admin@example.test", PAPER_VERIFICATION_SECRET: KEY, GMAIL_USER: options.mailConfigured === false ? "" : "sender@example.test", GMAIL_PASS: options.mailConfigured === false ? "" : "fake-app-password" } };
    new Function("require", "module", "exports", "process", code)(key => load(key, filename), compiledModule, compiledModule.exports, environment);
    return compiledModule.exports;
  }
  return { state, load, flushAfter: async () => {
    for (const callback of state.afterWork.splice(0)) await callback();
  } };
}
function registration(categoryId, paymentStatus = "exempt") {
  return {
    id: REGISTRATION_ID, kind: "registration", category_id: categoryId,
    name: "Persona de prueba", email: "ponente@example.test", doc_type: "DNI", doc_number: "12345678",
    mode: "Presencial", institution: "Institución de prueba", status: "approved", payment_status: paymentStatus,
    workflow_version: 2, created_at: "2026-10-14T15:00:00Z",
  };
}
function formRequest(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request("http://localhost/api/requests", { method: "POST", body: form });
}
function pdf() { return new File(["%PDF-1.7\nTest fixture"], "test.pdf", { type: "application/pdf" }); }
function registrationFields(categoryId) {
  return { kind: "registration", category_id: categoryId, name: "Persona de prueba", email: "prueba@example.test", doc_type: "DNI", doc_number: "87654321", institution: "Institución de prueba" };
}
function paymentFields() {
  return { payment_method: "pagalo_pe", payment_sequence: "093245", payment_amount: "101.00", payment_date: "2026-10-14", payment_document_number: "87654321", receipt: pdf() };
}
function verificationRequest() {
  return new Request("http://localhost/api/registrations/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ponente@example.test", doc_type: "DNI", doc_number: "12345678" }),
  });
}

test("six categories use the correct fee and exempt only internal speakers", () => {
  const { registrationCategories, getRegistrationTotal } = harness().load("../src/lib/congress");
  assert.deepEqual(registrationCategories.map(category => getRegistrationTotal(category)), [21, 31, 101, 71, 0, 0]);
});

test("only paid external speakers and free internal speakers are eligible", () => {
  const { assertSpeakerEligibility } = harness().load("../src/lib/registration-rules");
  assert.throws(() => assertSpeakerEligibility(null), /No encontramos/);
  assert.throws(() => assertSpeakerEligibility(registration("speaker_external", "pending")), /no está aprobado/);
  assert.equal(assertSpeakerEligibility(registration("speaker_external", "approved")).id, "speaker_external");
  for (const id of ["speaker_internal_teacher", "speaker_internal_student"]) assert.equal(assertSpeakerEligibility(registration(id)).fee, 0);
  for (const id of ["student_internal_attendee", "student_external", "attendee_external"]) assert.throws(() => assertSpeakerEligibility(registration(id, "approved")), /asistente/);
  assert.throws(() => assertSpeakerEligibility({ ...registration("speaker_internal_teacher"), status: "rejected" }), /rechazada/);
  assert.throws(() => assertSpeakerEligibility({ ...registration(null), category: "Estudiante EPEP" }), /categoría identificada/);
});

test("receipt sequence preserves leading zero, amount must include institutional fee and date must exist", () => {
  const h = harness();
  const { validatePayment } = h.load("../src/lib/registration-rules");
  const category = h.load("../src/lib/congress").getCategory("speaker_external");
  const fields = { sequence: "093245", amount: "101,00", date: "2026-10-14", documentNumber: "12345678", method: "pagalo_pe" };
  assert.equal(validatePayment(fields, category).sequence, "093245");
  for (const patch of [{ sequence: "93245" }, { amount: "100" }, { amount: "1e2" }, { date: "2026-02-30" }, { method: "cash" }]) assert.throws(() => validatePayment({ ...fields, ...patch }, category));
});

test("receipt PDF requires real header and size strictly below 2 MB", async () => {
  const h = harness();
  const { validatePdf } = h.load("../src/lib/registration-rules");
  const { RECEIPT_MAX_BYTES } = h.load("../src/lib/congress");
  await validatePdf(pdf(), RECEIPT_MAX_BYTES, "el comprobante");
  await assert.rejects(validatePdf(new File(["fake"], "fake.pdf", { type: "application/pdf" }), RECEIPT_MAX_BYTES, "el comprobante"), /no es un PDF/);
  await assert.rejects(validatePdf(new File(["%PDF-", new Uint8Array(RECEIPT_MAX_BYTES - 5)], "large.pdf", { type: "application/pdf" }), RECEIPT_MAX_BYTES, "el comprobante"), /menos de 2 MB/);
  await assert.rejects(validatePdf(null, RECEIPT_MAX_BYTES, "el comprobante"), /Adjunta/);
});

test("verification token cannot be forged or reused after expiration", () => {
  const { issueVerificationToken, readVerificationToken } = harness().load("../src/lib/paper-verification");
  const token = issueVerificationToken(registration("speaker_internal_teacher"));
  assert.equal(readVerificationToken(token).id, REGISTRATION_ID);
  assert.throws(() => readVerificationToken(token + "x"), /no es válida/);
  const claims = JSON.parse(Buffer.from(token.split(".")[0], "base64url"));
  claims.expires = 0;
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const expired = payload + "." + crypto.createHmac("sha256", KEY).update(payload).digest("base64url");
  assert.throws(() => readVerificationToken(expired), /venció/);
});

test("free speaker registration needs no payment fields and becomes confirmed", async () => {
  for (const category of ["speaker_internal_teacher", "speaker_internal_student"]) {
    const h = harness();
    const response = await h.load("../src/app/api/requests/route").POST(formRequest(registrationFields(category)));
    assert.equal(response.status, 201);
    assert.equal(h.state.records[0].payment_status, "exempt");
    assert.equal(h.state.records[0].status, "approved");
    assert.equal(h.state.records[0].institutional_fee, 0);
    assert.equal(h.state.uploads.length, 0);
  }
});

test("paid registration ignores forged price and modality, saves complete voucher and stays pending", async () => {
  const h = harness();
  const fields = { ...registrationFields("speaker_external"), ...paymentFields(), mode: "Virtual", registration_fee: "0", category: "Docente EPEP" };
  const response = await h.load("../src/app/api/requests/route").POST(formRequest(fields));
  assert.equal(response.status, 201);
  const saved = h.state.records[0];
  assert.equal(saved.registration_fee, 100);
  assert.equal(saved.institutional_fee, 1);
  assert.equal(saved.mode, "Presencial");
  assert.equal(saved.payment_status, "pending");
  assert.equal(saved.payment_sequence, "093245");
  assert.match(saved.receipt_path, /^receipts\/.+\.pdf$/);
});

test("paid registration without voucher data fails before uploading", async () => {
  const h = harness();
  const response = await h.load("../src/app/api/requests/route").POST(formRequest(registrationFields("speaker_external")));
  assert.equal(response.status, 400);
  assert.equal(h.state.records.length, 0);
  assert.equal(h.state.uploads.length, 0);
});

test("duplicate document or reused voucher is rejected", async () => {
  const existing = { ...registration("speaker_external", "approved"), payment_sequence: "093245", payment_date: "2026-10-14" };
  for (const document of ["12345678", "87654321"]) {
    const h = harness([existing]);
    const fields = { ...registrationFields("speaker_external"), ...paymentFields(), doc_number: document };
    const response = await h.load("../src/app/api/requests/route").POST(formRequest(fields));
    assert.equal(response.status, 409);
    assert.equal(h.state.uploads.length, 0);
  }
});

test("verification endpoint blocks unpaid speakers and attendees, and allows free speakers", async () => {
  for (const [category, paymentStatus, expected] of [
    ["speaker_external", "pending", 403], ["speaker_external", "approved", 200],
    ["attendee_external", "approved", 403], ["speaker_internal_teacher", "exempt", 200], ["speaker_internal_student", "exempt", 200],
  ]) {
    const h = harness([registration(category, paymentStatus)]);
    const response = await h.load("../src/app/api/registrations/verify/route").POST(verificationRequest());
    assert.equal(response.status, expected);
  }
});

test("paper endpoint cannot bypass verification", async () => {
  const h = harness();
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({ kind: "paper", topic: "Prueba", file: pdf() }));
  assert.equal(response.status, 403);
  assert.equal(h.state.records.length, 0);
  assert.equal(h.state.uploads.length, 0);
});

test("paper submission rechecks payment after verification", async () => {
  const h = harness([registration("speaker_external", "approved")]);
  const verification = await (await h.load("../src/app/api/registrations/verify/route").POST(verificationRequest())).json();
  h.state.records[0].payment_status = "rejected";
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({ kind: "paper", verification_token: verification.token, topic: "Prueba", file: pdf() }));
  assert.equal(response.status, 403);
  assert.equal(h.state.uploads.length, 0);
});

test("paper inherits verified registration data and remains in academic review", async () => {
  const h = harness([registration("speaker_internal_teacher")]);
  const verification = await (await h.load("../src/app/api/registrations/verify/route").POST(verificationRequest())).json();
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({
    kind: "paper", verification_token: verification.token, topic: "Investigación de prueba", message: "Resumen", file: pdf(),
    name: "Nombre manipulado", category: "Asistente", mode: "Virtual",
  }));
  assert.equal(response.status, 201);
  const paper = h.state.records[1];
  assert.equal(paper.registration_id, REGISTRATION_ID);
  assert.equal(paper.name, "Persona de prueba");
  assert.equal(paper.category_id, "speaker_internal_teacher");
  assert.equal(paper.mode, "Presencial");
  assert.equal(paper.status, "reviewing");
  assert.equal(paper.registration_fee, 0);
});

test("only administrator can approve payment, and confirmation alone cannot bypass payment review", async () => {
  const unpaid = { ...registration("speaker_external", "pending"), status: "reviewing", receipt_path: "receipts/test.pdf", payment_method: "pagalo_pe", payment_sequence: "093245", payment_amount: 101, payment_date: "2026-10-14", payment_document_number: "12345678" };
  const h = harness([unpaid]);
  const route = h.load("../src/app/api/requests/route");
  const patch = (body, token) => new Request("http://localhost/api/requests", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ id: REGISTRATION_ID, ...body }) });
  assert.equal((await route.PATCH(patch({ action: "review_payment", decision: "approved" }, "not-admin"))).status, 401);
  assert.equal((await route.PATCH(patch({ status: "approved" }, "test-admin"))).status, 409);
  assert.equal((await route.PATCH(patch({ action: "review_payment", decision: "approved", notes: "Revisado contra constancia" }, "test-admin"))).status, 200);
  assert.equal(h.state.records[0].payment_verified_by, ADMIN_ID);
  assert.equal(h.state.records[0].payment_verified_by_email, "admin@example.test");
  assert.equal(h.state.records[0].payment_status, "approved");
  assert.equal((await h.load("../src/app/api/registrations/verify/route").POST(verificationRequest())).status, 200);
});

test("failed database insert cleans up the newly uploaded private voucher", async () => {
  const h = harness();
  h.state.failInsert = { code: "23514" };
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({ ...registrationFields("speaker_external"), ...paymentFields() }));
  assert.equal(response.status, 409);
  assert.deepEqual(h.state.removed, h.state.uploads);
  assert.equal(h.state.records.length, 0);
});

test("admin listing signs private files and keeps legacy public research links", async () => {
  const h = harness([{ ...registration("speaker_external", "approved"), receipt_path: "receipts/test.pdf", file_url: "https://legacy.example.invalid/paper.pdf" }]);
  const rows = await h.load("../src/lib/requests").listRequests();
  assert.match(rows[0].receipt_url, /^https:\/\/files\.example\.invalid/);
  assert.equal(rows[0].file_url, "https://legacy.example.invalid/paper.pdf");
});

test("administrator can identify a legacy registration with a text identifier", async () => {
  const legacy = { ...registration(null), id: "legacy-registration", category: "Estudiante EPEP", workflow_version: 1 };
  const h = harness([legacy]);
  const response = await h.load("../src/app/api/requests/route").PATCH(new Request("http://localhost/api/requests", {
    method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer test-admin" },
    body: JSON.stringify({ id: legacy.id, action: "assign_category", category_id: "speaker_internal_student" }),
  }));
  assert.equal(response.status, 200);
  assert.equal(h.state.records[0].payment_status, "exempt");
  assert.equal(h.state.records[0].category_id, "speaker_internal_student");
});

function patchRequest(id, changes, token = "test-admin") {
  return new Request("http://localhost/api/requests", {
    method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ id, ...changes }),
  });
}

function paperRecord(status = "reviewing") {
  return {
    ...registration("speaker_internal_student"),
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", kind: "paper",
    registration_id: REGISTRATION_ID, status, topic: "Aprendizaje e inteligencia artificial",
  };
}

test("paper status changes notify the author with the matching result and do not resend unchanged states", async () => {
  for (const [status, expected] of [
    ["approved", "Tu ponencia ha sido aprobada"],
    ["rejected", "Resultado de la evaluación de tu ponencia"],
    ["reviewing", "Tu ponencia está en revisión"],
    ["pending", "Recibimos tu investigación"],
  ]) {
    const paper = paperRecord(status === "reviewing" ? "pending" : "reviewing");
    const h = harness([registration("speaker_internal_student"), paper]);
    const route = h.load("../src/app/api/requests/route");
    const response = await route.PATCH(patchRequest(paper.id, { status }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).email_sent, true);
    assert.equal(h.state.sentEmails.length, 1);
    assert.equal(h.state.sentEmails[0].to.address, paper.email);
    assert.match(h.state.sentEmails[0].subject, new RegExp(expected));
    assert.ok(h.state.sentEmails[0].text.includes(paper.topic));
    assert.equal(h.state.records[1].status, status);
    const unchanged = await route.PATCH(patchRequest(paper.id, { status }));
    assert.equal((await unchanged.json()).email_sent, null);
    assert.equal(h.state.sentEmails.length, 1);
  }
});

test("SMTP failure preserves approval and the admin can resend without changing the decision", async () => {
  const paper = paperRecord();
  const h = harness([registration("speaker_internal_student"), paper]);
  const route = h.load("../src/app/api/requests/route");
  h.state.failMail = true;
  const response = await route.PATCH(patchRequest(paper.id, { status: "approved" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).email_sent, false);
  assert.equal(h.state.records[1].status, "approved");
  h.state.failMail = false;
  const retry = await route.PATCH(patchRequest(paper.id, { action: "resend_notification" }));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).email_sent, true);
  assert.equal(h.state.records[1].status, "approved");
  assert.equal(h.state.sentEmails.length, 1);
  assert.match(h.state.sentEmails[0].subject, /ponencia ha sido aprobada/);
});

test("only an administrator can resend notifications and unknown requests do not send mail", async () => {
  const paper = paperRecord("approved");
  const h = harness([paper]);
  const route = h.load("../src/app/api/requests/route");
  assert.equal((await route.PATCH(patchRequest(paper.id, { action: "resend_notification" }, "invalid"))).status, 401);
  assert.equal((await route.PATCH(patchRequest(paper.id, { status: "rejected" }, "invalid"))).status, 401);
  assert.equal((await route.PATCH(patchRequest("unknown-request", { action: "resend_notification" }))).status, 404);
  assert.equal(h.state.sentEmails.length, 0);
});

test("payment approval and rejection send receipt details and notes, never academic acceptance", async () => {
  const paid = {
    ...registration("speaker_external", "pending"), status: "reviewing",
    payment_method: "pagalo_pe", receipt_path: "receipts/test.pdf",
    payment_sequence: "093245", payment_amount: 101, payment_date: "2026-10-14", payment_document_number: "12345678",
  };
  const h = harness([paid]);
  const route = h.load("../src/app/api/requests/route");
  const decision = { action: "review_payment", decision: "approved", notes: "Comprobante validado." };
  assert.equal((await (await route.PATCH(patchRequest(paid.id, decision))).json()).email_sent, true);
  const message = h.state.sentEmails[0];
  assert.match(message.subject, /Tu pago ha sido aprobado/);
  assert.match(message.text, /093245/);
  assert.match(message.text, /14\/10\/2026/);
  assert.match(message.text, /S\/ 101\.00/);
  assert.match(message.text, /Comprobante validado/);
  assert.match(message.text, /La aceptación de la ponencia dependerá/);
  assert.doesNotMatch(message.text, /Tu ponencia ha sido aprobada/);
  assert.equal((await (await route.PATCH(patchRequest(paid.id, decision))).json()).email_sent, null);
  assert.equal(h.state.sentEmails.length, 1);
  assert.equal((await (await route.PATCH(patchRequest(paid.id, { ...decision, notes: "Nueva observación" }))).json()).email_sent, true);
  const rejection = await route.PATCH(patchRequest(paid.id, { action: "review_payment", decision: "rejected", notes: "Secuencia no encontrada." }));
  assert.equal((await rejection.json()).email_sent, true);
  assert.match(h.state.sentEmails[2].subject, /comprobante de pago no fue aprobado/);
  assert.match(h.state.sentEmails[2].text, /Secuencia no encontrada/);
});

test("new free and paid registrations receive accurate confirmations", async () => {
  for (const [id, fields, subject] of [
    ["speaker_internal_student", {}, /Tu inscripción está confirmada/],
    ["speaker_external", paymentFields(), /Recibimos tu inscripción/],
  ]) {
    const h = harness();
    const response = await h.load("../src/app/api/requests/route").POST(formRequest({ ...registrationFields(id), ...fields }));
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.email_sent, null);
    assert.equal(result.email_status, "pending");
    assert.equal(h.state.sentEmails.length, 0);
    await h.flushAfter();
    assert.match(h.state.sentEmails[0].subject, subject);
    if (id === "speaker_internal_student") {
      assert.match(h.state.sentEmails[0].text, /gratuita/);
      assert.match(h.state.sentEmails[0].text, /Ya puedes presentar tu investigación/);
    } else assert.match(h.state.sentEmails[0].text, /Pago pendiente de validación/i);
  }
});

test("missing SMTP configuration reports unavailable mail without losing registration", async () => {
  const h = harness([], { mailConfigured: false });
  const response = await h.load("../src/app/api/requests/route").POST(formRequest(registrationFields("speaker_internal_student")));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.email_sent, false);
  assert.equal(result.email_status, "unavailable");
  assert.equal(h.state.records.length, 1);
  assert.equal(h.state.afterWork.length, 0);
});

test("rejected recipient does not undo a registration after its response", async () => {
  const h = harness();
  h.state.rejectRecipient = true;
  const response = await h.load("../src/app/api/requests/route").POST(formRequest(registrationFields("speaker_internal_student")));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).email_status, "pending");
  await h.flushAfter();
  assert.equal(h.state.records.length, 1);
  assert.equal(h.state.sentEmails.length, 1);
});

test("paper submission responds while SMTP is blocked and records upload timings", { timeout: 3000 }, async t => {
  let releaseMail;
  const waitForMail = new Promise(resolve => { releaseMail = resolve; });
  t.after(() => releaseMail());
  const h = harness([registration("speaker_internal_teacher")], { waitForMail });
  const token = h.load("../src/lib/paper-verification").issueVerificationToken(h.state.records[0]);
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({
    kind: "paper", verification_token: token, topic: "Investigación de prueba", file: pdf(),
  }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.email_status, "pending");
  assert.equal(result.email_sent, null);
  assert.equal(h.state.records.length, 2);
  assert.equal(h.state.uploads.length, 1);
  assert.equal(h.state.sentEmails.length, 0);
  for (const name of ["form", "registration", "storage", "database", "total"]) {
    assert.match(response.headers.get("Server-Timing"), new RegExp(name + ";dur=[0-9]+[.][0-9]"));
  }
  let mailFinished = false;
  const mailWork = h.flushAfter().then(() => { mailFinished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(mailFinished, false);
  releaseMail();
  await mailWork;
  assert.equal(h.state.sentEmails.length, 1);
  assert.deepEqual(h.state.removed, []);
});

test("background SMTP failure preserves the uploaded paper and saved request", async () => {
  const h = harness([registration("speaker_internal_student")]);
  h.state.failMail = true;
  const token = h.load("../src/lib/paper-verification").issueVerificationToken(h.state.records[0]);
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({
    kind: "paper", verification_token: token, topic: "Investigación de prueba", file: pdf(),
  }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).email_status, "pending");
  await h.flushAfter();
  assert.equal(h.state.records.length, 2);
  assert.equal(h.state.uploads.length, 1);
  assert.deepEqual(h.state.removed, []);
});

test("notification scheduling failure preserves a paid registration and its voucher", async () => {
  const h = harness([], { failSchedule: true });
  const response = await h.load("../src/app/api/requests/route").POST(formRequest({
    ...registrationFields("speaker_external"), ...paymentFields(),
  }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.email_sent, false);
  assert.equal(result.email_status, "unavailable");
  assert.equal(h.state.records.length, 1);
  assert.equal(h.state.uploads.length, 1);
  assert.deepEqual(h.state.removed, []);
  assert.equal(h.state.afterWork.length, 0);
});

test("email HTML escapes participant data and never includes uploaded files, document numbers or private URLs", () => {
  const h = harness();
  const { buildRequestEmail } = h.load("../src/lib/email-template");
  const paper = {
    ...paperRecord("approved"), name: '<img src=x onerror="alert(1)"> & nombre',
    topic: '<a href="https://untrusted.invalid">Investigación</a>',
    file_url: "https://private.invalid/paper.pdf", receipt_url: "https://private.invalid/receipt.pdf",
  };
  const message = buildRequestEmail(paper, "status_updated");
  assert.doesNotMatch(message.html, /<img src=x|<a href="https:\/\/untrusted/);
  assert.match(message.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt; &amp; nombre/);
  assert.match(message.html, /href="https:\/\/www\.coninci2026\.com\/#programa"/);
  assert.doesNotMatch(message.html + message.text, /private\.invalid|12345678/);
  assert.ok(message.text.includes(paper.topic));
  const observed = buildRequestEmail({ ...registration("speaker_external", "rejected"), payment_notes: "<script>bad()</script>\nContactar al comité" }, "payment_reviewed");
  assert.match(observed.html, /&lt;script&gt;bad\(\)&lt;\/script&gt;<br>Contactar/);
  assert.doesNotMatch(observed.html, /<script>/);
});

test("templates distinguish receipt from review and never confirm a rejected free registration", () => {
  const { buildRequestEmail, CONGRESS_WHATSAPP_GROUP_URL } = harness().load("../src/lib/email-template");
  assert.match(buildRequestEmail(paperRecord(), "received").subject, /Recibimos tu investigación/);
  assert.match(buildRequestEmail(paperRecord(), "status_updated").subject, /Tu ponencia está en revisión/);
  const rejected = buildRequestEmail({ ...registration("speaker_internal_student"), status: "rejected" }, "status_updated");
  assert.doesNotMatch(rejected.subject + rejected.text, /inscripción está confirmada/);
  const attendee = buildRequestEmail(registration("attendee_external", "approved"), "payment_reviewed");
  assert.doesNotMatch(attendee.text, /Ya puedes presentar tu investigación/);
  const legacy = buildRequestEmail({ ...registration(null, null), status: "cash" }, "status_updated");
  assert.doesNotMatch(legacy.text, /inscripción está confirmada|pago ha sido aprobado/);
});

test("confirmed registrations include congress WhatsApp group link while pending and paper emails omit it", () => {
  const { buildRequestEmail, CONGRESS_WHATSAPP_GROUP_URL } = harness().load("../src/lib/email-template");
  assert.equal(CONGRESS_WHATSAPP_GROUP_URL, "https://chat.whatsapp.com/FeX0kvwFsli3RC18gROIEh");

  // Free confirmed registration
  const freeConfirmed = buildRequestEmail(registration("speaker_internal_teacher", "exempt"), "received");
  assert.ok(freeConfirmed.html.includes(CONGRESS_WHATSAPP_GROUP_URL));
  assert.ok(freeConfirmed.text.includes(CONGRESS_WHATSAPP_GROUP_URL));

  // Paid confirmed registration
  const paidConfirmed = buildRequestEmail(registration("attendee_external", "approved"), "payment_reviewed");
  assert.ok(paidConfirmed.html.includes(CONGRESS_WHATSAPP_GROUP_URL));
  assert.ok(paidConfirmed.text.includes(CONGRESS_WHATSAPP_GROUP_URL));

  // Pending payment registration
  const pendingRegistration = buildRequestEmail({ ...registration("attendee_external", "pending"), status: "reviewing" }, "received");
  assert.doesNotMatch(pendingRegistration.html + pendingRegistration.text, /chat\.whatsapp\.com/);

  // Rejected registration
  const rejectedRegistration = buildRequestEmail({ ...registration("attendee_external", "rejected"), status: "rejected" }, "payment_reviewed");
  assert.doesNotMatch(rejectedRegistration.html + rejectedRegistration.text, /chat\.whatsapp\.com/);

  // Paper emails
  const approvedPaper = buildRequestEmail(paperRecord("approved"), "status_updated");
  assert.doesNotMatch(approvedPaper.html + approvedPaper.text, /chat\.whatsapp\.com/);
});

test("transactional email builds offline with HTML, plain text and two actual embedded PNG logos", async () => {
  const h = harness();
  const delivered = await h.load("../src/lib/email").sendRequestEmail(paperRecord("approved"), "status_updated");
  assert.equal(delivered, true);
  const message = h.state.sentEmails[0];
  assert.equal(message.attachments.length, 2);
  assert.equal(message.replyTo.address, "subdireccion.investigacion.epep@unap.edu.pe");
  for (const attachment of message.attachments) {
    assert.equal(attachment.content.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.ok(message.html.includes("cid:" + attachment.cid));
    assert.equal(attachment.contentDisposition, "inline");
  }
  const MailComposer = requireDependency("nodemailer/lib/mail-composer");
  const mime = (await new MailComposer(message).compile().build()).toString("utf8");
  assert.match(mime, /multipart\/alternative/);
  assert.match(mime, /multipart\/related/);
  assert.match(mime, /Content-Type: text\/plain; charset=utf-8/);
  assert.match(mime, /Content-Type: text\/html; charset=utf-8/);
  assert.match(mime, /Content-ID: <una-logo@coninci2026\.com>/);
  assert.match(mime, /Content-ID: <epep-logo@coninci2026\.com>/);
  assert.ok(Buffer.byteLength(mime) < 1024 * 1024);
});

test("missing logo assets still send a readable email without broken image references", async () => {
  const h = harness([], { missingLogos: true });
  assert.equal(await h.load("../src/lib/email").sendRequestEmail(paperRecord("approved"), "status_updated"), true);
  assert.equal(h.state.sentEmails[0].attachments.length, 0);
  assert.doesNotMatch(h.state.sentEmails[0].html, /src="cid:/);
  assert.match(h.state.sentEmails[0].html, /UNIVERSIDAD NACIONAL/);
});

test("admin listing includes registrations beyond a single database result page", async () => {
  const records = Array.from({ length: 1005 }, (_, index) => ({
    ...registration("speaker_internal_student"), id: "test-registration-" + index,
  }));
  const h = harness(records);
  const rows = await h.load("../src/lib/requests").listRequests();
  assert.equal(rows.length, 1005);
  assert.equal(new Set(rows.map(row => row.id)).size, 1005);
  assert.ok(rows.some(row => row.id === "test-registration-1004"));
});
