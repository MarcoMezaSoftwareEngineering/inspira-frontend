// La Oficina Inspira vista desde arriba (isométrica): paredes azul marino de la marca, el rótulo,
// una ventana al cielo de Lima (de día o de noche según la hora real), un globo giratorio y un
// avioncito de papel. Cada personaje trabaja en su mesa y su estado sale de lo que Core tiene
// pendiente en esa área.
import { useMemo } from "react";
import { Defs, Efectos, Escritorio, Mago, Placa } from "./Personas";
import { crearIso, pts, rnd } from "./geometria";
import { ESTADO_TEXTO } from "./personajes";

const ig = crearIso({ W: 104, H: 52, OX: 440, OY: 120 });
const { iso, losa } = ig;
const N = 8;
const L = N * 52;
const PARED_ALTO = 156;

const avionPath = "M0,0 L34,-9 L11,5 L15,17 Z M11,5 L34,-9 L15,17";

function Ventana({ x0, noche }) {
  const estrellas = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ x: 6 + rnd(i) * 44, y: -128 + rnd(i + 40) * 66, d: rnd(i + 7) * 3 })), []);
  return (
    <g transform={`translate(${x0},0)`}>
      <defs><clipPath id={`of-vent-${x0}`}><path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" /></clipPath></defs>
      <path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" fill={noche ? "url(#of-cielo-noche)" : "url(#of-cielo)"} />
      <g clipPath={`url(#of-vent-${x0})`}>
        {noche
          ? <>{estrellas.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r="1.1" fill="#fff" className="of-estrella" style={{ animationDelay: `${e.d}s` }} />)}<circle cx="40" cy="-100" r="8" fill="#f3efd6" /><circle cx="43" cy="-102" r="7" fill="#1b2a5e" /></>
          : <><circle cx="42" cy="-102" r="8" fill="#ffe9a8" /><g className="of-nube"><ellipse cx="-30" cy="-96" rx="14" ry="5" fill="#fff" opacity=".85" /><ellipse cx="-20" cy="-100" rx="9" ry="5" fill="#fff" opacity=".85" /></g></>}
        <g fill={noche ? "#0c2a40" : "#7ea6c4"}>
          <rect x="2" y="-72" width="10" height="20" /><rect x="14" y="-80" width="9" height="28" /><rect x="25" y="-68" width="12" height="16" /><rect x="39" y="-76" width="8" height="24" /><rect x="48" y="-66" width="8" height="14" />
        </g>
        {noche && <g fill="#ffd27a" opacity=".85"><rect x="16" y="-74" width="2" height="2" /><rect x="28" y="-62" width="2" height="2" /><rect x="41" y="-70" width="2" height="2" /><rect x="5" y="-66" width="2" height="2" /></g>}
      </g>
      <path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" fill="none" stroke="#FA943A" strokeWidth="4" />
      <path d="M28,-52 V-124 M0,-86 H56" stroke="#FA943A" strokeWidth="2.5" />
    </g>
  );
}

function Estandarte({ x0 }) {
  return (
    <g transform={`translate(${x0},-150)`}>
      <g className="of-estandarte">
        <path d="M0,0 H34 V70 L17,58 L0,70 Z" fill="#013446" stroke="#FA943A" strokeWidth="2" />
        <path d="M0,16 H34" stroke="#FA943A" strokeWidth="3" />
        <path d="M8,40 L26,32 L15,44 L17,52 Z" fill="#fff" />
      </g>
    </g>
  );
}

function Reloj({ x, y, hora }) {
  const h = (hora.h % 12) + hora.m / 60; const m = hora.m;
  const man = (ang, len, ancho) => <line x1="0" y1="0" x2={Math.sin(ang) * len} y2={-Math.cos(ang) * len} stroke="#01222E" strokeWidth={ancho} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="15" fill="#fff8e6" stroke="#FA943A" strokeWidth="3" />
      {[0, 3, 6, 9].map((i) => <circle key={i} cx={Math.sin((i / 12) * 6.283) * 11.5} cy={-Math.cos((i / 12) * 6.283) * 11.5} r="1" fill="#5a6a7a" />)}
      {man((h / 12) * 6.283, 8, 2.2)}{man((m / 60) * 6.283, 11.5, 1.5)}
      <circle r="1.6" fill="#FA943A" />
    </g>
  );
}

