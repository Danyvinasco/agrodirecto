import Image from "next/image";
import { cantidadConUnidad, haceCuanto, pesos, textoCalidad } from "@/lib/formato";

// Los datos de un producto que necesita la tarjeta (columnas de la tabla productos).
export type ProductoCatalogo = {
  id: number;
  created_at: string;
  producto: string;
  variedad: string | null;
  calidad: string | null;
  cantidad: number;
  precio: number;
  unidad: string;
  foto_url: string | null;
  municipio: string;
};

// Server Component: no reacciona a clics (el detalle llega en HU-06), solo muestra.
// "ahora" llega desde afuera para que todas las tarjetas usen el mismo momento.
export default function TarjetaProducto({ p, ahora }: { p: ProductoCatalogo; ahora: Date }) {
  return (
    <article className="overflow-hidden rounded-xl border border-cafe/15 bg-white shadow-sm">
      {/* Caja 4:3 para la foto: "relative" + Image "fill" hace que la foto llene la caja. */}
      <div className="relative aspect-[4/3] bg-crema">
        {p.foto_url ? (
          <Image
            src={p.foto_url}
            alt={`Foto de ${p.producto}`}
            fill
            // Le dice a Next qué tan ancha se ve la foto según la pantalla,
            // para mandarle al celular una versión pequeña y ahorrar datos.
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-cafe/50">Sin foto</div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4">
        <h2 className="text-lg font-bold leading-tight">
          {p.producto}
          {p.variedad && <span className="font-normal"> · {p.variedad}</span>}
        </h2>

        {p.calidad && (
          <span className="self-start rounded-full bg-cafe/10 px-2 py-0.5 text-xs font-semibold">
            {textoCalidad(p.calidad)}
          </span>
        )}

        <p className="text-xl font-bold text-verde">
          {pesos(Number(p.precio))} <span className="text-sm font-normal text-cafe">/ {p.unidad}</span>
        </p>

        <p className="text-sm">
          {cantidadConUnidad(Number(p.cantidad), p.unidad)}{" "}
          {Number(p.cantidad) === 1 ? "disponible" : "disponibles"}
        </p>
        <p className="text-sm">📍 {p.municipio}</p>
        <p className="text-xs text-cafe/60">{haceCuanto(p.created_at, ahora)}</p>
      </div>
    </article>
  );
}
