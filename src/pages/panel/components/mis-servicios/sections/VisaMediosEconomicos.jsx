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
import IconoPaso from "../../../../../components/common/IconoPaso";
import { IconoLinea } from "../utils";
import Icono from "../../../../../components/common/Icono";

/* ── Piezas de interfaz ──────────────────────────────────────────────────── */
// Los tonos de siempre (info, ok, warn, stop) en el diccionario del panel. El
// icono: el que se le pase o, si no, el del tono.
const AVISO_TONO = { info: "info", ok: "ok", warn: "aviso", stop: "alto" };
const AVISO_ICONO = { info: "info", ok: "checkCircle", aviso: "alert", alto: "alert" };
function Aviso({ tono = "info", icono, children }) {
  const t = AVISO_TONO[tono] || "info";
  return (
    <div className="pnl-aviso pnl-aviso-bloque" data-tono={t}>
      <span className="pnl-aviso-icono">{icono || <IconoLinea nombre={AVISO_ICONO[t]} />}</span>
      <div className="pnl-aviso-texto">{children}</div>
    </div>
  );
}

function Tarjeta({ titulo, children, tono }) {
  return (
    <div className="pnl-tarjeta pnl-tarjeta-visado" data-anidada="1" data-tono={tono}>
      {titulo && (
        <p className="pnl-eyebrow"><span className="punto" />{titulo}</p>
      )}
      {children}
    </div>
  );
}

function Fila({ etiqueta, nota, children }) {
  return (
    <div className="pnl-calc-fila">
      <div className="flex-1 min-w-0">
        <p className="pnl-calc-etiqueta">{etiqueta}</p>
        {nota && <p className="pnl-calc-nota">{nota}</p>}
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
      className="pnl-campo-control pnl-calc-numero"
    />
  );
}

// Solo la pista visual: la fila entera (el botón que la contiene) es la que
// se toca.
function Interruptor({ activo }) {
  return <span className="pnl-interruptor" data-on={activo ? "1" : undefined} aria-hidden="true" />;
}

