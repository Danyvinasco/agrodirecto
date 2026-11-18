import Image from "next/image";
import Link from "next/link";
import { cantidadConUnidad, pesos, textoCalidad } from "@/lib/formato";
import CambiarPublicacion from "../_componentes/CambiarPublicacion";
import type { MiProducto } from "./ListaMisProductos";

type Props = {
  producto: MiProducto;
  alCambiar: () => void; // la lista recarga después de quitar o volver a publicar
};

// Cómo está cada producto, en palabras de Dany (para un productor de Quinchía).
// Agotado gana: sin cantidad no tiene sentido volver a publicar (editar llega después).
type Situacion = "publicado" | "fuera" | "agotado";

const ETIQUETA: Record<Situacion, { texto: string; clase: string }> = {
  publicado: { texto: "Publicado", clase: "bg-verde/15 text-verde" },
  fuera: { texto: "Fuera del catálogo", clase: "bg-cafe/10 text-cafe" },
  agotado: { texto: "Agotado", clase: "bg-amarillo/20 text-cafe" },
};

export default function TarjetaMiProducto({ producto: p, alCambiar }: Props) {
  const cantidad = Number(p.cantidad);
  const situacion: Situacion = cantidad <= 0 ? "agotado" : p.publicado ? "publicado" : "fuera";
  const etiqueta = ETIQUETA[situacion];

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-cafe/20 bg-white p-4">
      <div className="flex gap-3">
        {/* Foto pequeña (80 px). Lo publicado abre el detalle, como en el catálogo. */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-crema">
          {p.foto_url ? (
            <Image src={p.foto_url} alt={`Foto de ${p.producto}`} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-cafe/50">Sin foto</div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold leading-tight text-cafe">
              {situacion === "publicado" ? (
                <Link href={`/producto/${p.id}`} className="underline-offset-2 hover:underline">
                  {p.producto}
                </Link>
              ) : (
                p.producto
              )}
              {p.variedad && <span className="font-normal"> · {p.variedad}</span>}
              {p.calidad && <span className="font-normal"> · {textoCalidad(p.calidad)}</span>}
            </h2>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${etiqueta.clase}`}>
              {etiqueta.texto}
            </span>
          </div>
          <p className="font-semibold text-verde">
            {pesos(Number(p.precio))} <span className="text-sm font-normal text-cafe">/ {p.unidad}</span>
          </p>
          <p className="text-sm">{cantidadConUnidad(cantidad, p.unidad)} disponibles</p>
        </div>
      </div>

      {/* Ajuste 3 de Dany: tranquilizar, nunca decir "ya no existe". */}
      {situacion === "fuera" && (
        <p className="text-sm text-cafe/80">
          La quitaste del catálogo. Puedes volver a publicarla cuando quieras.
        </p>
      )}

      {/* Criterio 9: sin cantidad no se puede volver a publicar todavía. */}
      {situacion === "agotado" ? (
        <p className="text-sm text-cafe/80">Agotado: podrás editar la cantidad más adelante.</p>
      ) : (
        <CambiarPublicacion
          productoId={p.id}
          producto={p.producto}
          publicado={p.publicado}
          cantidad={cantidad}
          unidad={p.unidad}
          alCambiar={alCambiar}
        />
      )}
    </article>
  );
}
