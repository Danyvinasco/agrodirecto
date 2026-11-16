import Numerito from "./Numerito";

// Accesos del encabezado del catálogo como "barra de pestañas": ícono arriba, palabra abajo.
// La comparten Mis pedidos, Recibidos y Cerrar sesión, para que se vean idénticos.
//
// Celular: flex-1 = todas del mismo ancho, repartiéndose la fila (2 para el comprador, 3 para
// el productor). Computador (md): ancho fijo, una al lado de la otra.
// min-w-0 deja que el texto se acomode si la pantalla es muy angosta.
export const CLASE_PESTANA =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-cafe/20 bg-white px-1 py-2 text-xs font-semibold text-cafe md:w-28 md:flex-none";

// El ícono con el numerito pegado a su esquina, como en WhatsApp.
// relative + absolute: el numerito se ubica respecto al ícono, no a la pestaña.
export function IconoConNumerito({ icono, cuantos = 0 }: { icono: string; cuantos?: number }) {
  return (
    <span className="relative text-xl leading-none">
      {icono}
      {cuantos > 0 && (
        <span className="absolute -right-5 -top-2">
          <Numerito cuantos={cuantos} />
        </span>
      )}
    </span>
  );
}
