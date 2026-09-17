// Preparar un archivo antes de subirlo desde el panel del asesorado.
//
// Casi todos los documentos que nos devuelven no están mal: están mal
// entregados. Una foto de 9 MB que el servidor rechaza, diez fotos sueltas del
// pasaporte que acaban en diez archivos, un DNI con una sola cara, una foto
// movida que nadie puede leer. Todo eso se puede ver ANTES de subir, en el
// propio teléfono, y decírselo en ese momento cuesta mucho menos que
// devolvérselo días después.
//
// Aquí solo hay funciones: nada de React. La interfaz vive en
// hooks/useSubidaDocumento.js y components/mis-servicios/AvisoArchivo.jsx.
//
// Nada cambia en el servidor: le llega lo mismo que antes (un PDF o el archivo
// original), solo que mejor preparado.

/* ── Los números ──────────────────────────────────────────────────────────── */

const MB = 1024 * 1024;

/** Lo que se le pide: menos de 4 MB. Es lo que sale de escanear bien. */
export const LIMITE_PEDIDO = 4 * MB;

/**
 * El tope real del servidor para las subidas del panel (multer, 12 MB). Entre
 * 4 y 12 el servidor lo acepta y lo achica; por encima rechaza la petición, así
 * que no tiene sentido mandarla y hacerle esperar para nada.
 */
export const TOPE_SERVIDOR = 12 * MB;

/** Lado largo máximo de cada página al pasar fotos a PDF: se lee de sobra. */
const LADO_MAX = 2000;

/**
 * Escalera de compresión: se baja un peldaño solo si el PDF no entra en 4 MB.
 * Empieza generosa porque la nitidez importa más que el peso; el último peldaño
 * sigue siendo legible para un documento de texto.
 */
const PELDANOS = [
  { lado: LADO_MAX, calidad: 0.82 },
  { lado: LADO_MAX, calidad: 0.7 },
  { lado: 1600, calidad: 0.68 },
  { lado: 1280, calidad: 0.62 },
  { lado: 1000, calidad: 0.55 },
];

/**
 * Por debajo de esta varianza del laplaciano la foto se considera borrosa.
 * Se mide sobre una copia de 512 px en grises: a ese tamaño una foto nítida de
 * un documento con texto da cientos, y una movida o desenfocada se queda en
 * decenas. Se elige bajo a propósito: es un aviso, no un bloqueo, y un falso
 * «borrosa» en una hoja casi en blanco molesta más que ayuda.
 */
export const UMBRAL_BORROSA = 50;
const LADO_NITIDEZ = 512;

/* ── Utilidades ───────────────────────────────────────────────────────────── */

export function megas(bytes) {
  return `${(bytes / MB).toFixed(1).replace(".", ",")} MB`;
}

const TIPOS_IMAGEN = /^image\/(jpe?g|png|webp|heic|heif|bmp|avif)$/i;
const EXT_IMAGEN = /\.(jpe?g|png|webp|heic|heif|bmp|avif)$/i;

/** Si es una foto que podemos intentar pasar a PDF (no un GIF ni un SVG). */
export function esImagen(archivo) {
  if (!archivo) return false;
  return TIPOS_IMAGEN.test(archivo.type || "") || (!archivo.type && EXT_IMAGEN.test(archivo.name || ""));
}

export function esPdf(archivo) {
  return /pdf/i.test(archivo?.type || "") || /\.pdf$/i.test(archivo?.name || "");
}

/**
 * Si el documento suele tener más de una cara o página.
 *
 * Se lee en el nombre del ítem, su descripción y sus requisitos, que es donde
 * lo dicen los textos reales: «Pasaporte completo», «Todas las páginas, de la
 * primera a la última», «DNI … por ambas caras», «por las dos caras».
 * «completo» va como palabra entera: «la página de datos, completa» (el
 * pasaporte del máster) es una sola página y no debe avisar.
 */
export function pideVariasPaginas(texto) {
  return /ambas caras|dos caras|anverso|reverso|todas las (p[aá]ginas|hojas)|de la primera a la [uú]ltima|\bdni\b|documento nacional|\bcompleto\b/i
    .test(String(texto || ""));
}

/* ── Decodificar y dibujar ────────────────────────────────────────────────── */

/**
 * Abre la imagen con lo que tenga el navegador. Safari abre HEIC; Chrome no, y
 * entonces devuelve null y el archivo se sube tal cual, como antes.
 */
