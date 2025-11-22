// frontend/src/api/pets.ts

export interface Pet {
  id: number;
  name: string;
  species?: string | null;
  sex?: string | null;
  age?: number | null;
  notes?: string | null;
  owner_id?: number;
  created_at?: string | null;
  breeds?: string[];
}

export interface PetVaccine {
  id: number;
  pet_id: number;
  name: string;
  lot?: string | null;
  date: string;        // ISO (YYYY-MM-DD)
  next_dose?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.5:5000";

function getAuthHeaders(): HeadersInit {
  // agora usamos o MESMO nome que o login salva
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    const msg = data?.message || "Erro na requisição";
    throw new Error(msg);
  }

  return data as T;
}

// ----------------------
// Pets
// ----------------------

export async function listPets(): Promise<Pet[]> {
  const response = await fetch(`${API_BASE_URL}/api/pets`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleJsonResponse<Pet[]>(response);
}

export async function getPet(id: string | number): Promise<Pet> {
  const response = await fetch(`${API_BASE_URL}/api/pets/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleJsonResponse<Pet>(response);
}

export interface CreatePetInput {
  name: string;
  species?: string;
  breed?: string;   // string única; será quebrada em lista
  sex?: string;
  notes?: string;
  age?: number;
}

export async function createPet(input: CreatePetInput): Promise<Pet> {
  const breedsArray =
    input.breed
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];

  const payload = {
    name: input.name,
    species: input.species,
    sex: input.sex,
    notes: input.notes,
    age: input.age,
    breeds: breedsArray,
  };

  const response = await fetch(`${API_BASE_URL}/api/pets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse<Pet>(response);
}

export interface UpdatePetInput {
  name?: string;
  species?: string;
  breed?: string;
  sex?: string;
  notes?: string;
  age?: number | null;
}

export async function updatePet(id: string | number, input: UpdatePetInput): Promise<Pet> {
  const breedsArray =
    input.breed !== undefined && input.breed !== null
      ? input.breed
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : undefined;

  const payload: any = {
    name: input.name,
    species: input.species,
    sex: input.sex,
    notes: input.notes,
    age: input.age,
  };

  if (breedsArray !== undefined) {
    payload.breeds = breedsArray;
  }

  const response = await fetch(`${API_BASE_URL}/api/pets/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse<Pet>(response);
}

export async function deletePet(id: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/pets/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleJsonResponse<{ message: string }>(response);
}

// ----------------------
// Vaccines
// ----------------------

export interface CreateVaccineInput {
  name: string;
  date: string;        // YYYY-MM-DD
  lot?: string;
  next_dose?: string;
  notes?: string;
}

export async function listPetVaccines(petId: string | number): Promise<PetVaccine[]> {
  const response = await fetch(`${API_BASE_URL}/api/pets/${petId}/vaccines`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleJsonResponse<PetVaccine[]>(response);
}

export async function createPetVaccine(
  petId: string | number,
  input: CreateVaccineInput
): Promise<PetVaccine> {
  const payload = {
    name: input.name,
    date: input.date,
    lot: input.lot,
    next_dose: input.next_dose,
    notes: input.notes,
  };

  const response = await fetch(`${API_BASE_URL}/api/pets/${petId}/vaccines`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse<PetVaccine>(response);
}
