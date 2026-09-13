// src/pages/tienda/Tienda.jsx
// Tiendita de productos digitales, con compra real.
//
// Vuelve el grid de compra (12/09/2026: el cliente quiere empezar a vender).
// Estuvo sustituido por un «en construcción» desde el 25/08/2026 por una
// pantalla en blanco: el archivo usaba CALENDLY_URL sin importarlo. Ya va
// importado.
//
// Qué se puede comprar lo deciden DOS llaves, y hacen falta las dos:
//  1. config/tienda.js: `disponible: true` y un modo de compra real
//     (`hotmartUrl`, o `precioPen` para Mercado Pago);
//  2. para Mercado Pago, el backend: `activo: true` en
//     inspira-backend/src/modules/pagos/productos.catalogo.js, que es quien
//     cobra y quien entrega (`entrega.url`). Se consulta en
//     GET /mercadopago/productos; si el servidor dice que no, la tarjeta sale
//     como «Próximamente» aunque el config diga lo contrario. Así nunca se
//     enseña un botón que termina en «Este producto todavía no está a la venta».
// Lo gratuito interno (`href`) se usa sin pagar. Todo lo demás, «Próximamente»
// y sin botón de compra.
import { useEffect, useState } from "react";
import { PRODUCTOS } from "../../config/tienda";
import { CALENDLY_URL } from "../../config/contacto";
import { navigate } from "../../services/navigate";
import ComprarProducto from "../../components/common/ComprarProducto";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/** Ids que el servidor tiene activos para cobrar. null = aún no se sabe. */
function useActivosServidor() {
  const [activos, setActivos] = useState(null);
  useEffect(() => {
    let vivo = true;
    fetch(`${API_URL}/mercadopago/productos`)
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        const lista = Array.isArray(d?.productos) ? d.productos : [];
        setActivos(new Set(lista.filter((p) => p.activo === true).map((p) => p.id)));
      })
      .catch(() => vivo && setActivos(new Set()));
    return () => { vivo = false; };
  }, []);
  return activos;
}

/** «gratis» | «hotmart» | «mercadopago» | «pronto». */
function modoDe(producto, activos) {
  if (producto.href) return "gratis";
  if (!producto.disponible) return "pronto";
  if (producto.hotmartUrl) return "hotmart";
  if (producto.precioPen && activos?.has(producto.id)) return "mercadopago";
  return "pronto";
}

function BotonProducto({ producto, modo }) {
  if (modo === "gratis") {
    return (
      <a
        href={producto.href}
        onClick={(e) => go(e, producto.href)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-light"
      >
        Usar gratis →
      </a>
    );
  }
  if (modo === "mercadopago") {
    return (
      <ComprarProducto
        idProducto={producto.id}
        nombre={producto.nombre}
        precio={producto.precioPen}
        precioRef={producto.precio}
      >
        Comprar ahora →
      </ComprarProducto>
    );
  }
  if (modo === "hotmart") {
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
  // «Próximamente»: sin botón de compra, solo la etiqueta.
  return (
    <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-primary">
      Próximamente
    </span>
  );
}

export default function Tienda() {
  const activos = useActivosServidor();

  return (
    <div className="w-full">
      <PageHero
        etiqueta="Tiendita"
        icono="libro"
        titulo="Recursos digitales para"
        destacado="avanzar por tu cuenta"
        descripcion="Guías, herramientas y accesos con compra directa. Empieza con lo que necesitas y, cuando quieras acompañamiento completo, aquí estamos."
        accesos={[
          { icono: "euro", label: "Calculadora gratis", href: "/calculadora-master" },
          { icono: "robot", label: "Asistente gratis", href: "/asistente" },
          { icono: "brujula", label: "Servicios completos", href: "/servicios" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => {
            const modo = modoDe(producto, activos);
            const pronto = modo === "pronto";
            return (
              <div
                key={producto.id}
                className={`flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition ${
                  pronto ? "opacity-80" : "hover:-translate-y-1 hover:shadow-lg"
                }`}
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
                <div className="mt-4">
                  {producto.precioPen ? (
                    <>
                      <span className="font-display text-2xl font-extrabold text-primary">
                        S/ {producto.precioPen}
                      </span>
                      {producto.precio && (
                        <span className="ml-2 text-sm text-neutral-500">≈ {producto.precio}</span>
                      )}
                    </>
                  ) : !producto.precio ? (
                    <span className="font-display text-2xl font-extrabold text-green-700">Gratis</span>
                  ) : null}
                </div>
                <BotonProducto producto={producto} modo={modo} />
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          Los pagos se procesan de forma segura con Mercado Pago y el acceso te
          llega al correo que indiques. ¿Dudas con un producto?{" "}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Agenda una asesoría
          </a>
          .
        </p>
      </div>
      <SigueExplorando destinos={["calculadora", "asistente", "blog", "servicios"]} />
    </div>
  );
}