async function decodificar(archivo) {
  if (typeof createImageBitmap === "function") {
    try {
      // `from-image` respeta la orientación EXIF: sin ella, la foto vertical
      // del móvil sale tumbada en el PDF.
      const bmp = await createImageBitmap(archivo, { imageOrientation: "from-image" });
      return { fuente: bmp, ancho: bmp.width, alto: bmp.height, cerrar: () => bmp.close?.() };
    } catch { /* se prueba con <img> */ }
  }
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((resolver, rechazar) => {
      const i = new Image();
      i.onload = () => resolver(i);
      i.onerror = rechazar;
      i.src = url;
    });
    if (!img.naturalWidth) return null;
    return { fuente: img, ancho: img.naturalWidth, alto: img.naturalHeight, cerrar: () => {} };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function lienzo(img, ladoMax) {
  const escala = Math.min(1, ladoMax / Math.max(img.ancho, img.alto));
  const ancho = Math.max(1, Math.round(img.ancho * escala));
  const alto = Math.max(1, Math.round(img.alto * escala));
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  // Fondo blanco: un PNG con transparencia pasa a JPEG con el fondo negro.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(img.fuente, 0, 0, ancho, alto);
  return canvas;
}

function aJpeg(canvas, calidad) {
  return new Promise((resolver, rechazar) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { rechazar(new Error("No se pudo convertir la imagen")); return; }
      resolver(new Uint8Array(await blob.arrayBuffer()));
    }, "image/jpeg", calidad);
  });
}

/**
 * Nitidez: varianza del laplaciano sobre una copia pequeña en grises.
 * Los bordes nítidos dan saltos grandes entre píxeles vecinos; una foto movida
 * los suaviza y la varianza cae. Devuelve null si no se puede medir.
 */
export function medirNitidez(img) {
  try {
    const canvas = lienzo(img, LADO_NITIDEZ);
    const { width: w, height: h } = canvas;
    if (w < 3 || h < 3) return null;
    const datos = canvas.getContext("2d").getImageData(0, 0, w, h).data;
    const gris = new Float32Array(w * h);
    for (let i = 0, p = 0; i < gris.length; i += 1, p += 4) {
      gris[i] = 0.299 * datos[p] + 0.587 * datos[p + 1] + 0.114 * datos[p + 2];
    }
    let suma = 0;
    let suma2 = 0;
    let n = 0;
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        const lap = 4 * gris[i] - gris[i - 1] - gris[i + 1] - gris[i - w] - gris[i + w];
        suma += lap;
        suma2 += lap * lap;
        n += 1;
      }
    }
    const media = suma / n;
    return suma2 / n - media * media;
  } catch {
    return null;
  }
}

/* ── Fotos → un PDF ───────────────────────────────────────────────────────── */

function nombrePdf(archivos) {
  const base = String(archivos[0]?.name || "documento").replace(/\.[^.]+$/, "") || "documento";
  return `${base}.pdf`;
}

/**
 * Junta varias fotos en un solo PDF, una por página, bajo 4 MB si se puede.
 *
 * «Un documento, un archivo»: las diez fotos del pasaporte son un documento, y
 * el asesor necesita abrir uno, no diez.
 *
 * @returns {{ archivo: File, paginas: number, borrosas: number[] , noAbiertas: File[] }}
 */
export async function fotosAPdf(fotos) {
  const abiertas = [];
  const noAbiertas = [];
  for (const f of fotos) {
    const img = await decodificar(f);
    if (img) abiertas.push({ archivo: f, img });
    else noAbiertas.push(f);
  }
  if (!abiertas.length) return { archivo: null, paginas: 0, borrosas: [], noAbiertas };

  try {
    const borrosas = [];
    abiertas.forEach(({ img }, i) => {
      const v = medirNitidez(img);
      if (v != null && v < UMBRAL_BORROSA) borrosas.push(i + 1);
    });

    const { PDFDocument } = await import("pdf-lib");
    let bytes = null;
    for (const peldano of PELDANOS) {
      const pdf = await PDFDocument.create();
      for (const { img } of abiertas) {
        const canvas = lienzo(img, peldano.lado);
        const jpg = await pdf.embedJpg(await aJpeg(canvas, peldano.calidad));
        // Página del tamaño de un A4 por su lado largo: se imprime y se ve
        // como un escaneo, no como un póster de medio metro.
        const escala = 841.89 / Math.max(canvas.width, canvas.height);
        const ancho = canvas.width * escala;
        const alto = canvas.height * escala;
        pdf.addPage([ancho, alto]).drawImage(jpg, { x: 0, y: 0, width: ancho, height: alto });
      }
      bytes = await pdf.save();
      if (bytes.length <= LIMITE_PEDIDO) break;
    }

    const archivo = new File([bytes], nombrePdf(abiertas.map((a) => a.archivo)), { type: "application/pdf" });
    return { archivo, paginas: abiertas.length, borrosas, noAbiertas };
  } finally {
    abiertas.forEach(({ img }) => img.cerrar());
  }
}

/** Páginas de un PDF, o null si no se puede leer (cifrado, dañado…). */
export async function contarPaginasPdf(archivo) {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(await archivo.arrayBuffer(), {
      ignoreEncryption: true, updateMetadata: false,
    });
    return pdf.getPageCount();
  } catch {
    return null;
  }
}

/* ── Todo junto ───────────────────────────────────────────────────────────── */

