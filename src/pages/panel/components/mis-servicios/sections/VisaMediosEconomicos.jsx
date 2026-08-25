// src/pages/panel/components/mis-servicios/sections/VisaMediosEconomicos.jsx
//
// Bloque 3 del expediente de visado: el punto que el consulado revisa con más
// detalle. El cliente elige su vía de solvencia, calcula cuánto debe acreditar
// y ve cómo se arma su lista de documentos.
//
// Elegir vía es lo que desbloquea el documento de solvencia del Bloque 2.
import { useEffect, useMemo, useRef, useState } from "react";
import { apiPUT } from "../../../../../services/api";
import {
  PERFILES, ESPECIALES, VIAS, VIA_ETIQUETA,
  listaSolvencia, calcularMedios, CALC_INICIAL, eur,
} from "./visaSolvencia";

/* ── Piezas de interfaz ──────────────────────────────────────────────────── */
function Aviso({ tono = "info", icono, children }) {
  const tonos = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    ok:   "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    stop: "bg-red-50 border-red-200 text-red-900",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tonos[tono]}`}>
      <span className="shrink-0 text-base leading-none mt-0.5">{icono}</span>
      <div>{children}</div>
    </div>
  );
}

function Tarjeta({ titulo, children, borde }) {
  return (
    <div className={`bg-white border rounded-2xl shadow-sm p-4 ${borde || "border-neutral-200"}`}>
      {titulo && (
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-3">{titulo}</p>
      )}
      {children}
    </div>
  );
}

function Fila({ etiqueta, nota, children }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-neutral-800 leading-tight">{etiqueta}</p>
        {nota && <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">{nota}</p>}
      </div>
      {children}
    </div>
  );
}

function Numero({ valor, onChange, disabled }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={valor}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      className="w-28 shrink-0 text-right border border-neutral-200 rounded-lg px-2.5 py-2 text-[14px] font-bold text-[#023A4B] outline-none focus:border-[#1D6A4A] disabled:opacity-60"
    />
  );
}

