// Piezas comunes de la Oficina Inspira: los degradados de la marca y los personajes. Dibujado todo
// en SVG con formas propias (nada de imágenes de películas). La proyección vive en geometria.js.
import { pts } from "./geometria";

export function Caja({ iso, x, y, w = 1, d = 1, alto = 28, z = 0, fills = null }) {
  const a = iso(x, y, z); const b = iso(x + w, y, z); const c = iso(x + w, y + d, z); const e = iso(x, y + d, z);
  const up = (p) => [p[0], p[1] - alto];
  return (
    <g>
      <polygon points={pts([e, c, up(c), up(e)])} fill={fills?.izq || "url(#of-madera-izq)"} />
      <polygon points={pts([b, c, up(c), up(b)])} fill={fills?.der || "url(#of-madera-der)"} />
      <polygon points={pts([up(a), up(b), up(c), up(e)])} fill={fills?.top || "url(#of-madera-top)"} />
    </g>
  );
}

export function Defs() {
  return (
    <defs>
      <radialGradient id="of-fondo" cx="50%" cy="25%"><stop offset="0%" stopColor="#0f4a63" /><stop offset="100%" stopColor="#01222E" /></radialGradient>
      <linearGradient id="of-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5fb0f0" /><stop offset="100%" stopColor="#cfe8fb" /></linearGradient>
      <linearGradient id="of-muro-izq" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0b4258" /><stop offset="100%" stopColor="#14607d" /></linearGradient>
      <linearGradient id="of-muro-der" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a6e8c" /><stop offset="100%" stopColor="#0f536c" /></linearGradient>
      <linearGradient id="of-madera-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d7ab78" /><stop offset="100%" stopColor="#bd8d5a" /></linearGradient>
      <linearGradient id="of-madera-izq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9b6c40" /><stop offset="100%" stopColor="#7a5230" /></linearGradient>
      <linearGradient id="of-madera-der" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ad7c4d" /><stop offset="100%" stopColor="#855a36" /></linearGradient>
      <radialGradient id="of-luz"><stop offset="0%" stopColor="#ffe2a8" stopOpacity=".95" /><stop offset="40%" stopColor="#ffbd66" stopOpacity=".35" /><stop offset="100%" stopColor="#ffbd66" stopOpacity="0" /></radialGradient>
      <radialGradient id="of-oro"><stop offset="0%" stopColor="#ffe8a3" stopOpacity=".9" /><stop offset="100%" stopColor="#ffd25e" stopOpacity="0" /></radialGradient>
      <linearGradient id="of-rayo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff3d0" stopOpacity=".3" /><stop offset="100%" stopColor="#fff3d0" stopOpacity="0" /></linearGradient>
      <radialGradient id="of-piel" cx="40%" cy="35%"><stop offset="0%" stopColor="#ffdcbd" /><stop offset="100%" stopColor="#e9b58f" /></radialGradient>
      <linearGradient id="of-alfombra" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#12556f" /><stop offset="100%" stopColor="#0a3a4d" /></linearGradient>
      <filter id="of-brillo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
  );
}

/* ── Personajes ────────────────────────────────────────────────────────────────────────────────── */
const PELO = { yo: "#3b2a22", hermione: "#6b4426", harry: "#1c1816", ron: "#c8561a", luna: "#efe0a8", neville: "#6a4a30", albus: "#ece8df" };

