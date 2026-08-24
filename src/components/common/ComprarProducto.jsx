// src/components/common/ComprarProducto.jsx
// Botón + modal de compra directa por Mercado Pago. Pide correo (para
// entregar el acceso) y redirige al checkout. No requiere iniciar sesión.
import { useState } from "react";
import Icono from "./Icono";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ComprarProducto({
  idProducto,
  nombre,
  precio,
  precioRef,
  children = "Comprar ahora",
  className = "",
}) {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const comprar = async (e) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Escribe un correo válido: ahí te enviamos el acceso.");
      return;
    }

    setCargando(true);
    try {
      const r = await fetch(`${API_URL}/mercadopago/producto/preferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: idProducto,
          email: email.trim(),
          nombre: nombreCliente.trim(),
        }),
      });
      const data = await r.json();

      if (!r.ok || !data.ok || !data.preferencia?.init_point) {
        throw new Error(data.msg || "No pudimos iniciar el pago.");
      }
      window.location.href = data.preferencia.init_point;
    } catch (err) {
      setError(err.message || "No pudimos iniciar el pago. Inténtalo de nuevo.");
      setCargando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          className ||
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent-dark"
        }
      >
        {children}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => !cargando && setAbierto(false)}
          />
          <form
            onSubmit={comprar}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-primary px-6 py-5 text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky">
                Compra segura
              </p>
              <h2 className="mt-1.5 font-display text-lg font-bold leading-snug">
                {nombre}
              </h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-accent">
                  S/ {precio}
                </span>
                {precioRef && (
                  <span className="text-xs text-white/60">≈ {precioRef}</span>
                )}
              </p>
            </div>

            <div className="space-y-3 px-6 py-5">
              <label className="block">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">
                  Tu nombre (opcional)
                </span>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(ev) => setNombreCliente(ev.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-secondary-light px-4 py-3 text-sm outline-none focus:border-sky-dark"
                  placeholder="Cómo te llamamos"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">
                  Correo para recibir el acceso *
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-secondary-light px-4 py-3 text-sm outline-none focus:border-sky-dark"
                  placeholder="tucorreo@ejemplo.com"
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-extrabold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                {cargando ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
              </button>

              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-500">
                <Icono nombre="escudo" size={14} className="mt-0.5 shrink-0" />
                Te llevamos al checkout seguro de Mercado Pago. Recibirás el
                acceso en el correo indicado al confirmarse el pago.
              </p>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                disabled={cargando}
                className="w-full py-1 text-xs font-semibold text-neutral-500 hover:text-primary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
