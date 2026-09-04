// Los acompañantes de una estancia por estudios, vistos por el asesorado.
//
// Cónyuge e hijos que se vinculan a su autorización. No piden su propia
// estancia ni llevan permiso de trabajo: van colgados de la suya, y por eso
// esto vive dentro de su expediente y no como un servicio aparte.
//
// De cada uno se pide el bloque 1 del EX-00 —cada acompañante lleva su propio
// impreso, del que sólo se rellena ese bloque— más el vínculo. El domicilio no
// se vuelve a preguntar si vive con el titular, que es lo normal.
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGET, apiPOST, apiPUT, apiDELETE } from "../../../../services/api";
import { Campo, Selector, Guardado } from "./campos";
import TarjetaDocumento, { ResumenDocumentos } from "./TarjetaDocumento";

const VINCULOS = [
  ["CONYUGE", "Cónyuge"],
  ["HIJO", "Hijo/a"],
  ["OTRO", "Otro familiar"],
];

const SEXO = ["Hombre", "Mujer"];
const CIVIL = ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a"];

function etiquetaVinculo(v) {
  const par = VINCULOS.find(([k]) => k === v);
  return par ? par[1] : "Acompañante";
}

function nombreDe(a) {
  const n = [a.nombres, a.apellido1, a.apellido2].filter(Boolean).join(" ").trim();
  return n || "Sin nombre todavía";
}

/* ── Una ficha ───────────────────────────────────────────────────────────── */

