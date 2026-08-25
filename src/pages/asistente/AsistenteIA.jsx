// src/pages/asistente/AsistenteIA.jsx
// Chat de InspiraGPT. El acceso se desbloquea con el código que llega por
// correo tras la compra; queda guardado en el navegador hasta que caduque.
import { useEffect, useRef, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import Icono from "../../components/common/Icono";
import ComprarProducto from "../../components/common/ComprarProducto";
import { navigate } from "../../services/navigate";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const CLAVE = "inspira_asistente_codigo";

const SUGERENCIAS = [
  "¿Me conviene la visa de estudios o la estancia por estudios?",
  "¿Qué necesito para homologar mi título en España?",
  "¿Cuánto cuesta estudiar un máster en una pública?",
  "¿Cuántos años necesito para la nacionalidad española?",
];

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function AsistenteIA() {
  const [codigo, setCodigo] = useState(() => localStorage.getItem(CLAVE) || "");
  const [validado, setValidado] = useState(false);
  const [expira, setExpira] = useState(null);
  const [entrada, setEntrada] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState(null);
  const [comprobando, setComprobando] = useState(true);
  const finRef = useRef(null);

  // Validación silenciosa del código guardado.
  useEffect(() => {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) {
      setComprobando(false);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/asistente/verificar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: guardado }),
        });
        const d = await r.json();
        if (d.ok) {
          setValidado(true);
          setExpira(d.expira_en);
        } else {
          localStorage.removeItem(CLAVE);
          setCodigo("");
          if (d.motivo === "expirado") setError("Tu acceso caducó.");
        }
      } catch {
        /* sin conexión: se pedirá el código al enviar */
      } finally {
        setComprobando(false);
      }
    })();
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, pensando]);

  const activar = async (e) => {
    e.preventDefault();
    setError(null);
    const c = codigo.trim();
    if (!c) return setError("Pega el código que recibiste por correo.");
    try {
      const r = await fetch(`${API_URL}/api/asistente/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: c }),
      });
      const d = await r.json();
      if (!d.ok) return setError(d.msg || "Ese código no es válido.");
      localStorage.setItem(CLAVE, c);
      setValidado(true);
      setExpira(d.expira_en);
    } catch {
      setError("No pudimos verificar el código. Revisa tu conexión.");
    }
  };

  const enviar = async (texto) => {
    const consulta = (texto ?? entrada).trim();
    if (!consulta || pensando) return;

    const historial = mensajes.map((m) => ({ role: m.role, content: m.content }));
    setMensajes((prev) => [...prev, { role: "user", content: consulta }]);
    setEntrada("");
    setPensando(true);
    setError(null);

    try {
      const r = await fetch(`${API_URL}/api/asistente/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: localStorage.getItem(CLAVE),
          mensaje: consulta,
          historial,
        }),
      });
      const d = await r.json();

      if (!d.ok) {
        if (r.status === 401) {
          localStorage.removeItem(CLAVE);
          setValidado(false);
        }
        setError(d.msg || "No pudimos responder ahora.");
        return;
      }
      setMensajes((prev) => [...prev, { role: "assistant", content: d.respuesta }]);
    } catch {
      setError("No pudimos conectar con el asistente. Inténtalo de nuevo.");
    } finally {
      setPensando(false);
    }
  };

  const salir = () => {
    localStorage.removeItem(CLAVE);
    setValidado(false);
    setCodigo("");
    setMensajes([]);
  };

  const diasRestantes = expira
    ? Math.max(0, Math.ceil((new Date(expira) - Date.now()) / 86400000))
    : null;

  return (
    <div className="w-full">
      <PageHero
        etiqueta="InspiraGPT"
        icono="robot"
        titulo="Tu asistente de extranjería,"
        destacado="disponible a cualquier hora"
        descripcion="Pregunta lo que necesites sobre trámites, visados, homologaciones y estudios en España. Entrenado con las guías del equipo legal de Inspira."
        accesos={[
          { icono: "brujula", label: "¿Cuál es mi trámite?", href: "/asistente" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
          { icono: "balanza", label: "Todos los servicios", href: "/servicios" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        {!validado ? (
          /* ── Puerta de acceso ─────────────────────────────── */
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
            <div className="bg-primary px-6 py-5 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Icono nombre="robot" size={22} />
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">
                Activa tu acceso
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Pega el código que te enviamos por correo al confirmarse tu
                compra. Queda guardado en este navegador.
              </p>
            </div>

            <form onSubmit={activar} className="px-6 py-6">
              {comprobando ? (
                <p className="text-sm text-neutral-500">Comprobando acceso…</p>
              ) : (
                <>
                  <label className="block">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">
                      Código de acceso
                    </span>
                    <textarea
                      rows={3}
                      value={codigo}
                      onChange={(ev) => setCodigo(ev.target.value)}
                      placeholder="Pega aquí el código de tu correo"
                      className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-secondary-light px-4 py-3 font-mono text-xs outline-none focus:border-sky-dark"
                    />
                  </label>
                  {error && (
                    <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="mt-4 w-full rounded-xl bg-primary px-5 py-3.5 font-extrabold text-white transition hover:bg-primary-light"
                  >
                    Entrar al asistente
                  </button>
                </>
              )}

              <div className="mt-6 border-t border-neutral-200 pt-5">
                <p className="text-sm font-bold text-neutral-900">
                  ¿Todavía no tienes acceso?
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
                  Un mes completo de consultas ilimitadas al asistente, por
                  S/ 100. Recibes el código al instante en tu correo.
                </p>
                <ComprarProducto
                  idProducto="asistente-ia"
                  nombre="InspiraGPT · 30 días de acceso"
                  precio={100}
                  precioRef="25 €"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-extrabold text-white transition hover:bg-accent-dark"
                >
                  Obtener acceso · S/ 100
                </ComprarProducto>
                <p className="mt-3 text-center text-[11px] text-neutral-500">
                  ¿Prefieres hablar con un abogado?{" "}
                  <a
                    href="/servicios"
                    onClick={(e) => go(e, "/servicios")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Mira las asesorías
                  </a>
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* ── Chat ─────────────────────────────────────────── */
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-secondary-light px-5 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Icono nombre="robot" size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-neutral-900">InspiraGPT</p>
                <p className="flex items-center gap-1.5 text-[11px] text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Activo
                  {diasRestantes !== null && ` · ${diasRestantes} días restantes`}
                </p>
              </div>
              <button
                type="button"
                onClick={salir}
                className="text-[11px] font-semibold text-neutral-500 hover:text-primary"
              >
                Salir
              </button>
            </div>

            <div className="max-h-[52vh] min-h-[280px] overflow-y-auto px-5 py-5">
              {mensajes.length === 0 && (
                <div className="text-center">
                  <p className="text-sm text-neutral-600">
                    Pregúntame lo que necesites sobre tu proceso en España.
                  </p>
                  <div className="mt-4 grid gap-2">
                    {SUGERENCIAS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => enviar(s)}
                        className="rounded-xl border border-neutral-200 px-4 py-2.5 text-left text-[13px] text-neutral-700 transition hover:border-accent hover:bg-accent/5"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mensajes.map((m, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-secondary-light text-neutral-800"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {pensando && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-sm bg-secondary-light px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-dark"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={finRef} />
            </div>

            {error && (
              <p className="mx-5 mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
              className="flex items-end gap-2 border-t border-neutral-200 px-4 py-3"
            >
              <textarea
                rows={1}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
                placeholder="Escribe tu consulta…"
                className="max-h-32 flex-1 resize-none rounded-xl border border-neutral-200 bg-secondary-light px-4 py-3 text-sm outline-none focus:border-sky-dark"
              />
              <button
                type="submit"
                disabled={pensando || !entrada.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-dark disabled:opacity-40"
                aria-label="Enviar"
              >
                <Icono nombre="avion" size={19} />
              </button>
            </form>

            <p className="border-t border-neutral-100 px-5 py-3 text-[11px] leading-relaxed text-neutral-500">
              InspiraGPT orienta, no sustituye el diagnóstico de un abogado.
              Puede equivocarse: confirma lo importante en una asesoría.
            </p>
          </div>
        )}
      </section>

      <SigueExplorando destinos={["servicios", "casos", "calculadora", "eventos"]} />
    </div>
  );
}
