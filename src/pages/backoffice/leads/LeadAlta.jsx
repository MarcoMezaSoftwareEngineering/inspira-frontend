// Alta manual de un lead: alguien que escribió por Instagram, llamó o vino
// recomendado. Hace falta nombre y un correo o un WhatsApp.
import { useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import { Boton, Campo, Ventana } from "../ui";

const VACIO = {
  nombre: "", email: "", whatsapp: "", pais: "", servicio_interes: "",
  origen_detalle: "", id_asesor: "", nota: "",
};

const SERVICIOS_SUGERIDOS = ["Máster", "Visado de estudios", "Estancia por estudios", "Modificatoria", "Sesión diagnóstico"];

export default function LeadAlta({ abierta, opciones, onCerrar, onCreado }) {
  const { user } = useAuth();
  // Se monta solo mientras está abierta: el estado inicial es el formulario limpio.
  const [f, setF] = useState(() => ({ ...VACIO, id_asesor: user?.id_usuario ? String(user.id_usuario) : "" }));
  const [enviando, setEnviando] = useState(false);

  const campo = (k) => ({ value: f[k], onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) });
  const valido = f.nombre.trim() && (f.email.trim() || f.whatsapp.trim());

  async function guardar(e) {
    e?.preventDefault();
    if (!valido) return;
    setEnviando(true);
    const r = await boPOST("/backoffice/leads", {
      ...f,
      id_asesor: f.id_asesor ? Number(f.id_asesor) : null,
    });
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo crear", "error"); return; }
    dialog.toast(r.msg || "Lead creado", "success");
    onCreado(r.lead);
  }

  return (
    <Ventana
      abierta={abierta}
      onCerrar={onCerrar}
      titulo="Nuevo lead"
      subtitulo="Para quien llega por un canal que la web no registra: redes, llamada, recomendación."
      pie={
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton tono="cta" cargando={enviando} disabled={!valido} onClick={guardar}>Crear lead</Boton>
        </>
      }
    >
      <form onSubmit={guardar} style={{ display: "grid", gap: 10 }}>
        <Campo etiqueta="Nombre *">
          <input className="ase-campo" autoFocus {...campo("nombre")} />
        </Campo>
        <div className="ase-ld-dos">
          <Campo etiqueta="Correo">
            <input className="ase-campo" type="email" {...campo("email")} />
          </Campo>
          <Campo etiqueta="WhatsApp">
            <input className="ase-campo" type="tel" placeholder="+51 …" {...campo("whatsapp")} />
          </Campo>
        </div>
        <div className="ase-ld-dos">
          <Campo etiqueta="País">
            <input className="ase-campo" {...campo("pais")} />
          </Campo>
          <Campo etiqueta="Le interesa">
            <input className="ase-campo" list="ase-ld-servicios" {...campo("servicio_interes")} />
            <datalist id="ase-ld-servicios">
              {SERVICIOS_SUGERIDOS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Campo>
        </div>
        <div className="ase-ld-dos">
          <Campo etiqueta="Cómo llegó">
            <input className="ase-campo" placeholder="Instagram, recomendación…" {...campo("origen_detalle")} />
          </Campo>
          <Campo etiqueta="Responsable">
            <select className="ase-campo" {...campo("id_asesor")}>
              <option value="">Sin asignar</option>
              {(opciones?.asesores || []).map((a) => (
                <option key={a.id_usuario} value={String(a.id_usuario)}>{a.nombre}</option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Nota">
          <textarea className="ase-campo" rows={3} {...campo("nota")} />
        </Campo>
        {!valido && f.nombre.trim() && (
          <p style={{ fontSize: 12, color: "var(--amber)", margin: 0 }}>Hace falta un correo o un WhatsApp.</p>
        )}
        <button type="submit" hidden />
      </form>
    </Ventana>
  );
}
