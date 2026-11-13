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
