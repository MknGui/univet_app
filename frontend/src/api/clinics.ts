// src/api/clinics.ts
import { apiRequest } from "@/api/client";

export interface Clinic {
  id: number;
  name: string;
  region?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone?: string | null;
}

export type CreateClinicPayload = {
  name: string;
  region?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
};

export async function listClinics(): Promise<Clinic[]> {
  return apiRequest<Clinic[]>("/clinics", {
    method: "GET",
  });
}

export async function createClinic(
  payload: CreateClinicPayload
): Promise<Clinic> {
  return apiRequest<Clinic>("/clinics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// novo: definir clínica atual no backend (PUT /api/clinics/current)
export async function setCurrentClinic(
  clinicId: number
): Promise<{ clinic_id: number }> {
  return apiRequest<{ clinic_id: number }>("/clinics/current", {
    method: "PUT",
    body: JSON.stringify({ clinic_id: clinicId }),
  });
}
