// src/pages/legal/DerechosArco.jsx
import { useState } from "react";
import LegalLayout, { Seccion } from "./LegalLayout";
import { apiPOST } from "../../services/api";
import { PLAZOS, RUTAS_LEGALES, TITULAR, VERSIONES } from "../../config/legal";

const DERECHOS = [
  {
    id: "ACCESO",
    label: "Acceso",
    ayuda: "Saber qué datos míos tienen, de dónde salieron y para qué los usan.",
    plazo: PLAZOS.acceso,
  },
  {
    id: "RECTIFICACION",
    label: "Rectificación",
    ayuda: "Corregir datos míos que están equivocados, incompletos o desactualizados.",
    plazo: PLAZOS.rectificacionCancelacionOposicion,
  },
  {
    id: "CANCELACION",
    label: "Cancelación (supresión)",
    ayuda: "Que eliminen mis datos cuando ya no son necesarios o retiro mi consentimiento.",
    plazo: PLAZOS.rectificacionCancelacionOposicion,
  },
  {
    id: "OPOSICION",
    label: "Oposición",
    ayuda: "Que dejen de tratar mis datos para una finalidad concreta.",
    plazo: PLAZOS.rectificacionCancelacionOposicion,
  },
  {
    id: "REVOCACION",
    label: "Revocar mi consentimiento",
    ayuda: "Retirar el permiso que di, por ejemplo para recibir comunicaciones comerciales.",
    plazo: PLAZOS.rectificacionCancelacionOposicion,
  },
  {
    id: "PORTABILIDAD",
    label: "Portabilidad",
    ayuda: "Recibir mis datos en un formato estructurado y de uso común.",
    plazo: PLAZOS.acceso,
  },
  {
    id: "TRATAMIENTO_AUTOMATIZADO",
    label: "Decisiones automatizadas",
    ayuda: "No ser objeto de una decisión basada solo en tratamiento automatizado.",
    plazo: PLAZOS.rectificacionCancelacionOposicion,
  },
];

const INICIAL = {
  derecho: "ACCESO",
  nombre: "",
  tipo_documento: "DNI",
  numero_documento: "",
  email: "",
  telefono: "",
  domicilio: "",
  detalle: "",
  medio_respuesta: "EMAIL",
  declara_titular: false,
};

const inputCls =
  "w-full h-11 rounded-xl border border-neutral-200 px-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelCls = "block text-sm font-medium text-neutral-900 mb-1.5";

