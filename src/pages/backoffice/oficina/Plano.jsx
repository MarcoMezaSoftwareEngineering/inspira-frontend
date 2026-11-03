// La Oficina Inspira como un plano habitable (al estilo de Habbo): seis oficinas con su puerta, una sala
// en el medio y gente que camina. Quien tiene trabajo se queda en su mesa; quien está al día pasea por la
// sala, descansa junto al dispensador o visita otra oficina. Tú tienes tu propio avatar: toque cualquier
// casilla y camina hasta allí; si entra a una oficina, se abre la mesa de esa persona. Hedwig, en su
// percha, sale a volar cuando hay mensajes de asesorados sin leer.
import { useEffect, useMemo, useRef } from "react";
import { Caja, Defs, Efectos, Mago, Placa } from "./Personas";
import { crearIso, pts, rnd } from "./geometria";
import { DESCANSOS, MUEBLES, OFICINAS, X, Y, adorno, casa, entrada, escritorio, oficinaDe, libre, ruta } from "./planta";
import { ESTADO_TEXTO } from "./personajes";

const ig = crearIso({ W: 76, H: 38, OX: 382, OY: 170 });
const { iso } = ig;
const C = (i, j, z = 0) => iso(i + 0.5, j + 0.5, z); // centro de una casilla
const ALTO = 150;
const LDER = X * 38;
const LIZQ = Y * 38;
const NAVY = { top: "#FA943A", izq: "#0b4258", der: "#14607d" };
const YO = { id: "yo", nombre: "Tú", rol: "", color: "#013446", acento: "#FA943A", casa: "", estado: "libre", cuenta: 0 };
const IDS = [...Object.keys(OFICINAS), "yo"].map((id) => ({ id }));
const ROL = { hermione: "EXPEDIENTES", harry: "TAREAS", ron: "LEADS", luna: "AGENDA", neville: "PAGOS", albus: "DIRECCIÓN" };

/* ── Paredes ───────────────────────────────────────────────────────────────────────────────────── */
function Ventana({ x0, noche, id }) {
  return (
    <g transform={`translate(${x0},0)`}>
      <defs><clipPath id={`of-v${id}`}><path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" /></clipPath></defs>
      <path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" fill={noche ? "#1b2a5e" : "url(#of-cielo)"} />
      <g clipPath={`url(#of-v${id})`}>
        {noche ? <><circle cx="40" cy="-100" r="8" fill="#f3efd6" /><circle cx="43" cy="-102" r="7" fill="#1b2a5e" />{[8, 20, 30, 48].map((x, i) => <circle key={x} cx={x} cy={-120 + (i % 2) * 16} r="1.1" fill="#fff" className="of-estrella" style={{ animationDelay: `${i * 0.6}s` }} />)}</>
          : <><circle cx="42" cy="-102" r="8" fill="#ffe9a8" /><g className="of-nube"><ellipse cx="-30" cy="-96" rx="14" ry="5" fill="#fff" opacity=".85" /><ellipse cx="-20" cy="-100" rx="9" ry="5" fill="#fff" opacity=".85" /></g></>}
        <g fill={noche ? "#0c2a40" : "#7ea6c4"}><rect x="2" y="-72" width="10" height="20" /><rect x="14" y="-80" width="9" height="28" /><rect x="25" y="-68" width="12" height="16" /><rect x="39" y="-76" width="8" height="24" /><rect x="48" y="-66" width="8" height="14" /></g>
      </g>
      <path d="M0,-52 L0,-108 Q28,-142 56,-108 L56,-52 Z" fill="none" stroke="#FA943A" strokeWidth="4" />
      <path d="M28,-52 V-124 M0,-86 H56" stroke="#FA943A" strokeWidth="2.5" />
    </g>
  );
}

function Rotulo({ x, texto, cuenta, urgente }) {
  const w = texto.length * 7.4 + 26;
  return (
    <g transform={`translate(${x},-150)`}>
      <rect x={-w / 2} y="0" width={w} height="22" rx="5" fill="#012331" stroke={urgente ? "#FA943A" : "#88C4FC"} strokeWidth="1.6" />
      <text y="15" textAnchor="middle" fontSize="10.5" fontWeight="800" letterSpacing="1.2" fill="#fff" x={cuenta > 0 ? -6 : 0}>{texto}</text>
      {cuenta > 0 && <g><circle cx={w / 2 - 12} cy="11" r="8" fill={urgente ? "#FA943A" : "#88C4FC"} /><text x={w / 2 - 12} y="14.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#01222E">{cuenta > 99 ? "99" : cuenta}</text></g>}
    </g>
  );
}

