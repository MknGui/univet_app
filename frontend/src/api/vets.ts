// src/api/vets.ts
import { apiRequest } from "@/api/client";

export interface VetOption {
  id: number;
  name: string;
  specialty?: string | null;
  clinic_name?: string | null;
  region?: string | null;
}

export async function listVets(): Promise<VetOption[]> {
  return apiRequest<VetOption[]>("/vets", {
    method: "GET",
  });
}
