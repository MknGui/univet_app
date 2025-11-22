export interface Pet {
  id: number;
  name: string;
  species?: string | null;
  sex?: string | null;
  notes?: string | null;
  owner_id?: number;
  created_at?: string | null;
  breeds?: string[]; // vem do back como lista
}

// usa o mesmo host do backend
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.5:5000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("univet_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function listPets(): Promise<Pet[]> {
  const response = await fetch(`${API_BASE_URL}/api/pets`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // ignore
    }
    throw new Error(data?.message || "Erro ao carregar pets");
  }

  return response.json();
}

interface CreatePetInput {
  name: string;
  species?: string;
  breed?: string; // vem do form da tela
  sex?: string;
  notes?: string;
}

export async function createPet(input: CreatePetInput): Promise<Pet> {
  // transforma o campo "breed" do form em array de raças
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
    breeds: breedsArray, // é isso que o back espera
  };

  const response = await fetch(`${API_BASE_URL}/api/pets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // ignore
    }
    throw new Error(data?.message || "Erro ao cadastrar pet");
  }

  return response.json();
}
