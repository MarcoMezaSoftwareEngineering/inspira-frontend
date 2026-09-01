// El presupuesto que se le manda al asesorado.
//
// Se hacía a mano sobre una plantilla y se mandaba por WhatsApp. Aquí se rellena
// una vez, se ve mientras se escribe, y sale el PDF de dos páginas —honorarios y
// condiciones— listo para descargar o mandar por correo.
//
// La vista previa no es adorno: quien lo rellena tiene que ver lo que va a
// recibir el cliente antes de mandarlo. Un importe mal puesto en un presupuesto
// se discute después con el cliente delante.
import { useMemo, useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { construirPresupuestoPDF, CONDICIONES_POR_DEFECTO } from "./presupuestoPdf";

const hoy = () => {
  const d = new Date();
  const M = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
             "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d.getDate()} de ${M[d.getMonth()]} de ${d.getFullYear()}`;
};

const eur = (n) => `${Number(n || 0).toLocaleString("es-ES", {
  minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const input = "w-full text-[12.5px] border border-neutral-300 rounded-lg px-2.5 py-1.5 "
  + "bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

/** Una lista de filas que se añaden y se quitan. */
function Filas({ titulo, filas, onCambio, campos, minimo = 1 }) {
  const set = (i, k, v) => {
    const n = filas.map((f, j) => (j === i ? { ...f, [k]: v } : f));
    onCambio(n);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wide">{titulo}</p>
        <span className="flex-1 h-px bg-neutral-100" />
        <button type="button" onClick={() => onCambio([...filas, {}])}
          className="text-[11px] font-semibold text-[#1D6A4A] hover:underline">+ añadir</button>
      </div>
      {filas.map((f, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          {campos.map((c) => (
            <input key={c.k} className={`${input} ${c.ancho || "flex-1"}`}
              type={c.tipo || "text"} placeholder={c.ph}
              value={f[c.k] ?? ""} onChange={(e) => set(i, c.k, e.target.value)} />
          ))}
          <button type="button"
            onClick={() => filas.length > minimo && onCambio(filas.filter((_, j) => j !== i))}
            disabled={filas.length <= minimo}
            className="shrink-0 text-[13px] text-neutral-300 hover:text-red-600 disabled:opacity-30 px-1"
            title="Quitar">×</button>
        </div>
      ))}
    </div>
  );
}

export default function PresupuestoAsesor() {
  const [d, setD] = useState({
    cliente: "", numero: "", fecha: hoy(),
    correo: "",
    servicios: [{ concepto: "", importe: "" }],
    tasas: [
      { concepto: "Tasa de homologación", importe: "" },
      { concepto: "Tasa de arraigo", importe: "" },
    ],
    nota_tasas: "Las tasas se abonan directamente al organismo y no forman parte de los honorarios.",
    pagos: [
      { texto: "50 % al contratar el servicio" },
      { texto: "50 % antes de la presentación del expediente" },
    ],
    nota_pago: "",
    web: "www.inspira-legal.cloud",
    email: "administracion@inspira-legal.cloud",
  });
  const [generando, setGenerando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [condicionesAbiertas, setCondicionesAbiertas] = useState(false);
  const [condiciones, setCondiciones] = useState(CONDICIONES_POR_DEFECTO);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const total = useMemo(
    () => (d.servicios || []).reduce((n, s) => n + (parseFloat(s.importe) || 0), 0),
    [d.servicios],
  );
  const totalTasas = useMemo(
    () => (d.tasas || []).reduce((n, s) => n + (parseFloat(s.importe) || 0), 0),
    [d.tasas],
  );

  const datos = () => ({ ...d, condiciones });

  async function descargar() {
    setGenerando(true);
    try {
      const bytes = await construirPresupuestoPDF(datos());
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Presupuesto ${d.numero || ""} ${d.cliente || ""}`.trim().replace(/\s+/g, " ") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      dialog.toast(e.message || "No se pudo generar el PDF", "error");
    }
    setGenerando(false);
  }

  async function enviar() {
    if (!d.correo?.trim()) return dialog.toast("Falta el correo del asesorado", "error");
    setEnviando(true);
    try {
      const bytes = await construirPresupuestoPDF(datos());
      // Se manda en base64 dentro del cuerpo: el PDF lo arma el navegador y el
      // servidor sólo lo adjunta, así que no hace falta subirlo a ningún sitio.
      let bin = "";
      const b = new Uint8Array(bytes);
      for (let i = 0; i < b.length; i += 1) bin += String.fromCharCode(b[i]);
      const r = await boPOST("/backoffice/presupuesto/enviar", {
        para: d.correo.trim(),
        cliente: d.cliente,
        numero: d.numero,
        total,
        pdf_base64: btoa(bin),
      });
      if (r?.ok) dialog.toast(`Enviado a ${r.enviado_a}`, "exito");
      else dialog.toast(r?.msg || "No se pudo enviar", "error");
    } catch (e) {
      dialog.toast(e.message || "No se pudo enviar", "error");
    }
    setEnviando(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="sm:flex-1 min-w-0">
          <h1 className="text-[19px] font-bold text-neutral-900">Presupuesto</h1>
          <p className="text-[12.5px] text-neutral-500">
            Se rellena aquí, se ve al lado y sale en PDF de dos páginas con las condiciones.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={descargar} disabled={generando}
            className="flex-1 sm:flex-none text-[12px] font-semibold px-3.5 py-2 rounded-lg
              border border-neutral-300 text-neutral-700 hover:border-neutral-400
              disabled:opacity-40">
            {generando ? "Generando…" : "Descargar PDF"}
          </button>
          <button type="button" onClick={enviar} disabled={enviando}
            className="flex-1 sm:flex-none text-[12px] font-semibold px-3.5 py-2 rounded-lg
              bg-[#1D6A4A] text-white hover:opacity-90 disabled:opacity-40">
            {enviando ? "Enviando…" : "Enviar por correo"}
          </button>
        </div>
      </div>

      {/* En el movil no caben dos columnas: el formulario va entero y la vista
          previa debajo. Forzar dos columnas en 390px deja los campos a media
          palabra y el presupuesto cortado por la mitad. */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">

        {/* ── Formulario ── */}
        <div className="space-y-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-neutral-500">Cliente</span>
                <input className={input} value={d.cliente}
                  onChange={(e) => set("cliente", e.target.value)} placeholder="Nombre y apellidos" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-neutral-500">Nº de presupuesto</span>
                <input className={input} value={d.numero}
                  onChange={(e) => set("numero", e.target.value)} placeholder="2026-014" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-neutral-500">Fecha</span>
                <input className={input} value={d.fecha}
                  onChange={(e) => set("fecha", e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-neutral-500">Correo del asesorado</span>
                <input className={input} type="email" value={d.correo}
                  onChange={(e) => set("correo", e.target.value)} placeholder="nombre@correo.com" />
              </label>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
            <Filas titulo="Servicios y honorarios" filas={d.servicios}
              onCambio={(v) => set("servicios", v)}
              campos={[
                { k: "concepto", ph: "Servicio" },
                { k: "importe", ph: "0,00", tipo: "number", ancho: "w-24" },
              ]} />
            <Filas titulo="Tasas adicionales" filas={d.tasas}
              onCambio={(v) => set("tasas", v)} minimo={0}
              campos={[
                { k: "concepto", ph: "Concepto" },
                { k: "importe", ph: "0,00", tipo: "number", ancho: "w-24" },
              ]} />
            <label className="block space-y-1">
              <span className="text-[11px] text-neutral-500">Nota sobre las tasas</span>
              <textarea rows={2} className={input} value={d.nota_tasas}
                onChange={(e) => set("nota_tasas", e.target.value)} />
            </label>
            <Filas titulo="Formas de pago" filas={d.pagos}
              onCambio={(v) => set("pagos", v)} minimo={0}
              campos={[{ k: "texto", ph: "50 % al contratar…" }]} />
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <button type="button" onClick={() => setCondicionesAbiertas(!condicionesAbiertas)}
              className="w-full flex items-center gap-2 text-left">
              <span className="text-[13px] font-semibold text-neutral-900 flex-1">
                Condiciones del servicio
              </span>
              <span className="text-[11px] text-neutral-400">
                {condiciones.length} cláusulas · {condicionesAbiertas ? "▲" : "▼"}
              </span>
            </button>
            <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-1">
              Van en la segunda página del PDF. Un presupuesto sin condiciones es una cifra
              suelta: cuando alguien discute qué incluía el servicio, no hay a qué mirar.
            </p>
            {condicionesAbiertas && (
              <div className="mt-3 space-y-2.5">
                {condiciones.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <input className={`${input} font-semibold`} value={c.t}
                      onChange={(e) => setCondiciones(condiciones.map((x, j) =>
                        (j === i ? { ...x, t: e.target.value } : x)))} />
                    <textarea rows={3} className={input} value={c.p}
                      onChange={(e) => setCondiciones(condiciones.map((x, j) =>
                        (j === i ? { ...x, p: e.target.value } : x)))} />
                  </div>
                ))}
                <button type="button"
                  onClick={() => setCondiciones([...condiciones, { t: "", p: "" }])}
                  className="text-[11px] font-semibold text-[#1D6A4A] hover:underline">
                  + añadir cláusula
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Vista previa ── */}
        <div className="lg:sticky lg:top-4 self-start w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-1.5">
            Lo que va a recibir
          </p>
          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 pt-5 pb-3 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[20px] font-bold text-[#173A5E] leading-none">inspira</p>
                <p className="text-[7.5px] tracking-[.18em] text-neutral-400 mt-1">
                  SUEÑA · APRENDE · VIAJA
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8.5px] text-neutral-400">Especialistas en Extranjería</p>
                <p className="text-[17px] font-bold text-[#173A5E] leading-tight">PRESUPUESTO</p>
                {d.numero && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-white
                    bg-[#F58220] px-2 py-0.5 rounded">Nº {d.numero}</span>
                )}
              </div>
            </div>

            <div className="px-5 pb-3">
              <p className="text-[9px] font-bold text-[#173A5E]">CLIENTE</p>
              <p className="text-[12.5px] text-neutral-800 border-b border-neutral-200 pb-1">
                {d.cliente || <span className="text-neutral-300">—</span>}
              </p>
              <p className="text-[9px] text-neutral-400 mt-1">{d.fecha}</p>
            </div>

            <div className="px-5">
              <div className="bg-[#173A5E] text-white flex items-center px-3 py-2 rounded-t">
                <span className="text-[10px] font-bold flex-1">SERVICIO</span>
                <span className="text-[10px] font-bold">HONORARIOS</span>
              </div>
              {(d.servicios || []).filter((s) => s.concepto || s.importe).map((s, i) => (
                <div key={i} className={`flex items-center px-3 py-2 border-b border-neutral-100
                  ${i % 2 === 0 ? "bg-neutral-50/70" : ""}`}>
                  <span className="text-[11.5px] text-neutral-700 flex-1 truncate">
                    {s.concepto || "—"}
                  </span>
                  <span className="text-[11.5px] font-bold text-[#173A5E] tabular-nums">
                    {eur(s.importe)}
                  </span>
                </div>
              ))}
              <div className="flex items-center px-3 py-2 bg-[#173A5E]/[.06] rounded-b">
                <span className="text-[11px] font-bold text-[#173A5E] flex-1">Total honorarios</span>
                <span className="text-[14px] font-bold text-[#173A5E] tabular-nums">{eur(total)}</span>
              </div>
            </div>

            <div className="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-[#F58220]/70 bg-[#FEF6EC] rounded-lg p-3">
                <p className="text-[9.5px] font-bold text-[#173A5E] mb-1.5">TASAS ADICIONALES</p>
                {(d.tasas || []).filter((t) => t.concepto || t.importe).map((t, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-[10px] text-neutral-700 truncate">· {t.concepto}</span>
                    <span className="text-[10px] font-semibold text-neutral-700 tabular-nums">
                      {eur(t.importe)}
                    </span>
                  </div>
                ))}
                {totalTasas > 0 && (
                  <p className="text-[9.5px] text-neutral-500 mt-1.5 pt-1.5 border-t border-[#F58220]/30">
                    Aparte de los honorarios: <b>{eur(totalTasas)}</b>
                  </p>
                )}
                {d.nota_tasas && (
                  <p className="text-[8.5px] text-neutral-500 leading-snug mt-1.5">{d.nota_tasas}</p>
                )}
              </div>

              <div className="border border-[#173A5E]/50 rounded-lg p-3">
                <p className="text-[9.5px] font-bold text-[#173A5E] mb-1.5">FORMAS DE PAGO</p>
                {(d.pagos || []).filter((p) => p.texto).map((p, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span className="text-[10px] font-bold text-[#F58220]">{i + 1}.</span>
                    <span className="text-[10px] text-neutral-700 leading-snug">{p.texto}</span>
                  </div>
                ))}
                {d.nota_pago && (
                  <p className="text-[8.5px] text-neutral-500 leading-snug mt-1.5">{d.nota_pago}</p>
                )}
              </div>
            </div>

            <div className="px-5 pb-4 flex justify-between border-t border-neutral-100 pt-2">
              <span className="text-[8.5px] text-neutral-400">{d.web}</span>
              <span className="text-[8.5px] text-neutral-400">{d.email}</span>
            </div>
          </div>

          <p className="text-[10.5px] text-neutral-400 mt-2 leading-relaxed">
            La segunda página del PDF lleva las {condiciones.length} cláusulas de condiciones.
            Aquí sólo se ve la primera.
          </p>
        </div>
      </div>
    </div>
  );
}
