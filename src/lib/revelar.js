// src/lib/revelar.js
//
// Aparición al entrar en pantalla, compartida por las páginas de marca
// (/enlaces, /mapa-estudiar-en-espana, /beca-generacion-bicentenario-2026).
//
// Hasta ahora las entradas se animaban todas al cargar, con un retraso en
// cascada: lo que estaba debajo del primer pantallazo terminaba su animación
// sin que nadie lo viera, y al bajar la página aparecía ya quieta. Aquí cada
// bloque se mueve cuando de verdad le toca, que es cuando asoma.
//
// Un solo IntersectionObserver para toda la página (no uno por elemento) y sin
// dependencias. Con `prefers-reduced-motion: reduce` no se observa nada: todo
// queda visible desde el primer momento, que es lo que pide el sistema.
//
// Uso:
//   <div data-revelar>…</div>            // sube y aparece
//   <div data-revelar="escala">…</div>   // además, entra creciendo
//   <div data-revelar style={paso()}>    // en cascada dentro de un grupo
//   useRevelar(ref, [deps])              // en el componente que los contiene
//
// Detalle importante: el escondite lo pone el JavaScript, no la hoja de
// estilos. Si `data-revelar` escondiera por CSS y algo fallara antes de
// observar (un error arriba, un navegador raro, el bloqueo de un script), la
// página se quedaría en blanco. Así, lo peor que puede pasar es que no haya
// animación. Se arma en un efecto de composición (useLayoutEffect), antes de
// que el navegador pinte, para que no se vea el parpadeo de esconder.
import { useLayoutEffect } from "react";

/** ¿El sistema pide no animar? */
export function sinMovimiento() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

let observador = null;

function obtener() {
  if (observador || typeof IntersectionObserver !== "function") return observador;
  observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-visto", "1");
        pendientes.delete(e.target);
        // Una vez visto, se deja en paz: nada de volver a esconderlo al subir.
        observador.unobserve(e.target);
      });
      if (!pendientes.size) desvigilar();
    },
    // Se dispara ANTES de que el bloque asome, no despues. El margen era
    // -12%, que ENCOGE la zona de disparo: el bloque tenia que entrar un 12%
    // en pantalla para empezar a aparecer, y con el dedo rapido siempre
    // llegaba tarde. Quien baja deprisa veia el hueco en blanco antes que el
    // contenido. En positivo la zona se agranda: lo que viene justo debajo ya
    // esta revelado cuando llega a la vista. Un 60% de pantalla por delante
    // da margen al dedo mas rapido sin adelantar tanto como para que la
    // entrada se anime fuera de la vista y no la vea nadie.
    { rootMargin: "0px 0px 60% 0px", threshold: 0.01 }
  );
  return observador;
}

/**
 * Red de seguridad. El escondite lo pone el JavaScript para que un fallo deje
 * la página sin animación en vez de en blanco, pero esa promesa solo cubre lo
 * que pasa ANTES de armar: si un bloque ya está armado y el observador no
 * llega a avisar —webviews embebidas, motores con IntersectionObserver
 * caprichoso tras un salto de ancla—, se queda a opacity 0 para siempre.
 *
 * Esto enseña lo que esté armado, sin ver y a la vista, sin esperar al
 * observador. Hasta el 09/10/2026 lo hacía un temporizador que cada 400 ms
 * recorría el documento entero (querySelectorAll + getBoundingClientRect)
 * mientras quedara algo sin ver: en una página larga que nadie baja hasta el
 * final, eso era despertar al procesador dos veces y media por segundo
 * durante toda la visita. Ahora solo se mira cuando algo puede haber cambiado
 * (scroll, cambio de tamaño de la ventana o de la página) y solo la lista de
 * pendientes, sin consultar el DOM. Cuando no queda nada, se desengancha.
 */
const pendientes = new Set();
let vigilando = false;
let barriendo = false;
let tamano = null;

/** Enseña lo que esté armado, sin ver y a la vista. Devuelve cuánto queda. */
function barrer() {
  if (!pendientes.size) return 0;
  const alto = window.innerHeight || 0;
  pendientes.forEach((n) => {
    // Lo desmontado o ya visto (por el observador o por revelarTodo) sale de
    // la lista sin más.
    if (!n.isConnected || n.hasAttribute("data-visto")) {
      pendientes.delete(n);
      return;
    }
    const caja = n.getBoundingClientRect();
    // A la vista (con un margen de cortesía) y todavía escondido: se enseña.
    if (caja.top < alto + 80 && caja.bottom > -80 && (caja.width > 0 || caja.height > 0)) {
      n.setAttribute("data-visto", "1");
      pendientes.delete(n);
      if (observador) observador.unobserve(n);
    }
  });
  return pendientes.size;
}

/** Un barrido por fotograma como mucho, para no pelearse con el scroll. */
function barrerPronto() {
  if (barriendo) return;
  barriendo = true;
  requestAnimationFrame(() => {
    barriendo = false;
    if (barrer() === 0) desvigilar();
  });
}

