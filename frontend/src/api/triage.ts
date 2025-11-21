import { apiRequest } from "./client";

export type TriageResult = {
  id: number;
  risk_level: string;
  ai_summary: string;
  recommendations: string;
};

export async function createTriage(payload: {
  pet_id: number;
  symptoms: string;
}): Promise<TriageResult> {
  return apiRequest<TriageResult>("/triage/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
