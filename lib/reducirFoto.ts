// Achica una foto en el propio celular antes de subirla (HU-03).
// Una foto de celular pesa 4-8 MB; así queda en unos 200-300 KB:
// sube rápido con datos móviles en zona rural y gasta menos datos al comprador.

const LADO_MAXIMO = 1200; // píxeles del lado más largo
const CALIDAD_JPEG = 0.8; // 0 a 1: 0.8 se ve bien y pesa poco

export async function reducirFoto(archivo: File): Promise<Blob> {
  // createImageBitmap "abre" la foto. imageOrientation: "from-image" respeta el giro
  // que guarda el celular, para que la foto no quede acostada.
  const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });

  // Regla de tres: el lado más largo queda en 1200 px y el otro en proporción.
  // Si la foto ya es pequeña, no la agrandamos (escala máxima 1).
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);

  // Un <canvas> es una hoja en blanco donde "volvemos a pintar" la foto más pequeña.
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const pincel = lienzo.getContext("2d");
  if (!pincel) throw new Error("El navegador no pudo procesar la foto.");
  pincel.drawImage(imagen, 0, 0, ancho, alto);
  imagen.close(); // liberar memoria del celular

  // toBlob trabaja con "callback"; lo envolvemos en una Promise para poder usar await.
  return new Promise((resolver, rechazar) => {
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo convertir la foto."))),
      "image/jpeg",
      CALIDAD_JPEG,
    );
  });
}
