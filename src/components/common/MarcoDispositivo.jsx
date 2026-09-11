// src/components/common/MarcoDispositivo.jsx
// Marcos propios de teléfono y de navegador para las capturas del Expediente
// Digital. Colores sólidos de marca, sin transparencias. La captura ya viene
// desenfocada de origen (horneada con PIL): aquí no se aplica ningún filtro.

/**
 * @param captura  { src, ancho, alto, alt, foco } (components/common/capturasPortal.js)
 * @param mini     marco fino para miniaturas (sello, pie)
 * @param aspecto  clase de proporción de la pantalla
 * @param decorativa  true si hay texto al lado que ya lo explica (alt vacío)
 */
export function MarcoTelefono({
  captura,
  className = "",
  eager = false,
  mini = false,
  aspecto = "aspect-[9/16]",
  foco,
  decorativa = false,
}) {
  const c = captura;
  return (
    <div
      className={`relative bg-primary-dark shadow-lg ${
        mini ? "rounded-[0.8rem] p-[3px]" : "rounded-[1.9rem] p-[6px]"
      } ${className}`}
    >
      {!mini && (
        <span
          aria-hidden
          className="absolute left-1/2 top-[6px] z-10 h-[9px] w-[32%] -translate-x-1/2 rounded-b-lg bg-primary-dark"
        />
      )}
      <div className={`overflow-hidden bg-white ${mini ? "rounded-[0.6rem]" : "rounded-[1.45rem]"}`}>
        <img
          src={c.src}
          alt={decorativa ? "" : c.alt}
          width={c.ancho}
          height={c.alto}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`block w-full object-cover ${aspecto}`}
          style={{ objectPosition: foco || c.foco || "top" }}
        />
      </div>
    </div>
  );
}

export function MarcoNavegador({
  captura,
  url = "inspira-legal.cloud/panel",
  className = "",
  eager = false,
}) {
  const c = captura;
  return (
    <div className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-[#EEF3F6] px-4 py-2.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#F26B5B]" />
        <span className="h-2.5 w-2.5 rounded-full bg-sun" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4CC38A]" />
        <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-neutral-700">{url}</span>
      </div>
      <img
        src={c.src}
        alt={c.alt}
        width={c.ancho}
        height={c.alto}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
