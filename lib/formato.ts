// Formatos para mostrar datos en pantalla, como se leen en Colombia.

// 1500 -> "$1.500"
export function pesos(n: number): string {
  return `$${n.toLocaleString("es-CO")}`;
}

// 1 kg / 200 kg / 1 racimo / 15 racimos
export function cantidadConUnidad(cantidad: number, unidad: string): string {
  const numero = cantidad.toLocaleString("es-CO");
  if (unidad === "racimo") return `${numero} ${cantidad === 1 ? "racimo" : "racimos"}`;
  return `${numero} kg`;
}

// "primera" -> "Primera", "por racimo" -> "Por racimo"
export function textoCalidad(calidad: string): string {
  return calidad.charAt(0).toUpperCase() + calidad.slice(1);
}

// Fecha del calendario en Colombia, como texto "AAAA-MM-DD".
// Importante: en Vercel el servidor vive en hora de Londres (UTC). Si no fijamos la zona,
// algo publicado a las 8 p. m. en Colombia aparecería como del día siguiente.
function diaEnColombia(fecha: Date): string {
  return fecha.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); // en-CA da AAAA-MM-DD
}

// "Publicado hoy", "Publicado ayer", "Publicado hace 3 días".
// Cuenta días del calendario, no horas: algo de anoche a las 11 p. m. es "ayer".
export function haceCuanto(creadoEn: string, ahora: Date): string {
  const desde = Date.parse(diaEnColombia(new Date(creadoEn)));
  const hasta = Date.parse(diaEnColombia(ahora));
  const dias = Math.round((hasta - desde) / 86_400_000); // milisegundos en un día

  if (dias <= 0) return "Publicado hoy";
  if (dias === 1) return "Publicado ayer";
  return `Publicado hace ${dias} días`;
}
