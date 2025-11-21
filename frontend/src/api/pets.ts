import { apiRequest } from "./client";

export type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  notes?: string | null;
};

export async function listPets(): Promise<Pet[]> {
  return apiRequest<Pet[]>("/pets/");
}

export async function createPet(payload: {
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  notes?: string;
}): Promise<{ id: number; message: string }> {
  return apiRequest<{ id: number; message: string }>("/pets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