function Pelo({ id, cx, cy }) {
  const c = PELO[id] || "#333";
  switch (id) {
    case "hermione": return (<g fill={c}><path d={`M${cx - 15},${cy - 46} Q${cx - 24},${cy - 64} ${cx - 8},${cy - 72} Q${cx},${cy - 78} ${cx + 10},${cy - 72} Q${cx + 26},${cy - 62} ${cx + 15},${cy - 46} Q${cx},${cy - 60} ${cx - 15},${cy - 46}Z`} /><circle cx={cx - 17} cy={cy - 52} r="6" /><circle cx={cx + 17} cy={cy - 52} r="6" /><circle cx={cx} cy={cy - 74} r="7" /></g>);
    case "harry": return (<g fill={c}><path d={`M${cx - 14},${cy - 50} Q${cx - 14},${cy - 70} ${cx},${cy - 70} Q${cx + 14},${cy - 70} ${cx + 14},${cy - 50} Q${cx + 2},${cy - 60} ${cx - 14},${cy - 50}Z`} /><path d={`M${cx - 6},${cy - 69} l-6,-5 l9,2 l-2,-7 l7,6 l5,-5 l2,8Z`} /></g>);
    case "ron": return (<g fill={c}><path d={`M${cx - 14},${cy - 48} Q${cx - 16},${cy - 70} ${cx},${cy - 71} Q${cx + 16},${cy - 70} ${cx + 14},${cy - 48} Q${cx},${cy - 60} ${cx - 14},${cy - 48}Z`} /><circle cx={cx - 8} cy={cy - 70} r="5" /><circle cx={cx + 7} cy={cy - 71} r="5" /></g>);
    case "luna": return (<g fill={c}><path d={`M${cx - 15},${cy - 46} Q${cx - 18},${cy - 72} ${cx},${cy - 72} Q${cx + 18},${cy - 72} ${cx + 15},${cy - 46} L${cx + 17},${cy - 18} Q${cx + 9},${cy - 22} ${cx + 8},${cy - 46} Q${cx},${cy - 58} ${cx - 8},${cy - 46} Q${cx - 9},${cy - 22} ${cx - 17},${cy - 18}Z`} /></g>);
    case "yo": return (<g fill={c}><path d={`M${cx - 15},${cy - 46} Q${cx - 18},${cy - 72} ${cx},${cy - 72} Q${cx + 18},${cy - 72} ${cx + 15},${cy - 46} L${cx + 14},${cy - 30} Q${cx + 9},${cy - 34} ${cx + 8},${cy - 46} Q${cx},${cy - 58} ${cx - 8},${cy - 46} Q${cx - 9},${cy - 34} ${cx - 14},${cy - 30}Z`} /></g>);
    case "neville": return (<g fill={c}><path d={`M${cx - 14},${cy - 49} Q${cx - 14},${cy - 68} ${cx},${cy - 68} Q${cx + 14},${cy - 68} ${cx + 14},${cy - 49} Q${cx},${cy - 58} ${cx - 14},${cy - 49}Z`} /></g>);
    default: return null;
  }
}

