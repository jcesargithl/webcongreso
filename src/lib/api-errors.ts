import { ValidationError } from "./registration-rules";

export function errorResponse(error: unknown): Response {
  if (error instanceof ValidationError) return Response.json({ error: error.message }, { status: error.status });
  if (typeof error === "object" && error && "code" in error && error.code === "23505") {
    return Response.json({ error: "Ya existe una inscripción para este documento o el comprobante ya fue utilizado." }, { status: 409 });
  }
  if (typeof error === "object" && error && "code" in error && error.code === "23514") {
    return Response.json({ error: "La inscripción o el pago no cumple los requisitos. Vuelve a verificar tu inscripción." }, { status: 409 });
  }
  console.error("Error en el flujo del congreso:", error);
  return Response.json({ error: "No pudimos completar la operación. Intenta nuevamente o contacta a la Secretaría." }, { status: 500 });
}
