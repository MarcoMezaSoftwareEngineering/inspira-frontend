// La oficina propia de cada personaje: el mismo cuarto, decorado con lo de su área. Lo que se ve
// en las paredes y sobre la mesa sale de los datos reales (cuántas tareas, qué día es hoy, cuántos
// leads sin contactar…), no de adorno.
import { useMemo } from "react";
import { Caja, Defs, Efectos, Escritorio, Mago } from "./Personas";
import { crearIso, pts, rnd } from "./geometria";

const ig = crearIso({ W: 96, H: 48, OX: 300, OY: 120 });
const { iso, losa } = ig;
const N = 5;
const L = N * 48;
const ALTO = 150;
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const ROL_MAYUS = { hermione: "EXPEDIENTES", harry: "TAREAS", ron: "LEADS", luna: "AGENDA", neville: "PAGOS", albus: "DIRECCIÓN" };

/* ── Pared izquierda: lo propio de cada área ───────────────────────────────────────────────────── */
function Corcho({ p }) {
  const n = Math.min(p.cuenta, 10);
  const venc = p.items.filter((x) => x.vencido).length;
  const colores = ["#fff3b0", "#cfe6ff", "#ffd9c2", "#d6f5df"];
  return (
    <g>
      <rect x="-222" y="-132" width="190" height="104" rx="4" fill="#bd8d5a" stroke="#7a5230" strokeWidth="4" />
      <rect x="-216" y="-126" width="178" height="92" fill="#e2c294" />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} className="of-nota" style={{ animationDelay: `${i * 0.3}s` }} transform={`translate(${-208 + (i % 5) * 34},${-120 + Math.floor(i / 5) * 42}) rotate(${(i % 3) * 2 - 2})`}>
          <rect width="28" height="32" fill={i < venc ? "#ffd0c2" : colores[i % 4]} stroke="#b09a70" strokeWidth=".6" />
          <circle cx="14" cy="3" r="2.4" fill={i < venc ? "#d23a2a" : "#FA943A"} />
          {[0, 1, 2].map((k) => <line key={k} x1="4" x2={24 - k * 4} y1={12 + k * 6} y2={12 + k * 6} stroke="#6a6a6a" strokeWidth="1" strokeLinecap="round" />)}
        </g>
      ))}
      {n === 0 && <text x="-127" y="-78" textAnchor="middle" fontSize="13" fontWeight="700" fill="#7a5230">Sin tareas para hoy</text>}
    </g>
  );
}

function Estante() {
  const libros = useMemo(() => Array.from({ length: 4 }, (_, f) => Array.from({ length: 14 }, (_, i) => ({ f, i, c: ["#8f1d2c", "#1d3f73", "#2f6b3f", "#b0831f", "#4a2a85", "#a3541a"][Math.floor(rnd(f * 14 + i + 5) * 6)], h: 16 + rnd(f * 31 + i) * 10, w: 8 + rnd(i + f) * 3 }))).flat(), []);
  return (
    <g>
      <rect x="-228" y="-140" width="206" height="136" fill="#6b4426" stroke="#3d2813" strokeWidth="2" />
      {[0, 1, 2, 3].map((f) => <rect key={f} x="-228" y={-110 + f * 34} width="206" height="3" fill="#8a5a33" />)}
      {libros.map((b) => <rect key={`${b.f}${b.i}`} x={-222 + b.i * 14.4} y={-110 + b.f * 34 - b.h} width={b.w} height={b.h} rx="1" fill={b.c} />)}
    </g>
  );
}

function Embudo({ p }) {
  const filas = [["Sin contactar", 176, "#FA943A"], ["Contactados", 136, "#88C4FC"], ["Asesoría", 96, "#4E9EE8"], ["Contrataron", 56, "#3fae7a"]];
  return (
    <g>
      <rect x="-222" y="-132" width="190" height="104" rx="4" fill="#012331" stroke="#FA943A" strokeWidth="3" />
      {filas.map(([t, w, c], i) => (
        <g key={t}>
          <rect x={-127 - w / 2} y={-120 + i * 24} width={w} height="19" rx="4" fill={c} opacity={i === 0 ? 1 : 0.55} />
          <text x="-127" y={-106.5 + i * 24} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#01222E">{i === 0 ? `${t} · ${p.cuenta}` : t}</text>
        </g>
      ))}
    </g>
  );
}