export default function DerechosArco() {
  const [form, setForm] = useState(INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const derechoSel = DERECHOS.find((d) => d.id === form.derecho);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.numero_documento.trim() || !form.email.trim()) {
      setError("Completa tu nombre, tu documento de identidad y tu correo.");
      return;
    }
    if (!form.declara_titular) {
      setError(
        "Debes declarar que eres el titular de los datos o su representante acreditado."
      );
      return;
    }

    setEnviando(true);
    try {
      const res = await apiPOST("/api/legal/derechos", {
        ...form,
        politica_version: VERSIONES.privacidad.version,
      });
      if (res?.ok) {
        setResultado(res);
        setForm(INICIAL);
      } else {
        setError(res?.msg || "No pudimos registrar tu solicitud. Intenta de nuevo.");
      }
    } catch {
      setError(
        "Error de conexión. Puedes escribirnos directamente a " +
          TITULAR.emailDatosPersonales
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LegalLayout
      titulo="Ejerce tus derechos sobre tus datos"
      version={VERSIONES.privacidad.version}
      fecha={VERSIONES.privacidad.fecha}
      resumen={
        "Este es el canal oficial y gratuito para ejercer tus derechos de acceso, rectificación, cancelación y oposición, así como para revocar tu consentimiento o pedir la portabilidad de tus datos. Recibirás un código de seguimiento y una respuesta dentro del plazo legal."
      }
    >
      {resultado ? (
        <div className="rounded-2xl border-2 border-primary bg-secondary-light p-6">
          <h2 className="font-fraunces text-xl font-semibold text-primary">
            Solicitud registrada
          </h2>
          <p className="mt-2 text-sm">
            Tu código de seguimiento es{" "}
            <strong className="text-primary">{resultado.codigo}</strong>. Te
            enviamos una copia a tu correo.
          </p>
          <p className="mt-2 text-sm">
            Responderemos en un plazo máximo de{" "}
            <strong>{resultado.plazo || derechoSel?.plazo}</strong> contados
            desde el día siguiente a hoy. Si necesitamos verificar tu identidad,
            te lo pediremos por ese mismo correo.
          </p>
          <button
            type="button"
            onClick={() => setResultado(null)}
            className="mt-4 h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-white"
          >
            Enviar otra solicitud
          </button>
        </div>
      ) : (
        <>
          <Seccion n="1" titulo="Qué derecho quieres ejercer">
            <div className="grid gap-2 sm:grid-cols-2">
              {DERECHOS.map((d) => (
                <label
                  key={d.id}
                  className={
                    "cursor-pointer rounded-xl border p-3 transition " +
                    (form.derecho === d.id
                      ? "border-primary bg-secondary-light"
                      : "border-neutral-200 hover:border-primary/40")
                  }
                >
                  <span className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="derecho"
                      className="mt-1 accent-[#1a5c3a]"
                      checked={form.derecho === d.id}
                      onChange={() => set("derecho", d.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-neutral-900">
                        {d.label}
                      </span>
                      <span className="block text-xs leading-relaxed text-neutral-600">
                        {d.ayuda}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              Plazo legal de respuesta para este derecho:{" "}
              <strong>{derechoSel?.plazo}</strong>.
            </p>
          </Seccion>

          <form onSubmit={onSubmit} className="space-y-5">
            <Seccion n="2" titulo="Tus datos para identificarte y responderte">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="arco-nombre">
                    Nombres y apellidos *
                  </label>
                  <input
                    id="arco-nombre"
                    className={inputCls}
                    value={form.nombre}
                    onChange={(e) => set("nombre", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="arco-tipodoc">
                    Tipo de documento *
                  </label>
                  <select
                    id="arco-tipodoc"
                    className={inputCls}
                    value={form.tipo_documento}
                    onChange={(e) => set("tipo_documento", e.target.value)}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carné de extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="arco-numdoc">
                    Número de documento *
                  </label>
                  <input
                    id="arco-numdoc"
                    className={inputCls}
                    value={form.numero_documento}
                    onChange={(e) => set("numero_documento", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="arco-email">
                    Correo electrónico *
                  </label>
                  <input
                    id="arco-email"
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="arco-tel">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="arco-tel"
                    type="tel"
                    className={inputCls}
                    value={form.telefono}
                    onChange={(e) => set("telefono", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="arco-dom">
                    Domicilio (opcional, si prefieres respuesta por escrito)
                  </label>
                  <input
                    id="arco-dom"
                    className={inputCls}
                    value={form.domicilio}
                    onChange={(e) => set("domicilio", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="arco-medio">
                    Cómo prefieres que te respondamos
                  </label>
                  <select
                    id="arco-medio"
                    className={inputCls}
                    value={form.medio_respuesta}
                    onChange={(e) => set("medio_respuesta", e.target.value)}
                  >
                    <option value="EMAIL">Por correo electrónico</option>
                    <option value="DOMICILIO">Por escrito a mi domicilio</option>
                  </select>
                </div>
              </div>
            </Seccion>

            <Seccion n="3" titulo="Detalle de tu solicitud">
              <label className={labelCls} htmlFor="arco-detalle">
                Explica qué necesitas. Si pides rectificación, indica el dato
                correcto; si pides cancelación u oposición, indica a qué
                tratamiento se refiere.
              </label>
              <textarea
                id="arco-detalle"
                rows={5}
                className="w-full rounded-xl border border-neutral-200 p-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.detalle}
                onChange={(e) => set("detalle", e.target.value)}
              />

              <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[#1a5c3a]"
                  checked={form.declara_titular}
                  onChange={(e) => set("declara_titular", e.target.checked)}
                />
                <span>
                  Declaro que soy el titular de los datos personales objeto de
                  esta solicitud, o su representante debidamente acreditado, y
                  que la información que proporciono es veraz. Entiendo que
                  {" "}{TITULAR.razonSocial} puede solicitarme acreditar mi
                  identidad antes de atender la solicitud. *
                </span>
              </label>

              <p className="text-xs leading-relaxed text-neutral-500">
                Los datos de este formulario se tratan únicamente para
                identificarte, atender tu solicitud y acreditar ante la
                autoridad que la respondimos. Detalle en el{" "}
                <a
                  className="font-medium text-primary underline underline-offset-2"
                  href={RUTAS_LEGALES.privacidad}
                >
                  Aviso de Privacidad
                </a>
                .
              </p>
            </Seccion>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
            >
              {enviando ? "Enviando…" : "Enviar solicitud"}
            </button>

            <p className="text-xs text-neutral-500">
              También puedes ejercer tus derechos escribiendo a{" "}
              <a
                className="font-medium text-primary underline underline-offset-2"
                href={"mailto:" + TITULAR.emailDatosPersonales}
              >
                {TITULAR.emailDatosPersonales}
              </a>
              , o presentando un reclamo ante la Autoridad Nacional de
              Protección de Datos Personales si no atendemos tu solicitud.
            </p>
          </form>
        </>
      )}
    </LegalLayout>
  );
}
