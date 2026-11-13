// Los 14 municipios de Risaralda, en orden alfabético.
// Se usan en la lista desplegable del registro (y luego al publicar productos).
// "as const" hace que TypeScript conozca cada nombre exacto, no solo "un texto cualquiera".
export const MUNICIPIOS_RISARALDA = [
  "Apía",
  "Balboa",
  "Belén de Umbría",
  "Dosquebradas",
  "Guática",
  "La Celia",
  "La Virginia",
  "Marsella",
  "Mistrató",
  "Pereira",
  "Pueblo Rico",
  "Quinchía",
  "Santa Rosa de Cabal",
  "Santuario",
] as const;

// Tipo que solo acepta uno de los 14 nombres de arriba.
export type Municipio = (typeof MUNICIPIOS_RISARALDA)[number];
