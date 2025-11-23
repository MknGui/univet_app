// src/api/client.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://192.168.1.5:5000"; // <-- seu IP da máquina

type ApiRequestOptions = RequestInit & {
  // para não ter que repetir o tipo toda hora
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Erro na requisição (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignora parse de erro
    }
    throw new Error(message);
  }

  // se não tiver body (204, por exemplo), só retorna undefined
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
