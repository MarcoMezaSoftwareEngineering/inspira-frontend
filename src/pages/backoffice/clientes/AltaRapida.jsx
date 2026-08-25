// Alta rápida: cliente + proceso en un solo paso.
//
// Antes había que crear el cliente aquí y volver a otra pantalla a crearle la
// solicitud, lo que dejaba clientes sueltos sin proceso. Ahora sale todo de
// una, y el paquete y las comunidades se guardan como atributos del proceso
// en vez de como servicios distintos.
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

// El catálogo de comunidades está vacío en base de datos, así que la lista vive
// aquí. Cuando se pueble, se cambia por la consulta y ya está.
const COMUNIDADES = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco",
];

const ORIGENES = ["Web", "Manual", "Referido", "Instagram", "WhatsApp", "Evento", "Otro"];

function Campo({ label, valor, onChange, tipo = "text", ancho, requerido, placeholder, opciones }) {
  const estilo =
    "w-full text-[13px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-3 py-2 " +
    "bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A] placeholder:text-neutral-300";
  return (
    <div className={ancho === "full" ? "sm:col-span-2" : ""}>
      <label className="block text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-1">
        {label}{requerido && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {opciones ? (
        <select className={estilo} value={valor} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {opciones.map((o) => (
            <option key={o.valor ?? o} value={o.valor ?? o}>{o.etiqueta ?? o}</option>
          ))}
        </select>
      ) : (
        <input className={estilo} type={tipo} value={valor} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function AltaRapida({ onCreado, onCancelar }) {
  const [opciones, setOpciones] = useState({ servicios: [], paquetes: [], asesores: [] });
  const [f, setF] = useState({
    nombre: "", email_contacto: "", telefono: "", dni: "", pasaporte: "",
    pais_origen: "", canal_origen: "Manual", servicio: "", paquete: "",
    id_asesor_asignado: "", notas: "",
  });
  const [comunidades, setComunidades] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    boGET("/backoffice/alta-rapida/opciones").then((r) => {
      if (r.ok) setOpciones({ servicios: r.servicios || [], paquetes: r.paquetes || [], asesores: r.asesores || [] });
    });
  }, []);

  const set = (k) => (v) => { setMsg(null); setF((p) => ({ ...p, [k]: v })); };
  const esMaster = f.servicio === "master";

  function alternarComunidad(c) {
    setComunidades((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  const listo = f.nombre.trim() && f.email_contacto.trim() && f.servicio;

  async function crear() {
    if (!listo || guardando) return;
    setGuardando(true);
    setMsg(null);
    try {
      const r = await boPOST("/backoffice/alta-rapida", { ...f, comunidades });
      if (!r.ok) throw new Error(r.msg || "No se pudo crear");
      setMsg({ tono: "ok", texto: r.msg });
      onCreado?.(r);
    } catch (e) {
      setMsg({ tono: "error", texto: e.message || "Error al crear" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-serif text-[17px] text-[#1A3557]">Alta rápida</p>
        <p className="text-[12.5px] text-neutral-500 mt-0.5 leading-relaxed">
          Cliente y proceso en un solo paso. Si el correo ya existe, se le añade el
          proceso al cliente que ya está — no se duplica.
        </p>
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Datos del cliente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Campo label="Nombre completo" requerido ancho="full" valor={f.nombre} onChange={set("nombre")} />
          <Campo label="Correo" tipo="email" requerido valor={f.email_contacto} onChange={set("email_contacto")} />
          <Campo label="Teléfono / WhatsApp" tipo="tel" valor={f.telefono} onChange={set("telefono")} />
          <Campo label="DNI" valor={f.dni} onChange={set("dni")} />
          <Campo label="Pasaporte" valor={f.pasaporte} onChange={set("pasaporte")} />
          <Campo label="País de origen" valor={f.pais_origen} onChange={set("pais_origen")} placeholder="Perú" />
          <Campo label="Origen" opciones={ORIGENES} valor={f.canal_origen} onChange={set("canal_origen")} />
        </div>
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Servicio que contrata
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {opciones.servicios.map((s) => {
            const on = f.servicio === s.clave;
            return (
              <button
                key={s.clave} type="button" onClick={() => set("servicio")(s.clave)}
                className={`py-3 px-2 rounded-xl border-2 text-[12.5px] font-semibold transition-all ${
                  on ? "border-[#1D6A4A] bg-[#1D6A4A]/10 text-[#1D6A4A]"
                     : "border-[#E2E8F0] bg-white text-[#6B7280] hover:border-[#CBD5E1]"
                }`}
              >
                {s.etiqueta}
              </button>
            );
          })}
        </div>

        {f.servicio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <Campo label="Paquete" opciones={opciones.paquetes} valor={f.paquete} onChange={set("paquete")} />
            <Campo
              label="Responsable"
              opciones={opciones.asesores.map((a) => ({ valor: String(a.id_usuario), etiqueta: a.nombre }))}
              valor={f.id_asesor_asignado} onChange={set("id_asesor_asignado")}
            />
          </div>
        )}

        {/* Las comunidades sólo tienen sentido en máster: es el alcance de la
            búsqueda, no un servicio distinto. */}
        {esMaster && (
          <div className="mt-3">
            <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
              Comunidades / alcance
              {comunidades.length > 0 && (
                <span className="ml-2 text-[#1D6A4A]">{comunidades.length} seleccionadas</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMUNIDADES.map((c) => {
                const on = comunidades.includes(c);
                return (
                  <button
                    key={c} type="button" onClick={() => alternarComunidad(c)}
                    className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-full border transition-all ${
                      on ? "border-[#1D6A4A] bg-[#1D6A4A] text-white"
                         : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-1">
          Nota inicial (opcional)
        </label>
        <textarea
          rows={2} value={f.notas} onChange={(e) => set("notas")(e.target.value)}
          placeholder="De dónde viene, qué pidió, qué se le prometió…"
          className="w-full text-[13px] text-neutral-800 border border-neutral-300 rounded-lg px-3 py-2 bg-white resize-y focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A] placeholder:text-neutral-300"
        />
      </div>

      {msg && (
        <p className={`text-[12.5px] rounded-lg border px-3 py-2 ${
          msg.tono === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {msg.texto}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button" onClick={crear} disabled={!listo || guardando}
          className="text-[12.5px] font-semibold px-5 py-2.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-40 transition-colors"
        >
          {guardando ? "Creando…" : "Crear cliente y proceso"}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar}
            className="text-[12.5px] font-semibold text-neutral-500 hover:text-neutral-800">
            Cancelar
          </button>
        )}
        {!listo && (
          <p className="text-[11.5px] text-neutral-400">Faltan nombre, correo y servicio</p>
        )}
      </div>
    </div>
  );
}