function Ficha({ idSolicitud, a, abierta, onAbrir, onCambio, onQuitar }) {
  const [datos, setDatos] = useState(a);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);
  const [pestana, setPestana] = useState("datos");
  const version = useRef(0);

  // La ficha se queda con su copia mientras esté montada: si se recargara desde
  // la lista, una recarga a destiempo le borraría lo que está escribiendo. Los
  // documentos sí se leen de la lista, que es quien los recarga.

  const base = `/solicitudes/${idSolicitud}/estancia/acompanantes/${a.id_acompanante}`;

  const set = (k) => (v) => {
    version.current += 1;
    setTocado(true);
    setDatos((p) => ({ ...p, [k]: v }));
  };

  const guardar = useCallback(async () => {
    if (!tocado) return;
    const v = version.current;
    setGuardando(true);
    const r = await apiPUT(base, datos);
    setGuardando(false);
    if (r?.ok) {
      setDatos((p) => ({ ...p, revision: r.acompanante?.revision }));
      if (version.current === v) { setTocado(false); onCambio(); }
    }
  }, [base, datos, tocado, onCambio]);

  useEffect(() => {
    if (!tocado) return undefined;
    const t = setTimeout(guardar, 900);
    return () => clearTimeout(t);
  }, [datos, tocado, guardar]);

  const rev = datos.revision || {};
  const faltaLista = new Set(rev.faltan || []);
  const falta = (l) => faltaLista.has(l);

  const docs = a.documentos || {};
  const ranurasCliente = Object.entries(docs.ranuras || {}).filter(([, d]) => d.de === "cliente");
  const ranurasAsesor = Object.entries(docs.ranuras || {}).filter(([, d]) => d.de === "asesor");
  const docsFaltan = (docs.faltan || []).length + (docs.observados || []).length;

  const propio = datos.dom_mismo === false;

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <button type="button" onClick={onAbrir}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-neutral-50/60">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
          bg-[#E8F5EE] text-[#14532d] font-semibold">
          {datos.vinculo === "HIJO" ? "👦" : datos.vinculo === "CONYUGE" ? "💍" : "👤"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold text-neutral-900 truncate">
            {nombreDe(datos)}
          </span>
          <span className="block text-[11.5px] text-neutral-400">
            {etiquetaVinculo(datos.vinculo)}
            {rev.edad !== null && rev.edad !== undefined ? ` · ${rev.edad} años` : ""}
          </span>
        </span>
        {(rev.faltan?.length > 0 || docsFaltan > 0) && (
          <span className="shrink-0 text-[10.5px] font-semibold text-amber-600 text-right leading-tight">
            {rev.faltan?.length > 0 && <>{rev.faltan.length} datos<br /></>}
            {docsFaltan > 0 && <>{docsFaltan} docs</>}
          </span>
        )}
        <span className="shrink-0 text-neutral-300 text-[11px]">{abierta ? "▲" : "▼"}</span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100">
          <div className="flex gap-1.5 px-3.5 pt-3">
            {[["datos", "Sus datos"], ["docs", "Sus documentos"]].map(([k, t]) => (
              <button key={k} type="button" onClick={() => setPestana(k)}
                className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-lg ${
                  pestana === k ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {pestana === "datos" && (
            <div className="px-3.5 pb-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Selector label="Vínculo contigo" obligatorio falta={falta("Vínculo con el titular")}
                  opciones={VINCULOS} valor={datos.vinculo} onChange={set("vinculo")}
                  ayuda="Cómo se relaciona contigo: cónyuge, hijo/a u otro familiar a cargo." />
                <Campo label="Primer apellido" obligatorio falta={falta("Primer apellido")}
                  valor={datos.apellido1} onChange={set("apellido1")} />
                <Campo label="Segundo apellido"
                  valor={datos.apellido2} onChange={set("apellido2")} />
                <Campo label="Nombres" obligatorio falta={falta("Nombres")}
                  valor={datos.nombres} onChange={set("nombres")} />
                <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")}
                  valor={datos.pasaporte} onChange={set("pasaporte")}
                  ayuda="Como figura en su pasaporte, sin espacios." />
                <Campo label="NIE" valor={datos.nie} onChange={set("nie")}
                  ayuda="Sólo si ya lo tiene. Lo normal es que no." />
                <Selector label="Sexo" obligatorio falta={falta("Sexo")}
                  opciones={SEXO} valor={datos.sexo} onChange={set("sexo")} />
                <Campo label="Fecha de nacimiento" tipo="date" obligatorio
                  falta={falta("Fecha de nacimiento")}
                  valor={datos.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")}
                  valor={datos.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
                <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")}
                  valor={datos.pais_nacimiento} onChange={set("pais_nacimiento")} />
                <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")}
                  valor={datos.nacionalidad} onChange={set("nacionalidad")} />
                <Selector label="Estado civil" obligatorio falta={falta("Estado civil")}
                  opciones={CIVIL} valor={datos.estado_civil} onChange={set("estado_civil")} />
                <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")}
                  valor={datos.nombre_padre} onChange={set("nombre_padre")} />
                <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")}
                  valor={datos.nombre_madre} onChange={set("nombre_madre")} />
                <Campo label="Teléfono" valor={datos.telefono} onChange={set("telefono")} />
                <Campo label="Correo electrónico" tipo="email"
                  valor={datos.correo} onChange={set("correo")} />
              </div>

              {/* No se le vuelve a preguntar el domicilio a quien vive contigo. */}
              <label className="flex items-start gap-2.5 mt-4 rounded-xl border border-neutral-200
                px-3.5 py-3 cursor-pointer hover:bg-neutral-50/60">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#1D6A4A]"
                  checked={datos.dom_mismo !== false}
                  onChange={(e) => set("dom_mismo")(e.target.checked)} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-neutral-800">
                    Vive contigo, en la misma dirección
                  </span>
                  <span className="block text-[11.5px] text-neutral-500 leading-relaxed">
                    Si es así no hace falta repetirla: usamos la tuya.
                  </span>
                </span>
              </label>

              {propio && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Campo label="Domicilio" obligatorio falta={falta("Domicilio")}
                    valor={datos.dom_direccion} onChange={set("dom_direccion")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Campo label="Número" valor={datos.dom_numero} onChange={set("dom_numero")} />
                    <Campo label="Piso / puerta" valor={datos.dom_piso} onChange={set("dom_piso")} />
                  </div>
                  <Campo label="Localidad" obligatorio falta={falta("Localidad")}
                    valor={datos.dom_localidad} onChange={set("dom_localidad")} />
                  <Campo label="Código postal" obligatorio falta={falta("Código postal")}
                    valor={datos.dom_cp} onChange={set("dom_cp")} />
                  <Campo label="Provincia" obligatorio falta={falta("Provincia")}
                    valor={datos.dom_provincia} onChange={set("dom_provincia")} />
                </div>
              )}

              {rev.menor && (
                <div className="rounded-xl border-l-[3px] border-sky-400 bg-sky-50 px-3.5 py-3 mt-4">
                  <p className="text-[12.5px] text-sky-900 leading-relaxed mb-2.5">
                    Es menor de edad, así que su impreso necesita un <b>representante legal</b>,
                    que normalmente eres tú.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo label="Representante legal"
                      valor={datos.repr_nombre} onChange={set("repr_nombre")} />
                    <Campo label="DNI / NIE / pasaporte"
                      valor={datos.repr_doc} onChange={set("repr_doc")} />
                    <Campo label="En calidad de"
                      valor={datos.repr_titulo} onChange={set("repr_titulo")}
                      ayuda="Padre, madre, tutor/a…" />
                  </div>
                </div>
              )}

              {(rev.avisos || []).map((t) => (
                <p key={t} className="text-[12px] text-amber-700 leading-relaxed mt-3">⚠ {t}</p>
              ))}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Guardado guardando={guardando} tocado={tocado} completo={rev.completo} />
                <button type="button" onClick={onQuitar}
                  className="text-[11.5px] text-neutral-400 hover:text-red-600 mt-4">
                  Quitar a esta persona
                </button>
              </div>
            </div>
          )}

          {pestana === "docs" && (
            <div className="px-3.5 pb-4 pt-3">
              <ResumenDocumentos ranuras={docs.ranuras} />
              <div className="space-y-2.5">
                {ranurasCliente.map(([clave, def]) => (
                  <TarjetaDocumento key={clave} base={base} clave={clave} def={def}
                    onCambio={onCambio} />
                ))}
              </div>
              {ranurasAsesor.length > 0 && (
                <>
                  <p className="text-[12px] font-semibold text-neutral-600 mt-5 mb-2">
                    Lo que preparamos nosotros
                  </p>
                  <div className="space-y-2.5">
                    {ranurasAsesor.map(([clave, def]) => (
                      <TarjetaDocumento key={clave} base={base} clave={clave} def={def}
                        onCambio={onCambio} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── El bloque entero ────────────────────────────────────────────────────── */

export default function AcompanantesCliente({ idSolicitud, conAcompanantes, onMarcar }) {
  const [lista, setLista] = useState([]);
  const [abierta, setAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [anadiendo, setAnadiendo] = useState(false);

  const cargar = useCallback(
    () => apiGET(`/solicitudes/${idSolicitud}/estancia/acompanantes`).then((r) => {
      if (r?.ok) setLista(r.acompanantes || []);
      setCargando(false);
    }),
    [idSolicitud],
  );

  useEffect(() => { cargar(); }, [cargar]);

  async function anadir() {
    setAnadiendo(true);
    const r = await apiPOST(`/solicitudes/${idSolicitud}/estancia/acompanantes`, {});
    setAnadiendo(false);
    if (r?.ok) {
      await cargar();
      setAbierta(r.acompanante.id_acompanante);
      onMarcar?.(true);
    }
  }

  async function quitar(id) {
    const r = await apiDELETE(`/solicitudes/${idSolicitud}/estancia/acompanantes/${id}`);
    if (r?.ok) { setAbierta(null); cargar(); }
  }

  return (
    <>
      <label className="flex items-start gap-3 rounded-xl border border-neutral-200
        px-3.5 py-3.5 cursor-pointer hover:bg-neutral-50/60 mb-3">
        <input type="checkbox" className="mt-0.5 w-4.5 h-4.5 accent-[#1D6A4A]"
          checked={Boolean(conAcompanantes)}
          onChange={(e) => onMarcar?.(e.target.checked)} />
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-neutral-900 leading-snug">
            Voy con acompañante
          </span>
          <span className="block text-[12.5px] text-neutral-500 leading-relaxed mt-0.5">
            Irá vinculado a mi autorización y <b>sin permiso de trabajo</b>: cónyuge, hijos
            o familiares a mi cargo.
          </span>
        </span>
      </label>

      {conAcompanantes && (
        <>
          <div className="rounded-xl border-l-[3px] border-sky-400 bg-sky-50 px-3.5 py-3 mb-3">
            <p className="text-[12.5px] text-sky-900 leading-relaxed">
              Cada acompañante necesita <b>sus propios datos y sus propios documentos</b>, y
              lleva su propio formulario ante Extranjería. Añade uno por cada persona que
              venga contigo.
            </p>
          </div>

          {cargando ? (
            <p className="text-[12.5px] text-neutral-400 py-3">Cargando…</p>
          ) : (
            <div className="space-y-2.5">
              {lista.map((a) => (
                <Ficha
                  key={a.id_acompanante} idSolicitud={idSolicitud} a={a}
                  abierta={abierta === a.id_acompanante}
                  onAbrir={() => setAbierta(abierta === a.id_acompanante ? null : a.id_acompanante)}
                  onCambio={cargar}
                  onQuitar={() => quitar(a.id_acompanante)}
                />
              ))}
              {lista.length === 0 && (
                <p className="text-[12.5px] text-neutral-400 py-2">
                  Todavía no has añadido a nadie.
                </p>
              )}
            </div>
          )}

          <button type="button" onClick={anadir} disabled={anadiendo}
            className="mt-3 text-[13px] font-semibold px-4 py-2.5 rounded-lg border-2
              border-dashed border-neutral-300 text-neutral-500 w-full
              hover:border-[#1D6A4A] hover:text-[#1D6A4A] disabled:opacity-50">
            {anadiendo ? "Añadiendo…" : "+ Añadir acompañante"}
          </button>
        </>
      )}
    </>
  );
}
