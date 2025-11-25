// src/api/education.ts
import { apiRequest } from "./client";

export interface EducationContent {
  id: number;
  title: string;
  summary: string;
  category: string;     // 'nutrition' | 'vaccination' | 'hygiene' | 'wellbeing'
  readTime?: string;
  link?: string;
  content?: string;     // só vem no detalhe
}

export async function listEducationContents(): Promise<EducationContent[]> {
  return apiRequest<EducationContent[]>("/education");
}

export async function getEducationContent(
  id: number | string
): Promise<EducationContent> {
  return apiRequest<EducationContent>(`/education/${id}`);
}