function Paredes({ noche, tablero, personajes }) {
  const p = Object.fromEntries(personajes.map((q) => [q.id, q]));
  const libros = useMemo(() => Array.from({ length: 3 }, (_, f) => Array.from({ length: 9 }, (_, i) => ({ f, i, c: ["#8f1d2c", "#1d3f73", "#2f6b3f", "#b0831f", "#4a2a85", "#a3541a"][Math.floor(rnd(f * 9 + i) * 6)], h: 15 + rnd(f * 31 + i) * 9, w: 7 + rnd(i + f) * 3 }))).flat(), []);
  const lineas = (L, c) => Array.from({ length: 7 }, (_, i) => <line key={i} x1={c} x2={c + L} y1={-ALTO + (i + 1) * 20} y2={-ALTO + (i + 1) * 20} stroke="#012a3a" strokeWidth=".6" opacity=".5" />);
  return (
    <g>
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 -.5 0 1 0 0)`}>
        <rect x={-LIZQ} y={-ALTO} width={LIZQ} height={ALTO} fill="url(#of-muro-izq)" />
        {lineas(LIZQ, -LIZQ)}
        <Ventana x0={-308} noche={noche} id="a" /><Ventana x0={-96} noche={noche} id="b" />
        <g transform="translate(-200,-150)"><g className="of-estandarte"><path d="M0,0 H34 V70 L17,58 L0,70 Z" fill="#013446" stroke="#FA943A" strokeWidth="2" /><path d="M0,16 H34" stroke="#FA943A" strokeWidth="3" /><path d="M8,40 L26,32 L15,44 L17,52 Z" fill="#fff" /></g></g>
        <text x="-171" y="-24" textAnchor="middle" fontSize="17" fontWeight="800" letterSpacing="4.5" fill="#FA943A">INSPIRA LEGAL</text>
        <rect x={-LIZQ} y="-12" width={LIZQ} height="12" fill="#012331" />
      </g>
      <g transform={`translate(${ig.OX},${ig.OY}) matrix(1 .5 0 1 0 0)`}>
        <rect x="0" y={-ALTO} width={LDER} height={ALTO} fill="url(#of-muro-der)" />
        {lineas(LDER, 0)}
        {/* Hermione: la biblioteca */}
        <rect x="14" y="-124" width="124" height="112" fill="#6b4426" stroke="#3d2813" strokeWidth="2" />
        {[0, 1, 2].map((f) => <rect key={f} x="14" y={-90 + f * 32 - 6} width="124" height="3" fill="#8a5a33" />)}
        {libros.map((b) => <rect key={`${b.f}${b.i}`} x={19 + b.i * 13} y={-90 + b.f * 32 - 6 - b.h} width={b.w} height={b.h} rx="1" fill={b.c} />)}
        {/* Harry: el tablero con las cifras del día */}
        <rect x="166" y="-122" width="132" height="100" rx="3" fill="#bd8d5a" stroke="#7a5230" strokeWidth="4" />
        <rect x="172" y="-116" width="120" height="88" fill="#f0e2c8" />
        {tablero.map(([t, n, c, x, y]) => (
          <g key={t} transform={`translate(${x - 94},${y + 6})`}><rect width="54" height="30" fill={c} stroke="#9a8a6a" strokeWidth=".8" transform="rotate(-1.5)" /><circle cx="27" cy="1" r="2.4" fill="#FA943A" /><text x="27" y="14" textAnchor="middle" fontSize="8" fill="#3a3a3a" fontWeight="700">{t}</text><text x="27" y="26" textAnchor="middle" fontSize="13" fill="#01222E" fontWeight="800">{n}</text></g>
        ))}
        {/* Neville: ventanas */}
        <Ventana x0={322} noche={noche} id="c" /><Ventana x0={392} noche={noche} id="d" />
        <g transform="translate(152,-150)"><g className="of-estandarte"><path d="M0,0 H34 V70 L17,58 L0,70 Z" fill="#013446" stroke="#FA943A" strokeWidth="2" /><path d="M0,16 H34" stroke="#FA943A" strokeWidth="3" /></g></g>
        <Rotulo x={76} texto={ROL.hermione} cuenta={p.hermione?.cuenta} urgente={p.hermione?.estado === "urgente"} />
        <Rotulo x={228} texto={ROL.harry} cuenta={p.harry?.cuenta} urgente={p.harry?.estado === "urgente"} />
        <Rotulo x={380} texto={ROL.neville} cuenta={p.neville?.cuenta} urgente={p.neville?.estado === "urgente"} />
        <rect x="0" y="-12" width={LDER} height="12" fill="#012331" />
      </g>
    </g>
  );
}

function Suelo({ personajes }) {
  const t = [];
  for (let x = 0; x < X; x += 1) for (let y = 0; y < Y; y += 1) {
    t.push(<polygon key={`${x}-${y}`} points={pts([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)])} fill={(x + y) % 2 ? "#c9a273" : "#bf9768"} stroke="#a67c50" strokeWidth=".6" />);
  }
  const alfombras = personajes.filter((q) => OFICINAS[q.id]).map((q) => {
    const o = OFICINAS[q.id]; const y0 = o.fila === "A" ? 0.15 : 6.15; const y1 = o.fila === "A" ? 2.85 : 8.85;
    return <polygon key={q.id} points={pts([iso(o.x0 + 0.15, y0), iso(o.x0 + 3.85, y0), iso(o.x0 + 3.85, y1), iso(o.x0 + 0.15, y1)])} fill={q.color} opacity=".42" stroke="#FA943A" strokeWidth="1.2" />;
  });
  return (
    <g>
      {t}
      <polygon points={pts([iso(0.4, 3.25), iso(11.6, 3.25), iso(11.6, 5.75), iso(0.4, 5.75)])} fill="url(#of-alfombra)" opacity=".92" stroke="#FA943A" strokeWidth="2.4" />
      <polygon points={pts([iso(0.7, 3.5), iso(11.3, 3.5), iso(11.3, 5.5), iso(0.7, 5.5)])} fill="none" stroke="#88C4FC" strokeWidth="1" strokeDasharray="6 5" opacity=".6" />
      {alfombras}
    </g>
  );
}

/* ── Muebles y adornos (cada uno lleva su profundidad para ordenarse con la gente) ─────────────── */
function Mesa({ id }) {
  const [ex, ey] = escritorio(id);
  const [px, py] = iso(ex + 0.5, ey + 0.5, 30);
  return (
    <g>
      <Caja iso={iso} x={ex + 0.03} y={ey + 0.03} w={0.94} d={0.94} alto={30} />
      <g transform={`translate(${px},${py})`}>
        <polygon points="-12,2 6,-6 14,-2 -4,6" fill="#fff8e6" stroke="#c9b27a" /><line x1="-6" y1="2" x2="6" y2="-3" stroke="#9aa6b2" strokeWidth=".8" />
        <rect x="8" y="-15" width="5" height="9" rx="1.5" fill="#01222E" />
      </g>
    </g>
  );
}

function Adorno({ id }) {
  const [ax, ay] = adorno(id);
  const [px, py] = iso(ax + 0.5, ay + 0.5, 0);
  switch (id) {
    case "hermione": return <g><Caja iso={iso} x={ax + 0.05} y={ay + 0.05} w={0.9} d={0.9} alto={50} />{["#8f1d2c", "#1d3f73", "#2f6b3f"].map((c, i) => <rect key={c} x={px - 15 + i * 11} y={py - 62} width="8" height="12" fill={c} />)}</g>;
    case "harry": return <g><Caja iso={iso} x={ax + 0.05} y={ay + 0.05} w={0.9} d={0.9} alto={44} fills={{ top: "#cfdbe6", izq: "#7c92a6", der: "#9fb2c4" }} />{[0, 1, 2].map((i) => <rect key={i} x={px - 11} y={py - 32 + i * 9} width="22" height="6" rx="1" fill="#5d7387" />)}</g>;
    case "neville": return <g><path d={`M${px - 12},${py - 24} L${px - 9},${py - 4} H${px + 9} L${px + 12},${py - 24}Z`} fill="#c2693b" />{[-1, 0, 1].map((k) => <ellipse key={k} cx={px + k * 9} cy={py - 40} rx="7" ry="18" fill="#3f9a5a" transform={`rotate(${k * 26} ${px + k * 9} ${py - 26})`} />)}</g>;
    case "ron": return <g><Caja iso={iso} x={ax + 0.1} y={ay + 0.1} w={0.8} d={0.8} alto={26} /><rect x={px - 11} y={py - 40} width="22" height="11" rx="3" fill="#01222E" /><rect x={px - 13} y={py - 44} width="26" height="6" rx="3" fill="#FA943A" /></g>;
    case "luna": return <g><Caja iso={iso} x={ax + 0.1} y={ay + 0.1} w={0.8} d={0.8} alto={26} /><circle cx={px} cy={py - 46} r="17" fill="url(#of-oro)" className="of-brilla" /><circle cx={px} cy={py - 42} r="10" fill="#9ad0ff" stroke="#fff" strokeWidth="1.3" opacity=".92" /></g>;
    default: return <g><ellipse cx={px} cy={py - 2} rx="16" ry="6" fill="rgba(0,0,0,.25)" /><path d={`M${px - 10},${py - 4} H${px + 10} L${px + 5},${py - 12} H${px - 5}Z`} fill="#7a5230" /><circle cx={px} cy={py - 32} r="17" fill="#2f86c8" stroke="#FA943A" strokeWidth="2" /><path d={`M${px - 10},${py - 42} Q${px - 2},${py - 48} ${px + 5},${py - 40} Q${px + 1},${py - 31} ${px - 7},${py - 33}Z`} fill="#7bc07a" /></g>;
  }
}

function Sofa() {
  const [a] = MUEBLES.sofa;
  return (
    <g>
      <Caja iso={iso} x={a[0] + 0.05} y={a[1] + 0.05} w={1.9} d={0.9} alto={20} fills={{ top: "#FA943A", izq: "#c4661a", der: "#e07a1c" }} />
      <Caja iso={iso} x={a[0] + 0.05} y={a[1] + 0.05} w={1.9} d={0.25} alto={42} fills={{ top: "#ffb064", izq: "#c4661a", der: "#e07a1c" }} />
    </g>
  );
}

function Dispensador() {
  const [x, y] = MUEBLES.dispensador[0];
  const [px, py] = C(x, y);
  return (
    <g>
      <Caja iso={iso} x={x + 0.2} y={y + 0.2} w={0.6} d={0.6} alto={48} fills={{ top: "#e8f2f8", izq: "#9fb8c8", der: "#b9d0de" }} />
      <ellipse cx={px} cy={py - 64} rx="9" ry="4" fill="#9ad0ff" opacity=".9" /><rect x={px - 9} y={py - 64} width="18" height="14" fill="#9ad0ff" opacity=".7" />
      {[0, 1, 2].map((i) => <circle key={i} className="of-burbuja-agua" cx={px - 4 + i * 4} cy={py - 52} r="1.6" fill="#fff" style={{ animationDelay: `${i * 0.5}s` }} />)}
    </g>
  );
}

function Planta({ celda }) {
  const [px, py] = C(celda[0], celda[1]);
  return <g><path d={`M${px - 11},${py - 18} L${px - 8},${py} H${px + 8} L${px + 11},${py - 18}Z`} fill="#c2693b" />{[-1, 0, 1].map((k) => <ellipse key={k} cx={px + k * 9} cy={py - 36} rx="7" ry="18" fill="#3f9a5a" transform={`rotate(${k * 26} ${px + k * 9} ${py - 20})`} />)}</g>;
}

function Percha() {
  const [x, y] = MUEBLES.percha[0];
  const [px, py] = C(x, y);
  return (
    <g>
      <ellipse cx={px} cy={py} rx="14" ry="5" fill="rgba(0,0,0,.25)" />
      <rect x={px - 2} y={py - 60} width="4" height="60" fill="#7a5230" /><rect x={px - 15} y={py - 62} width="30" height="4" rx="2" fill="#5a381f" />
    </g>
  );
}

function Hedwig({ mensajes, onHedwig }) {
  const [px, py] = C(MUEBLES.percha[0][0], MUEBLES.percha[0][1]);
  const hay = mensajes > 0;
  return (
    <g transform={`translate(${px},${py - 66})`} className="of-hedwig-lugar">
      <g className={hay ? "of-hedwig-vuelo" : "of-hedwig-quieta"} onClick={onHedwig} role="button" tabIndex={0} style={{ cursor: "pointer" }}
        aria-label={hay ? `Hedwig, ${mensajes} mensajes de asesorados sin leer. Abrir` : "Hedwig, sin mensajes nuevos"}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHedwig(); } }}>
        <path className="of-ala" d="M-9,-2 Q-26,-18 -36,-4 Q-24,4 -9,6Z M9,-2 Q26,-18 36,-4 Q24,4 9,6Z" fill="#eef2f6" stroke="#c9d3dc" />
        <ellipse rx="10" ry="13" fill="#f8fafc" stroke="#c9d3dc" />
        <circle cx="-4" cy="-6" r="3.2" fill="#fff" /><circle cx="4" cy="-6" r="3.2" fill="#fff" />
        <g className="of-ojos-h"><circle cx="-4" cy="-6" r="1.5" fill="#f5a623" /><circle cx="4" cy="-6" r="1.5" fill="#f5a623" /></g>
        <path d="M-2,-3 L0,1 L2,-3Z" fill="#e0a43a" />
        {[0, 1, 2].map((i) => <circle key={i} cx={-3 + i * 3} cy="6" r=".9" fill="#b8c4cf" />)}
        {hay && (
          <g transform="translate(14,2)"><rect width="18" height="12" rx="1.5" fill="#fff8e6" stroke="#FA943A" strokeWidth="1.4" /><path d="M0,0 L9,7 L18,0" fill="none" stroke="#FA943A" strokeWidth="1.2" /><circle cx="18" cy="0" r="7" fill="#d23a2a" /><text x="18" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">{mensajes > 9 ? "9+" : mensajes}</text></g>
        )}
        {!hay && <text className="of-zzz" x="14" y="-14" fontSize="10" fontWeight="800" fill="#88C4FC">z z</text>}
      </g>
    </g>
  );
}

/* ── El plano ──────────────────────────────────────────────────────────────────────────────────── */
function particiones() {
  const out = [];
  const seg = (k, d, props) => out.push({ k, d, el: <Caja key={k} iso={iso} fills={NAVY} alto={34} {...props} /> });
  for (const lx of [4, 8, 12]) for (const y of [0, 1, 2, 6, 7, 8]) seg(`v${lx}-${y}`, lx + y + 0.5, { x: lx - 0.04, y, w: 0.08, d: 1 });
  for (const ly of [3, 6]) for (let x = 0; x < X; x += 1) if (!(x % 4 === 1 || x % 4 === 2)) seg(`h${ly}-${x}`, x + 0.5 + ly, { x, y: ly - 0.04, w: 1, d: 0.08 });
  return out;
}

export default function Plano({ personajes, onElegir, onHedwig, mensajes = 0, celebra = {}, tablero, noche, nombreYo = "Tú" }) {
  const mundo = useRef(null);
  const nodos = useRef({});
  const tapas = useRef({});
  const cuerpo = useRef({});
  const vivos = useRef(personajes);
  const alElegir = useRef(onElegir);
  const svgRef = useRef(null);
  useEffect(() => { vivos.current = personajes; alElegir.current = onElegir; });

  const gente = IDS;
  const estaticos = useMemo(() => {
    const lista = [...particiones()];
    for (const id of Object.keys(OFICINAS)) {
      const [ex, ey] = escritorio(id); const [ax, ay] = adorno(id);
      lista.push({ k: `m${id}`, d: ex + ey + 1, el: <Mesa key={`m${id}`} id={id} /> });
      lista.push({ k: `a${id}`, d: ax + ay + 1, el: <Adorno key={`a${id}`} id={id} /> });
    }
    lista.push({ k: "sofa", d: 3 + 4 + 1.4, el: <Sofa key="sofa" /> });
    lista.push({ k: "disp", d: 7 + 3 + 1, el: <Dispensador key="disp" /> });
    lista.push({ k: "p1", d: 11 + 3 + 1, el: <Planta key="p1" celda={MUEBLES.planta1[0]} /> });
    lista.push({ k: "p2", d: 0 + 5 + 1, el: <Planta key="p2" celda={MUEBLES.planta2[0]} /> });
    lista.push({ k: "perc", d: 7 + 5 + 1, el: <Percha key="perc" /> });
    return lista;
  }, []);

  // Movimiento: un bucle que mueve a cada personaje casilla a casilla y reordena la profundidad.
  useEffect(() => {
    const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const est = {};
    const origen = (id) => (id === "yo" ? [6, 4] : casa(id));
    for (const p of gente) { const [i, j] = origen(p.id); est[p.id] = { x: i + 0.5, y: j + 0.5, cel: [i, j], ruta: [], fase: "casa", espera: 3 + rnd(p.id.length * 7) * 8, destinoEntrada: null }; }
    cuerpo.current = est;
    let previo = performance.now(); let reloj = 0;
    const poner = (id) => {
      const e = est[id]; const g = nodos.current[id]; if (!g) return;
      const [sx, sy] = iso(e.x, e.y);
      const tr = `translate(${sx.toFixed(1)},${(sy + 4).toFixed(1)})`;
      g.setAttribute("transform", tr);
      tapas.current[id]?.setAttribute("transform", tr);
      g.dataset.d = (e.x + e.y + 0.01).toFixed(3);
    };
    gente.forEach((p) => poner(p.id));
    const ordenar = () => {
      const w = mundo.current; if (!w) return;
      const hijos = Array.from(w.children);
      const orden = hijos.map((h, i) => [Number(h.dataset.d || 0), i, h]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
      if (orden.every((h, i) => h === hijos[i])) return;
      const f = document.createDocumentFragment(); orden.forEach((h) => f.appendChild(h)); w.appendChild(f);
    };
    ordenar();

    const ahi = (id, v) => { const t = tapas.current[id]; if (t) t.dataset.ahi = v ? "1" : "0"; };
    const ir = (id, destino, fase) => {
      const e = est[id]; const r = ruta(e.cel, destino);
      if (!r.length) return false;
      e.ruta = r; e.fase = fase; return true;
    };
    let raf = 0;
    const paso = (ahora) => {
      const dt = Math.min(0.08, (ahora - previo) / 1000); previo = ahora; reloj += dt;
      for (const p of gente) {
        const e = est[p.id]; const g = nodos.current[p.id]; if (!g) continue;
        const real = vivos.current.find((q) => q.id === p.id);
        const ocupado = p.id !== "yo" && real && real.estado !== "libre";
        let camina = false;
        if (e.ruta.length) {
          if (reducir) { const t = e.ruta[e.ruta.length - 1]; e.cel = t; e.x = t[0] + 0.5; e.y = t[1] + 0.5; e.ruta = []; poner(p.id); }
          else {
            const [ti, tj] = e.ruta[0]; const tx = ti + 0.5; const ty = tj + 0.5;
            const d = Math.hypot(tx - e.x, ty - e.y); const v = 2.3 * dt;
            const dir = (tx - e.x) - (ty - e.y);
            if (Math.abs(dir) > 0.01) cuerpo.current[`flip${p.id}`] = dir < 0;
            if (d <= v) { e.x = tx; e.y = ty; e.cel = e.ruta.shift(); } else { e.x += ((tx - e.x) / d) * v; e.y += ((ty - e.y) / d) * v; }
            camina = true; poner(p.id);
          }
        }
        const flip = g.querySelector(".of-flip"); if (flip) flip.setAttribute("transform", cuerpo.current[`flip${p.id}`] ? "scale(-1 1)" : "");
        g.querySelector(".of-mago")?.setAttribute("data-camina", camina ? "1" : "0");
        if (p.id === "yo") {
          if (!e.ruta.length && e.destinoEntrada) { const id = oficinaDe(e.cel[0], e.cel[1]); e.destinoEntrada = null; if (id) alElegir.current(id); }
          continue;
        }
        if (e.ruta.length) continue;
        const [hi, hj] = casa(p.id);
        const encasa = e.cel[0] === hi && e.cel[1] === hj;
        if (ocupado) { if (!encasa) ir(p.id, [hi, hj], "volviendo"); ahi(p.id, false); continue; }
        if (e.fase === "yendo") { e.fase = "ahi"; e.espera = 3.5 + rnd(reloj + p.id.length) * 4; ahi(p.id, true); continue; }
        e.espera -= dt;
        if (e.fase === "ahi" && e.espera <= 0) { ahi(p.id, false); ir(p.id, [hi, hj], "volviendo"); continue; }
        if (e.fase === "volviendo") { e.fase = "casa"; e.espera = 5 + rnd(reloj * 3 + p.id.length) * 9; continue; }
        if (e.fase === "casa" && e.espera <= 0 && !reducir) {
          const otras = Object.keys(OFICINAS).filter((o) => o !== p.id);
          const k = rnd(reloj * 11 + p.id.length * 5);
          const dest = k < 0.55 ? DESCANSOS[Math.floor(rnd(reloj * 7 + p.id.length) * DESCANSOS.length)] : entrada(otras[Math.floor(rnd(reloj * 13 + p.id.length) * otras.length)]);
          if (!ir(p.id, dest, "yendo")) e.espera = 4;
        }
      }
      if (Math.floor(reloj * 8) !== Math.floor((reloj - dt) * 8)) ordenar();
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [gente]);

  function alTocarSuelo(ev) {
    const svg = svgRef.current; const e = cuerpo.current.yo; if (!svg || !e) return;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const m = svg.getScreenCTM(); if (!m) return;
    const s = pt.matrixTransform(m.inverse());
    const a = ((s.x - ig.OX) * 2) / ig.W; const b = ((s.y - ig.OY) * 2) / ig.H;
    const i = Math.floor((a + b) / 2); const j = Math.floor((b - a) / 2);
    if (!libre(i, j)) return;
    const r = ruta(e.cel, [i, j]);
    if (!r.length) return;
    e.ruta = r; e.destinoEntrada = oficinaDe(i, j) ? true : null;
  }

  return (
    <svg ref={svgRef} viewBox="0 0 880 592" className="of-svg" role="group" aria-label="Oficina Inspira. Toque una oficina o a una persona para ver su mesa; toque el suelo para caminar">
      <Defs />
      <rect x="0" y="0" width="880" height="600" fill="url(#of-fondo)" />
      <Paredes noche={noche} tablero={tablero} personajes={personajes} />
      <g onClick={alTocarSuelo} style={{ cursor: "pointer" }}><Suelo personajes={personajes} /></g>
      <g ref={mundo} pointerEvents="none">
        {estaticos.map((s) => <g key={s.k} data-k={s.k} data-d={s.d}>{s.el}</g>)}
        {gente.map((p) => {
          const esYo = p.id === "yo";
          const real = esYo ? { ...YO, nombre: nombreYo } : personajes.find((q) => q.id === p.id);
          if (!real) return null; const [i, j] = esYo ? [6, 4] : casa(p.id); const [sx, sy] = iso(i + 0.5, j + 0.5);
          return (
            <g key={p.id} data-id={p.id} data-d={i + j + 1} ref={(el) => { if (el) nodos.current[p.id] = el; }} transform={`translate(${sx},${sy + 4})`}
              className="of-personaje" data-estado={real.estado} data-ahi="0" pointerEvents="all"
              onClick={() => { if (!esYo) onElegir(p.id); }} role={esYo ? undefined : "button"} tabIndex={esYo ? undefined : 0}
              aria-label={esYo ? undefined : `${real.nombre}, ${real.rol}: ${ESTADO_TEXTO[real.estado]}${real.cuenta ? `, ${real.cuenta} en su mesa` : ""}. Abrir su oficina`}
              onKeyDown={(ev) => { if (!esYo && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); onElegir(p.id); } }}>
              <g className="of-flip"><Mago p={real} cx={0} cy={0} estado={real.estado} celebra={!!celebra[p.id]} caminando={false} /></g>
            </g>
          );
        })}
      </g>
      <g pointerEvents="none">
        {gente.map((p) => {
          const esYo = p.id === "yo";
          const real = esYo ? { ...YO, nombre: nombreYo } : personajes.find((q) => q.id === p.id);
          if (!real) return null;
          const [i, j] = esYo ? [6, 4] : casa(p.id); const [sx, sy] = iso(i + 0.5, j + 0.5);
          return (
            <g key={p.id} ref={(el) => { if (el) tapas.current[p.id] = el; }} transform={`translate(${sx},${sy + 4})`} data-ahi="0" className="of-tapa">
              <Efectos cx={0} cy={0} estado={real.estado} celebra={!!celebra[p.id]} cuenta={real.cuenta} />
              <Placa p={{ ...real, estado: esYo ? "libre" : real.estado }} cx={0} cy={0} cuenta={esYo ? 0 : real.cuenta} />
              <g className="of-burbuja"><rect x="-26" y="-118" width="52" height="20" rx="10" fill="#fff" stroke="#88C4FC" /><path d="M-4,-98 L0,-92 L4,-98Z" fill="#fff" stroke="#88C4FC" /><text y="-104" textAnchor="middle" fontSize="12" fill="#01222E">☕ …</text></g>
            </g>
          );
        })}
      </g>
      <Hedwig mensajes={mensajes} onHedwig={onHedwig} />
    </svg>
  );
}
