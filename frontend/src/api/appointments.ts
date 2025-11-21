import { apiRequest } from "./client";

export type Appointment = {
  id: number;
  pet_id: number;
  vet_id: number;
  scheduled_at: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
  notes?: string | null;
};

export async function listAppointments(): Promise<Appointment[]> {
  return apiRequest<Appointment[]>("/appointments/");
}

export async function createAppointment(payload: {
  pet_id: number;
  vet_id: number;
  scheduled_at: string; // ISO string
  notes?: string;
}): Promise<{ id: number; message: string }> {
  return apiRequest<{ id: number; message: string }>("/appointments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
