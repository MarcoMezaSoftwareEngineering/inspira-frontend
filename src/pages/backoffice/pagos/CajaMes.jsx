// La caja de un mes: pestaña «Caja» de Pagos.
//
// Cuatro cifras (cobrado en el mes, pendiente que vence en el mes, vencido
// acumulado y en revisión), cada una por moneda y comparada con el mes
// anterior; debajo, el desglose por servicio, asesor o método de pago, y la
// exportación a CSV. Las reglas las calcula el servidor
// (inspira-backend/src/modules/pagos/caja.js): aquí solo se pintan.
// Euros, soles y dólares no se suman nunca.
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { boGET, boFetch } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Boton, Chip, Esqueleto, Pill } from "../ui";
import { dinero, bolsaTexto, cobrosDe, dia, nombreMes, limitesMes } from "./pagosComun";

const TARJETAS = [
  { id: "cobrado", titulo: "Cobrado en el mes", nota: "por fecha de pago", tono: "verde", comparar: true },
  { id: "pendiente_mes", titulo: "Pendiente del mes", nota: "vence en el mes y no consta pagado", tono: "ambar", comparar: true },
  { id: "vencido", titulo: "Vencido acumulado", nota: null, tono: "rojo", comparar: true },
  { id: "en_revision", titulo: "En revisión", nota: "comprobantes por validar hoy", tono: "cielo", comparar: false },
];

const DIMENSIONES = [
  { id: "servicio", label: "Por servicio" },
  { id: "asesor", label: "Por asesor" },
  { id: "metodo", label: "Por método de pago" },
];

/** «+139,50 € (+139,5 %)», por moneda, solo lo que se movió. */
function textoComparacion(comp) {
  const partes = Object.entries(comp || {})
    .filter(([, v]) => v.actual || v.anterior)
    .map(([m, v]) => {
      const signo = v.diferencia > 0 ? "+" : v.diferencia < 0 ? "−" : "±";
      const pct = v.porcentaje === null ? "" : ` (${v.porcentaje > 0 ? "+" : ""}${v.porcentaje.toLocaleString("es-ES")} %)`;
      return `${signo}${dinero(Math.abs(v.diferencia), m)}${pct}`;
    });
  return partes.length ? partes.join(" · ") : "sin cambios";
}

/** El corte de lo vencido: hoy en el mes en curso; el último día en los pasados. */
function textoCorte(caja) {
  if (caja.corte?.slice(0, 7) === caja.mes) return `venció antes del ${dia(caja.corte)} y sigue sin pagar`;
  return `venció hasta el ${dia(limitesMes(caja.mes).hasta)} y no estaba pagado`;
}

function LineasMoneda({ bolsa }) {
  const lineas = Object.entries(bolsa || {}).filter(([, v]) => Number(v?.importe) > 0 || Number(v?.cobros) > 0);
  if (!lineas.length) return <span className="ase-pg-caja-importe">0 €</span>;
  return lineas.map(([m, v]) => (
    <span key={m} className="ase-pg-caja-importe">
      {dinero(v.importe, m)} <small>{v.cobros} cobro{v.cobros === 1 ? "" : "s"}</small>
    </span>
  ));
}

