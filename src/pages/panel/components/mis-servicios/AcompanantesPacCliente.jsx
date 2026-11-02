// Los acompañantes del profesional altamente cualificado, vistos por el asesorado.
//
// Cada uno presenta su propia solicitud ante la UGE (su MI-F, su tasa, su
// resolución), vinculada al expediente del titular, y por eso lleva sus
// propios datos y sus propios documentos. Entra también el hijo que no es del
// titular: con «acompaña a» se dice de quién depende y, según la patria
// potestad, se le pide la autorización notarial del otro progenitor o la
// sentencia.
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGET, apiPOST, apiPUT, apiDELETE } from "../../../../services/api";
import { Campo, Selector, Guardado } from "./campos";
import TarjetaDocumento, { ResumenDocumentos } from "./TarjetaDocumento";
import { ChevronPlegable, IconoAlerta } from "./Bloques";
import Icono from "../../../../components/common/Icono";
import IconoPaso from "../../../../components/common/IconoPaso";

const VINCULOS = [
  ["CONYUGE", "Cónyuge"],
  ["PAREJA", "Pareja de hecho"],
  ["HIJO_COMUN", "Hijo/a de ambos"],
  ["HIJO_NO_COMUN", "Hijo/a solo mío (no del titular)"],
  ["ASCENDIENTE", "Padre o madre a cargo"],
];
const ACOMPANA_A = [["TITULAR", "Al titular del PAC"], ["SOLICITANTE", "A mí (soy familiar del titular)"]];
const SEXO = ["Hombre", "Mujer"];
const CIVIL = ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Unión de hecho"];
const PATRIA = [["AMBOS", "La comparten ambos padres"], ["EXCLUSIVA", "La tengo en exclusiva (hay sentencia)"]];

function etiquetaVinculo(v) {
  const par = VINCULOS.find(([k]) => k === v);
  return par ? par[1] : "Acompañante";
}

function nombreDe(a) {
  const n = [a.nombres, a.apellido1, a.apellido2].filter(Boolean).join(" ").trim();
  return n || "Sin nombre todavía";
}

const ESTADO = { FAVORABLE: "Concedida", DESFAVORABLE: "Denegada", SILENCIO: "Concedida por silencio", CONCEDIDO: "Concedido", DENEGADO: "Denegado" };

/* ── Una ficha ───────────────────────────────────────────────────────────── */

