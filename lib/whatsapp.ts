// Enlace de WhatsApp (HU-06). Regla de negocio: nadie escribe enlaces, la app los arma.
// telefono: 10 dígitos que empiezan por 3 (así lo garantiza la base, migración 07).
// encodeURIComponent "empaca" el mensaje para viajar dentro de un enlace:
// los espacios y las tildes se vuelven códigos como %20 y %C3%AD.
export function enlaceWhatsApp(telefono: string, producto: string): string {
  // Redacción neutral a propósito: "vi tu plátano" se presta para doble sentido en Colombia.
  const mensaje = `Hola, te escribo por tu publicación de ${producto} en AgroDirecto.`;
  return `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
}
