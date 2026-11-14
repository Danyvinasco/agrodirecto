// "Volver a donde estaba" después de iniciar sesión (HU-06): /login?volver=/producto/12
//
// Cuidado de seguridad: cualquiera puede armar un enlace como
//   /login?volver=https://sitio-falso.com
// y mandarlo por WhatsApp. Si lo obedeciéramos, la persona inicia sesión en AgroDirecto
// y termina en una página falsa que podría pedirle la contraseña otra vez.
// Por eso solo aceptamos direcciones INTERNAS de la app.
//
// Devuelve la dirección si es segura, o null si no lo es (o si no hay).
export function direccionInterna(valor: string | null): string | null {
  if (!valor) return null;

  // Debe empezar por una sola "/". "//sitio.com" y "/\sitio.com" los navegadores
  // los entienden como OTRO sitio, así que también se rechazan.
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return null;

  // Segunda revisión: le pedimos al navegador que interprete la dirección sobre una base
  // inventada. Si el resultado se sale de esa base, no es interna.
  try {
    const base = "https://agrodirecto.local";
    return new URL(valor, base).origin === base ? valor : null;
  } catch {
    return null;
  }
}
