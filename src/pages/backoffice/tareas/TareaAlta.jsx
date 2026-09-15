// Alta de una tarea: qué hay que hacer, de qué área, para quién y para cuándo.
// Quien no gestiona tareas se la crea a sí mismo; quien gestiona elige
// responsable. En Leads se liga a un lead; en Servicios y Sub servicios, al
// expediente de un cliente (opcional).
import { useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Boton, Campo, Pill, Ventana } from "../ui";
import BuscarVinculo from "./BuscarVinculo";
import { CATEGORIAS, CON_SERVICIO, PRIORIDADES, diaDesdeHoy, avisarCambioTareas } from "./tareasComun";

const ATAJOS = [
  { l: "Hoy", dias: 0 },
  { l: "Mañana", dias: 1 },
  { l: "En 3 días", dias: 3 },
  { l: "En una semana", dias: 7 },
];

export default function TareaAlta({ abierta, opciones, inicial = {}, onCerrar, onCreada }) {
  const yo = opciones?.yo;
  // Se monta solo mientras está abierta: el estado inicial es el formulario limpio.
  const [f, setF] = useState(() => ({
    titulo: "",
    descripcion: "",
    categoria: inicial.categoria || "GENERAL",
    prioridad: "MEDIA",
    vence_el: "",
    id_asignado: yo?.id_usuario ? String(yo.id_usuario) : "",
    servicio: "",
    subservicio: "",
  }));
  const [vinculo, setVinculo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const poner = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const conServicio = CON_SERVICIO.has(f.categoria);
  const tipoVinculo = f.categoria === "LEADS" ? "lead" : conServicio ? "solicitud" : null;
  const paquetes = opciones?.paquetes?.[f.servicio] || [];
  const valido = !!f.titulo.trim()
    && (!conServicio || !!f.servicio)
    && (f.categoria !== "SUBSERVICIOS" || !!f.subservicio);

  function cambiarCategoria(c) {
    const nuevoConServicio = CON_SERVICIO.has(c);
    setF((x) => ({
      ...x,
      categoria: c,
      servicio: nuevoConServicio ? x.servicio : "",
      subservicio: c === "SUBSERVICIOS" ? x.subservicio : "",
    }));
    // El vínculo depende del área: lead en Leads, expediente en Servicios.
    const tipo = c === "LEADS" ? "lead" : nuevoConServicio ? "solicitud" : null;
    setVinculo((v) => (v && v.tipo === tipo ? v : null));
  }

  /** Al elegir un expediente, se aprovechan su servicio y su paquete. */
  function elegirVinculo(v) {
    setVinculo(v);
    if (v?.tipo !== "solicitud" || !v.servicio) return;
    setF((x) => {
      const servicio = x.servicio || v.servicio;
      const paqueteValido = (opciones?.paquetes?.[servicio] || []).includes(v.paquete);
      return {
        ...x,
        servicio,
        subservicio: x.categoria === "SUBSERVICIOS" && !x.subservicio && paqueteValido ? v.paquete : x.subservicio,
      };
    });
  }

  async function guardar(e) {
    e?.preventDefault();
    if (!valido || enviando) return;
    setEnviando(true);
    const r = await boPOST("/backoffice/tareas", {
      titulo: f.titulo.trim(),
      descripcion: f.descripcion.trim() || null,
      categoria: f.categoria,
      prioridad: f.prioridad,
      vence_el: f.vence_el || null,
      // Sin gestionar, el servidor la asigna a quien la crea.
      id_asignado: yo?.gestor ? (f.id_asignado ? Number(f.id_asignado) : null) : undefined,
      servicio: conServicio ? f.servicio : null,
      subservicio: f.categoria === "SUBSERVICIOS" ? f.subservicio : null,
      id_lead: vinculo?.tipo === "lead" ? vinculo.id : null,
      id_solicitud: vinculo?.tipo === "solicitud" ? vinculo.id : null,
    });
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo crear la tarea", "error"); return; }
    dialog.toast(r.msg || "Tarea creada", "success");
    avisarCambioTareas();
    onCreada(r.tarea);
  }

  return (
    <Ventana
      abierta={abierta}
      onCerrar={onCerrar}
      titulo="Nueva tarea"
      subtitulo={yo?.gestor
        ? "Qué hay que hacer, de qué área, para quién y para cuándo."
        : "Se crea para ti. Para asignarla a otra persona, pídeselo a quien gestiona las tareas."}
      pie={
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton tono="cta" cargando={enviando} disabled={!valido} onClick={guardar}>Crear tarea</Boton>
        </>
      }
    >
      <form onSubmit={guardar} style={{ display: "grid", gap: 12 }}>
        <Campo etiqueta="Qué hay que hacer *">
          <input
            className="ase-campo" autoFocus maxLength={200} value={f.titulo}
            placeholder="Publicar el reel de la beca, llamar a Ana, revisar el EX-00…"
            onChange={(e) => poner("titulo", e.target.value)}
          />
        </Campo>

        <div>
          <span className="ase-etiqueta">Área *</span>
          <div className="ase-tr-areas-elegir" role="group" aria-label="Área">
            {CATEGORIAS.map((c) => {
              const Icono = c.icono;
              return (
                <button
                  key={c.valor} type="button" className="ase-tr-area-op"
                  data-on={f.categoria === c.valor ? "1" : "0"}
                  aria-pressed={f.categoria === c.valor}
                  style={{ "--tr-color": c.color }}
                  onClick={() => cambiarCategoria(c.valor)}
                >
                  <Icono size={15} strokeWidth={2.1} /> {c.etiqueta}
                </button>
              );
            })}
          </div>
        </div>

        {conServicio && (
          <div className="ase-ld-dos">
            <Campo etiqueta="Servicio *">
              <select
                className="ase-campo" value={f.servicio}
                onChange={(e) => setF((x) => ({ ...x, servicio: e.target.value, subservicio: "" }))}
              >
                <option value="">Elige…</option>
                {(opciones?.servicios || []).map((s) => <option key={s.clave} value={s.clave}>{s.etiqueta}</option>)}
              </select>
            </Campo>
            {f.categoria === "SUBSERVICIOS" && (
              <Campo etiqueta="Sub servicio (paquete) *">
                <select
                  className="ase-campo" value={f.subservicio} disabled={!f.servicio}
                  onChange={(e) => poner("subservicio", e.target.value)}
                >
                  <option value="">{f.servicio ? "Elige…" : "Primero el servicio"}</option>
                  {paquetes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Campo>
            )}
          </div>
        )}

        {tipoVinculo && (
          <div>
            <span className="ase-etiqueta">
              {tipoVinculo === "lead" ? "Lead (opcional)" : "Expediente del cliente (opcional)"}
            </span>
            <BuscarVinculo tipo={tipoVinculo} valor={vinculo} onElegir={elegirVinculo} />
          </div>
        )}

        <div className="ase-ld-dos">
          <Campo etiqueta="Responsable">
            {yo?.gestor ? (
              <select className="ase-campo" value={f.id_asignado} onChange={(e) => poner("id_asignado", e.target.value)}>
                <option value="">Sin asignar</option>
                {(opciones?.equipo || []).map((u) => (
                  <option key={u.id_usuario} value={String(u.id_usuario)}>
                    {u.nombre}{u.id_usuario === yo.id_usuario ? " (tú)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input className="ase-campo" value="Tú" disabled />
            )}
          </Campo>
          <Campo etiqueta="Fecha límite">
            <input
              className="ase-campo" type="date" value={f.vence_el}
              onChange={(e) => poner("vence_el", e.target.value)}
            />
          </Campo>
        </div>
        <div className="ase-pills" style={{ marginTop: -4 }}>
          {ATAJOS.map((a) => {
            const dia = diaDesdeHoy(a.dias);
            return (
              <Pill key={a.l} on={f.vence_el === dia} onClick={() => poner("vence_el", f.vence_el === dia ? "" : dia)}>
                {a.l}
              </Pill>
            );
          })}
        </div>

        <div>
          <span className="ase-etiqueta">Prioridad</span>
          <div className="ase-pills">
            {PRIORIDADES.map((p) => (
              <Pill key={p.valor} on={f.prioridad === p.valor} onClick={() => poner("prioridad", p.valor)}>
                {p.etiqueta}
              </Pill>
            ))}
          </div>
        </div>

        <Campo etiqueta="Detalle">
          <textarea
            className="ase-campo" rows={3} value={f.descripcion}
            placeholder="Pasos, enlaces o lo que haga falta saber"
            onChange={(e) => poner("descripcion", e.target.value)}
          />
        </Campo>
        <button type="submit" hidden />
      </form>
    </Ventana>
  );
}
