import type { Practice } from "@/data/buenasPracticas/countries";

export interface SimilarityResult {
  common: string[];
  onlyA: string[];
  onlyB: string[];
}

export function getSimilarities(a: Practice, b: Practice): SimilarityResult {
  const common = a.tags.filter(tag => b.tags.includes(tag));
  const onlyA = a.tags.filter(tag => !b.tags.includes(tag));
  const onlyB = b.tags.filter(tag => !a.tags.includes(tag));

  return { common, onlyA, onlyB };
}





