// src/pages/tienda/Tienda.jsx
// La tiendita todavía no tiene productos de pago listos para vender (ver
// config/tienda.js: solo la calculadora es gratuita, el resto sigue sin
// contenido ni entrega configurada en el backend), así que en vez de
// exponer un checkout a medio construir mostramos un adelanto de lo que
// viene y desviamos a lo que SÍ funciona hoy (calculadora gratis,
// asistente, asesoría).
import { PRODUCTOS } from "../../config/tienda";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function Tienda() {
  return (
    <div className="w-full">
      <PageHero
        etiqueta="Tiendita"
        icono="reloj"
        titulo="Estamos preparando"
        destacado="tu tiendita"
        descripcion="Muy pronto vas a poder comprar guías, ebooks y accesos con pago directo e inmediato, sin trámites. Mientras la terminamos, la calculadora gratuita y el asistente ya están disponibles."
        accesos={[
          { icono: "euro", label: "Calculadora gratis", href: "/calculadora-master" },
          { icono: "robot", label: "Asistente IA", href: "/asistente" },
          { icono: "brujula", label: "Servicios completos", href: "/servicios" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Bloque "en construcción" */}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-white sm:px-14">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-secondary">
            <Icono nombre="destello" size={26} />
          </div>
          <h2 className="relative mt-5 font-display text-2xl font-extrabold sm:text-3xl">
            En construcción
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            Estamos afinando el pago directo de cada recurso para que la
            compra sea inmediata y segura. No falta mucho.
          </p>
        </div>

        {/* Adelanto del catálogo */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => {
            const disponible = Boolean(producto.href);
            return (
              <div
                key={producto.id}
                className={`flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 ${
                  disponible ? "" : "opacity-70"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {producto.emoji}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold leading-snug text-neutral-900">
                    {producto.nombre}
                  </h3>
                  {disponible ? (
                    <a
                      href={producto.href}
                      onClick={(e) => go(e, producto.href)}
                      className="mt-2 inline-block text-xs font-extrabold uppercase tracking-wide text-primary hover:underline"
                    >
                      Ya disponible →
                    </a>
                  ) : (
                    <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                      Próximamente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <p className="mt-12 text-center text-sm text-neutral-500">
          ¿No quieres esperar? Agenda una asesoría y te ayudamos ahora mismo.
        </p>
        <div className="mt-4 flex justify-center">
          <BotonAsesoria variante="oscuro">Agenda una asesoría</BotonAsesoria>
        </div>
      </div>
      <SigueExplorando destinos={["calculadora","asistente","blog","servicios"]} />
    </div>
  );
}
