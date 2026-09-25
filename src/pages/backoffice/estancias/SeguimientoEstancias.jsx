// Seguimiento semanal de las estancias por estudios en la sede.
//
// Marco lo pidió el 25/09/2026: un sitio interno donde consignar, por
// estancia, nombre, pasaporte, NIE, fecha de ingreso del expediente, número
// de registro (I-…), número de expediente y el estado que dice la consulta
// en infoext2. Nicole lo repasa una vez a la semana; la tarea automática
// «Consultar en la sede…» se lo recuerda mientras haya estancias sin mirar
// en siete días.
//
// Los datos viven en el expediente de estancia de cada solicitud (los mismos
// que ve la ficha de la solicitud): aquí solo se ven todos juntos y se editan
// en línea. Los cambios quedan en el historial del expediente.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, FileText, RefreshCw, Search } from "lucide-react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { Pagina, Cabecera, Cuerpo, Seccion, Boton, Chip, Pill, Vacio, Esqueleto } from "../ui";

const SEDE = "https://sede.administracionespublicas.gob.es/infoext2/";
const DIAS_REPASO = 7;

const ESTADOS = [
  ["", "Sin consultar"],
  ["EN_TRAMITE", "En trámite"],
  ["REQUERIDO", "Requerimiento"],
  ["RESUELTO_FAVORABLE", "Resuelto · favorable"],
  ["RESUELTO_DESFAVORABLE", "Resuelto · desfavorable"],
  ["RECURSO", "En recurso"],
  ["ARCHIVADO", "Archivado"],
];
const TONO = { EN_TRAMITE: "cielo", REQUERIDO: "ambar", RESUELTO_FAVORABLE: "verde", RESUELTO_DESFAVORABLE: "rojo", RECURSO: "ambar", ARCHIVADO: "gris" };

const input = "text-[12.5px] px-2 py-1.5 rounded-lg border border-neutral-200 bg-white focus:border-[#1A3557] focus:outline-none w-full";

const dias = (iso) => (iso ? Math.floor((Date.now() - new Date(iso)) / 86400000) : null);
const fechaCorta = (iso) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—");

/** Toca revisar: presentada, sin resolución y sin consulta en DIAS_REPASO días. */
const tocaRevisar = (e) =>
  e.presentada && !e.cerrada && !["RESUELTO_FAVORABLE", "RESUELTO_DESFAVORABLE", "ARCHIVADO"].includes(e.consulta_estado || "")
  && (dias(e.consulta_fecha) === null || dias(e.consulta_fecha) >= DIAS_REPASO);

function Celda({ valor, campo, onGuardar, ancho = "w-32", tipo = "text", placeholder = "—" }) {
  return (
    <input
      type={tipo}
      className={`${input} ${ancho}`}
      defaultValue={valor || ""}
      placeholder={placeholder}
      onBlur={(e) => { if ((e.target.value || "") !== (valor || "")) onGuardar({ [campo]: e.target.value }); }}
    />
  );
}