export function Mago({ p, cx, cy, estado, celebra, caminando = false }) {
  const c = p.color; const trabajando = estado === "trabajando"; const urgente = estado === "urgente";
  const bufanda = p.casa === "Gryffindor";
  return (
    <g className="of-mago" data-estado={estado} data-celebra={celebra ? "1" : "0"} data-camina={caminando ? "1" : "0"}>
      <ellipse cx={cx} cy={cy + 3} rx="21" ry="7.5" fill="rgba(0,0,0,.3)" />
      <g className="of-cuerpo">
        <ellipse cx={cx - 7} cy={cy + 1} rx="6" ry="3" fill="#1a1218" /><ellipse cx={cx + 7} cy={cy + 1} rx="6" ry="3" fill="#1a1218" />
        <path d={`M${cx - 15},${cy - 38} Q${cx - 21},${cy - 12} ${cx - 19},${cy - 1} L${cx + 19},${cy - 1} Q${cx + 21},${cy - 12} ${cx + 15},${cy - 38} Q${cx},${cy - 44} ${cx - 15},${cy - 38}Z`} fill={c} />
        <path d={`M${cx - 19},${cy - 8} Q${cx},${cy - 2} ${cx + 19},${cy - 8} L${cx + 19},${cy - 1} L${cx - 19},${cy - 1}Z`} fill="rgba(0,0,0,.28)" />
        <path d={`M${cx - 15},${cy - 38} Q${cx - 7},${cy - 20} ${cx - 8},${cy - 3} L${cx - 19},${cy - 1} Q${cx - 21},${cy - 12} ${cx - 15},${cy - 38}Z`} fill="rgba(255,255,255,.1)" />
        <path d={`M${cx},${cy - 40} V${cy - 1}`} stroke="rgba(0,0,0,.25)" strokeWidth="1.4" />
        <path d={`M${cx - 15},${cy - 38} Q${cx},${cy - 44} ${cx + 15},${cy - 38}`} fill="none" stroke={p.acento} strokeWidth="2.2" />
        <g className="of-brazo-izq" style={{ transformOrigin: `${cx - 14}px ${cy - 36}px`, transformBox: "view-box" }}><path d={`M${cx - 14},${cy - 37} L${cx - 22},${cy - 18}`} stroke={c} strokeWidth="7" strokeLinecap="round" /><circle cx={cx - 22} cy={cy - 16} r="3.4" fill="#f0c7a3" /></g>
        <g className="of-brazo-der" style={{ transformOrigin: `${cx + 14}px ${cy - 36}px`, transformBox: "view-box" }}>
          <path d={`M${cx + 14},${cy - 37} L${cx + 22},${cy - 18}`} stroke={c} strokeWidth="7" strokeLinecap="round" /><circle cx={cx + 22} cy={cy - 16} r="3.4" fill="#f0c7a3" />
          <line x1={cx + 22} y1={cy - 16} x2={cx + 34} y2={cy - 30} stroke="#5a3a1c" strokeWidth="2.2" strokeLinecap="round" />
          <circle className="of-punta" cx={cx + 34} cy={cy - 30} r={trabajando || celebra ? 3.6 : 2} fill="#fff3b0" filter="url(#of-brillo)" />
        </g>
        {bufanda && <g><rect x={cx - 11} y={cy - 44} width="22" height="7" rx="3" fill="#a3182a" /><rect x={cx - 11} y={cy - 42} width="22" height="1.8" fill="#eeba30" /></g>}
        <g className="of-cabeza">
          <circle cx={cx} cy={cy - 52} r="12.5" fill="url(#of-piel)" />
          {p.id === "albus" && <path d={`M${cx - 13},${cy - 50} Q${cx - 18},${cy - 22} ${cx},${cy - 14} Q${cx + 18},${cy - 22} ${cx + 13},${cy - 50} Q${cx},${cy - 38} ${cx - 13},${cy - 50}Z`} fill={PELO.albus} />}
          <Pelo id={p.id} cx={cx} cy={cy} />
          {p.id === "albus" && <g><path d={`M${cx - 20},${cy - 60} Q${cx},${cy - 66} ${cx + 20},${cy - 60} L${cx + 6},${cy - 92} Q${cx},${cy - 96} ${cx - 6},${cy - 92}Z`} fill="#3a1f66" /><rect x={cx - 21} y={cy - 63} width="42" height="5" rx="2.5" fill="#2a1650" /><circle cx={cx} cy={cy - 80} r="2.2" fill="#e8d9a8" /></g>}
          <g className="of-ojos"><ellipse cx={cx - 4.6} cy={cy - 52} rx="1.9" ry="2.4" fill="#2a1d18" /><ellipse cx={cx + 4.6} cy={cy - 52} rx="1.9" ry="2.4" fill="#2a1d18" /></g>
          {(p.id === "harry" || p.id === "albus") && <g fill="none" stroke={p.id === "harry" ? "#111" : "#c9a85c"} strokeWidth="1.5"><circle cx={cx - 4.6} cy={cy - 52} r="4.2" /><circle cx={cx + 4.6} cy={cy - 52} r="4.2" /><line x1={cx - 0.4} y1={cy - 52} x2={cx + 0.4} y2={cy - 52} /></g>}
          {p.id === "harry" && <path d={`M${cx + 2},${cy - 60} l2.4,3.4 l-3.2,0 l2.2,3.4`} stroke="#b01a1a" strokeWidth="1.1" fill="none" />}
          <path d={urgente ? `M${cx - 1.6},${cy - 46} a1.6,1.6 0 1 0 3.2,0 a1.6,1.6 0 1 0 -3.2,0` : `M${cx - 3.6},${cy - 46.5} Q${cx},${cy - 43} ${cx + 3.6},${cy - 46.5}`} stroke="#8a4a3a" strokeWidth="1.3" fill={urgente ? "#8a4a3a" : "none"} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** Lo que el personaje hace según su estado real: escribe, avisa con un aro y número, o celebra. */
export function Efectos({ cx, cy, estado, celebra, cuenta }) {
  const top = cy - 98;
  return (
    <g pointerEvents="none">
      {estado === "trabajando" && (
        <g>
          <g className="of-pergamino" transform={`translate(${cx - 40},${cy - 78})`}><rect width="24" height="30" rx="2" fill="#fff8e6" stroke="#c9b27a" />{[0, 1, 2, 3].map((i) => <line key={i} className="of-renglon" x1="4" x2={20 - (i % 2) * 5} y1={7 + i * 6} y2={7 + i * 6} stroke="#5a6a7a" strokeWidth="1.3" strokeLinecap="round" style={{ animationDelay: `${i * 0.45}s` }} />)}</g>
          <g className="of-pluma" transform={`translate(${cx - 20},${cy - 70})`}><path d="M0,10 L10,-6 Q14,-12 20,-10 Q16,-4 12,0 Z" fill="#fff" stroke="#FA943A" strokeWidth="1.2" /><circle cx="0" cy="10" r="1.6" fill="#FA943A" filter="url(#of-brillo)" /></g>
          {[0, 1, 2].map((i) => <circle key={i} className="of-chispa" cx={cx + 30 + i * 3} cy={cy - 34 - i * 4} r="1.8" fill="#bfe0ff" filter="url(#of-brillo)" style={{ animationDelay: `${i * 0.3}s` }} />)}
        </g>
      )}
      {estado === "urgente" && (
        <g className="of-pide">
          <circle cx={cx} cy={top - 4} r="22" fill="url(#of-oro)" className="of-aro" />
          <g transform={`translate(${cx},${top - 4})`}>
            <circle r="12" fill="#FA943A" stroke="#fff4e0" strokeWidth="2" />
            <text textAnchor="middle" y="5" fontSize={cuenta > 9 ? 11 : 14} fontWeight="800" fill="#2b1500">{cuenta > 9 ? "9+" : cuenta}</text>
          </g>
        </g>
      )}
      {celebra && (
        <g>
          <circle cx={cx} cy={cy - 40} r="30" fill="url(#of-oro)" className="of-onda" />
          {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return (
            <g key={i} transform={`translate(${cx},${cy - 46})`}><path className="of-fiesta" d="M0,-6 L1.8,-1.8 L6,0 L1.8,1.8 L0,6 L-1.8,1.8 L-6,0 L-1.8,-1.8Z" fill="#ffe08a" style={{ "--dx": `${Math.cos(a) * 46}px`, "--dy": `${Math.sin(a) * 38}px` }} /></g>
          ); })}
          <g transform={`translate(${cx},${top - 6})`}><circle r="12" fill="#14502f" stroke="#7ee0a6" strokeWidth="2" /><path d="M-5,0 L-1.5,4 L5.5,-4" stroke="#d4ffe4" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
        </g>
      )}
    </g>
  );
}

