// El gráfico de clientes nuevos del Inicio, en su propio archivo.
//
// Recharts y lo que arrastra pesan unos 350 KB y Core solo los usa aquí. Antes
// iban en el paquete de todo el backoffice; ahora Dashboard carga este archivo
// en diferido y el resto de la pantalla no lo espera (09/10/2026). El gráfico
// es exactamente el de antes.
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function GraficoClientes({ datos }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
  );
}
