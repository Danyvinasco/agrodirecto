import Image from "next/image";
import Link from "next/link";
import { io } from "next/cache";
import { supabase } from "@/lib/supabase";
import { cantidadConUnidad, haceCuanto, pesos, textoCalidad } from "@/lib/formato";
import ContactoProductor from "./ContactoProductor";

// Server Component: la parte PÚBLICA del detalle (criterio 2), igual para todos.
// El nombre del productor y WhatsApp NO van aquí: el servidor no sabe quién mira (paso 2).
export default async function DetalleProducto({ id }: { id: string }) {
  // Criterio 7: si escriben /producto/abc o /producto/-5, no vamos ni a la base.
  const idNumero = Number(id);
  if (!Number.isInteger(idNumero) || idNumero <= 0) return <NoDisponible />;

  await io(); // consultar fresco en cada visita (la cantidad cambia con los pedidos)
  const ahora = new Date();

  const { data: p, error } = await supabase
    .from("productos")
    .select("id, productor_id, created_at, producto, variedad, calidad, cantidad, precio, unidad, foto_url, municipio")
    .eq("id", idNumero)
    .maybeSingle(); // como FirstOrDefault en C#: una fila o null

  if (error) {
    return (
      <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">
        No pudimos cargar el producto. Revisa tu conexión y recarga la página.
      </p>
    );
  }
  // Criterio 7: no existe o ya se agotó.
  if (!p || Number(p.cantidad) <= 0) return <NoDisponible />;

  const cantidad = Number(p.cantidad);

  return (
    // En celular, una columna (foto arriba). En computador (md), foto a la izquierda y datos a la derecha.
    <article className="grid gap-6 md:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-crema">
        {p.foto_url ? (
          <Image
            src={p.foto_url}
            alt={`Foto de ${p.producto}`}
            fill
            priority // es lo primero que se ve: que cargue de una vez
            sizes="(min-width: 768px) 450px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cafe/50">Sin foto</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold leading-tight text-cafe">
          {p.producto}
          {p.variedad && <span className="font-normal"> · {p.variedad}</span>}
        </h1>

        {p.calidad && (
          <span className="self-start rounded-full bg-cafe/10 px-3 py-1 text-sm font-semibold">
            Calidad: {textoCalidad(p.calidad)}
          </span>
        )}

        <p className="text-3xl font-bold text-verde">
          {pesos(Number(p.precio))} <span className="text-base font-normal text-cafe">/ {p.unidad}</span>
        </p>

        <p>
          {cantidadConUnidad(cantidad, p.unidad)} {cantidad === 1 ? "disponible" : "disponibles"}
        </p>
        <p>📍 {p.municipio}</p>
        <p className="text-sm text-cafe/60">{haceCuanto(p.created_at, ahora)}</p>

        {/* Contacto: se arma en el navegador, con la sesión de quien mira (criterios 3 a 6).
            productor_id es público (la regla del catálogo deja verlo); nombre y teléfono no. */}
        <ContactoProductor productorId={p.productor_id} productoId={p.id} producto={p.producto} />
      </div>
    </article>
  );
}

function NoDisponible() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <p className="text-lg">Este producto ya no está disponible.</p>
      <Link href="/" className="rounded-lg bg-cafe px-6 py-3 font-semibold text-white">
        Ver el catálogo
      </Link>
    </div>
  );
}
