// El plano de la Oficina Inspira: una planta de 12 × 9 casillas con seis oficinas (tres contra la pared
// del fondo, tres al frente), un pasillo-sala en el medio y las puertas por donde se entra. Aquí vive
// lo que no se dibuja: qué casillas están ocupadas, qué paredes no se cruzan y cómo se llega de una
// casilla a otra (búsqueda por anchura). El dibujo y el movimiento están en Plano.jsx.
export const X = 12;
export const Y = 9;

// Cada oficina ocupa 4 × 3 casillas. Fila A: pegadas a la pared del fondo (y 0‑2). Fila B: al frente (y 6‑8).
export const OFICINAS = {
  hermione: { x0: 0, fila: "A" },
  harry: { x0: 4, fila: "A" },
  neville: { x0: 8, fila: "A" },
  ron: { x0: 0, fila: "B" },
  luna: { x0: 4, fila: "B" },
  albus: { x0: 8, fila: "B" },
};

export const casa = (id) => {
  const o = OFICINAS[id];
  return o.fila === "A" ? [o.x0 + 2, 1] : [o.x0 + 2, 7];
};
export const escritorio = (id) => {
  const o = OFICINAS[id];
  return o.fila === "A" ? [o.x0 + 1, 1] : [o.x0 + 1, 7];
};
export const adorno = (id) => {
  const o = OFICINAS[id];
  return o.fila === "A" ? [o.x0 + 3, 0] : [o.x0 + 3, 8];
};
/** La casilla de dentro, junto a la puerta: ahí «entra» quien visita la oficina. */
export const entrada = (id) => {
  const o = OFICINAS[id];
  return o.fila === "A" ? [o.x0 + 2, 2] : [o.x0 + 2, 6];
};

// Lo que hay en la sala del medio (y 3‑5). Ocupa casilla; se rodea.
export const MUEBLES = {
  sofa: [[3, 4], [4, 4]],
  dispensador: [[7, 3]],
  planta1: [[11, 3]],
  planta2: [[0, 5]],
  percha: [[7, 5]],
};

// Dónde se detiene alguien a descansar: junto al sofá, el dispensador, la percha de Hedwig…
export const DESCANSOS = [[3, 3], [4, 5], [6, 3], [8, 4], [10, 4], [1, 4], [5, 4], [9, 5]];

const ocupadas = new Set();
const marcar = (c) => ocupadas.add(`${c[0]},${c[1]}`);
Object.keys(OFICINAS).forEach((id) => { marcar(escritorio(id)); marcar(adorno(id)); });
Object.values(MUEBLES).flat().forEach(marcar);

export const libre = (x, y) => x >= 0 && y >= 0 && x < X && y < Y && !ocupadas.has(`${x},${y}`);

// Las puertas: dos casillas por oficina (la 2.ª y la 3.ª de su bloque) en las líneas y = 3 e y = 6.
const esPuerta = (x) => x % 4 === 1 || x % 4 === 2;

/** ¿Se puede pasar de la casilla a a la casilla b (vecinas)? Las divisiones entre oficinas no se cruzan. */
export function paso(ax, ay, bx, by) {
  if (!libre(bx, by)) return false;
  if (ax !== bx) {
    const linea = Math.max(ax, bx);
    if ((linea === 4 || linea === 8) && (ay <= 2 || ay >= 6)) return false;
    return true;
  }
  const linea = Math.max(ay, by);
  if ((linea === 3 || linea === 6) && !esPuerta(ax)) return false;
  return true;
}

/** Camino más corto entre dos casillas (sin la de salida), o [] si no hay. */
export function ruta(desde, hasta) {
  const [sx, sy] = desde; const [tx, ty] = hasta;
  if (sx === tx && sy === ty) return [];
  const clave = (x, y) => y * X + x;
  const prev = new Map([[clave(sx, sy), null]]);
  const cola = [[sx, sy]];
  for (let i = 0; i < cola.length; i += 1) {
    const [x, y] = cola[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx; const ny = y + dy;
      if (prev.has(clave(nx, ny)) || !paso(x, y, nx, ny)) continue;
      prev.set(clave(nx, ny), [x, y]);
      if (nx === tx && ny === ty) {
        const camino = [[nx, ny]];
        let a = [x, y];
        while (a && !(a[0] === sx && a[1] === sy)) { camino.unshift(a); a = prev.get(clave(a[0], a[1])); }
        return camino;
      }
      cola.push([nx, ny]);
    }
  }
  return [];
}

/** La oficina en la que está una casilla (o null si está en la sala o el pasillo). */
export function oficinaDe(x, y) {
  if (y >= 3 && y <= 5) return null;
  return Object.keys(OFICINAS).find((id) => {
    const o = OFICINAS[id];
    return x >= o.x0 && x < o.x0 + 4 && (o.fila === "A" ? y <= 2 : y >= 6);
  }) || null;
}