function Calendario({ fecha }) {
  const celdas = [];
  for (let i = 0; i < fecha.primerDia; i += 1) celdas.push(null);
  for (let d = 1; d <= fecha.diasMes; d += 1) celdas.push(d);
  return (
    <g>
      <rect x="-222" y="-136" width="190" height="112" rx="4" fill="#fff8e6" stroke="#FA943A" strokeWidth="3" />
      <rect x="-222" y="-136" width="190" height="20" rx="4" fill="#FA943A" />
      <text x="-127" y="-122" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{MESES[fecha.mes]}</text>
      {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => <text key={d} x={-212 + i * 25.5 + 10} y="-106" textAnchor="middle" fontSize="8" fontWeight="700" fill="#5a6a7a">{d}</text>)}
      {celdas.map((d, i) => {
        if (!d) return null;
        const col = i % 7; const fila = Math.floor(i / 7);
        const hoy = d === fecha.dia;
        return (
          <g key={i}>
            {hoy && <circle cx={-202 + col * 25.5} cy={-95 + fila * 13} r="6.5" fill="#FA943A" className="of-brilla" />}
            <text x={-202 + col * 25.5} y={-92 + fila * 13} textAnchor="middle" fontSize="8.5" fontWeight={hoy ? 800 : 500} fill={hoy ? "#fff" : "#01222E"}>{d}</text>
          </g>
        );
      })}
    </g>
  );
}

function Plantas() {
  const maceta = (x, y, r) => (
    <g key={x} transform={`translate(${x},${y})`}>
      <path d="M-10,0 L-7,16 H7 L10,0 Z" fill="#c2693b" />
      {[-1, 0, 1].map((k) => <ellipse key={k} cx={k * 8} cy={-10 - Math.abs(k) * -2 - r} rx="6" ry={14 + r} fill="#3f9a5a" transform={`rotate(${k * 24} ${k * 8} -2)`} />)}
    </g>
  );
  return (
    <g>
      <rect x="-224" y="-132" width="200" height="5" fill="#8a5a33" /><rect x="-224" y="-78" width="200" height="5" fill="#8a5a33" />
      {[-196, -150, -104, -58].map((x, i) => maceta(x, -146, i % 2 * 3))}
      {[-176, -122, -70].map((x, i) => maceta(x, -92, i * 2))}
    </g>
  );
}

