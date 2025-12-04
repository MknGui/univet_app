// src/api/appointments.ts
import { apiRequest } from "./client";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Appointment {
  id: number;
  pet_id: number;
  tutor_id: number;
  vet_id: number;
  scheduled_at: string; // ISO 8601 vindo do backend
  reason?: string | null;
  status: AppointmentStatus;
  created_at?: string | null;
  updated_at?: string | null;
  
  pet_name?: string | null;
  tutor_name?: string | null;
  vet_name?: string | null;
}

export interface CreateAppointmentPayload {
  pet_id: number;
  vet_id: number;
  scheduled_at: string;
  reason?: string;
}

// lista para o usuário logado (tutor por padrão)
export async function listAppointments(
  role: "tutor" | "vet" = "tutor"
): Promise<Appointment[]> {
  const query = role ? `?role=${role}` : "";
  return apiRequest<Appointment[]>(`/appointments${query}`);
}

export async function getAppointment(id: number): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`);
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  return apiRequest<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function confirmAppointment(id: number): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}/confirm`, {
    method: "PATCH",
  });
}