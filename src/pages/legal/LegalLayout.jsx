// src/pages/legal/LegalLayout.jsx
import { TITULAR } from "../../config/legal";

/** Shell común de los documentos legales: cabecera, versión y tipografía. */
export default function LegalLayout({ titulo, version, fecha, resumen, children }) {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
        <header className="border-b border-neutral-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {TITULAR.nombreComercial}
          </p>
          <h1 className="mt-2 font-fraunces text-3xl font-semibold text-primary sm:text-4xl">
            {titulo}
          </h1>
          <p className="mt-3 text-xs text-neutral-500">
            Versión {version} · Vigente desde el {fecha} · Titular:{" "}
            {TITULAR.razonSocial} (RUC {TITULAR.ruc})
          </p>
          {resumen && (
            <p className="mt-4 rounded-xl bg-secondary-light p-4 text-sm leading-relaxed text-neutral-700">
              {resumen}
            </p>
          )}
        </header>

        <div className="legal-prose mt-8 space-y-6 text-[15px] leading-relaxed text-neutral-700">
          {children}
        </div>
      </article>
    </main>
  );
}

/** Sección numerada reutilizable dentro de un documento legal. */
export function Seccion({ n, titulo, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-fraunces text-xl font-semibold text-primary">
        {n}. {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Tabla responsiva: nunca desborda el ancho de la página en móvil. */
export function Tabla({ cabeceras, filas }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[540px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary-light text-left">
            {cabeceras.map((h) => (
              <th
                key={h}
                className="border-b border-neutral-200 px-3 py-2.5 font-semibold text-primary"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="align-top">
              {fila.map((celda, j) => (
                <td
                  key={j}
                  className="border-b border-neutral-100 px-3 py-2.5 text-neutral-700"
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