function Fila({ e, onGuardar, onConsultado, onLeer, guardando }) {
  const toca = tocaRevisar(e);
  const d = dias(e.consulta_fecha);
  return (
    <tr className={`align-top ${toca ? "bg-[#fff8ef]" : ""}`}>
      <td className="px-2 py-2 min-w-[180px]">
        <button type="button" className="text-left font-bold text-[13px] text-[#1A3557] hover:underline" onClick={() => navigate(`/backoffice/solicitudes/${e.id_solicitud}`)}>
          {e.nombre}
        </button>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          {e.asesor ? `${e.asesor} · ` : ""}{e.etapa || e.estado_proceso || "—"}
          {e.anio_nacimiento ? ` · nac. ${e.anio_nacimiento}` : ""}
        </div>
        {toca && <Chip tono="ambar" className="mt-1">toca revisar</Chip>}
        {!e.presentada && <Chip tono="gris" className="mt-1">sin presentar</Chip>}
      </td>
      <td className="px-2 py-2"><Celda valor={e.pasaporte} campo="pasaporte_numero" onGuardar={onGuardar} ancho="w-32" /></td>
      <td className="px-2 py-2"><Celda valor={e.nie} campo="expediente_nie" onGuardar={onGuardar} ancho="w-28" /></td>
      <td className="px-2 py-2"><Celda valor={e.fecha_ingreso} campo="expediente_fecha" onGuardar={onGuardar} ancho="w-36" tipo="date" /></td>
      <td className="px-2 py-2"><Celda valor={e.registro} campo="expediente_justificante" onGuardar={onGuardar} ancho="w-36" placeholder="I-XXXXXXXX" /></td>
      <td className="px-2 py-2"><Celda valor={e.expediente} campo="expediente_numero" onGuardar={onGuardar} ancho="w-40" placeholder="46XXXXXXXXXXX" /></td>
      <td className="px-2 py-2 min-w-[190px]">
        <select
          className={`${input} w-44`}
          value={e.consulta_estado || ""}
          onChange={(ev) => onGuardar({ consulta_estado: ev.target.value })}
        >
          {ESTADOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
        <textarea
          className={`${input} w-44 mt-1`}
          rows={2}
          defaultValue={e.consulta_nota || ""}
          placeholder="Nota (qué dijo la sede, requerimiento…)"
          onBlur={(ev) => { if ((ev.target.value || "") !== (e.consulta_nota || "")) onGuardar({ consulta_nota: ev.target.value }); }}
        />
      </td>
      <td className="px-2 py-2 min-w-[170px]">
        <div className="text-[12px]">
          {e.consulta_fecha ? (
            <>
              <b>{fechaCorta(e.consulta_fecha)}</b>
              <span className="text-neutral-500"> · hace {d} {d === 1 ? "día" : "días"}</span>
              {e.consulta_por && <div className="text-[11px] text-neutral-500">{e.consulta_por}</div>}
            </>
          ) : <span className="text-neutral-400">nunca</span>}
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Boton tono="primario" tam="xs" icono={Check} cargando={guardando} onClick={onConsultado}>Consultado hoy</Boton>
          <a href={SEDE} target="_blank" rel="noopener" className="ase-btn ase-btn-fantasma ase-btn-xs" style={{ textDecoration: "none" }} title="Abrir la sede (infoext2)">
            <ExternalLink strokeWidth={2.2} /> Sede
          </a>
          <Boton tono="fantasma" tam="xs" icono={FileText} onClick={onLeer} title="Leer el nº I… y la fecha del justificante de MERCURIO">PDF</Boton>
        </div>
      </td>
    </tr>
  );
}

export default function SeguimientoEstancias() {
  const [estancias, setEstancias] = useState(null);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("revisar");
  const [busca, setBusca] = useState("");
  const [guardando, setGuardando] = useState(null);
  const [aviso, setAviso] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const r = await boGET("/backoffice/solicitudes/estancias/seguimiento");
      if (!r?.ok) throw new Error(r?.msg || "No se pudo cargar");
      setEstancias(r.estancias || []);
      setError(null);
    } catch (e) {
      setError(e.message);
      setEstancias([]);
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (id, datos) => {
    setGuardando(id);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/estancias/seguimiento/${id}`, datos);
      if (!r?.ok) throw new Error(r?.msg || "No se pudo guardar");
      setAviso({ tono: "verde", texto: datos.consultado ? "Consulta anotada" : "Guardado" });
      await cargar();
    } catch (e) {
      setAviso({ tono: "rojo", texto: e.message });
    } finally {
      setGuardando(null);
      setTimeout(() => setAviso(null), 2500);
    }
  };

  // El justificante de MERCURIO trae el nº I… y la fecha de presentación: se
  // leen del PDF (uno o todos) en vez de teclearlos.
  const [leyendo, setLeyendo] = useState(false);
  const leerJustificantes = async (id = null) => {
    setLeyendo(true);
    try {
      const r = id
        ? await boPOST(`/backoffice/solicitudes/estancias/seguimiento/${id}/leer-justificante`, {})
        : await boPOST("/backoffice/solicitudes/estancias/seguimiento/leer-justificantes", {});
      if (!r?.ok) throw new Error(r?.msg || "No se pudo leer");
      const n = id ? (r.resultado?.guardado?.length ? 1 : 0) : r.leidos;
      const fallo = id && !r.resultado?.ok ? ` · ${r.resultado.motivo}` : "";
      setAviso({ tono: n ? "verde" : "gris", texto: id ? (n ? "Leído del justificante" : `Nada nuevo${fallo}`) : `${n} ${n === 1 ? "estancia rellenada" : "estancias rellenadas"} desde el justificante` });
      await cargar();
    } catch (e) {
      setAviso({ tono: "rojo", texto: e.message });
    } finally {
      setLeyendo(false);
      setTimeout(() => setAviso(null), 3500);
    }
  };

  const lista = useMemo(() => {
    if (!estancias) return [];
    const q = busca.trim().toLowerCase();
    return estancias
      .filter((e) => (filtro === "revisar" ? tocaRevisar(e) : filtro === "presentadas" ? e.presentada && !e.cerrada : filtro === "resueltas" ? /^RESUELTO|ARCHIVADO/.test(e.consulta_estado || "") : true))
      .filter((e) => !q || [e.nombre, e.pasaporte, e.nie, e.registro, e.expediente].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [estancias, filtro, busca]);

  const n = {
    revisar: (estancias || []).filter(tocaRevisar).length,
    presentadas: (estancias || []).filter((e) => e.presentada && !e.cerrada).length,
    resueltas: (estancias || []).filter((e) => /^RESUELTO|ARCHIVADO/.test(e.consulta_estado || "")).length,
    todas: (estancias || []).length,
  };

  return (
    <Pagina>
      <Cabecera
        eyebrow="Procesos · Estancia por estudios"
        titulo="Seguimiento en la sede"
        subtitulo="Nombre, pasaporte, NIE, fecha de ingreso, nº de registro (I…), nº de expediente y lo que dice la consulta en infoext2. El nº I… y la fecha se leen solos del justificante de MERCURIO; el resto se edita en línea y queda en el historial. Repaso semanal: marca «Consultado hoy»."
        stats={[
          { n: n.revisar, l: "toca revisar", tono: n.revisar ? "ambar" : "verde" },
          { n: n.presentadas, l: "presentadas" },
          { n: n.resueltas, l: "resueltas" },
          { n: n.todas, l: "estancias" },
        ]}
        acciones={
          <div className="flex gap-2 flex-wrap">
            <a href={SEDE} target="_blank" rel="noopener" className="ase-btn ase-btn-secundario ase-btn-sm" style={{ textDecoration: "none" }}>
              <ExternalLink strokeWidth={2.2} /> Abrir la sede
            </a>
            <Boton tono="fantasma" tam="sm" icono={FileText} cargando={leyendo} onClick={() => leerJustificantes()}>Leer de los justificantes</Boton>
            <Boton tono="fantasma" tam="sm" icono={RefreshCw} onClick={cargar}>Actualizar</Boton>
          </div>
        }
      />
      <Cuerpo>
        <Seccion
          titulo="Estancias"
          subtitulo="La consulta pide el nº de registro I-…, el año de nacimiento y la fecha de entrada; cuando la oficina asigna el expediente (46…), se sigue con ese número."
          derecha={
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2.5 text-neutral-400" />
                <input className={`${input} pl-7 w-52`} placeholder="Buscar nombre, pasaporte, nº…" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              {[["revisar", "Toca revisar"], ["presentadas", "Presentadas"], ["resueltas", "Resueltas"], ["todas", "Todas"]].map(([k, t]) => (
                <Pill key={k} on={filtro === k} n={n[k]} onClick={() => setFiltro(k)}>{t}</Pill>
              ))}
            </div>
          }
        >
          {aviso && <div className="mb-2"><Chip tono={aviso.tono}>{aviso.texto}</Chip></div>}
          {error && <div className="mb-2"><Chip tono="rojo">{error}</Chip></div>}
          {estancias === null ? (
            <Esqueleto filas={4} />
          ) : lista.length === 0 ? (
            <Vacio
              titulo={filtro === "revisar" ? "Todas las estancias están al día" : "No hay estancias aquí"}
              texto={filtro === "revisar" ? `Ninguna presentada lleva más de ${DIAS_REPASO} días sin consultar.` : "Cambia el filtro o la búsqueda."}
            />
          ) : (
            <div className="ase-tabla-scroll">
              <table className="min-w-[1100px] w-full border-separate border-spacing-0 text-[12.5px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500">
                    {["Nombre", "Pasaporte", "NIE", "Fecha de ingreso", "Nº registro (I-)", "Nº expediente", "Estado en consulta", "Última consulta"].map((h) => (
                      <th key={h} className="px-2 py-2 border-b border-neutral-200 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&>tr>td]:border-b [&>tr>td]:border-neutral-100">
                  {lista.map((e) => (
                    <Fila
                      key={e.id_solicitud}
                      e={e}
                      guardando={guardando === e.id_solicitud}
                      onGuardar={(datos) => guardar(e.id_solicitud, datos)}
                      onConsultado={() => guardar(e.id_solicitud, { consultado: true })}
                      onLeer={() => leerJustificantes(e.id_solicitud)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Seccion>
      </Cuerpo>
    </Pagina>
  );
}
