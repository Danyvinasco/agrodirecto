// Enlace de WhatsApp (HU-06). Regla de negocio: nadie escribe enlaces, la app los arma.
// telefono: 10 dígitos que empiezan por 3 (así lo garantiza la base, migración 07).
// encodeURIComponent "empaca" el mensaje para viajar dentro de un enlace:
// los espacios y las tildes se vuelven códigos como %20 y %C3%AD.
//
// motivo (HU-08): "publicacion" = el comprador le escribe al productor (por defecto, HU-06);
//                 "pedido"      = el productor le escribe al comprador para cuadrar la entrega.
// El "= ..." es un parámetro opcional con valor por defecto, igual que en C#.
export function enlaceWhatsApp(
  telefono: string,
  producto: string,
  motivo: "publicacion" | "pedido" = "publicacion",
): string {
  // Redacción neutral a propósito: "vi tu plátano" se presta para doble sentido en Colombia.
  const mensaje =
    motivo === "pedido"
      ? `Hola, te escribo por tu pedido de ${producto} en AgroDirecto.`
      : `Hola, te escribo por tu publicación de ${producto} en AgroDirecto.`;
  return `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
}
