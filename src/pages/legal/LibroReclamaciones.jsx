// src/pages/legal/LibroReclamaciones.jsx
import { useState } from "react";
import { apiPOST } from "../../services/api";
import { AUTORIDAD, PLAZOS, TITULAR, pendiente } from "../../config/legal";

const INICIAL = {
  // Identificación del consumidor
  nombre: "",
  tipo_documento: "DNI",
  numero_documento: "",
  email: "",
  telefono: "",
  domicilio: "",
  es_menor: false,
  apoderado: "",
  // Identificación del bien contratado
  tipo_bien: "SERVICIO",
  descripcion_bien: "",
  monto_reclamado: "",
  // Detalle
  tipo: "RECLAMO",
  detalle: "",
  pedido: "",
  acepta_privacidad: false,
};

const inputCls =
  "w-full h-11 rounded-xl border border-neutral-200 px-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelCls = "block text-sm font-medium text-neutral-900 mb-1.5";

function Campo({ id, label, children }) {
  return (
    <div>
      <label className={labelCls} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

const Dato = ({ etiqueta, valor }) =>
  valor ? (
    <p>
      <span className="text-neutral-500">{etiqueta}:</span> {valor}
    </p>
  ) : null;

/**
 * Copia de la hoja para el consumidor, con el contenido mínimo que exige el
 * reglamento del Libro de Reclamaciones: identificación del proveedor y del
 * consumidor, del bien contratado, el detalle, el pedido y el número
 * correlativo. Se imprime tal cual desde el botón de arriba.
 */
function CopiaHoja({ hoja }) {
  const d = hoja.datos || {};
  return (
    <div className="mt-4 space-y-4 border-t border-neutral-200 pt-4 text-sm leading-relaxed">
      <section className="space-y-0.5">
        <p className="font-semibold text-primary">1. Proveedor</p>
        <Dato etiqueta="Razón social" valor={`${TITULAR.razonSocial} — RUC ${TITULAR.ruc}`} />
        <Dato etiqueta="Nombre comercial" valor={TITULAR.nombreComercial} />
        {!pendiente(TITULAR.domicilioFiscal) && (
          <Dato etiqueta="Domicilio" valor={TITULAR.domicilioFiscal} />
        )}
        <Dato etiqueta="Correo" valor={TITULAR.emailContacto} />
      </section>

      <section className="space-y-0.5">
        <p className="font-semibold text-primary">2. Consumidor reclamante</p>
        <Dato etiqueta="Nombre" valor={d.nombre} />
        <Dato
          etiqueta="Documento"
          valor={d.numero_documento && `${d.tipo_documento} ${d.numero_documento}`}
        />
        <Dato etiqueta="Correo" valor={d.email} />
        <Dato etiqueta="Teléfono" valor={d.telefono} />
        <Dato etiqueta="Domicilio" valor={d.domicilio} />
        {d.es_menor && <Dato etiqueta="Padre, madre o apoderado" valor={d.apoderado} />}
      </section>

      <section className="space-y-0.5">
        <p className="font-semibold text-primary">3. Bien contratado</p>
        <Dato
          etiqueta="Tipo"
          valor={d.tipo_bien === "PRODUCTO" ? "Producto" : "Servicio"}
        />
        <Dato etiqueta="Descripción" valor={d.descripcion_bien} />
        <Dato
          etiqueta="Monto reclamado"
          valor={d.monto_reclamado ? `S/ ${d.monto_reclamado}` : null}
        />
      </section>

      <section className="space-y-1">
        <p className="font-semibold text-primary">
          4. Detalle de la {d.tipo === "QUEJA" ? "queja" : "reclamación"}
        </p>
        <p className="whitespace-pre-wrap">{d.detalle}</p>
        <p className="mt-2 font-semibold text-primary">5. Pedido del consumidor</p>
        <p className="whitespace-pre-wrap">{d.pedido}</p>
      </section>
    </div>
  );
}

/**
 * Libro de Reclamaciones virtual.
 *
 * Reproduce el contenido mínimo exigido por la normativa de protección al
 * consumidor: identificación del proveedor y del consumidor, identificación
 * del bien contratado, distinción entre reclamo y queja, pedido del
 * consumidor, número correlativo de hoja y aviso sobre las vías de solución
 * de controversias.
 */
export default function LibroReclamaciones() {
  const [form, setForm] = useState(INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [hoja, setHoja] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.numero_documento.trim() || !form.email.trim()) {
      setError("Completa tu nombre, tu documento de identidad y tu correo.");
      return;
    }
    if (!form.detalle.trim() || !form.pedido.trim()) {
      setError("Describe el detalle de tu reclamo o queja y tu pedido concreto.");
      return;
    }
    if (form.es_menor && !form.apoderado.trim()) {
      setError("Si el consumidor es menor de edad, indica los datos del padre, madre o apoderado.");
      return;
    }
    if (!form.acepta_privacidad) {
      setError("Debes aceptar el tratamiento de tus datos para poder atender el reclamo.");
      return;
    }

    setEnviando(true);
    try {
      const res = await apiPOST("/api/legal/reclamaciones", {
        ...form,
        monto_reclamado: form.monto_reclamado
          ? Number(form.monto_reclamado)
          : null,
      });
      if (res?.ok) {
        // Se guarda una copia de lo enviado ANTES de limpiar el formulario:
        // el reglamento obliga a entregar copia de la hoja al consumidor, y
        // hasta ahora eso dependía por completo de un correo que se manda sin
        // comprobar si sale. Con esto la copia existe siempre en pantalla.
        setHoja({ ...res, datos: { ...form } });
        setForm(INICIAL);
      } else {
        setError(res?.msg || "No pudimos registrar tu hoja. Intenta nuevamente.");
      }
    } catch {
      setError(
        "Error de conexión. También puedes escribirnos a " + TITULAR.emailContacto
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border-2 border-primary bg-white p-6 sm:p-10">
          <div className="flex items-start gap-4 border-b border-neutral-200 pb-6">
            <span className="text-4xl" aria-hidden="true">
              📕
            </span>
            <div>
              <h1 className="font-fraunces text-3xl font-semibold text-primary">
                Libro de Reclamaciones
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Hoja de Reclamación virtual · Conforme al Código de Protección y
                Defensa del Consumidor
              </p>
            </div>
          </div>

          {/* Identificación del proveedor */}
          <section className="mt-6 rounded-xl bg-secondary-light p-4 text-sm leading-relaxed text-neutral-700">
            <p className="font-semibold text-primary">
              Identificación del proveedor
            </p>
            <p className="mt-1">
              {TITULAR.razonSocial} — RUC {TITULAR.ruc}
            </p>
            <p>Nombre comercial: {TITULAR.nombreComercial}</p>
            {!pendiente(TITULAR.domicilioFiscal) && (
              <p>Domicilio: {TITULAR.domicilioFiscal}</p>
            )}
            <p>
              Correo: {TITULAR.emailContacto}
              {!pendiente(TITULAR.telefono) && <> · Teléfono: {TITULAR.telefono}</>}
            </p>
            <p>Sitio web: {TITULAR.web}</p>
          </section>

          {hoja ? (
            <>
              {/* Al imprimir solo debe salir la hoja, no la web entera. */}
              <style>{`
                @media print {
                  body * { visibility: hidden !important; }
                  #hoja-imprimible, #hoja-imprimible * { visibility: visible !important; }
                  #hoja-imprimible {
                    position: absolute; left: 0; top: 0; width: 100%;
                    padding: 16px; background: #fff; border: 0;
                  }
                  .no-imprimir { display: none !important; }
                }
              `}</style>

              <div
                id="hoja-imprimible"
                className="mt-6 rounded-2xl border-2 border-primary bg-white p-6"
              >
                <h2 className="font-fraunces text-xl font-semibold text-primary">
                  Hoja de reclamación registrada
                </h2>
                <p className="mt-2 text-sm">
                  Número de hoja:{" "}
                  <strong className="text-primary">{hoja.numero}</strong> · Fecha:{" "}
                  {new Date(hoja.fecha || Date.now()).toLocaleString("es-PE", {
                    timeZone: "America/Lima",
                  })}
                </p>

                <CopiaHoja hoja={hoja} />

                <p className="mt-4 text-sm">
                  Te responderemos en un plazo máximo de{" "}
                  <strong>{PLAZOS.reclamoConsumidor}</strong>, prorrogable por
                  única vez cuando la naturaleza del reclamo lo justifique, lo
                  que te comunicaríamos.
                </p>
                <p className="mt-2 text-xs text-neutral-600">
                  Guarda esta hoja: es tu constancia. También te enviamos una
                  copia al correo que indicaste; si no te llega en unos minutos,
                  revisa la carpeta de no deseados o escríbenos a{" "}
                  {TITULAR.emailContacto} citando el número de hoja.
                </p>

                <div className="no-imprimir mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Descargar / imprimir mi hoja
                  </button>
                  <button
                    type="button"
                    onClick={() => setHoja(null)}
                    className="h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-secondary"
                  >
                    Registrar otra hoja
                  </button>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-8">
              {/* 1. Consumidor */}
              <section className="space-y-4">
                <h2 className="font-fraunces text-lg font-semibold text-primary">
                  1. Identificación del consumidor reclamante
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Campo id="lr-nombre" label="Nombres y apellidos *">
                      <input
                        id="lr-nombre"
                        className={inputCls}
                        value={form.nombre}
                        onChange={(e) => set("nombre", e.target.value)}
                      />
                    </Campo>
                  </div>
                  <Campo id="lr-tipodoc" label="Tipo de documento *">
                    <select
                      id="lr-tipodoc"
                      className={inputCls}
                      value={form.tipo_documento}
                      onChange={(e) => set("tipo_documento", e.target.value)}
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </Campo>
                  <Campo id="lr-numdoc" label="Número de documento *">
                    <input
                      id="lr-numdoc"
                      className={inputCls}
                      value={form.numero_documento}
                      onChange={(e) => set("numero_documento", e.target.value)}
                    />
                  </Campo>
                  <Campo id="lr-email" label="Correo electrónico *">
                    <input
                      id="lr-email"
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Campo>
                  <Campo id="lr-tel" label="Teléfono">
                    <input
                      id="lr-tel"
                      type="tel"
                      className={inputCls}
                      value={form.telefono}
                      onChange={(e) => set("telefono", e.target.value)}
                    />
                  </Campo>
                  <div className="sm:col-span-2">
                    <Campo id="lr-dom" label="Domicilio">
                      <input
                        id="lr-dom"
                        className={inputCls}
                        value={form.domicilio}
                        onChange={(e) => set("domicilio", e.target.value)}
                      />
                    </Campo>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#1a5c3a]"
                        checked={form.es_menor}
                        onChange={(e) => set("es_menor", e.target.checked)}
                      />
                      El consumidor es menor de edad
                    </label>
                    {form.es_menor && (
                      <div className="mt-3">
                        <Campo
                          id="lr-apod"
                          label="Nombres, documento y contacto del padre, madre o apoderado *"
                        >
                          <input
                            id="lr-apod"
                            className={inputCls}
                            value={form.apoderado}
                            onChange={(e) => set("apoderado", e.target.value)}
                          />
                        </Campo>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. Bien contratado */}
              <section className="space-y-4">
                <h2 className="font-fraunces text-lg font-semibold text-primary">
                  2. Identificación del bien contratado
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id="lr-tipobien" label="Tipo">
                    <select
                      id="lr-tipobien"
                      className={inputCls}
                      value={form.tipo_bien}
                      onChange={(e) => set("tipo_bien", e.target.value)}
                    >
                      <option value="SERVICIO">Servicio</option>
                      <option value="PRODUCTO">Producto</option>
                    </select>
                  </Campo>
                  <Campo id="lr-monto" label="Monto reclamado (S/), si aplica">
                    <input
                      id="lr-monto"
                      type="number"
                      step="0.01"
                      min="0"
                      className={inputCls}
                      value={form.monto_reclamado}
                      onChange={(e) => set("monto_reclamado", e.target.value)}
                    />
                  </Campo>
                  <div className="sm:col-span-2">
                    <Campo
                      id="lr-desc"
                      label="Descripción del servicio o producto contratado"
                    >
                      <input
                        id="lr-desc"
                        className={inputCls}
                        placeholder="Ej.: Paquete Full Económico Lista 1, contratado el 12/03/2026"
                        value={form.descripcion_bien}
                        onChange={(e) => set("descripcion_bien", e.target.value)}
                      />
                    </Campo>
                  </div>
                </div>
              </section>

              {/* 3. Detalle */}
              <section className="space-y-4">
                <h2 className="font-fraunces text-lg font-semibold text-primary">
                  3. Detalle de la reclamación y pedido del consumidor
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "RECLAMO",
                      titulo: "Reclamo",
                      ayuda:
                        "Disconformidad relacionada con el servicio o producto contratado.",
                    },
                    {
                      id: "QUEJA",
                      titulo: "Queja",
                      ayuda:
                        "Malestar o descontento respecto a la atención recibida, no vinculado al servicio en sí.",
                    },
                  ].map((op) => (
                    <label
                      key={op.id}
                      className={
                        "cursor-pointer rounded-xl border p-3.5 transition " +
                        (form.tipo === op.id
                          ? "border-primary bg-secondary-light"
                          : "border-neutral-200 hover:border-primary/40")
                      }
                    >
                      <span className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="tipo"
                          className="mt-1 accent-[#1a5c3a]"
                          checked={form.tipo === op.id}
                          onChange={() => set("tipo", op.id)}
                        />
                        <span>
                          <span className="block text-sm font-semibold text-neutral-900">
                            {op.titulo}
                          </span>
                          <span className="block text-xs leading-relaxed text-neutral-600">
                            {op.ayuda}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <Campo id="lr-detalle" label="Detalle *">
                  <textarea
                    id="lr-detalle"
                    rows={5}
                    className="w-full rounded-xl border border-neutral-200 p-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={form.detalle}
                    onChange={(e) => set("detalle", e.target.value)}
                  />
                </Campo>

                <Campo id="lr-pedido" label="Pedido concreto *">
                  <textarea
                    id="lr-pedido"
                    rows={3}
                    className="w-full rounded-xl border border-neutral-200 p-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={form.pedido}
                    onChange={(e) => set("pedido", e.target.value)}
                  />
                </Campo>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#1a5c3a]"
                    checked={form.acepta_privacidad}
                    onChange={(e) => set("acepta_privacidad", e.target.checked)}
                  />
                  <span>
                    Acepto que {TITULAR.razonSocial} trate los datos de esta hoja
                    con la única finalidad de atender y responder mi reclamo o
                    queja y de acreditarlo ante la autoridad, conforme al{" "}
                    <a
                      className="font-medium text-primary underline underline-offset-2"
                      href="/legal/privacidad"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Aviso de Privacidad
                    </a>
                    . *
                  </span>
                </label>
              </section>

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {enviando ? "Registrando…" : "Registrar hoja de reclamación"}
              </button>
            </form>
          )}

          {/* Avisos legales obligatorios */}
          <section className="mt-8 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
            <p>
              <strong>Plazo de respuesta:</strong> el proveedor debe dar
              respuesta al reclamo en un plazo no mayor a{" "}
              {PLAZOS.reclamoConsumidor}, prorrogable por única vez cuando la
              naturaleza del reclamo lo justifique, comunicando al consumidor la
              ampliación y sus motivos.
            </p>
            <p>
              <strong>Importante:</strong> la formulación del reclamo no impide
              acudir a otras vías de solución de controversias ni constituye
              requisito previo para interponer una denuncia ante {" "}
              {AUTORIDAD.consumidor}.
            </p>
            <p>
              El proveedor debe conservar las hojas de reclamación por un periodo
              mínimo de dos (2) años desde su presentación.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
