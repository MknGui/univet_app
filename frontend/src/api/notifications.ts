import { apiRequest } from "./client";

export type NotificationType = "appointment" | "triage" | "info" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string | null;
}

// AQUI é o pulo do gato: sem /api
const BASE_PATH = "/notifications";

export async function listNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>(BASE_PATH, {
    method: "GET",
  });
}

export async function markNotificationAsRead(
  id: string | number
): Promise<void> {
  await apiRequest<Notification>(`${BASE_PATH}/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest<{ status: string }>(`${BASE_PATH}/read-all`, {
    method: "PATCH",
  });
}