function Ficha({ idSolicitud, a, esFamiliar, abierta, onAbrir, onCambio, onQuitar }) {
  const [datos, setDatos] = useState(a);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);
  const [pestana, setPestana] = useState("datos");
  const version = useRef(0);
  const base = `/solicitudes/${idSolicitud}/pac/acompanantes/${a.id_acompanante}`;

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
  const hijoNoComun = datos.vinculo === "HIJO_NO_COMUN";
  const seguimiento = [
    ["Nº expediente UGE", datos.expediente_numero],
    ["Presentada el", datos.expediente_fecha],
    ["Tasa pagada el", datos.tasa_pagada_fecha],
    ["Resolución", datos.resolucion_sentido ? `${ESTADO[datos.resolucion_sentido] || datos.resolucion_sentido}${datos.resolucion_fecha ? ` · ${datos.resolucion_fecha}` : ""}` : null],
    ["Cita en BLS", datos.bls_cita_fecha],
    ["Visado", datos.visado_resolucion ? `${ESTADO[datos.visado_resolucion] || datos.visado_resolucion}${datos.visado_recogida_fecha ? ` · recogido el ${datos.visado_recogida_fecha}` : ""}` : null],
  ].filter(([, v]) => v);

  return (
    <div className="pnl-acomp" data-abierta={abierta ? "1" : "0"}>
      <button type="button" onClick={onAbrir} aria-expanded={abierta} className="pnl-acomp-cab">
        <span className="pnl-ico" data-talla="l" aria-hidden="true"><Icono nombre="usuario" size={18} /></span>
        <span className="pnl-acomp-txt">
          <b>{nombreDe(datos)}</b>
          <span>
            {etiquetaVinculo(datos.vinculo)}{rev.edad !== null && rev.edad !== undefined ? ` · ${rev.edad} años` : ""}
          </span>
        </span>
        {(rev.faltan?.length > 0 || docsFaltan > 0) && (
          <span className="pnl-acomp-faltan">
            {rev.faltan?.length > 0 && <>{rev.faltan.length} datos<br /></>}
            {docsFaltan > 0 && <>{docsFaltan} docs</>}
          </span>
        )}
        <ChevronPlegable className="pnl-chev" />
      </button>

      {abierta && (
        <div className="pnl-acomp-cuerpo">
          <div className="pnl-segmentos pnl-acomp-pestanas">
            {[["datos", "Sus datos"], ["docs", "Sus documentos"], ["tramite", "Su trámite"]].map(([k, t]) => (
              <button key={k} type="button" onClick={() => setPestana(k)}
                aria-pressed={pestana === k}>{t}</button>
            ))}
          </div>

          {pestana === "datos" && (
            <div className="pnl-acomp-panel">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <Selector label="Quién es" obligatorio falta={falta("Vínculo")} opciones={VINCULOS} valor={datos.vinculo} onChange={set("vinculo")}
                  ayuda="«Hijo/a solo mío» es el hijo de uno de los dos que no es hijo del titular: lleva documentos propios." />
                {esFamiliar && (
                  <Selector label="A quién acompaña" opciones={ACOMPANA_A} valor={datos.acompana_a || "TITULAR"} onChange={set("acompana_a")}
                    ayuda="Si es tu hijo y tú eres la pareja del titular, acompaña a ti: su vínculo con el titular es a través tuyo." />
                )}
                <Campo label="Primer apellido" obligatorio falta={falta("Primer apellido")} valor={datos.apellido1} onChange={set("apellido1")} />
                <Campo label="Segundo apellido" valor={datos.apellido2} onChange={set("apellido2")} />
                <Campo label="Nombres" obligatorio falta={falta("Nombres")} valor={datos.nombres} onChange={set("nombres")} />
                <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")} valor={datos.pasaporte} onChange={set("pasaporte")} />
                <Campo label="Caducidad del pasaporte" tipo="date" obligatorio falta={falta("Caducidad del pasaporte")} valor={datos.pasaporte_caducidad} onChange={set("pasaporte_caducidad")} />
                <Campo label="NIE" valor={datos.nie} onChange={set("nie")} ayuda="Solo si ya lo tiene." />
                <Selector label="Sexo" obligatorio falta={falta("Sexo")} opciones={SEXO} valor={datos.sexo} onChange={set("sexo")} />
                <Campo label="Fecha de nacimiento" tipo="date" obligatorio falta={falta("Fecha de nacimiento")} valor={datos.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")} valor={datos.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
                <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")} valor={datos.pais_nacimiento} onChange={set("pais_nacimiento")} />
                <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")} valor={datos.nacionalidad} onChange={set("nacionalidad")} />
                <Selector label="Estado civil" obligatorio falta={falta("Estado civil")} opciones={CIVIL} valor={datos.estado_civil} onChange={set("estado_civil")} />
                <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")} valor={datos.nombre_padre} onChange={set("nombre_padre")} />
                <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")} valor={datos.nombre_madre} onChange={set("nombre_madre")} />
                <Campo label="Teléfono" valor={datos.telefono} onChange={set("telefono")} />
                <Campo label="Correo electrónico" tipo="email" valor={datos.correo} onChange={set("correo")} />
              </div>

              <label className="pnl-casilla-fila pnl-casilla-larga pnl-casilla-caja mt-5">
                <input type="checkbox" checked={datos.dom_mismo !== false} onChange={(e) => set("dom_mismo")(e.target.checked)} />
                <span className="min-w-0">
                  <span className="block">Vive contigo, en la misma dirección</span>
                  <small>Si es así no hace falta repetirla: usamos la tuya.</small>
                </span>
              </label>
              {propio && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 mt-4">
                  <Campo label="Domicilio" obligatorio falta={falta("Domicilio")} valor={datos.dom_direccion} onChange={set("dom_direccion")} />
                  <Campo label="Localidad" obligatorio falta={falta("Localidad")} valor={datos.dom_localidad} onChange={set("dom_localidad")} />
                  <Campo label="Código postal" valor={datos.dom_cp} onChange={set("dom_cp")} />
                  <Campo label="Provincia" obligatorio falta={falta("Provincia")} valor={datos.dom_provincia} onChange={set("dom_provincia")} />
                </div>
              )}

              {rev.menor && (
                <div className="pnl-caja-tono mt-5" data-tono="info">
                  <p className="pnl-caja-tono-texto">
                    Es menor de edad: su MI-F lo firma su <b>representante legal</b>, que normalmente eres tú.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <Campo label="Representante legal" obligatorio falta={falta("Representante legal (firma su MI-F)")} valor={datos.repr_nombre} onChange={set("repr_nombre")} />
                    <Campo label="DNI / NIE / pasaporte" valor={datos.repr_doc} onChange={set("repr_doc")} />
                    <Campo label="En calidad de" valor={datos.repr_titulo} onChange={set("repr_titulo")} ayuda="Padre, madre, tutor/a…" />
                  </div>
                  {hijoNoComun && (
                    <div className="pnl-caja-tono pnl-caja-tono-anidada mt-4" data-tono="aviso">
                      <p className="pnl-caja-tono-texto">
                        Como no es hijo del titular, la UGE exige la <b>autorización notarial del otro progenitor</b>, en escritura pública y apostillada, que lo autorice expresamente a viajar, residir legalmente, fijar su domicilio en España contigo y hacer los trámites de extranjería. Si tienes la patria potestad en exclusiva, en su lugar va la <b>sentencia apostillada</b>.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                        <Selector label="Patria potestad" obligatorio falta={falta("Patria potestad (ambos padres o exclusiva)")} opciones={PATRIA} valor={datos.patria_potestad} onChange={set("patria_potestad")} />
                        <Campo label="Nombre del otro progenitor" obligatorio falta={falta("Nombre del otro progenitor (otorga la autorización notarial)")} valor={datos.otro_progenitor_nombre} onChange={set("otro_progenitor_nombre")} />
                        <Campo label="Documento del otro progenitor" valor={datos.otro_progenitor_doc} onChange={set("otro_progenitor_doc")} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(rev.avisos || []).map((t) => <p key={t} className="pnl-aviso-linea"><IconoAlerta /> {t}</p>)}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Guardado guardando={guardando} tocado={tocado} completo={rev.completo} />
                <button type="button" onClick={onQuitar} className="pnl-btn-texto pnl-texto-peligro mt-4" data-talla="s">Quitar a esta persona</button>
              </div>
            </div>
          )}

          {pestana === "docs" && (
            <div className="pnl-acomp-panel">
              <p className="pnl-bloque-texto">
                Sus documentos son los que pide la UGE para <b>{etiquetaVinculo(datos.vinculo).toLowerCase()}</b>{rev.menor ? ", menor de edad" : ""}. El pasaporte, completo; los antecedentes, solo si es mayor de edad.
              </p>
              <ResumenDocumentos ranuras={docs.ranuras} />
              <div className="ex-docs">
                {ranurasCliente.map(([clave, def]) => <TarjetaDocumento key={clave} base={base} clave={clave} def={def} onCambio={onCambio} />)}
              </div>
              {ranurasAsesor.length > 0 && (
                <>
                  <p className="pnl-eyebrow pnl-docs-grupo">Lo que preparamos nosotros</p>
                  <div className="ex-docs">
                    {ranurasAsesor.map(([clave, def]) => <TarjetaDocumento key={clave} base={base} clave={clave} def={def} onCambio={onCambio} />)}
                  </div>
                </>
              )}
            </div>
          )}

          {pestana === "tramite" && (
            <div className="pnl-acomp-panel">
              {seguimiento.length ? (
                <div className="pnl-ficha"><table className="pnl-ficha-tabla"><tbody>
                  {seguimiento.map(([k, v]) => (
                    <tr key={k}>
                      <td className="pnl-ficha-k">{k}</td>
                      <td className="pnl-ficha-v">{v}</td>
                    </tr>
                  ))}
                </tbody></table></div>
              ) : (
                <p className="pnl-bloque-texto pnl-texto-suave">Su solicitud se presenta junto a la del titular. Cuando la presentemos verás aquí su número de expediente, su tasa y su resolución.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── El bloque entero ────────────────────────────────────────────────────── */

export default function AcompanantesPacCliente({ idSolicitud, exp, conAcompanantes, onMarcar }) {
  const [lista, setLista] = useState([]);
  const [abierta, setAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [anadiendo, setAnadiendo] = useState(false);
  const esFamiliar = exp?.rol === "FAMILIAR";

  const cargar = useCallback(
    () => apiGET(`/solicitudes/${idSolicitud}/pac/acompanantes`).then((r) => {
      if (r?.ok) setLista(r.acompanantes || []);
      setCargando(false);
    }),
    [idSolicitud],
  );
  useEffect(() => { cargar(); }, [cargar]);

  async function anadir() {
    setAnadiendo(true);
    const r = await apiPOST(`/solicitudes/${idSolicitud}/pac/acompanantes`, { acompana_a: esFamiliar ? "SOLICITANTE" : "TITULAR" });
    setAnadiendo(false);
    if (r?.ok) { await cargar(); setAbierta(r.acompanante.id_acompanante); onMarcar?.(true); }
  }

  async function quitar(id) {
    const r = await apiDELETE(`/solicitudes/${idSolicitud}/pac/acompanantes/${id}`);
    if (r?.ok) { setAbierta(null); cargar(); }
  }

  return (
    <>
      <label className="pnl-casilla-fila pnl-casilla-larga pnl-casilla-caja mb-3">
        <input type="checkbox" checked={Boolean(conAcompanantes)} onChange={(e) => onMarcar?.(e.target.checked)} />
        <span className="min-w-0">
          <b className="block">Vienen familiares conmigo</b>
          <small>
            Cónyuge o pareja de hecho, hijos (también los que son solo tuyos) y padres a cargo. Con la residencia PAC la familia <b>sí puede trabajar</b>.
          </small>
        </span>
      </label>

      {conAcompanantes && (
        <>
          <div className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="info">
            <span className="pnl-aviso-icono" aria-hidden="true"><Icono nombre="usuarios" size={16} /></span>
            <p className="pnl-aviso-texto">
              Cada persona presenta <b>su propia solicitud</b> ante la UGE —su formulario MI-F, su tasa y su resolución—, todas vinculadas al expediente del titular y enviadas a la vez. Añade una ficha por cada persona que viaja.
            </p>
          </div>
          {cargando ? <p className="pnl-acomp-nota" role="status">Cargando…</p> : (
            <div className="flex flex-col gap-2.5">
              {lista.map((a) => (
                <Ficha key={a.id_acompanante} idSolicitud={idSolicitud} a={a} esFamiliar={esFamiliar}
                  abierta={abierta === a.id_acompanante}
                  onAbrir={() => setAbierta(abierta === a.id_acompanante ? null : a.id_acompanante)}
                  onCambio={cargar} onQuitar={() => quitar(a.id_acompanante)} />
              ))}
              {lista.length === 0 && <p className="pnl-acomp-nota">Todavía no has añadido a nadie.</p>}
            </div>
          )}
          <button type="button" onClick={anadir} disabled={anadiendo}
            className="pnl-btn pnl-anadir mt-3 w-full">
            {!anadiendo && <IconoPaso nombre="plus" />}
            {anadiendo ? "Añadiendo…" : "Añadir a un familiar (cónyuge, hijo/a, padre o madre)"}
          </button>
        </>
      )}
    </>
  );
}