function Paredes({ tablero, noche, hora }) {
  const libros = useMemo(() => Array.from({ length: 3 }, (_, f) => Array.from({ length: 9 }, (_, i) => ({ f, i, c: ["#8f1d2c", "#1d3f73", "#2f6b3f", "#b0831f", "#4a2a85", "#a3541a"][Math.floor(rnd(f * 9 + i) * 6)], h: 17 + rnd(f * 31 + i) * 9, w: 7 + rnd(i + f) * 3 }))).flat(), []);
  return (
    <g>
      <defs><linearGradient id="of-cielo-noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d1530" /><stop offset="100%" stopColor="#25346b" /></linearGradient></defs>
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 -.5 0 1 0 0)`}>
        <rect x={-L} y={-PARED_ALTO} width={L} height={PARED_ALTO} fill="url(#of-muro-izq)" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-L} x2={0} y1={-PARED_ALTO + (i + 1) * 19} y2={-PARED_ALTO + (i + 1) * 19} stroke="#012a3a" strokeWidth=".6" opacity=".5" />)}
        <Ventana x0={-118} noche={noche} /><Ventana x0={-290} noche={noche} />
        <Estandarte x0={-196} /><Estandarte x0={-370} />
        <text x="-168" y="-24" textAnchor="middle" fontSize="19" fontWeight="800" letterSpacing="5" fill="#FA943A" opacity=".95">INSPIRA LEGAL</text>
        <rect x={-L} y={-12} width={L} height={12} fill="#012331" />
      </g>
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 .5 0 1 0 0)`}>
        <rect x="0" y={-PARED_ALTO} width={L} height={PARED_ALTO} fill="url(#of-muro-der)" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" x2={L} y1={-PARED_ALTO + (i + 1) * 19} y2={-PARED_ALTO + (i + 1) * 19} stroke="#012a3a" strokeWidth=".6" opacity=".5" />)}
        <rect x="14" y="-132" width="126" height="132" fill="#6b4426" stroke="#3d2813" strokeWidth="2" />
        {[0, 1, 2].map((f) => <rect key={f} x="14" y={-64 + f * 36 - 36} width="126" height="3" fill="#8a5a33" />)}
        {libros.map((b) => <rect key={`${b.f}${b.i}`} x={20 + b.i * 13.2} y={-64 + b.f * 36 - 36 - b.h} width={b.w} height={b.h} rx="1" fill={b.c} opacity=".95" />)}
        <path d="M168,0 V-66 Q168,-92 196,-92 Q224,-92 224,-66 V0 Z" fill="#012331" stroke="#FA943A" strokeWidth="5" />
        <path d="M178,0 V-60 Q178,-80 196,-80 Q214,-80 214,-60 V0 Z" fill="#0b4258" />
        <circle cx="208" cy="-34" r="2.4" fill="#FA943A" />
        <Reloj x={196} y={-118} hora={hora} />
        <rect x="256" y="-126" width="140" height="92" rx="3" fill="#bd8d5a" stroke="#7a5230" strokeWidth="4" />
        <rect x="262" y="-120" width="128" height="80" fill="#f0e2c8" />
        {tablero.map(([t, n, c, x, y]) => (
          <g key={t} transform={`translate(${x},${y})`}><rect width="56" height="30" fill={c} stroke="#9a8a6a" strokeWidth=".8" transform="rotate(-1.5)" /><circle cx="28" cy="1" r="2.4" fill="#FA943A" /><text x="28" y="14" textAnchor="middle" fontSize="8" fill="#3a3a3a" fontWeight="700">{t}</text><text x="28" y="26" textAnchor="middle" fontSize="13" fill="#01222E" fontWeight="800">{n}</text></g>
        ))}
        <Estandarte x0={150} />
        <rect x="0" y="-12" width={L} height="12" fill="#012331" />
      </g>
    </g>
  );
}

