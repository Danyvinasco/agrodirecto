"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MUNICIPIOS_RISARALDA } from "@/lib/municipios";
import { limpiarTelefono, validarTelefono } from "@/lib/validaciones";

// Nombres de los campos que pueden tener un error.
type Campo = "nombre" | "telefono" | "municipio" | "correo" | "contrasena" | "ley";
type Errores = Partial<Record<Campo, string>>;

const estiloCampo =
  "w-full rounded-lg border bg-white px-3 py-3 text-base text-cafe outline-none focus:border-verde";

// Pequeño componente para el texto rojo debajo de cada campo.
function MensajeError({ texto }: { texto?: string }) {
  if (!texto) return null;
  return <p className="mt-1 text-sm text-rojo">{texto}</p>;
}

export default function FormularioRegistro() {
  const router = useRouter();

  // Cada campo guarda lo que la persona escribió. Como vive en el "estado",
  // no se borra aunque haya errores.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [tambienVender, setTambienVender] = useState(false);
  const [aceptaLey, setAceptaLey] = useState(false);

  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Revisa todo antes de enviar. Devuelve los errores encontrados (vacío = todo bien).
  function validar(): Errores {
    const e: Errores = {};
    if (nombre.trim().length < 2) e.nombre = "Escribe tu nombre.";
    const errorTel = validarTelefono(telefono);
    if (errorTel) e.telefono = errorTel;
    if (!municipio) e.municipio = "Escoge tu municipio.";
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) e.correo = "Escribe un correo válido.";
    if (contrasena.length < 8) e.contrasena = "La contraseña debe tener mínimo 8 caracteres.";
    if (!aceptaLey) e.ley = "Debes aceptar el tratamiento de datos para crear la cuenta.";
    return e;
  }

  async function crearCuenta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); // evita que el navegador recargue la página
    setErrorGeneral("");

    const encontrados = validar();
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return; // hay errores: no se envía nada

    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: {
        // Estos datos llegan a raw_user_meta_data y el trigger de la migración 07
        // los copia a la tabla usuarios.
        data: {
          nombre: nombre.trim(),
          telefono,
          municipio,
          es_productor: tambienVender,
        },
      },
    });
    setEnviando(false);

    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists") {
        setErrores({ correo: "Ese correo ya tiene una cuenta. Inicia sesión." });
      } else if (error.code === "weak_password") {
        setErrores({ contrasena: "Esa contraseña es muy débil. Prueba con otra más larga." });
      } else if (error.message.includes("Database error")) {
        setErrorGeneral("No pudimos guardar tus datos. Revisa el formulario e inténtalo de nuevo.");
      } else {
        setErrorGeneral("No pudimos crear la cuenta. Revisa tu conexión e inténtalo de nuevo.");
      }
      return;
    }

    // Con "Confirm email" apagado, Supabase devuelve la sesión de una vez.
    if (!data.session) {
      setErrorGeneral("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
      return;
    }

    // Paso 5: aquí se decidirá la pantalla según el rol. Por ahora, al catálogo.
    router.push("/");
  }

  // Borde rojo si el campo tiene error; si no, borde café suave.
  const borde = (campo: Campo) => (errores[campo] ? "border-rojo" : "border-cafe/30");

  return (
    <form onSubmit={crearCuenta} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="nombre" className="mb-1 block font-semibold">Nombre</label>
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`${estiloCampo} ${borde("nombre")}`}
        />
        <MensajeError texto={errores.nombre} />
      </div>

      <div>
        <label htmlFor="telefono" className="mb-1 block font-semibold">Celular</label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-cafe/30 bg-crema px-3 text-base">
            +57
          </span>
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="3001234567"
            value={telefono}
            onChange={(e) => setTelefono(limpiarTelefono(e.target.value))}
            className={`${estiloCampo} rounded-l-none ${borde("telefono")}`}
          />
        </div>
        <p className="mt-1 text-sm text-cafe/70">Así te escribirán compradores y vendedores.</p>
        <MensajeError texto={errores.telefono} />
      </div>

      <div>
        <label htmlFor="municipio" className="mb-1 block font-semibold">Municipio</label>
        <select
          id="municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          className={`${estiloCampo} ${borde("municipio")}`}
        >
          <option value="">Escoge tu municipio</option>
          {MUNICIPIOS_RISARALDA.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <MensajeError texto={errores.municipio} />
      </div>

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
        {errores.correo?.startsWith("Ese correo") && (
          <Link href="/login" className="mt-1 inline-block text-sm font-semibold text-verde underline">
            Ir a iniciar sesión
          </Link>
        )}
      </div>

      <div>
        <label htmlFor="contrasena" className="mb-1 block font-semibold">Contraseña</label>
        <div className="relative">
          <input
            id="contrasena"
            type={verContrasena ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
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

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-semibold">¿Qué quieres hacer en AgroDirecto?</legend>
        <label className="flex items-center gap-3 rounded-lg border border-cafe/30 bg-white p-3 opacity-80">
          <input type="checkbox" checked disabled className="h-5 w-5 accent-verde" />
          <span>Comprar <span className="text-sm text-cafe/70">· todos pueden comprar</span></span>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-cafe/30 bg-white p-3">
          <input
            type="checkbox"
            checked={tambienVender}
            onChange={(e) => setTambienVender(e.target.checked)}
            className="h-5 w-5 accent-verde"
          />
          <span>También vender mis productos</span>
        </label>
      </fieldset>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={aceptaLey}
            onChange={(e) => setAceptaLey(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-verde"
          />
          <span className="text-sm">
            Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012.
          </span>
        </label>
        <MensajeError texto={errores.ley} />
      </div>

      {errorGeneral && (
        <p className="rounded-lg border border-rojo bg-white p-3 text-sm text-rojo">{errorGeneral}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-verde py-3 text-lg font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-verde underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
