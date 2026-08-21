import { useEffect, useRef, useState } from "react";

/**
 * Réplica del patrón [data-reveal] del mockup v4: fade-up al entrar en viewport.
 * Los estilos viven en src/styles/v4.css (.v4-home [data-reveal] / .in).
 */
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
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.14 }
    );
    io.observe(el);
    return () => io.disconnect();
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
