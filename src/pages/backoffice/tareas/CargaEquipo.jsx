// La carga de cada persona del equipo: abiertas, vencidas, para hoy y hechas
// en 7 días. Tocar a alguien filtra el tablero por esa persona. El admin
// decide aquí quién puede asignar tareas (la marca personal «Asigna»), porque
// los permisos de Roles y Permisos van por rol y no por persona.
import { useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { initials } from "../layout/navSections";

export default function CargaEquipo({ asignado, onElegir, esAdmin, version }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/tareas/carga").then((r) => {
      if (!vivo) return;
      if (r?.ok) { setDatos(r); setError(null); } else setError(r?.msg || "No se pudo cargar la carga del equipo");
    });
    return () => { vivo = false; };
  }, [version]);

  async function cambiarGestor(p, valor) {
    const r = await boPATCH(`/backoffice/tareas/gestores/${p.id_usuario}`, { gestiona_tareas: valor });
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar", "error"); return; }
    setDatos((d) => ({
      ...d,
      personas: d.personas.map((x) => (x.id_usuario === p.id_usuario ? { ...x, gestiona_tareas: valor } : x)),
    }));
    dialog.toast(valor ? `${p.nombre} ya puede asignar tareas` : `${p.nombre} ya no asigna tareas`, "success");
  }

  if (error) {
    return <div className="ase-tr-carga" style={{ color: "var(--red)", fontSize: 12.5 }}>{error}</div>;
  }
  if (!datos) return <div className="ase-tr-carga ase-esq" style={{ height: 96 }} />;

  const sinAsignar = datos.sin_asignar?.abiertas || 0;

  return (
    <section className="ase-tr-carga" aria-label="Carga del equipo">
      <div className="ase-tr-carga-cab">
        <span>Carga del equipo</span>
        {sinAsignar > 0 && (
          <button
            type="button" className="ase-tr-sin" data-on={asignado === "sin" ? "1" : "0"}
            onClick={() => onElegir(asignado === "sin" ? "" : "sin")}
          >
            {sinAsignar} sin asignar
          </button>
        )}
      </div>
      <div className="ase-tr-carga-grid">
        {datos.personas.map((p) => {
          const on = asignado === String(p.id_usuario);
          return (
            <div key={p.id_usuario} className="ase-tr-persona" data-on={on ? "1" : "0"}>
              <button
                type="button" className="ase-tr-persona-btn" aria-pressed={on}
                onClick={() => onElegir(on ? "" : String(p.id_usuario))}
                title={on ? "Quitar el filtro" : `Ver solo las tareas de ${p.nombre}`}
              >
                <span className="ase-tr-avatar">{initials(p)}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="ase-tr-persona-n">{p.nombre}</span>
                  <span className="ase-tr-persona-d">
                    {p.abiertas} abierta{p.abiertas === 1 ? "" : "s"}
                    {p.hoy ? ` · ${p.hoy} hoy` : ""}
                    {` · ${p.hechas_7d} hecha${p.hechas_7d === 1 ? "" : "s"} en 7 d`}
                  </span>
                </span>
                {p.vencidas > 0 && (
                  <span className="ase-tr-persona-alerta" title={`${p.vencidas} vencida${p.vencidas === 1 ? "" : "s"}`}>
                    {p.vencidas}
                  </span>
                )}
              </button>
              {esAdmin && p.rol !== "admin" && (
                <label className="ase-toggle ase-tr-gestor" title="Puede asignar tareas a otras personas y ver las de todo el equipo">
                  <input type="checkbox" checked={!!p.gestiona_tareas} onChange={(e) => cambiarGestor(p, e.target.checked)} />
                  <i /> Asigna
                </label>
              )}
              {esAdmin && p.rol === "admin" && <span className="ase-tr-gestor-fijo">Admin</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
