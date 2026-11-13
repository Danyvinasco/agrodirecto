// Reglas del teléfono, iguales a las de la base de datos (migración 07):
// 10 dígitos, empieza por 3, sin espacios ni +57.

// Deja solo los números. Si la persona escribió el indicativo (+57 o 57)
// delante de un celular de 10 dígitos, también se lo quitamos.
// Ejemplos: "310 555 1234" -> "3105551234"   "+57 310-555-1234" -> "3105551234"
export function limpiarTelefono(texto: string): string {
  const soloDigitos = texto.replace(/\D/g, "");
  if (soloDigitos.length === 12 && soloDigitos.startsWith("57")) {
    return soloDigitos.slice(2);
  }
  return soloDigitos;
}

// Devuelve el mensaje de error para mostrar en pantalla, o null si el número está bien.
// Recibe el teléfono ya limpio.
export function validarTelefono(telefono: string): string | null {
  if (telefono.length === 0) return "Escribe tu número de celular.";
  if (telefono.length !== 10) return "El celular debe tener 10 dígitos.";
  if (!telefono.startsWith("3")) return "El celular debe empezar por 3.";
  return null;
}

// ---------- Cantidad y precio de un producto (HU-03) ----------

// Tope para atajar errores de dedo (un cero de más).
export const MAXIMO_CANTIDAD_PRECIO = 100_000;

// Deja solo los números. Así "1.500" o "$1500" quedan como "1500".
export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

// Muestra los dígitos con puntos de miles, como se escribe en Colombia: "1500" -> "1.500".
export function conPuntosDeMiles(digitos: string): string {
  return digitos ? Number(digitos).toLocaleString("es-CO") : "";
}

// Devuelve el mensaje de error, o null si el número está bien.
// "que" es el nombre del campo para armar el mensaje: "la cantidad", "el precio".
export function validarNumeroProducto(digitos: string, que: string): string | null {
  if (digitos.length === 0) return `Escribe ${que}.`;
  const valor = Number(digitos);
  if (valor <= 0) return `${mayuscula(que)} debe ser mayor que 0.`;
  if (valor > MAXIMO_CANTIDAD_PRECIO) {
    return `${mayuscula(que)} no puede pasar de ${conPuntosDeMiles(String(MAXIMO_CANTIDAD_PRECIO))}. Revisa si sobra un cero.`;
  }
  return null;
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
