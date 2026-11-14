"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { rutaSegunRol } from "@/lib/roles";
import { direccionInterna } from "@/lib/navegacion";

type Campo = "correo" | "contrasena";
type Errores = Partial<Record<Campo, string>>;

const estiloCampo =
  "w-full rounded-lg border bg-white px-3 py-3 text-base text-cafe outline-none focus:border-verde";

function MensajeError({ texto }: { texto?: string }) {
  if (!texto) return null;
  return <p className="mt-1 text-sm text-rojo">{texto}</p>;
}

// ¿A dónde ir después de entrar?
// 1) Si llegó con ?volver= (ej. desde el detalle de un producto) y es una dirección interna, allá.
// 2) Si no, según su rol (HU-02).
// Leemos window.location aquí, solo al momento de redirigir, en vez de useSearchParams:
// así el formulario no necesita <Suspense> y se ve de una vez, aun con internet lento.
async function destinoTrasEntrar(idUsuario: string): Promise<string> {
  const volver = direccionInterna(new URLSearchParams(window.location.search).get("volver"));
  return volver ?? (await rutaDelUsuario(idUsuario));
}

// Busca en la ficha del usuario si también vende y devuelve a qué pantalla debe ir.
// Si por alguna razón no encuentra la ficha, lo manda al catálogo (todos pueden comprar).
async function rutaDelUsuario(idUsuario: string): Promise<string> {
  const { data } = await supabase
    .from("usuarios")
    .select("es_productor")
    .eq("id", idUsuario)
    .maybeSingle();
  return rutaSegunRol(data?.es_productor ?? false);
}

export default function FormularioLogin() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [entrando, setEntrando] = useState(false);

  // Criterio 6: si ya hay sesión abierta, no pedimos los datos otra vez.
  // useEffect corre una vez cuando la pantalla aparece en el celular.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        router.replace(await destinoTrasEntrar(data.session.user.id));
      }
    });
  }, [router]);

  function validar(): Errores {
    const e: Errores = {};
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) e.correo = "Escribe un correo válido.";
    if (contrasena.length === 0) e.contrasena = "Escribe tu contraseña.";
    return e;
  }

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral("");

    const encontrados = validar();
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEntrando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });

    if (error) {
      setEntrando(false);
      // No decimos cuál de los dos falló, para no revelar quién tiene cuenta.
      if (error.code === "invalid_credentials") {
        setErrorGeneral("Correo o contraseña incorrectos.");
      } else {
        setErrorGeneral("No pudimos iniciar sesión. Revisa tu conexión e inténtalo de nuevo.");
      }
      return;
    }

    const ruta = await destinoTrasEntrar(data.user.id);
    // Next 16 guarda esta pantalla escondida al salir. Dejamos el formulario limpio
    // para que al volver no quede trabado en "Entrando..." ni guarde la contraseña.
    setContrasena("");
    setVerContrasena(false);
    setEntrando(false);
    // replace (no push): cambia /login por la pantalla de destino en el historial,
    // así el botón "atrás" no vuelve al login y no rebota hacia adelante.
    router.replace(ruta);
  }

  const borde = (campo: Campo) => (errores[campo] ? "border-rojo" : "border-cafe/30");

  return (
    <form onSubmit={entrar} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="correo" className="mb-1 block font-semibold">Correo</label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className={`${estiloCampo} ${borde("correo")}`}
        />
        <MensajeError texto={errores.correo} />
      </div>

      <div>
        <label htmlFor="contrasena" className="mb-1 block font-semibold">Contraseña</label>
        <div className="relative">
          <input
            id="contrasena"
            type={verContrasena ? "text" : "password"}
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={`${estiloCampo} pr-20 ${borde("contrasena")}`}
          />
          <button
            type="button"
            onClick={() => setVerContrasena(!verContrasena)}
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-verde"
          >
            {verContrasena ? "Ocultar" : "👁 Ver"}
          </button>
        </div>
        <MensajeError texto={errores.contrasena} />
      </div>

      {errorGeneral && (
        <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{errorGeneral}</p>
      )}

      <button
        type="submit"
        disabled={entrando}
        className="rounded-lg bg-verde py-3 text-lg font-semibold text-white disabled:opacity-60"
      >
        {entrando ? "Entrando..." : "Entrar"}
      </button>

      <Link
        href="/registro"
        className="rounded-lg bg-cafe py-3 text-center text-lg font-semibold text-white"
      >
        Crear cuenta
      </Link>

      <Link href="/" className="text-center text-sm font-semibold text-verde underline">
        o ver el catálogo sin cuenta
      </Link>
    </form>
  );
}
