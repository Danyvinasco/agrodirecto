import { supabase } from "@/lib/supabase";

// Precio de referencia SIPSA-DANE para mostrar al lado del precio (HU-03).
// Regla de negocio: primero Pereira; si no hay dato, otra ciudad del Eje Cafetero
// (diciendo cuál); si tampoco hay, se avisa que no hay referencia. Nunca bloquea.

// Orden de prioridad de las ciudades.
const CIUDADES_EN_ORDEN = ["Pereira", "Manizales", "Armenia"];

export type Referencia = {
  ciudad: string;
  mercados: string[]; // ej. ["La 41-Impala", "Mercasa"]
  minimo: number;     // el más bajo entre los mercados de esa ciudad
  maximo: number;     // el más alto entre los mercados de esa ciudad
  fechaInicio: string; // "2026-10-24"
  fechaFin: string;    // "2026-10-30"
};

type Fila = {
  ciudad: string;
  mercado: string;
  precio_min: number;
  precio_max: number;
  fecha_inicio: string;
  fecha_fin: string;
};

// Va a la base de datos. Devuelve la referencia, o null si no hay dato.
// Si falla la conexión, lanza el error (como un throw en C#) para que la pantalla lo maneje.
export async function buscarReferencia(nombreSipsa: string): Promise<Referencia | null> {
  const { data, error } = await supabase
    .from("precios_referencia")
    .select("ciudad, mercado, precio_min, precio_max, fecha_inicio, fecha_fin")
    .eq("producto", nombreSipsa)
    .in("ciudad", CIUDADES_EN_ORDEN);

  if (error) throw error;
  return elegirReferencia(data as Fila[]);
}

// No va a la base: solo decide con las filas que le pasan.
// Separarla así permite probarla con datos inventados sin tocar Supabase.
export function elegirReferencia(filas: Fila[]): Referencia | null {
  for (const ciudad of CIUDADES_EN_ORDEN) {
    const deLaCiudad = filas.filter((f) => f.ciudad === ciudad);
    if (deLaCiudad.length === 0) continue; // no hay dato: probar la siguiente ciudad

    // Solo la semana más reciente de esa ciudad.
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto: "2026-11-06" > "2026-10-30".
    const ultimaFecha = deLaCiudad.map((f) => f.fecha_fin).sort().at(-1)!;
    const semana = deLaCiudad.filter((f) => f.fecha_fin === ultimaFecha);

    return {
      ciudad,
      mercados: semana.map((f) => f.mercado).sort(),
      minimo: Math.min(...semana.map((f) => Number(f.precio_min))),
      maximo: Math.max(...semana.map((f) => Number(f.precio_max))),
      fechaInicio: semana[0].fecha_inicio,
      fechaFin: ultimaFecha,
    };
  }
  return null;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2026-10-24" y "2026-10-30" -> "24 – 30 oct 2026"
// "2026-10-28" y "2026-11-03" -> "28 oct – 3 nov 2026"
// Partimos el texto a mano en vez de usar new Date(): new Date("2026-10-24") lo toma
// como medianoche en Londres, y en Colombia (5 horas menos) mostraría el 23.
export function formatearSemana(inicio: string, fin: string): string {
  const [, mesIni, diaIni] = inicio.split("-").map(Number);
  const [anioFin, mesFin, diaFin] = fin.split("-").map(Number);
  const desde = mesIni === mesFin ? `${diaIni}` : `${diaIni} ${MESES[mesIni - 1]}`;
  return `${desde} – ${diaFin} ${MESES[mesFin - 1]} ${anioFin}`;
}