export function Escritorio({ ig, x, y }) {
  const [px, py] = ig.iso(x + 0.75, y + 0.3, 30);
  return (
    <g>
      <Caja iso={ig.iso} x={x} y={y} w={1.4} d={0.95} alto={30} />
      <g transform={`translate(${px},${py})`}>
        <polygon points="-12,2 6,-6 14,-2 -4,6" fill="#fff8e6" stroke="#c9b27a" /><line x1="-6" y1="2" x2="6" y2="-3" stroke="#9aa6b2" strokeWidth=".8" />
        <rect x="14" y="-12" width="5" height="9" rx="1.5" fill="#01222E" /><path d="M16.5,-12 q6,-8 11,-14" stroke="#fff" strokeWidth="1.2" fill="none" />
      </g>
    </g>
  );
}

/** Placa con el nombre, el rol y cuántas cosas tiene en la mesa. */
export function Placa({ p, cx, cy, cuenta }) {
  const texto = p.nombre; const w = texto.length * 8 + 26 + (cuenta > 0 ? 24 : 0);
  return (
    <g pointerEvents="none" className="of-placa" data-estado={p.estado}>
      <rect x={cx - w / 2} y={cy + 20} width={w} height="19" rx="9.5" fill="rgba(1,34,46,.88)" stroke={p.estado === "urgente" ? "#FA943A" : "#88C4FC"} strokeWidth="1.2" />
      <circle cx={cx - w / 2 + 9} cy={cy + 29.5} r="3.2" fill={p.color} />
      <text x={cx - (cuenta > 0 ? 8 : -4)} y={cy + 33.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#f4f8fb">{texto}</text>
      {cuenta > 0 && (
        <g><circle cx={cx + w / 2 - 14} cy={cy + 29.5} r="8" fill={p.estado === "urgente" ? "#FA943A" : "#88C4FC"} /><text x={cx + w / 2 - 14} y={cy + 33.2} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#01222E">{cuenta > 99 ? "99" : cuenta}</text></g>
      )}
    </g>
  );
}
