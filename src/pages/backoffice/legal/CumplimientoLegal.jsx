// src/pages/backoffice/legal/CumplimientoLegal.jsx
import { useCallback, useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

const ETIQUETA_DERECHO = {
  ACCESO: "Acceso",
  RECTIFICACION: "Rectificación",
  CANCELACION: "Cancelación",
  OPOSICION: "Oposición",
  REVOCACION: "Revocación del consentimiento",
  PORTABILIDAD: "Portabilidad",
  TRATAMIENTO_AUTOMATIZADO: "Decisiones automatizadas",
};

const fecha = (v) =>
  v
    ? new Date(v).toLocaleDateString("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

/** Semáforo del plazo legal: lo único que de verdad importa en esta pantalla. */
function Plazo({ row }) {
  if (row.fecha_respuesta) {
    return (
      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        Respondida {fecha(row.fecha_respuesta)}
      </span>
    );
  }
  if (row.vencido) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        VENCIDA hace {Math.abs(row.dias_para_vencer)} d.
      </span>
    );
  }
  if (row.por_vencer) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Vence en {row.dias_para_vencer} d. ({fecha(row.fecha_limite)})
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
      Vence {fecha(row.fecha_limite)} ({row.dias_para_vencer} d.)
    </span>
  );
}

function Ficha({ children }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      {children}
    </div>
  );
}

const textarea =
  "w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

/* ── Derechos del titular ────────────────────────────────────────────────── */

function PanelDerechos({ rows, recargar }) {
  const [editando, setEditando] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [guardando, setGuardando] = useState(false);

  const responder = async (id, estado) => {
    if (!respuesta.trim()) return;
    setGuardando(true);
    const res = await boPATCH(`/backoffice/legal/derechos/${id}`, {
      estado,
      respuesta,
    });
    setGuardando(false);
    if (res?.ok) {
      setEditando(null);
      setRespuesta("");
      recargar();
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
        No hay solicitudes de derechos registradas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Ficha key={r.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {r.codigo} · {ETIQUETA_DERECHO[r.derecho] || r.derecho}
              </p>
              <p className="text-xs text-neutral-500">
                {r.nombre} · {r.tipo_documento} {r.numero_documento} ·{" "}
                {r.email}
                {r.telefono ? ` · ${r.telefono}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plazo row={r} />
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                {r.estado}
              </span>
            </div>
          </div>

          {r.detalle && (
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
              {r.detalle}
            </p>
          )}

          {r.respuesta && (
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-green-50 p-3 text-sm text-neutral-700">
              <span className="font-semibold text-green-800">Respuesta: </span>
              {r.respuesta}
            </p>
          )}

          {editando === r.id ? (
            <div className="mt-3 space-y-2">
              <textarea
                rows={4}
                className={textarea}
                placeholder="Respuesta que se enviará al titular por correo…"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => responder(r.id, "ATENDIDA")}
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Atender y notificar
                </button>
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => responder(r.id, "DENEGADA")}
                  className="h-9 rounded-lg border border-red-300 px-4 text-xs font-semibold text-red-700 disabled:opacity-60"
                >
                  Denegar motivadamente
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="h-9 rounded-lg border border-neutral-300 px-4 text-xs font-medium text-neutral-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            !r.fecha_respuesta && (
              <button
                type="button"
                onClick={() => {
                  setEditando(r.id);
                  setRespuesta("");
                }}
                className="mt-3 h-9 rounded-lg border border-primary px-4 text-xs font-semibold text-primary"
              >
                Responder
              </button>
            )
          )}
        </Ficha>
      ))}
    </div>
  );
}

/* ── Libro de Reclamaciones ──────────────────────────────────────────────── */

function PanelReclamaciones({ rows, recargar }) {
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ respuesta: "", acciones: "" });
  const [guardando, setGuardando] = useState(false);

  const enviar = async (id, extra) => {
    setGuardando(true);
    const res = await boPATCH(`/backoffice/legal/reclamaciones/${id}`, extra);
    setGuardando(false);
    if (res?.ok) {
      setEditando(null);
      setForm({ respuesta: "", acciones: "" });
      recargar();
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
        No hay hojas de reclamación registradas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Ficha key={r.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {r.numero} · {r.tipo}
                {r.prorrogado && (
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    prorrogado
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                {r.nombre} · {r.tipo_documento} {r.numero_documento} ·{" "}
                {r.email}
                {r.telefono ? ` · ${r.telefono}` : ""}
              </p>
              <p className="text-xs text-neutral-500">
                {r.tipo_bien}
                {r.descripcion_bien ? ` — ${r.descripcion_bien}` : ""}
                {r.monto_reclamado != null
                  ? ` · S/ ${r.monto_reclamado}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plazo row={r} />
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                {r.estado}
              </span>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
            <span className="font-semibold">Detalle: </span>
            {r.detalle}
          </p>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
            <span className="font-semibold">Pedido: </span>
            {r.pedido}
          </p>

          {r.respuesta && (
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-green-50 p-3 text-sm text-neutral-700">
              <span className="font-semibold text-green-800">Respuesta: </span>
              {r.respuesta}
            </p>
          )}

          {editando === r.id ? (
            <div className="mt-3 space-y-2">
              <textarea
                rows={4}
                className={textarea}
                placeholder="Respuesta al consumidor…"
                value={form.respuesta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, respuesta: e.target.value }))
                }
              />
              <textarea
                rows={2}
                className={textarea}
                placeholder="Acciones adoptadas por el proveedor…"
                value={form.acciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acciones: e.target.value }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={guardando || !form.respuesta.trim()}
                  onClick={() =>
                    enviar(r.id, { estado: "RESPONDIDA", ...form })
                  }
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Responder y notificar
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="h-9 rounded-lg border border-neutral-300 px-4 text-xs font-medium text-neutral-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            !r.fecha_respuesta && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditando(r.id);
                    setForm({
                      respuesta: r.respuesta || "",
                      acciones: r.acciones || "",
                    });
                  }}
                  className="h-9 rounded-lg border border-primary px-4 text-xs font-semibold text-primary"
                >
                  Responder
                </button>
                {!r.prorrogado && (
                  <button
                    type="button"
                    disabled={guardando}
                    onClick={() => enviar(r.id, { prorrogar: true })}
                    className="h-9 rounded-lg border border-amber-300 px-4 text-xs font-semibold text-amber-700 disabled:opacity-60"
                    title="Amplía el plazo por única vez y comunica al consumidor"
                  >
                    Prorrogar plazo
                  </button>
                )}
              </div>
            )
          )}
        </Ficha>
      ))}
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────────── */

