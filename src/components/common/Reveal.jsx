import { useEffect, useRef, useState } from "react";

/**
 * Réplica del patrón [data-reveal] del mockup v4: fade-up al entrar en viewport.
 * Los estilos viven en src/styles/v4.css (.v4-home [data-reveal] / .in).
 *
 * Todos los Reveal de la página comparten un único IntersectionObserver (la
 * portada monta más de cuarenta): crear uno por elemento multiplicaba el
 * trabajo del navegador en cada scroll sin aportar nada.
 */
let observador = null;
const callbacks = new WeakMap();

function observar(el, cb) {
  if (!observador) {
    observador = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const fn = callbacks.get(entry.target);
          observador.unobserve(entry.target);
          callbacks.delete(entry.target);
          if (fn) fn();
        });
      },
      { threshold: 0.14 }
    );
  }
  callbacks.set(el, cb);
  observador.observe(el);
  return () => {
    callbacks.delete(el);
    observador.unobserve(el);
  };
}

export default function Reveal({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observar(el, () => setVisible(true));
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
