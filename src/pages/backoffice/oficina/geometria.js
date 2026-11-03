// Proyección isométrica 2:1 de la oficina: pantalla = ((x − y)·W/2, (x + y)·H/2 − z).
export const pts = (l) => l.map((p) => p.join(",")).join(" ");
export const rnd = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }; // «azar» estable

export function crearIso({ W, H, OX, OY }) {
  const iso = (x, y, z = 0) => [OX + (x - y) * (W / 2), OY + (x + y) * (H / 2) - z];
  const losa = (x, y) => pts([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)]);
  return { iso, losa, W, H, OX, OY };
}