function Suelo() {
  const t = [];
  for (let x = 0; x < N; x += 1) for (let y = 0; y < N; y += 1) {
    t.push(<polygon key={`${x}-${y}`} points={losa(x, y)} fill={(x + y) % 2 ? "#c9a273" : "#bf9768"} stroke="#a67c50" strokeWidth=".7" />);
  }
  const [rx, ry] = iso(4.1, 4.1);
  return (
    <g>
      {t}
      <polygon points={pts([iso(2.3, 2.3), iso(5.9, 2.3), iso(5.9, 5.9), iso(2.3, 5.9)])} fill="url(#of-alfombra)" stroke="#FA943A" strokeWidth="3" />
      <polygon points={pts([iso(2.6, 2.6), iso(5.6, 2.6), iso(5.6, 5.6), iso(2.6, 5.6)])} fill="none" stroke="#88C4FC" strokeWidth="1.2" strokeDasharray="5 4" opacity=".7" />
      <g transform={`translate(${rx},${ry})`} opacity=".7"><ellipse rx="34" ry="17" fill="none" stroke="#FA943A" strokeWidth="1.6" /><path d="M0,-12 L9,0 L0,12 L-9,0 Z" fill="none" stroke="#FA943A" strokeWidth="1.4" /></g>
    </g>
  );
}

function Rayos() {
  const rayo = (k, a, b, c, d) => <polygon key={k} points={pts([iso(...a), iso(...b), iso(...c), iso(...d)])} fill="url(#of-rayo)" className="of-rayo" />;
  return <g pointerEvents="none">{rayo(1, [0, 0.9], [0, 2.1], [3.4, 5.5], [2.2, 4.3])}{rayo(2, [0, 4.2], [0, 5.4], [2.6, 7.6], [1.6, 6.5])}</g>;
}

function Polvo() {
  const m = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ p: iso(0.5 + rnd(i) * 7, 0.5 + rnd(i + 50) * 7, 20 + rnd(i + 90) * 110), r: 0.9 + rnd(i + 3) * 1.4, d: rnd(i + 11) * 6, t: 7 + rnd(i + 21) * 7 })), []);
  return <g pointerEvents="none">{m.map((o, i) => <circle key={i} className="of-polvo" cx={o.p[0]} cy={o.p[1]} r={o.r} fill="#fff6d8" style={{ animationDelay: `${o.d}s`, animationDuration: `${o.t}s` }} />)}</g>;
}

function Lamparas() {
  const v = [[1.1, 1.3], [3.0, 3.7], [5.6, 1.1], [6.2, 5.3], [2.1, 6.4], [4.2, 0.9]];
  return (
    <g pointerEvents="none">
      {v.map(([x, y], i) => {
        const [px, py] = iso(x, y, 150);
        return (
          <g key={i} className="of-lampara" style={{ animationDelay: `${i * 0.7}s` }}>
            <line x1={px} y1={py - 60} x2={px} y2={py} stroke="#01222E" strokeWidth="1.4" />
            <circle cx={px} cy={py + 8} r="30" fill="url(#of-luz)" className="of-halo" />
            <path d={`M${px - 10},${py + 10} L${px - 5},${py} H${px + 5} L${px + 10},${py + 10} Z`} fill="#FA943A" stroke="#E07A1C" strokeWidth="1" />
            <ellipse cx={px} cy={py + 10} rx="10" ry="2.6" fill="#fff3c8" />
          </g>
        );
      })}
    </g>
  );
}

