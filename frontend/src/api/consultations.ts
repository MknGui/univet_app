// src/api/consultations.ts
import { apiRequest } from "./client";

export interface Consultation {
  id: number;
  pet_id: number;
  tutor_id: number;
  vet_id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  observations?: string | null;
  next_visit?: string | null;
  pet_name?: string | null;
  tutor_name?: string | null;
  vet_name?: string | null;
}

export interface CreateConsultationPayload {
  pet_id: number;
  date: string; // "YYYY-MM-DD"
  diagnosis: string;
  treatment: string;
  observations?: string;
  next_visit?: string;
}

export async function createConsultation(
  payload: CreateConsultationPayload
): Promise<Consultation> {
  return apiRequest<Consultation>("/consultations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listConsultations(): Promise<Consultation[]> {
  return apiRequest<Consultation[]>("/consultations", {
    method: "GET",
  });
}

// novo helper para buscar histórico por pet
export async function listConsultationsByPet(
  petId: number | string
): Promise<Consultation[]> {
  const query = `?pet_id=${encodeURIComponent(String(petId))}`;
  return apiRequest<Consultation[]>(`/consultations${query}`, {
    method: "GET",
  });
}

export async function getConsultation(
  id: number | string
): Promise<Consultation> {
  return apiRequest<Consultation>(`/consultations/${id}`, {
    method: "GET",
  });
}
