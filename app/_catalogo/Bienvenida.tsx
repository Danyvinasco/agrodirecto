import Image from "next/image";
import Link from "next/link";
import BotonSesion from "../_componentes/BotonSesion";
import BotonPublicar from "../_componentes/BotonPublicar";
import AccesoPedidosRecibidos from "../_componentes/AccesoPedidosRecibidos";
import AccesoMisPedidos from "../_componentes/AccesoMisPedidos";

// Encabezado de bienvenida del catálogo. Server Component: el logo y la frase son iguales
// para todos. Solo los accesos (que dependen de la sesión) corren en el navegador.
//
// Celular: todo centrado y apilado (logo, frase, aviso de prototipo, fila de accesos), sin pasar de ~300 px de
// alto para que se alcance a ver la primera tarjeta.
// Computador (md): logo y frase a la izquierda, accesos a la derecha.
export default function Bienvenida() {
  return (
    <header className="mb-5 flex flex-col items-center gap-3 md:flex-row md:justify-between">
      <div className="flex flex-col items-center gap-1 text-center md:flex-row md:gap-4 md:text-left">
        {/* El h1 ES el logo: su texto alternativo es el nombre y el lema (opción A de Dany:
            no se repite el texto, porque la imagen ya lo trae). Así el lector de pantalla
            anuncia "AgroDirecto — Del productor a tu mesa" como título de la página.
            -my-2: la imagen trae margen blanco arriba y abajo; esto lo recorta un poco. */}
        <h1 className="-my-2">
          <Image
            src="/logo.png"
            alt="AgroDirecto — Del productor a tu mesa"
            width={140}
            height={140}
            priority // es lo primero que se ve
            className="h-[140px] w-[140px] md:h-24 md:w-24"
          />
        </h1>
        {/* La frase y el aviso van juntos en una columna: en computador quedan los dos a la
            derecha del logo, uno debajo del otro. */}
        <div className="flex flex-col gap-0.5">
          <p className="max-w-xs text-base text-cafe">
            Compra directo a los productores de Risaralda, sin intermediarios.
          </p>
          {/* Aviso arriba, no solo en el pie: hay que saber que es un prototipo académico y
              cómo se tratan los datos ANTES de publicar o pedir. Letra pequeña y café claro
              para que no compita con el logo; una sola línea (~16 px) para no tapar la
              primera tarjeta en el celular. */}
          <Link
            href="/sobre-nosotros"
            className="text-xs text-cafe/70 underline underline-offset-2"
          >
            Prototipo académico · Conoce más
          </Link>
        </div>
      </div>

      {/* Fila de accesos. min-h-14 reserva el alto desde el principio: los accesos aparecen
          después de revisar la sesión, y sin esto las tarjetas "brincarían" hacia abajo.
          "Publicar producto" sigue fijo abajo en celular; en computador entra en esta fila. */}
      <nav aria-label="Accesos" className="flex min-h-14 w-full items-stretch gap-2 md:w-auto md:items-center">
        <AccesoMisPedidos />
        <AccesoPedidosRecibidos />
        <BotonPublicar />
        <BotonSesion forma="pestaña" />
      </nav>
    </header>
  );
}
