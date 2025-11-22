const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = API_BASE_URL + path;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    console.error("API error:", response.status, errorBody);
    throw new Error(
      (errorBody as any)?.message ??
        `Erro na API (${response.status} ${response.statusText})`
    );
  }

  // Suporta rotas sem corpo, mas nosso back retorna JSON
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}