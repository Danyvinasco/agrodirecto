"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Aviso verde que aparece en el catálogo justo después de publicar.
// No se guarda en el estado: sale de la dirección (/?publicado=1), como el tiquete
// de la báscula. Si la dirección ya no lo trae, el aviso no está.
// Así, con cacheComponents, no se queda pegado al volver al catálogo más tarde.
//
// useSearchParams lee la dirección en el navegador: debe ir dentro de un <Suspense>
// (lo pone app/page.tsx), o "npm run build" falla.
export default function AvisoPublicado() {
  const parametros = useSearchParams();
  const router = useRouter();

  if (parametros.get("publicado") !== "1") return null;

  // Solo el mensaje y la ✕: para publicar otro está el botón "Publicar producto"
  // (fijo abajo en el celular, arriba en computador).
  return (
    <div
      role="status"
      className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-verde bg-verde/10 p-4 text-verde"
    >
      <p className="font-semibold">✅ Tu producto quedó publicado</p>
      {/* La ✕ quita el "tiquete" de la dirección; scroll: false para no saltar arriba. */}
      <button
        type="button"
        onClick={() => router.replace("/", { scroll: false })}
        aria-label="Cerrar aviso"
        className="text-xl leading-none"
      >
        ✕
      </button>
    </div>
  );
}
