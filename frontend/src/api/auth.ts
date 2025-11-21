import { apiRequest } from "./client";

export type UserIdentity = {
  id: number;
  role: "TUTOR" | "VET" | "ADMIN";
};

export type LoginResponse = {
  access_token: string;
  user: UserIdentity;
};

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

export async function register(payload: {
  full_name: string;
  email: string;
  password: string;
  role?: "TUTOR" | "VET" | "ADMIN";
  crmv?: string;
  phone?: string;
}) {
  return apiRequest<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): UserIdentity | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserIdentity;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}