function Interruptor({ activo, onClick, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${activo ? "bg-[#1D6A4A]" : "bg-neutral-300"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${activo ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Casilla({ item, activa, onToggle, disabled }) {
  return (
    <>
      <button
        type="button" onClick={onToggle} disabled={disabled}
        className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border transition-all disabled:opacity-60 ${
          activa ? "border-[#1D6A4A] bg-emerald-50/60" : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}
      >
        <span className={`shrink-0 w-5 h-5 rounded-md grid place-items-center text-[11px] font-black ${
          activa ? "bg-[#1D6A4A] text-white" : "bg-neutral-100 text-transparent"
        }`}>✓</span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-neutral-800">{item.icono} {item.nombre}</span>
          <span className="block text-[11px] text-neutral-400">{item.sub}</span>
        </span>
      </button>
      {activa && (
        <div className="ml-8 mb-1 pl-3 border-l-2 border-emerald-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Documentos que suma</p>
          <ul className="space-y-0.5">
            {item.docs.map((d) => (
              <li key={d} className="text-[12px] text-neutral-600 leading-snug">· {d}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function VisaMediosEconomicos({ idSolicitud, expediente, onGuardado }) {
  const guardado = expediente || {};
  const bloqueado = guardado.formulario_estado === "FIRMADO";

  const [via, setVia] = useState(() =>
    guardado.tipo_solvencia && guardado.tipo_solvencia !== "PENDIENTE" ? guardado.tipo_solvencia : null
  );
  const [calc, setCalc] = useState(() => ({ ...CALC_INICIAL, ...(guardado.medios_calc || {}) }));
  const [perfiles, setPerfiles] = useState(() => guardado.medios_perfiles || {});
  const [especiales, setEspeciales] = useState(() => guardado.medios_especiales || {});
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);

  // Igual que en el Bloque 1: el detalle se refresca solo cada 25 s y no
  // debemos pisar lo que el cliente esté ajustando.
  const sucioRef = useRef(sucio);
  sucioRef.current = sucio;
  useEffect(() => {
    if (sucioRef.current) return;
    setVia(guardado.tipo_solvencia && guardado.tipo_solvencia !== "PENDIENTE" ? guardado.tipo_solvencia : null);
    setCalc({ ...CALC_INICIAL, ...(guardado.medios_calc || {}) });
    setPerfiles(guardado.medios_perfiles || {});
    setEspeciales(guardado.medios_especiales || {});
  }, [guardado.tipo_solvencia, guardado.medios_calc, guardado.medios_perfiles, guardado.medios_especiales]);

  const r = useMemo(() => calcularMedios(calc), [calc]);
  const lista = useMemo(() => listaSolvencia(via, perfiles, especiales), [via, perfiles, especiales]);

  const tocar = () => { setSucio(true); setAviso(null); };
  const setC = (k, v) => { tocar(); setCalc((c) => ({ ...c, [k]: v })); };
  const alternar = (setter) => (k) => { tocar(); setter((o) => ({ ...o, [k]: !o[k] })); };

  async function guardar() {
    if (bloqueado || guardando) return;
    setGuardando(true);
    setAviso(null);
    try {
      const cuerpo = {
        medios_calc: calc,
        medios_perfiles: perfiles,
        medios_especiales: especiales,
      };
      if (via) cuerpo.tipo_solvencia = via;
      const resp = await apiPUT(`/solicitudes/${idSolicitud}/visa-expediente/datos`, cuerpo);
      if (!resp.ok) throw new Error(resp.msg || "No se pudo guardar");
      setSucio(false);
      setAviso({ tono: "ok", texto: "Guardado. Tu lista de solvencia quedó registrada." });
      if (onGuardado) onGuardado();
    } catch (e) {
      setAviso({ tono: "warn", texto: e.message || "Error al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  const off = bloqueado || guardando;

  return (
    <div className="space-y-3">
      <p className="text-[13.5px] text-neutral-500 leading-relaxed">
        Es el punto más importante y el que el consulado revisa con más detalle.
        Elige tu vía, calcula el monto y arma tu lista de documentos.
      </p>

      {/* Vía de solvencia */}
      <div className="space-y-2">
        {VIAS.map((v) => (
          <button
            key={v.key} type="button" disabled={off}
            onClick={() => { tocar(); setVia(v.key); }}
            className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative disabled:opacity-60 ${
              via === v.key ? "border-[#1D6A4A] bg-emerald-50/60" : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            {via === v.key && (
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D6A4A] text-white">
                ✓ Tu opción
              </span>
            )}
            <div className="flex items-center gap-3">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-neutral-100 grid place-items-center text-xl">{v.icono}</span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#023A4B]">{v.nombre}</p>
                <p className="text-[12px] text-neutral-500 mt-0.5">{v.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {via ? (
        <Aviso tono="ok" icono="✅">
          Elegiste <b>{VIA_ETIQUETA[via]}</b>. Tu lista de solvencia se arma abajo.
        </Aviso>
      ) : (
        <Aviso tono="warn" icono="🔒">Elige una opción para armar tu lista de solvencia.</Aviso>
      )}

      {/* Calculadora */}
      <Tarjeta titulo="Calculadora de medios (IPREM)">
        <div className="flex gap-1 bg-neutral-100 border border-neutral-200 rounded-xl p-1 mb-3">
          {[[true, "Estancia larga · +6 meses"], [false, "Corta · ≤6 meses"]].map(([v, txt]) => (
            <button
              key={String(v)} type="button" disabled={off}
              onClick={() => setC("larga", v)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all disabled:opacity-60 ${
                calc.larga === v ? "bg-[#023A4B] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {txt}
            </button>
          ))}
        </div>

        <Fila
          etiqueta="Meses de estudio"
          nota={calc.larga ? "En estancia larga se usa el año completo" : "Se multiplica por el IPREM mensual"}
        >
          <Numero valor={calc.meses} onChange={(v) => setC("meses", v)} disabled={off || calc.larga} />
        </Fila>
        <Fila etiqueta="Familiares que te acompañan" nota="+75% el 1.º · +50% cada adicional">
          <Numero valor={calc.familiares} onChange={(v) => setC("familiares", v)} disabled={off} />
        </Fila>
        <Fila etiqueta="Costo del programa (€)" nota="Estudios / matrícula">
          <Numero valor={calc.programa} onChange={(v) => setC("programa", v)} disabled={off} />
        </Fila>
        <Fila etiqueta="Ya pagado del programa (€)">
          <Numero valor={calc.pagado} onChange={(v) => setC("pagado", v)} disabled={off} />
        </Fila>
        <Fila etiqueta="Incluir vuelo de regreso" nota="~1.000 € de referencia">
          <Interruptor activo={calc.incluirVuelo} onClick={() => setC("incluirVuelo", !calc.incluirVuelo)} disabled={off} />
        </Fila>
        {calc.incluirVuelo && (
          <Fila etiqueta="Importe del vuelo (€)">
            <Numero valor={calc.vuelo} onChange={(v) => setC("vuelo", v)} disabled={off} />
          </Fila>
        )}
        <Fila etiqueta="Alojamiento pagado por adelantado (€)" nota="Toda la estancia · se descuenta">
          <Numero valor={calc.alojPagado} onChange={(v) => setC("alojPagado", v)} disabled={off} />
        </Fila>

        <details className="mt-2">
          <summary className="cursor-pointer text-[12px] font-semibold text-neutral-500 py-2 select-none">
            ⚙ Parámetros (editables)
          </summary>
          <Fila etiqueta="IPREM mensual (€)">
            <Numero valor={calc.ipremMes} onChange={(v) => setC("ipremMes", v)} disabled={off} />
          </Fila>
          <Fila etiqueta="IPREM anual (€)">
            <Numero valor={calc.anual} onChange={(v) => setC("anual", v)} disabled={off} />
          </Fila>
          <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
            Verifica el IPREM vigente del año en curso: es el importe que el consulado toma como referencia.
          </p>
        </details>

        {/* Resultado */}
        <div className="mt-3.5 rounded-xl bg-gradient-to-br from-[#023A4B] to-[#035670] text-white p-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[13px] text-white/70">
              <span>100% IPREM {calc.larga ? "(año)" : `(${calc.meses || 0} meses)`}</span>
              <b className="text-white font-semibold">{eur(r.periodo)} €</b>
            </div>
            {r.familiares > 0 && (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>Familiares (75% / 50%)</span><b className="text-white font-semibold">{eur(r.familiares)} €</b>
              </div>
            )}
            {r.programa > 0 && (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>Programa pendiente</span><b className="text-white font-semibold">{eur(r.programa)} €</b>
              </div>
            )}
            {r.vuelo > 0 && (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>Vuelo de regreso</span><b className="text-white font-semibold">{eur(r.vuelo)} €</b>
              </div>
            )}
            {r.alojamiento > 0 && (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>− Alojamiento pagado</span><b className="text-white font-semibold">−{eur(r.alojamiento)} €</b>
              </div>
            )}
          </div>
          <div className="flex justify-between items-baseline mt-2.5 pt-3 border-t border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">A acreditar</span>
            <b className="text-3xl font-bold">{eur(r.total)} €</b>
          </div>
        </div>
      </Tarjeta>

      {/* Documentación bancaria base */}
      <Tarjeta titulo="Documentación bancaria (base, siempre)">
        <p className="text-[13px] text-neutral-600 leading-relaxed mb-3">
          🏦 Extractos <b>originales</b> de cuenta de <b>ahorro y/o corriente</b>, últimos{" "}
          <b>6 meses</b>, con firma y sello del banco.
        </p>
        <Aviso tono="stop" icono="🚫">
          No se admiten: cartas del banco, fondos de inversión, cuentas a plazo, cuentas de empresa,
          cuentas CTS, planes de pensiones ni tarjetas de crédito (esos sólo sirven para justificar
          el origen del dinero).
        </Aviso>
      </Tarjeta>

      {/* Perfil de quien financia */}
      <Tarjeta titulo="Perfil de quien financia">
        <p className="text-[12.5px] text-neutral-500 mb-2.5">
          Marca los que apliquen (a ti o a tu avalista). Suman documentos:
        </p>
        <div className="space-y-1.5">
          {PERFILES.map((p) => (
            <Casilla key={p.key} item={p} activa={!!perfiles[p.key]} disabled={off}
              onToggle={() => alternar(setPerfiles)(p.key)} />
          ))}
        </div>
      </Tarjeta>

      {/* Situaciones especiales */}
      <Tarjeta titulo="Situaciones especiales">
        <p className="text-[12.5px] text-neutral-500 mb-2.5">
          Ingresos repentinos o significativos en la cuenta:
        </p>
        <div className="space-y-1.5">
          {ESPECIALES.map((e) => (
            <Casilla key={e.key} item={e} activa={!!especiales[e.key]} disabled={off}
              onToggle={() => alternar(setEspeciales)(e.key)} />
          ))}
        </div>
      </Tarjeta>

      {/* Carta aval */}
      {(via === "AVAL" || via === "MIXTO") && (
        <Tarjeta titulo="Carta aval — obligatoria" borde="border-amber-200">
          <p className="text-[13px] text-neutral-600 leading-relaxed mb-2.5">
            Con avalista directo la carta aval <b>siempre va</b>. Pueden financiarte:
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["papá", "mamá", "hermano/a", "tío/a", "abuelo/a"].map((f) => (
              <span key={f} className="text-[11.5px] font-bold text-[#023A4B] bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
          <ul className="space-y-1.5 text-[13px] text-neutral-600 leading-relaxed">
            <li>📝 Carta aval <b>ante notario, legalizada por el Colegio de Notarios y apostillada</b>, indicando que cubre todos los costes.</li>
            <li>🔗 Vínculo familiar directo, <b>apostillado</b>.</li>
            <li>📄 Toda la documentación económica del avalista + tu situación personal, laboral y financiera.</li>
          </ul>
        </Tarjeta>
      )}

      {/* Lista resultante */}
      <Tarjeta titulo="Tu lista de solvencia" borde="border-emerald-200">
        <ul className="space-y-1.5">
          {lista.map((d) => (
            <li key={d} className="flex gap-2 text-[13px] text-neutral-700 leading-relaxed">
              <span className="shrink-0 text-[#1D6A4A] font-bold">✓</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Aviso tono="info" icono="🌐">
        Todo documento extranjero debe ir <b>legalizado o apostillado</b>. Si no está en español,
        con <b>traducción oficial</b>. Presenta <b>original + una copia</b>.
      </Aviso>

      {/* Guardado */}
      {!bloqueado && (
        <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-white via-white to-transparent">
          {aviso && (
            <div className="mb-2">
              <Aviso tono={aviso.tono} icono={aviso.tono === "ok" ? "✔" : "⚠️"}>{aviso.texto}</Aviso>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button" onClick={guardar} disabled={guardando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D6A4A] text-white text-sm font-semibold shadow-sm hover:bg-[#175a3e] active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {guardando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <p className="text-[11.5px] text-neutral-400">
              {sucio ? "Tienes cambios sin guardar" : `${lista.length} documentos en tu lista`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