function Globo() {
  const [x, y] = iso(7.3, 4.0, 0);
  return (
    <g>
      <ellipse cx={x} cy={y + 4} rx="22" ry="8" fill="rgba(0,0,0,.28)" />
      <path d={`M${x - 14},${y + 2} H${x + 14} L${x + 8},${y - 8} H${x - 8} Z`} fill="#7a5230" />
      <defs><clipPath id="of-esfera"><circle cx={x} cy={y - 30} r="22" /></clipPath></defs>
      <circle cx={x} cy={y - 30} r="22" fill="#2f86c8" />
      <g clipPath="url(#of-esfera)">
        <g className="of-globo">
          {[0, 60, 120].map((d) => <g key={d} transform={`translate(${x - 30 + d},${y - 30})`} fill="#7bc07a"><path d="M0,-12 Q10,-18 18,-8 Q22,2 12,6 Q2,10 -2,0 Z" /><path d="M30,0 Q38,-6 44,2 Q42,12 34,12 Q28,8 30,0 Z" /></g>)}
        </g>
        <circle cx={x} cy={y - 30} r="22" fill="none" stroke="rgba(1,34,46,.35)" strokeWidth="9" />
      </g>
      <circle cx={x} cy={y - 30} r="22" fill="none" stroke="#FA943A" strokeWidth="2" />
      <path d={`M${x - 22},${y - 30} A22,22 0 0 0 ${x + 22},${y - 30}`} fill="none" stroke="#FA943A" strokeWidth="2.5" opacity="0" />
    </g>
  );
}

function Avioncito({ vuelo }) {
  return (
    <g pointerEvents="none">
      <g transform="translate(70,150)"><g className="of-avion"><path d={avionPath} fill="#fff" stroke="#88C4FC" strokeWidth="1.4" strokeLinejoin="round" /></g></g>
      {vuelo > 0 && <g key={vuelo} transform="translate(180,170)"><g className="of-avion-fiesta"><path d={avionPath} fill="#FA943A" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></g></g>}
    </g>
  );
}

function Personaje({ p, elegido, celebra, onElegir }) {
  const [cx, y0] = iso(p.celda[0], p.celda[1], 0); const cy = y0 + 4;
  const sel = [iso(p.celda[0] - 0.9, p.celda[1] - 0.8), iso(p.celda[0] + 1.3, p.celda[1] - 0.8), iso(p.celda[0] + 1.3, p.celda[1] + 1.3), iso(p.celda[0] - 0.9, p.celda[1] + 1.3)];
  return (
    <g className="of-personaje" data-estado={p.estado} onClick={() => onElegir(p.id)} role="button" tabIndex={0}
      aria-label={`${p.nombre}, ${p.rol}: ${ESTADO_TEXTO[p.estado]}${p.cuenta ? `, ${p.cuenta} en su mesa` : ""}. Abrir su oficina`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onElegir(p.id); } }}>
      <Escritorio ig={ig} x={p.celda[0] - 0.6} y={p.celda[1] - 0.1} />
      {elegido && <polygon points={pts(sel)} fill="rgba(250,148,58,.1)" stroke="#FA943A" strokeWidth="2.4" strokeDasharray="8 6" className="of-seleccion" />}
      <Mago p={p} cx={cx} cy={cy} estado={p.estado} celebra={celebra} />
      <Efectos cx={cx} cy={cy} estado={p.estado} celebra={celebra} cuenta={p.cuenta} />
    </g>
  );
}

/** `personajes`: [{...definición, estado, cuenta}]; `tablero`: [[título, n, color, x, y]]; `hora`: {h, m} de Lima. */
export default function Escena({ personajes, elegido, onElegir, celebra = {}, vuelo = 0, tablero, hora, noche }) {
  const orden = useMemo(() => [...personajes].sort((a, b) => (a.celda[0] + a.celda[1]) - (b.celda[0] + b.celda[1])), [personajes]);
  return (
    <svg viewBox="10 -50 860 600" className="of-svg" role="group" aria-label="Oficina Inspira: cada personaje atiende un área; toque uno para entrar a su oficina">
      <Defs />
      <rect x="0" y="0" width="880" height="580" fill="url(#of-fondo)" />
      <Paredes tablero={tablero} noche={noche} hora={hora} />
      <Suelo />
      <Rayos />
      <Globo />
      {orden.map((p) => <Personaje key={p.id} p={p} elegido={elegido === p.id} celebra={!!celebra[p.id]} onElegir={onElegir} />)}
      {orden.map((p) => { const [lx, ly] = iso(p.celda[0], p.celda[1], 0); return <Placa key={`n${p.id}`} p={p} cx={lx} cy={ly} cuenta={p.cuenta} />; })}
      <Polvo /><Lamparas /><Avioncito vuelo={vuelo} />
    </svg>
  );
}
