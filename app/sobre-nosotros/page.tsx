import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre AgroDirecto",
};

// Pantalla de solo texto: igual para todos, sin sesión ni base de datos.
// Por eso es un Server Component puro: Next la prepara una vez y la sirve lista.
export default function PaginaSobreNosotros() {
  return (
    <main className="flex flex-1 justify-center px-4 py-6 md:items-center md:py-10">
      <div className="flex w-full max-w-prose flex-col gap-6 md:rounded-2xl md:bg-white md:p-8 md:shadow-md">
        <Link href="/" aria-label="Volver al catálogo" className="text-2xl font-bold text-cafe">
          ←
        </Link>

        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="AgroDirecto — Del productor a tu mesa" width={110} height={110} />
          <h1 className="text-center text-2xl font-bold text-cafe">Sobre AgroDirecto</h1>
        </div>

        <div className="flex flex-col gap-4 leading-relaxed">
          <p>
            AgroDirecto es un prototipo académico de marketplace agrícola para circuitos cortos de
            comercialización en Risaralda.
          </p>
          <p>
            Lo desarrolló Daniel Alberto Vinasco Isaza para el curso Proyecto de Grado del programa de
            Ingeniería de Sistemas de la Universidad Nacional Abierta y a Distancia (UNAD), en 2026.
          </p>
          <p>
            La plataforma conecta directamente a productores y compradores, sin intermediarios. Los
            precios de referencia provienen de los boletines públicos del SIPSA-DANE.
          </p>
          <p>
            Al ser un prototipo en evaluación, no procesa pagos ni gestiona transporte. Los acuerdos
            se hacen directamente entre las partes.
          </p>
          <p>
            Tus datos se tratan conforme a la Ley 1581 de 2012 y se usan únicamente para el
            funcionamiento de la plataforma y la evaluación académica del prototipo. Solo los
            usuarios registrados pueden ver el número de contacto de otro usuario.
          </p>
        </div>

        <p className="border-t border-cafe/20 pt-4 text-center text-sm text-cafe/70">
          Quinchía, Risaralda · 2026
        </p>
      </div>
    </main>
  );
}
