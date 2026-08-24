// src/pages/tienda/Tienda.jsx
// Tiendita de productos digitales. Los productos de pago se venden vía
// Hotmart (URL en config/tienda.js); los gratuitos enlazan a herramientas
// internas. Un producto de pago sin hotmartUrl se muestra como "Muy pronto".
import { PRODUCTOS } from "../../config/tienda";
import { navigate } from "../../services/navigate";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

function BotonProducto({ producto }) {
  // Producto interno gratuito
  if (producto.href) {
    return (
      <a
        href={producto.href}
        onClick={(e) => go(e, producto.href)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-dark"
      >
        Usar gratis →
      </a>
    );
  }
  // Producto de pago con checkout de Hotmart
  if (producto.hotmartUrl) {
    return (
      <a
        href={producto.hotmartUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent-dark"
      >
        Comprar ahora →
      </a>
    );
  }
  // Aún sin enlace de pago
  return (
    <button
      type="button"
      disabled
      className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-neutral-200 px-5 py-3 font-bold text-neutral-500"
    >
      Muy pronto
    </button>
  );
}

export default function Tienda() {
  return (
    <div className="w-full">
      <PageHero
        etiqueta="Tiendita"
        icono="libro"
        titulo="Recursos digitales para"
        destacado="avanzar por tu cuenta"
        descripcion="Guías, herramientas y accesos con compra directa e inmediata. Empieza hoy con lo que necesitas — y cuando quieras acompañamiento completo, aquí estamos."
        accesos={[
          { icono: "euro", label: "Calculadora gratis", href: "/calculadora-master" },
          { icono: "robot", label: "Asistente IA", href: "/asistente" },
          { icono: "brujula", label: "Servicios completos", href: "/servicios" },
        ]}
      />

      {/* Productos */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => (
            <div
              key={producto.id}
              className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl" aria-hidden>
                  {producto.emoji}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                  {producto.tipo}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug text-neutral-900">
                {producto.nombre}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-700">
                {producto.descripcion}
              </p>
              <div className="mt-4 text-2xl font-extrabold text-primary">
                {producto.precio || (
                  <span className="text-green-700">Gratis</span>
                )}
              </div>
              <BotonProducto producto={producto} />
            </div>
          ))}
        </div>

        {/* Nota de compra */}
        <p className="mt-10 text-center text-sm text-neutral-500">
          Los pagos se procesan de forma segura y el acceso al contenido es
          inmediato tras la compra. ¿Dudas con un producto?{" "}
          <a
            href="/reservar"
            onClick={(e) => go(e, "/reservar")}
            className="font-semibold text-primary hover:underline"
          >
            Escríbenos o reserva una asesoría
          </a>
          .
        </p>
      </div>
      <SigueExplorando destinos={["calculadora","asistente","blog","servicios"]} />
    </div>
  );
}
