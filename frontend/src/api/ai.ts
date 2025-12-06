// src/api/ai.ts
import { apiRequest } from "./client";

export type ConsultationSummaryResponse = {
  pet_id: number;
  consultation_count: number;
  summary: string;
};

export async function getConsultationSummary(
  petId: number
): Promise<ConsultationSummaryResponse> {
  return apiRequest<ConsultationSummaryResponse>(
    `/consultations/summary?pet_id=${petId}`,
    {
      method: "GET",
    }
  );
}