/**
 * Prepara lo que eligió para subirlo.
 *
 * @param {File[]|FileList} entrada  lo que salió del selector, de la cámara o del arrastre
 * @param {object} opciones
 * @param {string}  opciones.texto   nombre, descripción y requisitos del documento
 * @param {boolean} opciones.varios  si ese documento admite más de un archivo
 * @param {number}  opciones.tope    bytes por encima de los cuales el servidor lo rechaza
 * @returns {Promise<{
 *   archivos: File[],
 *   avisos: {tipo: "borrosa"|"paginas"|"pesado", mensaje: string}[],
 *   bloqueo: string|null,
 *   desdeFotos: boolean,
 * }>}
 */
export async function prepararArchivos(entrada, { texto = "", varios = false, tope = TOPE_SERVIDOR, convertir = true } = {}) {
  const lista = Array.from(entrada || []).filter(Boolean);
  const avisos = [];
  if (!lista.length) return { archivos: [], avisos, bloqueo: null, desdeFotos: false };

  // `convertir: false` (firma, fotografía): las imágenes van tal cual.
  const fotos = convertir ? lista.filter(esImagen) : [];
  const resto = convertir ? lista.filter((f) => !esImagen(f)) : lista;

  const archivos = [];
  let paginasFotos = 0;
  let desdeFotos = false;

  if (fotos.length) {
    let r = null;
    try {
      // Donde caben varios archivos, cada foto es su propio documento (antes
      // subían por separado); donde cabe uno, todas van al mismo PDF.
      if (varios && fotos.length > 1) {
        const partes = [];
        for (const f of fotos) partes.push(await fotosAPdf([f]));
        r = {
          archivos: partes.map((x) => x.archivo).filter(Boolean),
          paginas: partes.reduce((t, x) => t + (x.paginas || 0), 0),
          borrosas: partes.flatMap((x, i) => (x.borrosas.length ? [i + 1] : [])),
          noAbiertas: partes.flatMap((x) => x.noAbiertas),
        };
      } else {
        r = await fotosAPdf(fotos);
      }
    } catch {
      // Si el navegador no puede con el lienzo (memoria en un móvil viejo),
      // se sube como antes: el servidor ya sabe achicar imágenes.
      r = { archivo: null, paginas: 0, borrosas: [], noAbiertas: fotos };
    }
    const hechos = r.archivos || (r.archivo ? [r.archivo] : []);
    if (hechos.length) {
      archivos.push(...hechos);
      paginasFotos = r.paginas;
      desdeFotos = true;
      if (r.borrosas.length) {
        avisos.push({
          tipo: "borrosa",
          mensaje: r.paginas > 1
            ? `La foto ${r.borrosas.join(", ")} parece borrosa. Si no se lee bien, te lo devolverán y tendrás que repetirla.`
            : "La foto parece borrosa. Si no se lee bien, te lo devolverán y tendrás que repetirla.",
        });
      }
    }
    archivos.push(...r.noAbiertas);
  }
  archivos.push(...resto);

  // Un documento, un archivo. Solo «Otros documentos», experiencia y
  // formación complementaria admiten varios.
  if (!varios && archivos.length > 1) {
    return {
      archivos, avisos, desdeFotos,
      bloqueo: "Aquí va un solo archivo con todo el documento. Si son fotos, elígelas todas "
        + "a la vez y las juntamos en un PDF; si ya tienes PDFs sueltos, únelos en uno antes de subirlo.",
    };
  }

  for (const f of archivos) {
    if (f.size > tope) {
      return {
        archivos, avisos, desdeFotos,
        bloqueo: `«${f.name}» pesa ${megas(f.size)} y no se puede subir: el límite es ${megas(tope)}. `
          + "Eso suele ser una foto o un escaneo sin comprimir. Escanéalo con la app de escaneo "
          + "de tu teléfono (o CamScanner), que lo deja por debajo de 4 MB y se lee mejor. "
          + "Si aun así no entra, escríbele a tu asesor y lo subimos nosotros.",
      };
    }
  }

  const pesados = archivos.filter((f) => f.size > LIMITE_PEDIDO);
  if (pesados.length) {
    avisos.push({
      tipo: "pesado",
      mensaje: `${pesados.length > 1 ? "Hay archivos que pesan" : `Pesa ${megas(pesados[0].size)},`} más de los 4 MB que pedimos. `
        + "Se puede subir, pero tardará más y al achicarlo puede perder nitidez. Si puedes, escanéalo de nuevo.",
    });
  }

  // La otra cara del DNI, el resto del pasaporte: lo que más se olvida.
  if (!varios && archivos.length === 1 && pideVariasPaginas(texto)) {
    const f = archivos[0];
    const paginas = desdeFotos ? paginasFotos : esPdf(f) ? await contarPaginasPdf(f) : null;
    if (paginas === 1) {
      avisos.push({
        tipo: "paginas",
        mensaje: "Este documento suele tener más de una cara o página, y tu archivo tiene solo una. "
          + "Revisa que no falte nada: la otra cara del DNI o del título, o el resto de hojas del pasaporte.",
      });
    }
  }

  return { archivos, avisos, bloqueo: null, desdeFotos };
}