function vigilar() {
  if (vigilando) return;
  vigilando = true;
  // Al scroll, en el acto. En WebKit el observador puede tardar en avisar —o
  // no avisar— y el bloque del mapa se veía en blanco hasta que algo volvía a
  // mirar: casi un segundo de nada en mitad de la página.
  window.addEventListener("scroll", barrerPronto, { passive: true });
  window.addEventListener("resize", barrerPronto, { passive: true });
  // Lo que entra en pantalla sin que nadie haga scroll (una lista que llega
  // de la API y empuja la página, una imagen que termina de cargar) cambia el
  // alto del documento: eso sustituye al antiguo tic de fondo.
  if (typeof ResizeObserver === "function") {
    tamano = new ResizeObserver(barrerPronto);
    tamano.observe(document.documentElement);
  }
  barrerPronto();
}

function desvigilar() {
  if (!vigilando) return;
  vigilando = false;
  window.removeEventListener("scroll", barrerPronto);
  window.removeEventListener("resize", barrerPronto);
  tamano?.disconnect();
  tamano = null;
}

/**
 * Pone a la escucha todo lo que haya marcado con data-revelar dentro de `raiz`.
 * Devuelve una función para dejar de escuchar.
 */
export function revelar(raiz) {
  // Todo lo que aún no se ha visto, esté armado o no. Antes se pedía
  // `:not([data-armado])`, y como la limpieza del efecto deja de observar
  // todos los nodos al cambiar las dependencias, los ya armados quedaban
  // fuera de esta consulta y nadie volvía a observarlos: se quedaban a
  // opacity 0 para siempre. Basta con tocar el mapa —`foco.tipo` es una de
  // las dependencias— para que el resto de la página desapareciera.
  const nodos = raiz ? Array.from(raiz.querySelectorAll("[data-revelar]:not([data-visto])")) : [];
  const obs = obtener();
  // Sin observador (navegador antiguo) o con el sistema pidiendo quietud, no se
  // arma nada: los bloques se quedan como están, a la vista.
  if (!obs || sinMovimiento()) return () => {};
  const alto = window.innerHeight || 0;
  nodos.forEach((n) => {
    n.setAttribute("data-armado", "1");
    // Lo que ya está en pantalla se da por visto sin esperar al observador.
    // En algunos navegadores (Safari, sobre todo tras un salto de ancla) la
    // primera emisión no llega y el bloque se quedaba invisible para siempre.
    const caja = n.getBoundingClientRect();
    if (caja.top < alto && caja.bottom > 0) {
      n.setAttribute("data-visto", "1");
      return;
    }
    pendientes.add(n);
    obs.observe(n);
  });
  if (pendientes.size) vigilar();
  // Al limpiar se deja de observar, pero el nodo sigue en `pendientes`: si
  // sigue montado y armado, la red de seguridad lo enseña igual (como hacía
  // el barrido del documento); si se desmontó, sale de la lista al barrer.
  return () => nodos.forEach((n) => obs.unobserve(n));
}

/**
 * Enseña de golpe todo lo que haya escondido dentro de `raiz`.
 *
 * Se usa antes de cualquier salto dentro de la página (el índice del móvil,
 * «ver el comparador», el recomendador): al saltar, los bloques por los que
 * no pasa el dedo nunca llegan a asomar y se quedaban en blanco. Una página
 * con un índice no puede depender de que se recorra entera.
 */
export function revelarTodo(raiz = document) {
  if (!raiz?.querySelectorAll) return;
  raiz.querySelectorAll("[data-revelar]:not([data-visto])").forEach((n) => {
    n.setAttribute("data-armado", "1");
    n.setAttribute("data-visto", "1");
    pendientes.delete(n);
    if (observador) observador.unobserve(n);
  });
  if (!pendientes.size) desvigilar();
}

/**
 * La versión de React: vuelve a barrer cuando cambia lo que hay dentro.
 *
 * `deps` sirve para los bloques que aparecen después (una lista que llega de la
 * API, un acordeón que se abre): al cambiar, se observan también los nuevos.
 */
export function useRevelar(ref, deps = []) {
  useLayoutEffect(() => {
    const parar = revelar(ref.current);
    return parar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Cascada dentro de un grupo: `const paso = cascada(); …style={paso()}`.
 *
 * Son milisegundos de retraso sobre la propia animación de entrada, no sobre la
 * carga de la página: el primer elemento del grupo entra en cuanto asoma y los
 * siguientes le van pisando los talones. Se corta a los 420 ms para que una
 * lista larga no termine entrando a cámara lenta.
 */
export function cascada(salto = 60, tope = 420) {
  let n = -1;
  return () => {
    n += 1;
    return { "--r": `${Math.min(n * salto, tope)}ms` };
  };
}