function Casilla({ item, activa, onToggle, disabled }) {
  return (
    <>
      <button
        type="button" onClick={onToggle} disabled={disabled}
        aria-pressed={activa}
        className="pnl-opcion pnl-opcion-casilla"
      >
        <span className="pnl-opcion-check">
          {activa && <IconoPaso nombre="check" strokeWidth={2.6} />}
        </span>
        <span className="min-w-0">
          <span className="pnl-opcion-titulo">{item.nombre}</span>
          <span className="pnl-opcion-texto">{item.sub}</span>
        </span>
      </button>
      {activa && (
        <div className="pnl-opcion-suma">
          <p className="pnl-opcion-suma-rotulo">Documentos que suma</p>
          <ul className="space-y-0.5">
            {item.docs.map((d) => (
              <li key={d}>· {d}</li>
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
      <p className="pnl-visado-intro">
        Es el punto más importante y el que el consulado revisa con más detalle.
        Elige tu vía, calcula el monto y arma tu lista de documentos.
      </p>

      {/* Vía de solvencia */}
      <div className="space-y-2">
        {VIAS.map((v) => (
          <button
            key={v.key} type="button" disabled={off}
            onClick={() => { tocar(); setVia(v.key); }}
            aria-pressed={via === v.key}
            className="pnl-opcion"
          >
            {via === v.key && (
              <span className="pnl-opcion-marca">
                <IconoPaso nombre="check" strokeWidth={2.4} />
                Tu opción
              </span>
            )}
            <span className="pnl-opcion-cab">
              <span className="pnl-opcion-ico"><Icono nombre="usuario" size={18} /></span>
              <span className="min-w-0">
                <span className="pnl-opcion-titulo">{v.nombre}</span>
                <span className="pnl-opcion-texto">{v.desc}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {via ? (
        <Aviso tono="ok">
          Elegiste <b>{VIA_ETIQUETA[via]}</b>. Tu lista de solvencia se arma abajo.
        </Aviso>
      ) : (
        <Aviso tono="warn" icono={<Icono nombre="candado" size={16} />}>Elige una opción para armar tu lista de solvencia.</Aviso>
      )}

      {/* Calculadora */}
      <Tarjeta titulo="Calculadora de medios (IPREM)">
        <div className="pnl-segmentos pnl-segmentos-llenos pnl-calc-segmentos">
          {[[true, "Estancia larga · +6 meses"], [false, "Corta · ≤6 meses"]].map(([v, txt]) => (
            <button
              key={String(v)} type="button" disabled={off}
              onClick={() => setC("larga", v)}
              aria-pressed={calc.larga === v}
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
        {/* La fila entera es el interruptor: se toca en cualquier punto. */}
        <button
          type="button"
          className="pnl-interruptor-fila pnl-calc-fila"
          onClick={() => setC("incluirVuelo", !calc.incluirVuelo)}
          disabled={off}
          aria-pressed={!!calc.incluirVuelo}
        >
          <span className="flex-1 min-w-0">
            <span className="pnl-calc-etiqueta">Incluir vuelo de regreso</span>
            <span className="pnl-calc-nota">~1.000 € de referencia</span>
          </span>
          <Interruptor activo={calc.incluirVuelo} />
        </button>
        {calc.incluirVuelo && (
          <Fila etiqueta="Importe del vuelo (€)">
            <Numero valor={calc.vuelo} onChange={(v) => setC("vuelo", v)} disabled={off} />
          </Fila>
        )}
        <Fila etiqueta="Alojamiento pagado por adelantado (€)" nota="Toda la estancia · se descuenta">
          <Numero valor={calc.alojPagado} onChange={(v) => setC("alojPagado", v)} disabled={off} />
        </Fila>

        <details className="pnl-calc-parametros">
          <summary>
            Parámetros (editables)
            <IconoLinea nombre="chevron" className="pnl-chev" />
          </summary>
          <Fila etiqueta="IPREM mensual (€)">
            <Numero valor={calc.ipremMes} onChange={(v) => setC("ipremMes", v)} disabled={off} />
          </Fila>
          <Fila etiqueta="IPREM anual (€)">
            <Numero valor={calc.anual} onChange={(v) => setC("anual", v)} disabled={off} />
          </Fila>
          <p className="pnl-calc-nota">
            Verifica el IPREM vigente del año en curso: es el importe que el consulado toma como referencia.
          </p>
        </details>

        {/* Resultado */}
        <div className="pnl-calc-resultado">
          <div className="pnl-calc-lineas">
            <div className="pnl-calc-linea">
              <span>100% IPREM {calc.larga ? "(año)" : `(${calc.meses || 0} meses)`}</span>
              <b>{eur(r.periodo)} €</b>
            </div>
            {r.familiares > 0 && (
              <div className="pnl-calc-linea">
                <span>Familiares (75% / 50%)</span><b>{eur(r.familiares)} €</b>
              </div>
            )}
            {r.programa > 0 && (
              <div className="pnl-calc-linea">
                <span>Programa pendiente</span><b>{eur(r.programa)} €</b>
              </div>
            )}
            {r.vuelo > 0 && (
              <div className="pnl-calc-linea">
                <span>Vuelo de regreso</span><b>{eur(r.vuelo)} €</b>
              </div>
            )}
            {r.alojamiento > 0 && (
              <div className="pnl-calc-linea">
                <span>− Alojamiento pagado</span><b>−{eur(r.alojamiento)} €</b>
              </div>
            )}
          </div>
          <div className="pnl-calc-total">
            <span>A acreditar</span>
            <b>{eur(r.total)} €</b>
          </div>
        </div>
      </Tarjeta>

      {/* Documentación bancaria base */}
      <Tarjeta titulo="Documentación bancaria (base, siempre)">
        <p className="pnl-visado-texto pnl-visado-texto-primero">
          Extractos <b>originales</b> de cuenta de <b>ahorro y/o corriente</b>, últimos{" "}
          <b>6 meses</b>, con firma y sello del banco.
        </p>
        <Aviso tono="stop">
          No se admiten: cartas del banco, fondos de inversión, cuentas a plazo, cuentas de empresa,
          cuentas CTS, planes de pensiones ni tarjetas de crédito (esos sólo sirven para justificar
          el origen del dinero).
        </Aviso>
      </Tarjeta>

      {/* Perfil de quien financia */}
      <Tarjeta titulo="Perfil de quien financia">
        <p className="pnl-visado-texto pnl-visado-texto-primero">
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
        <p className="pnl-visado-texto pnl-visado-texto-primero">
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
        <Tarjeta titulo="Carta aval — obligatoria" tono="aviso">
          <p className="pnl-visado-texto pnl-visado-texto-primero">
            Con avalista directo la carta aval <b>siempre va</b>. Pueden financiarte:
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["papá", "mamá", "hermano/a", "tío/a", "abuelo/a"].map((f) => (
              <span key={f} className="pnl-chip" data-talla="sm">
                {f}
              </span>
            ))}
          </div>
          <ul className="space-y-1.5">
            <li className="pnl-lista-check pnl-lista-icono"><IconoPaso nombre="fileText" /><span>Carta aval <b>ante notario, legalizada por el Colegio de Notarios y apostillada</b>, indicando que cubre todos los costes.</span></li>
            <li className="pnl-lista-check pnl-lista-icono"><IconoPaso nombre="external" /><span>Vínculo familiar directo, <b>apostillado</b>.</span></li>
            <li className="pnl-lista-check pnl-lista-icono"><IconoPaso nombre="fileText" /><span>Toda la documentación económica del avalista + tu situación personal, laboral y financiera.</span></li>
          </ul>
        </Tarjeta>
      )}

      {/* Lista resultante */}
      <Tarjeta titulo="Tu lista de solvencia" tono="ok">
        <ul className="space-y-1.5">
          {lista.map((d) => (
            <li key={d} className="pnl-lista-check">
              <IconoPaso nombre="check" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Aviso tono="info" icono={<Icono nombre="globo" size={16} />}>
        Todo documento extranjero debe ir <b>legalizado o apostillado</b>. Si no está en español,
        con <b>traducción oficial</b>. Presenta <b>original + una copia</b>.
      </Aviso>

      {/* Guardado */}
      {!bloqueado && (
        <div className="pnl-barra-guardar sticky bottom-[var(--selector-alto)] z-[14] flex-wrap">
          {aviso && (
            <div className="w-full">
              <Aviso tono={aviso.tono}>{aviso.texto}</Aviso>
            </div>
          )}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button" onClick={guardar} disabled={guardando}
              className="pnl-btn-primario"
            >
              {guardando && <span className="pnl-spinner" data-talla="s" />}
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <p className="pnl-barra-guardar-texto" data-sucio={sucio ? "1" : undefined}>
              {sucio ? "Tienes cambios sin guardar" : `${lista.length} documentos en tu lista`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
