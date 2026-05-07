import complexesJson from "@/data/complexes.json";
import schoolsJson from "@/data/schools.json";

import type { Complex, ComplexId } from "@/lib/types/complex";

export const complexes = complexesJson as Complex[];

export function getComplex(id: ComplexId): Complex | undefined {
  return complexes.find((c) => c.id === id);
}

export function listComplexes(): Complex[] {
  return complexes;
}

export type SchoolLevel = "elementary" | "middle" | "high";

export type School = {
  id: string;
  name: string;
  level: SchoolLevel;
  address: string;
  homepage: string | null;
};

export const schools = schoolsJson as School[];

export function getSchool(id: string): School | undefined {
  return schools.find((s) => s.id === id);
}
