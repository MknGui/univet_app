import { apiRequest } from "./client";

export type EducationalContent = {
  id: number;
  title: string;
  summary?: string | null;
  target_species?: string | null;
};

export async function listEducationalContent(): Promise<EducationalContent[]> {
  return apiRequest<EducationalContent[]>("/content/");
}
