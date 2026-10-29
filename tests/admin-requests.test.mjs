import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const cache = new Map();
function load(filename) {
  const absolute = path.resolve(filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const compiledModule = { exports: {} };
  cache.set(absolute, compiledModule);
  const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", source)(
    request => load(path.resolve(path.dirname(absolute), request + ".ts")), compiledModule, compiledModule.exports,
  );
  return compiledModule.exports;
}
const { buildRequestsCsv, canApproveRequest, defaultAdminFilters, filterAdminRequests, formatTimestamp, paginateRequests } = load("src/lib/admin-requests.ts");

function registration(overrides = {}) {
  return {
    id: "reg-1", kind: "registration", name: "José Núñez", email: "jose@example.test",
    doc_type: "DNI", doc_number: "01234567", category_id: "speaker_external",
    category: "Ponente Externo · Investigadores", institution: "UNA Puno", mode: "Presencial",
    payment_status: "approved", payment_sequence: "093245", payment_amount: 101,
    registration_fee: 100, institutional_fee: 1, status: "approved", created_at: "2026-10-29T15:00:00Z",
    ...overrides,
  };
}
function paper(overrides = {}) {
  return {
    ...registration(), id: "paper-1", kind: "paper", registration_id: "reg-1",
    payment_status: "exempt", payment_sequence: null, payment_amount: null,
    registration_fee: 0, institutional_fee: 0, status: "reviewing",
    topic: "Innovación educativa", created_at: "2026-10-29T16:00:00Z", ...overrides,
  };
}
function lookup(rows) { return new Map(rows.map(row => [row.id, row])); }

test("payment filters use the linked registration instead of the paper exemption", () => {
  const rows = [registration(), paper(), paper({ id: "orphan", registration_id: "missing" })];
  const approved = filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, kind: "paper", payment: "approved" }, "newest");
  assert.deepEqual(approved.map(row => row.id), ["paper-1"]);
  assert.deepEqual(filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, kind: "paper", payment: "exempt" }, "newest"), []);
});

test("search matches accents, multiple terms, research titles and inherited receipt sequences", () => {
  const rows = [registration(), paper()];
  assert.equal(filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, query: "JOSE nunez 093245" }, "newest").length, 2);
  assert.deepEqual(filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, query: "innovacion educativa" }, "newest").map(row => row.id), ["paper-1"]);
  assert.equal(filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, query: "nunez inexistente" }, "newest").length, 0);
});

test("kind, category and status filters are applied together", () => {
  const rows = [registration(), paper(), paper({ id: "rejected", status: "rejected" })];
  const filtered = filterAdminRequests(rows, lookup(rows), { ...defaultAdminFilters, kind: "paper", category: "speaker_external", status: "reviewing" }, "newest");
  assert.deepEqual(filtered.map(row => row.id), ["paper-1"]);
});

test("approval eligibility requires a valid registration and approved external payment", () => {
  const submission = paper();
  assert.equal(canApproveRequest(submission, lookup([submission])), false);
  assert.equal(canApproveRequest(submission, lookup([submission, registration({ payment_status: "pending" })])), false);
  assert.equal(canApproveRequest(submission, lookup([submission, registration()])), true);
  const internal = registration({ category_id: "speaker_internal_teacher", payment_status: "exempt", registration_fee: 0 });
  assert.equal(canApproveRequest(internal, lookup([internal])), true);
  assert.equal(canApproveRequest(paper({ category_id: "speaker_internal_teacher" }), lookup([internal])), true);
  assert.equal(canApproveRequest(submission, lookup([registration({ status: "rejected" })])), false);
  assert.equal(canApproveRequest(registration({ category_id: null, category: "Sin identificar" }), new Map()), false);
});

test("sorting is stable and does not mutate the source collection", () => {
  const rows = [registration({ id: "z", name: "Zulema", created_at: "2026-10-28T15:00:00Z" }), registration({ id: "a", name: "Ana" })];
  assert.deepEqual(filterAdminRequests(rows, lookup(rows), defaultAdminFilters, "name_asc").map(row => row.id), ["a", "z"]);
  assert.deepEqual(filterAdminRequests(rows, lookup(rows), defaultAdminFilters, "oldest").map(row => row.id), ["z", "a"]);
  assert.deepEqual(rows.map(row => row.id), ["z", "a"]);
});

test("pagination handles empty results and clamps pages after filters change", () => {
  const rows = Array.from({ length: 23 }, (_, index) => index);
  const last = paginateRequests(rows, 50, 10);
  assert.equal(last.page, 3);
  assert.equal(last.pageCount, 3);
  assert.equal(last.from, 21);
  assert.equal(last.to, 23);
  assert.deepEqual(last.rows, [20, 21, 22]);
  assert.deepEqual(paginateRequests([], 5, 10), { rows: [], page: 1, pageCount: 1, from: 0, to: 0 });
});

test("CSV neutralizes formulas, quotes content and omits private file links", () => {
  const row = registration({
    name: '=HYPERLINK("https://untrusted.invalid")',
    institution: 'UNA, "Puno"\nEducación',
    file_url: "https://private.invalid/paper",
    receipt_url: "https://private.invalid/receipt",
  });
  const csv = buildRequestsCsv([row], lookup([row]));
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\u0027=HYPERLINK(""https://untrusted.invalid"")"'));
  assert.ok(csv.includes('"UNA, ""Puno""\nEducación"'));
  assert.doesNotMatch(csv, /private[.]invalid/);
  assert.ok(csv.includes('"01234567"'));
});

test("CSV includes all filtered records rather than just the current page", () => {
  const rows = Array.from({ length: 23 }, (_, index) => registration({ id: "reg-" + index, name: "Participante " + index }));
  const filtered = filterAdminRequests(rows, lookup(rows), defaultAdminFilters, "name_asc");
  assert.equal(paginateRequests(filtered, 1, 10).rows.length, 10);
  const csv = buildRequestsCsv(filtered, lookup(rows));
  assert.equal(csv.split("\r\n").length, 24);
  assert.ok(csv.includes('"Participante 22"'));
});

test("admin dates consistently use Peru time", () => {
  assert.match(formatTimestamp("2026-10-29T03:30:00Z", true), /28/);
  assert.equal(formatTimestamp("invalid"), "No registrada");
});