export default function CumplimientoLegal() {
  const [tab, setTab] = useState("derechos");
  const [derechos, setDerechos] = useState([]);
  const [hojas, setHojas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);

  // Los hijos piden refrescar incrementando el contador; el efecto reacciona.
  const recargar = useCallback(() => setRecarga((n) => n + 1), []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [d, h] = await Promise.all([
        boGET("/backoffice/legal/derechos"),
        boGET("/backoffice/legal/reclamaciones"),
      ]);
      if (!vivo) return;
      setDerechos(d?.solicitudes || []);
      setHojas(h?.hojas || []);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [recarga]);

  const vencidas =
    derechos.filter((r) => r.vencido && !r.fecha_respuesta).length +
    hojas.filter((r) => r.vencido && !r.fecha_respuesta).length;

  const tabs = [
    { id: "derechos", label: `Derechos del titular (${derechos.length})` },
    { id: "reclamaciones", label: `Libro de Reclamaciones (${hojas.length})` },
  ];

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold text-neutral-900">
          Cumplimiento legal
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Solicitudes de derechos sobre datos personales y hojas del Libro de
          Reclamaciones. Los plazos se calculan en días hábiles desde la
          recepción; responder fuera de plazo es sancionable con independencia
          de si la solicitud procede.
        </p>
        {vencidas > 0 && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            ⚠️ {vencidas} solicitud(es) con el plazo legal vencido sin respuesta.
          </p>
        )}
      </header>

      <div className="mb-4 flex gap-2 border-b border-neutral-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition " +
              (tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-800")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : tab === "derechos" ? (
        <PanelDerechos rows={derechos} recargar={recargar} />
      ) : (
        <PanelReclamaciones rows={hojas} recargar={recargar} />
      )}
    </div>
  );
}
