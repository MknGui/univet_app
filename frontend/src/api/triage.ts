// src/api/triage.ts
import { apiRequest } from "./client";

export interface TriagePayload {
  pet_id: number;
  symptoms: string;
}

export type RiskLevel = "urgent" | "monitor" | "ok";

export interface TriageResult {
  id: number;
  pet_id?: number;
  tutor_id?: number;
  risk_level: RiskLevel;
  ai_summary: string;
  recommendations: string;
  created_at?: string | null;
}

export async function createTriage(
  payload: TriagePayload
): Promise<TriageResult> {
  return apiRequest<TriageResult>("/triage/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
