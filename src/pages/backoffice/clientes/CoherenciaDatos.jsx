// Datos del cliente que no cuadran.
//
// Los mismos datos (pasaporte, DNI, teléfono, fecha de nacimiento) viven en el
// perfil, en el expediente de visado y en el de estancia. Si se corrigen en
// uno, los otros siguen mal y el error llega a un formulario oficial. Aquí se
// avisa y se unifican de un toque; también de lo que falta o caduca.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

export default function CoherenciaDatos({ idCliente }) {
  const [avisos, setAvisos] = useState(null);

  const cargar = useCallback(() => {
    boGET(`/backoffice/gestion-clientes/coherencia/${idCliente}`).then((r) => setAvisos(r.ok ? r.avisos : []));
  }, [idCliente]);
  useEffect(() => { cargar(); }, [cargar]);

  async function unificar(campo, valor) {
    const ok = await dialog.confirm(`Se guardará «${valor}» en el perfil y en todos sus expedientes.`, "Unificar dato");
    if (!ok) return;
    const r = await boPOST(`/backoffice/gestion-clientes/coherencia/${idCliente}/unificar`, { campo, valor });
    if (r.ok) { dialog.toast("Dato unificado", "success"); cargar(); } else dialog.toast(r.msg || "No se pudo", "error");
  }

  if (!avisos || !avisos.length) return null;

  return (
    <section className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
      <h2 className="text-[9px] font-bold uppercase tracking-widest font-mono text-amber-800 mb-2">Datos a revisar · {avisos.length}</h2>
      <div className="space-y-2.5">
        {avisos.map((a) => (
          <div key={`${a.tipo}-${a.campo}`} className="bg-white rounded-lg border border-amber-100 p-2.5">
            <p className={`text-[12.5px] font-semibold ${a.tipo === "caducado" ? "text-red-700" : "text-amber-900"}`}>{a.t}</p>
            {a.valores && (
              <div className="mt-1.5 space-y-1">
                {a.valores.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="text-neutral-500 w-16 shrink-0">{v.donde}</span>
                    <span className="font-mono text-neutral-800 truncate flex-1">{v.valor}</span>
                    <button type="button" onClick={() => unificar(a.campo, v.valor)}
                      className="shrink-0 text-[11px] font-semibold text-[#1D6A4A] border border-[#1D6A4A]/30 rounded-md px-2 py-0.5">
                      Usar este
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
