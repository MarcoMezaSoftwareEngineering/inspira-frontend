import { useEffect, useRef, useState } from "react";
import { useHidratando } from "../../lib/hidratacion";

/**
 * Réplica del patrón [data-reveal] del mockup v4: fade-up al entrar en viewport.
 * Los estilos viven en src/styles/v4.css (.v4-home [data-reveal] / .in).
 *
 * Todos los Reveal de la página comparten un único IntersectionObserver (la
 * portada monta más de cuarenta): crear uno por elemento multiplicaba el
 * trabajo del navegador en cada scroll sin aportar nada.
 *
 * En la portada prerenderizada (scripts/prerender.mjs, 09/10/2026) todo llega
 * ya visible (.in) en el HTML: el H1 se pinta sin esperar al JavaScript y la
 * página se lee entera aunque el JavaScript tarde o falle. Al hidratar, lo que
 * está a la vista, aunque solo asome, o ya quedó atrás se queda como está, y
 * lo de más abajo, que nadie ve todavía, se esconde para que entre animado al
 * asomar, como siempre. Lo decide el primer aviso del observador, que llega
 * con la posición de cada bloque: sin medir nada a mano.
 */
let observador = null;
const callbacks = new WeakMap();

function dejarDeObservar(el) {
  callbacks.delete(el);
  observador.unobserve(el);
}

/**
 * @param {Function} alAsomar        El bloque entra en pantalla: se revela.
 * @param {Function} [alEmpezarAbajo] Solo los que llegaron pintados: el primer
 *                                    aviso dice que están por debajo de la vista.
 */
function observar(el, alAsomar, alEmpezarAbajo) {
  if (!observador) {
    observador = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const registro = callbacks.get(entry.target);
          if (!registro) return;
          if (entry.isIntersecting) {
            dejarDeObservar(entry.target);
            registro.alAsomar();
            return;
          }
          // Sin llegar al umbral. Solo cuenta para lo que llegó pintado, y solo
          // el primer aviso (cómo estaba al hidratar). Se mira la posición y
          // no el umbral: un bloque que asoma un 13 % no llega al 14 % y, si
          // se escondiera, desaparecería un trozo que ya se está viendo.
          const alEmpezarAbajo = registro.alEmpezarAbajo;
          registro.alEmpezarAbajo = null;
          if (!alEmpezarAbajo) return;
          const bordeInferior = entry.rootBounds ? entry.rootBounds.bottom : window.innerHeight;
          if (entry.boundingClientRect.top < bordeInferior) dejarDeObservar(entry.target);
          else alEmpezarAbajo();
        });
      },
      { threshold: 0.14 }
    );
  }
  callbacks.set(el, { alAsomar, alEmpezarAbajo });
  observador.observe(el);
  return () => dejarDeObservar(el);
}

export default function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  style,
  ...rest
}) {
  const Tag = as;
  const ref = useRef(null);
  const hidratando = useHidratando();
  const [visible, setVisible] = useState(hidratando);
  const llegoPintado = useRef(hidratando);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const alEmpezarAbajo = llegoPintado.current ? () => setVisible(false) : undefined;
    return observar(el, () => setVisible(true), alEmpezarAbajo);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={`${className}${visible ? " in" : ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
