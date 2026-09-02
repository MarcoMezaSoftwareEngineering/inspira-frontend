import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import {
  TrendingUp, Users, FileText, FileWarning, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  function cargar() {
    setLoading(true);
    boGET("/backoffice/dashboard/stats")
      .then((data) => { if (data.error) throw new Error(data.error); setStats(data); setLastSync(new Date()); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#f4f7f5] min-h-full">
      <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 animate-pulse h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Dashboard</h1>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Error al cargar estadísticas: {error}
      </div>
    </div>
  );

  const { kpis, clientes_por_mes, solicitudes_por_tipo, documentos_por_estado, top_clientes } = stats;
  const totalDocs = documentos_por_estado.reduce((s, d) => s + d.count, 0);
  const totalClientesNuevos = clientes_por_mes.reduce((s, d) => s + d.count, 0);

  const chartData = clientes_por_mes.map((d) => {
    const [y, mo] = d.mes.split("-");
    return { mes: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-ES", { month: "short" }), count: d.count };
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 bg-[#f4f7f5] min-h-full">
      {/* Cabecera */}
      <header className="flex items-start justify-between flex-wrap gap-4 mb-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#147a4d] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#46b77f] shadow-[0_0_0_4px_rgba(70,183,127,0.12)]" />
            Resumen operativo
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#15231b]">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Indicadores clave, actividad comercial y carga operativa.</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              Actualizado {lastSync.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={cargar}
            title="Actualizar"
            className="w-9 h-9 border border-neutral-200 bg-white rounded-xl text-neutral-500 flex items-center justify-center shadow-sm hover:bg-[#f8faf8] hover:-translate-y-px transition-all"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp} title="Leads esta semana" value={kpis.leads_semana} sub="Entrada comercial reciente" trend="últimos 7 días" accent="#0d8d82" soft="#e5f7f4" />
        <KpiCard icon={Users} title="Clientes activos" value={kpis.total_clientes} sub="Clientes registrados" accent="#173454" soft="#eaf0f7" />
        <KpiCard icon={FileText} title="Expedientes activos" value={kpis.expedientes_activos} sub="Carga operativa actual" trend="en curso" accent="#147a4d" soft="#e7f4ed" />
        <KpiCard icon={FileWarning} title="Docs pendientes" value={kpis.documentos_pendientes} sub={totalDocs ? `${((kpis.documentos_pendientes / totalDocs) * 100).toFixed(1)}% de ${totalDocs} documentos` : ""} trend="requieren revisión" warn accent="#e6a400" soft="#fff6dc" />
      </div>

      {/* Fila 1: gráfico + top clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-3">
        <section className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)]">
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-1">
            <div>
              <h2 className="text-[13px] font-extrabold text-[#26352c]">Evolución de clientes nuevos</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">Altas registradas durante los últimos 6 meses</p>
            </div>
            <span className="text-[10px] font-bold text-neutral-500 bg-[#f6f8f6] border border-neutral-200 px-2.5 py-1 rounded-full whitespace-nowrap">
              {chartData[0]?.mes} – {chartData[chartData.length - 1]?.mes}
            </span>
          </div>
          <div className="flex items-end gap-2 px-5">
            <strong className="text-2xl font-extrabold tracking-tight text-[#15231b]">{totalClientesNuevos}</strong>
            <span className="text-[10px] font-extrabold text-[#147a4d] bg-[#e7f4ed] px-2 py-1 rounded-full mb-0.5">total acumulado</span>
          </div>
          <div className="h-[220px] px-2 pb-3 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientesArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#147a4d" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#147a4d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf1ee" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca7a1", fontWeight: 650 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca7a1", fontWeight: 650 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#18392a", border: "none", borderRadius: 10, padding: "7px 10px", boxShadow: "0 9px 22px rgba(16,54,34,.22)" }}
                  labelStyle={{ color: "rgba(255,255,255,.62)", fontSize: 10, fontWeight: 550, marginBottom: 2 }}
                  itemStyle={{ color: "#fff", fontSize: 11, fontWeight: 700 }}
                  formatter={(value) => [`${value} clientes`, ""]}
                />
                <Area type="monotone" dataKey="count" stroke="#147a4d" strokeWidth={2.6} fill="url(#clientesArea)" dot={{ r: 4, fill: "#fff", stroke: "#147a4d", strokeWidth: 2.2 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <TopClientes data={top_clientes || []} />
      </div>

      {/* Fila 2: reparto de expedientes por servicio */}
      <div className="grid grid-cols-1 gap-3">
        <HorizontalBarChart title="Expedientes por servicio" subtitle={`Distribución de los ${kpis.expedientes_activos} expedientes activos`} data={solicitudes_por_tipo.slice(0, 8)} labelKey="nombre" valueKey="count" total={kpis.expedientes_activos} barColor="#173454" />

      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, title, value, sub, trend, warn, accent, soft }) {
  return (
    <article className="relative bg-white border border-neutral-200 rounded-2xl p-4 shadow-[0_2px_10px_rgba(20,35,27,0.045)] overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: accent }} />
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-extrabold">{title}</span>
        {Icon && (
          <span className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: soft, color: accent }}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <strong className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#15231b] leading-none">{value ?? "—"}</strong>
        {trend && (
          <span
            className="text-[10px] font-extrabold px-1.5 py-1 rounded-full mb-0.5"
            style={warn ? { color: "#a86f00", background: "#fff6dc" } : { color: "#147a4d", background: "#e7f4ed" }}
          >
            {trend}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-neutral-400 mt-1.5">{sub}</p>}
    </article>
  );
}

/* ── Top Clientes ─────────────────────────────────────────────── */
function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function TopClientes({ data }) {
  const maxVal = Math.max(...data.map((c) => c.presupuesto_hasta || 0), 1);

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2">
        <div>
          <h2 className="text-[13px] font-extrabold text-[#26352c]">Top clientes</h2>
          <p className="text-[10px] text-neutral-400 mt-0.5">Ordenados por presupuesto máximo</p>
        </div>
      </div>
      <div className="px-2 pb-3">
        {data.length === 0 ? (
          <p className="text-xs text-neutral-400 px-4 py-4">Sin datos — ningún cliente ha definido presupuesto aún</p>
        ) : (
          data.map((c, i) => {
            const pres = c.presupuesto_hasta || 0;
            return (
              <div key={c.id_cliente} className="grid grid-cols-[20px_32px_minmax(0,1fr)_auto] items-center gap-2.5 px-2.5 py-2 rounded-[11px] hover:bg-[#f8faf8] transition-colors">
                <span className="text-[10px] font-extrabold text-neutral-300 text-center">{i + 1}</span>
                <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#ecf6f0] to-[#dceee4] text-[#0f5b3a] text-[10px] font-extrabold flex items-center justify-center">
                  {iniciales(c.nombre)}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#26352c] truncate">{c.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {c.solicitudes > 0 && <span className="text-[9px] text-neutral-400 whitespace-nowrap">{c.solicitudes} expediente{c.solicitudes > 1 ? "s" : ""}</span>}
                    <span className="h-1 bg-[#edf1ee] rounded-full overflow-hidden flex-1 min-w-[60px] max-w-[110px]">
                      <span className="block h-full bg-[#147a4d] rounded-full" style={{ width: `${(pres / maxVal) * 100}%` }} />
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-[#0f5b3a] whitespace-nowrap">
                  {pres.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* ── Horizontal Bar Chart (servicios) ────────────────────────── */
function HorizontalBarChart({ title, subtitle, data, labelKey, valueKey, total, barColor = "#173454" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
        <div>
          <h2 className="text-[13px] font-extrabold text-[#26352c]">{title}</h2>
          {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
        {total != null && (
          <span className="text-[10px] font-bold text-neutral-500 bg-[#f6f8f6] border border-neutral-200 px-2.5 py-1 rounded-full whitespace-nowrap">{total} total</span>
        )}
      </div>
      <div className="px-5 pb-5">
        {data.length === 0 ? (
          <p className="text-xs text-neutral-400">Sin datos</p>
        ) : (
          <div className="space-y-3">
            {data.map((d, i) => {
              const pct = (d[valueKey] / max) * 100;
              const share = total ? ((d[valueKey] / total) * 100).toFixed(1).replace(".", ",") : null;
              return (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_34px] gap-3 items-center">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10.5px] text-[#46564d] font-semibold truncate">{d[labelKey]}</span>
                      {share && <span className="text-[9px] text-neutral-400 shrink-0">{share}%</span>}
                    </div>
                    <div className="h-[7px] bg-[#edf1ee] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, #244f79)` }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#314038] text-right">{d[valueKey]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

