// Enlace de WhatsApp (HU-06). Regla de negocio: nadie escribe enlaces, la app los arma.
// telefono: 10 dígitos que empiezan por 3 (así lo garantiza la base, migración 07).
// encodeURIComponent "empaca" el mensaje para viajar dentro de un enlace:
// los espacios y las tildes se vuelven códigos como %20 y %C3%AD.

// Para qué se escribe: cambia el mensaje que llega ya escrito.
// - "publicacion": el comprador le escribe al productor desde el detalle (HU-06).
// - "pedido":      el productor le escribe al comprador desde Pedidos recibidos (HU-08).
// - "mi-pedido":   el comprador le escribe al productor desde Mis pedidos (HU-10).
export type MotivoWhatsApp = "publicacion" | "pedido" | "mi-pedido";

// Un mensaje por motivo. Record obliga a que estén todos (como un switch completo en C#).
// Redacción neutral a propósito: "vi tu plátano" se presta para doble sentido en Colombia.
const MENSAJES: Record<MotivoWhatsApp, (producto: string) => string> = {
  publicacion: (producto) => `Hola, te escribo por tu publicación de ${producto} en AgroDirecto.`,
  pedido: (producto) => `Hola, te escribo por tu pedido de ${producto} en AgroDirecto.`,
  "mi-pedido": (producto) => `Hola, te escribo por mi pedido de ${producto} en AgroDirecto.`,
};

// El "= ..." es un parámetro opcional con valor por defecto, igual que en C#.
export function enlaceWhatsApp(
  telefono: string,
  producto: string,
  motivo: MotivoWhatsApp = "publicacion",
): string {
  const mensaje = MENSAJES[motivo](producto);
  return `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
}
