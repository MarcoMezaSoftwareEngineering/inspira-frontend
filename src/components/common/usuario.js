// Presentación del usuario en la cabecera.
//
// Los nombres llegan de Google tal y como los escribió la persona al abrir su
// cuenta, y en el Perú eso suele significar el nombre legal completo y en
// mayúsculas: "MARCO ALFREDO RUBEN MEZA RAMON". Volcarlo tal cual en una barra
// de 68 px de alto lo partía en cinco líneas y deformaba el nav entero.

const PARTICULAS = new Set(["de", "del", "la", "las", "lo", "los", "y", "e", "da", "das", "do", "dos", "van", "von"]);

function palabras(nombre) {
  return String(nombre).trim().split(/\s+/).filter(Boolean);
}

/**
 * "MARCO ALFREDO RUBEN MEZA RAMON" -> "Marco Alfredo Ruben Meza Ramon".
 * Solo se toca cuando viene todo en mayúsculas: si alguien ya escribió su
 * nombre con el formato correcto ("Ana McCarthy", "Juan de la Cruz"), pasarlo
 * por aquí lo estropearía.
 */
export function formatearNombre(nombre) {
  const texto = String(nombre || "").trim();
  if (!texto) return "";
  if (texto !== texto.toUpperCase()) return texto;

  return palabras(texto)
    .map((p, i) => {
      const bajo = p.toLocaleLowerCase("es");
      if (i > 0 && PARTICULAS.has(bajo)) return bajo;
      return bajo.charAt(0).toLocaleUpperCase("es") + bajo.slice(1);
    })
    .join(" ");
}

/**
 * Lo que cabe en el botón del nav: el primer nombre, y nada más. Es como se
 * dirige uno a alguien, y ocupa una línea siempre.
 */
export function nombreCorto(nombre) {
  const p = palabras(formatearNombre(nombre));
  return p[0] || "";
}

/** Primera letra del nombre y primera del último apellido. */
export function iniciales(nombre, correo) {
  const p = palabras(nombre).filter((x) => !PARTICULAS.has(x.toLocaleLowerCase("es")));
  if (p.length === 0) {
    const c = String(correo || "").trim();
    return c ? c.charAt(0).toLocaleUpperCase("es") : "U";
  }
  const primera = p[0].charAt(0);
  const ultima = p.length > 1 ? p[p.length - 1].charAt(0) : "";
  return (primera + ultima).toLocaleUpperCase("es");
}

/**
 * Google sirve la foto en el tamaño que se le pida con el sufijo `=s<px>-c`.
 * El que guardamos suele ser de 96 px; se vuelve a pedir del tamaño exacto que
 * se va a pintar (x2 por las pantallas de densidad doble).
 */
export function fotoTamano(url, px) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const lado = Math.round(px * 2);
  return url.replace(/=s\d+(-c)?$/, `=s${lado}-c`);
}

/** Todo lo que la cabecera necesita saber de quien ha entrado. */
export function datosUsuario(user) {
  const bruto = user?.nombre || user?.name || user?.nombres || "";
  const correo = user?.email || user?.email_contacto || user?.correo || "";
  return {
    nombre: formatearNombre(bruto) || "Mi cuenta",
    corto: nombreCorto(bruto) || "Mi cuenta",
    iniciales: iniciales(bruto, correo),
    correo,
    foto: user?.foto || user?.picture || user?.avatarUrl || null,
  };
}