export default function CajaMes({ mes }) {
  const [datos, setDatos] = useState({ mes: null, caja: null, error: null });
  const [dimension, setDimension] = useState("servicio");
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/pagos/caja?mes=${mes}`).then((r) => {
      if (!vivo) return;
      if (r?.ok) setDatos({ mes, caja: r, error: null });
      else setDatos({ mes, caja: null, error: r?.msg || "No se pudo calcular la caja del mes." });
    });
    return () => { vivo = false; };
  }, [mes]);

  async function exportar() {
    setExportando(true);
    try {
      const r = await boFetch(`/backoffice/pagos/caja/csv?mes=${mes}`);
      if (!r) return;
      if (!r.ok) throw new Error("No se pudo exportar la caja.");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caja-${mes}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      dialog.toast(e.message || "No se pudo exportar la caja.", "error");
    } finally {
      setExportando(false);
    }
  }

  const { caja, error } = datos;
  const cargando = datos.mes !== mes;

  if (error && !cargando) return <div className="ase-pg-error">{error}</div>;
  if (!caja) return <Esqueleto filas={4} alto={90} />;

  const mesAnterior = caja.anterior?.mes ? nombreMes(caja.anterior.mes) : "el mes anterior";
  const filas = caja.desglose?.[dimension] || [];

  return (
    <div className="ase-pg-caja" style={{ opacity: cargando ? 0.6 : 1, transition: "opacity .2s" }}>
      <div className="ase-pg-caja-cab">
        <p className="ase-pg-cobro-s">
          Caja de <b style={{ textTransform: "capitalize" }}>{nombreMes(caja.mes)}</b>
          {caja.excluidos_prueba ? ` · ${caja.excluidos_prueba} cobros de cuentas de prueba fuera` : " · sin cuentas de prueba"}
        </p>
        <Boton tono="secundario" tam="sm" icono={Download} cargando={exportando} onClick={exportar}>
          Exportar CSV
        </Boton>
      </div>

      <div className="ase-pg-caja-grid">
        {TARJETAS.map((t) => (
          <section key={t.id} className="ase-pg-caja-tarjeta" data-tono={t.tono}>
            <h3 className="ase-pg-caja-t">{t.titulo}</h3>
            <p className="ase-pg-caja-nota">
              {t.id === "vencido" ? textoCorte(caja) : t.nota}
            </p>
            <div className="ase-pg-caja-importes"><LineasMoneda bolsa={caja[t.id]} /></div>
            {t.comparar && caja.comparacion?.[t.id] && (
              <p className="ase-pg-caja-comp">
                vs {mesAnterior}: {textoComparacion(caja.comparacion[t.id])}
                <small>antes: {bolsaTexto(caja.anterior?.[t.id])}</small>
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="ase-pg-caja-desglose">
        <div className="ase-pills" role="group" aria-label="Desglose de la caja">
          {DIMENSIONES.map((d) => (
            <Pill key={d.id} on={dimension === d.id} onClick={() => setDimension(d.id)}>{d.label}</Pill>
          ))}
        </div>
        {filas.length === 0 ? (
          <p className="ase-pg-previa-vacia">No hay cobros en este mes.</p>
        ) : (
          <div className="ase-tabla-scroll">
            <table className="ase-pg-caja-tabla">
              <thead>
                <tr>
                  <th>{DIMENSIONES.find((d) => d.id === dimension)?.label.replace("Por ", "")}</th>
                  <th>Cobrado</th>
                  <th>Pendiente del mes</th>
                  <th>Vencido</th>
                  <th>En revisión</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.clave}>
                    <td className="ase-pg-caja-etq">
                      {f.etiqueta}
                      {f.clave.startsWith("sin_") && <Chip tono="gris" className="ase-pg-chip-titulo">sin dato</Chip>}
                    </td>
                    <td>{cobrosDe(f.cobrado) ? bolsaTexto(f.cobrado) : "—"}</td>
                    <td>{cobrosDe(f.pendiente_mes) ? bolsaTexto(f.pendiente_mes) : "—"}</td>
                    <td data-rojo={cobrosDe(f.vencido) ? "1" : "0"}>{cobrosDe(f.vencido) ? bolsaTexto(f.vencido) : "—"}</td>
                    <td>{cobrosDe(f.en_revision) ? bolsaTexto(f.en_revision) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="ase-pg-caja-pie">
          Cada importe va en su moneda: euros, soles y dólares no se suman. El vencido de un mes pasado
          se mide a su último día; en revisión es lo que espera validación hoy.
        </p>
      </div>
    </div>
  );
}