function Mapa({ p }) {
  const n = Math.min(p.cuenta, 8);
  return (
    <g>
      <rect x="-224" y="-134" width="196" height="108" rx="5" fill="#1d6a9b" stroke="#FA943A" strokeWidth="3" />
      <g fill="#7bc07a" opacity=".95">
        <path d="M-200,-110 Q-186,-124 -166,-114 Q-156,-100 -172,-92 Q-190,-84 -200,-96Z" />
        <path d="M-150,-120 Q-124,-128 -104,-114 Q-92,-100 -112,-96 Q-136,-92 -148,-102Z" />
        <path d="M-120,-84 Q-100,-90 -84,-80 Q-86,-62 -100,-56 Q-114,-62 -120,-84Z" />
        <path d="M-72,-112 Q-52,-118 -44,-100 Q-52,-90 -66,-92Z" />
        <path d="M-186,-72 Q-170,-78 -160,-62 Q-168,-46 -180,-52Z" />
      </g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${-196 + rnd(i + 3) * 152},${-114 + rnd(i + 9) * 70})`}><circle r="8" fill="url(#of-oro)" className="of-brilla" /><circle r="3.2" fill="#FA943A" stroke="#fff" strokeWidth="1" /></g>
      ))}
    </g>
  );
}

/* ── Pared derecha: la misma en todas, con el rótulo del área ──────────────────────────────────── */
function ParedDerecha({ p, hora, noche }) {
  const h = (hora.h % 12) + hora.m / 60;
  const man = (ang, len, ancho) => <line x1="0" y1="0" x2={Math.sin(ang) * len} y2={-Math.cos(ang) * len} stroke="#01222E" strokeWidth={ancho} strokeLinecap="round" />;
  return (
    <g>
      <path d="M24,-40 L24,-104 Q54,-136 84,-104 L84,-40 Z" fill={noche ? "#1b2a5e" : "#8fc6f4"} stroke="#FA943A" strokeWidth="4" />
      <path d="M54,-40 V-124 M24,-80 H84" stroke="#FA943A" strokeWidth="2.5" />
      {noche ? <circle cx="70" cy="-100" r="6" fill="#f3efd6" /> : <circle cx="70" cy="-100" r="6" fill="#ffe9a8" />}
      <g transform="translate(130,-96)">
        <circle r="17" fill="#fff8e6" stroke="#FA943A" strokeWidth="3" />
        {[0, 3, 6, 9].map((i) => <circle key={i} cx={Math.sin((i / 12) * 6.283) * 13} cy={-Math.cos((i / 12) * 6.283) * 13} r="1.1" fill="#5a6a7a" />)}
        {man((h / 12) * 6.283, 9, 2.4)}{man((hora.m / 60) * 6.283, 13, 1.6)}<circle r="1.8" fill="#FA943A" />
      </g>
      <rect x="156" y="-62" width="72" height="26" rx="4" fill="#012331" stroke="#FA943A" strokeWidth="2" />
      <text x="192" y="-44" textAnchor="middle" fontSize={ROL_MAYUS[p.id].length > 8 ? 9 : 11} fontWeight="800" letterSpacing="1.5" fill="#FA943A">{ROL_MAYUS[p.id]}</text>
    </g>
  );
}

/* ── Sobre el suelo y la mesa ──────────────────────────────────────────────────────────────────── */
function Pila({ x, y, k }) {
  return (
    <g className="of-pila" style={{ animationDelay: `${k}s` }}>
      <Caja iso={iso} x={x} y={y} w={0.7} d={0.6} alto={12} />
      <Caja iso={iso} x={x} y={y} w={0.7} d={0.6} alto={10} z={12} />
      <Caja iso={iso} x={x + 0.05} y={y + 0.05} w={0.6} d={0.5} alto={8} z={22} />
    </g>
  );
}

function Suelito({ p }) {
  const [tx, ty] = iso(3.7, 3.5, 0);
  const [dx, dy] = iso(2.35, 2.35, 30);
  switch (p.id) {
    case "harry": case "hermione":
      return <g><Pila x={3.5} y={0.7} k={0} />{p.cuenta > 3 && <Pila x={3.5} y={1.6} k={0.8} />}{p.cuenta > 8 && <Pila x={0.3} y={3.8} k={1.5} />}</g>;
    case "ron": {
      const [px, py] = iso(3.4, 1.2, 30);
      return (
        <g>
          <Caja iso={iso} x={3.1} y={0.9} w={0.9} d={0.8} alto={30} />
          <g transform={`translate(${px},${py - 4})`}>
            <rect x="-11" y="-6" width="22" height="12" rx="3" fill="#01222E" /><rect x="-13" y="-10" width="26" height="6" rx="3" fill="#FA943A" />
            {p.cuenta > 0 && [0, 1, 2].map((i) => <circle key={i} className="of-onda-tel" cx="0" cy="-12" r="8" fill="none" stroke="#FA943A" strokeWidth="1.6" style={{ animationDelay: `${i * 0.45}s` }} />)}
          </g>
        </g>
      );
    }
    case "luna": {
      const [bx, by] = iso(3.6, 1.2, 0);
      return (
        <g>
          <Caja iso={iso} x={3.3} y={0.9} w={0.7} d={0.7} alto={26} />
          <circle cx={bx} cy={by - 44} r="22" fill="url(#of-oro)" className="of-brilla" />
          <circle cx={bx} cy={by - 40} r="14" fill="#9ad0ff" stroke="#fff" strokeWidth="1.5" opacity=".92" /><ellipse cx={bx - 4} cy={by - 45} rx="4" ry="2.4" fill="#fff" opacity=".7" />
        </g>
      );
    }
    case "neville":
      return (
        <g>
          <g transform={`translate(${dx + 38},${dy - 2})`}>
            <rect x="-14" y="-8" width="28" height="14" rx="2" fill="#7a5230" stroke="#3d2813" /><rect x="-14" y="-8" width="28" height="4" fill="#FA943A" />
            {p.cuenta > 0 && [0, 1, 2].map((i) => <circle key={i} className="of-moneda" cx={-8 + i * 8} cy="-14" r="3.6" fill="#ffd25e" stroke="#b88a22" style={{ animationDelay: `${i * 0.7}s` }} />)}
          </g>
          <g transform={`translate(${tx + 90},${ty - 70})`}>
            <path d="M-12,0 L-9,18 H9 L12,0 Z" fill="#c2693b" />{[-1, 0, 1].map((k) => <ellipse key={k} cx={k * 9} cy={-14} rx="7" ry="17" fill="#3f9a5a" transform={`rotate(${k * 26} ${k * 9} 0)`} />)}
          </g>
        </g>
      );
    default: {
      const [gx, gy] = iso(3.6, 1.0, 0);
      return (
        <g>
          <ellipse cx={gx} cy={gy + 2} rx="20" ry="7" fill="rgba(0,0,0,.28)" />
          <circle cx={gx} cy={gy - 28} r="20" fill="#2f86c8" stroke="#FA943A" strokeWidth="2" /><path d={`M${gx - 12},${gy - 40} Q${gx - 2},${gy - 46} ${gx + 6},${gy - 38} Q${gx + 2},${gy - 28} ${gx - 8},${gy - 30}Z`} fill="#7bc07a" />
          <path d={`M${gx - 12},${gy} H${gx + 12} L${gx + 6},${gy - 8} H${gx - 6}Z`} fill="#7a5230" />
        </g>
      );
    }
  }
}

function Lampara() {
  const [px, py] = iso(2.4, 2.4, 138);
  return (
    <g pointerEvents="none" className="of-lampara">
      <line x1={px} y1={py - 40} x2={px} y2={py} stroke="#01222E" strokeWidth="1.4" />
      <circle cx={px} cy={py + 8} r="34" fill="url(#of-luz)" className="of-halo" />
      <path d={`M${px - 11},${py + 11} L${px - 6},${py} H${px + 6} L${px + 11},${py + 11} Z`} fill="#FA943A" stroke="#E07A1C" />
    </g>
  );
}

export default function Sala({ p, celebra, fecha, hora, noche }) {
  const [cx, y0] = iso(2.0, 2.05, 0); const cy = y0 + 4;
  const izq = { harry: <Corcho p={p} />, hermione: <Estante />, ron: <Embudo p={p} />, luna: <Calendario fecha={fecha} />, neville: <Plantas />, albus: <Mapa p={p} /> }[p.id];
  const suelo = [];
  for (let x = 0; x < N; x += 1) for (let y = 0; y < N; y += 1) suelo.push(<polygon key={`${x}${y}`} points={losa(x, y)} fill={(x + y) % 2 ? "#c9a273" : "#bf9768"} stroke="#a67c50" strokeWidth=".7" />);
  return (
    <svg viewBox="50 -42 500 412" className="of-svg" role="img" aria-label={`Oficina de ${p.nombre}, ${p.rol}`}>
      <Defs />
      <rect x="0" y="0" width="600" height="440" fill="url(#of-fondo)" />
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 -.5 0 1 0 0)`}>
        <rect x={-L} y={-ALTO} width={L} height={ALTO} fill="url(#of-muro-izq)" />
        {izq}
        <rect x={-L} y={-12} width={L} height={12} fill="#012331" />
      </g>
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 .5 0 1 0 0)`}>
        <rect x="0" y={-ALTO} width={L} height={ALTO} fill="url(#of-muro-der)" />
        <ParedDerecha p={p} hora={hora} noche={noche} />
        <rect x="0" y="-12" width={L} height="12" fill="#012331" />
      </g>
      {suelo}
      <polygon points={pts([iso(0.9, 0.9), iso(4.1, 0.9), iso(4.1, 4.1), iso(0.9, 4.1)])} fill="url(#of-alfombra)" stroke="#FA943A" strokeWidth="2.5" />
      <Suelito p={p} />
      <Escritorio ig={ig} x={1.4} y={2.0} />
      <g transform={`translate(${cx} ${cy}) scale(1.35) translate(${-cx} ${-cy})`}>
        <Mago p={p} cx={cx} cy={cy} estado={p.estado} celebra={celebra} />
        <Efectos cx={cx} cy={cy} estado={p.estado} celebra={celebra} cuenta={p.cuenta} />
      </g>
      <Lampara />
    </svg>
  );
}
