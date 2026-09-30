import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type RequestKind = "registration" | "paper";
export type RequestStatus = "pending" | "reviewing" | "approved" | "rejected";

export type CongressRequest = {
  id: string;
  kind: RequestKind;
  name: string;
  email: string;
  mode: "Presencial" | "Virtual";
  institution?: string;
  topic?: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "requests.json");

async function readRequests(): Promise<CongressRequest[]> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as CongressRequest[];
  } catch {
    return [];
  }
}

async function writeRequests(requests: CongressRequest[]) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(requests, null, 2), "utf8");
}

export async function listRequests() {
  return (await readRequests()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRequest(input: Omit<CongressRequest, "id" | "status" | "createdAt">) {
  const request: CongressRequest = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const requests = await readRequests();
  requests.push(request);
  await writeRequests(requests);
  return request;
}

export async function updateRequestStatus(id: string, status: RequestStatus) {
  const requests = await readRequests();
  const request = requests.find((item) => item.id === id);
  if (!request) return null;
  request.status = status;
  await writeRequests(requests);
  return request;
}
