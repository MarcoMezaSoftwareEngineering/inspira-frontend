// src/components/layout/footer/Footer.jsx
import { RUTAS_LEGALES, TITULAR, pendiente } from "../../../config/legal";
import { navigate } from "../../../services/navigate";
import { NOMBRE_PORTAL, NOMBRE_CORTO, MENU_ETIQUETA } from "../../../config/portalMarca";
import { MarcoTelefono } from "../../common/MarcoDispositivo";
import { CAPTURAS_PORTAL } from "../../common/capturasPortal";

const ir = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const enlacesExplora = [
  { label: "Todos los servicios", href: "/servicios" },
  { label: "Paquete Máster 2027/2028", href: "/servicios/master" },
  { label: "Visa y estancia por estudios", href: "/servicios/estancia" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: MENU_ETIQUETA, href: "/plataforma" },
  { label: "Eventos gratuitos", href: "/eventos" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
];

const enlacesLegales = [
  { label: "Aviso de Privacidad", href: RUTAS_LEGALES.privacidad },
  { label: "Política de Cookies", href: RUTAS_LEGALES.cookies },
  { label: "Términos y Condiciones", href: RUTAS_LEGALES.terminos },
  { label: "Derechos sobre tus datos (ARCO)", href: RUTAS_LEGALES.derechos },
];

/**
 * Pie de página con la identificación completa del proveedor.
 *
 * Cubre el deber de información al consumidor: razón social, RUC, domicilio,
 * representante y canales de contacto visibles en todas las páginas públicas,
 * más los accesos a los documentos legales y al Libro de Reclamaciones.
 */
export default function Footer() {
  const abrirCookies = () =>
    window.dispatchEvent(new CustomEvent("inspira:abrir-cookies"));

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Identificación del titular */}
          <div>
            <p className="font-fraunces text-lg font-semibold text-primary">
              {TITULAR.nombreComercial}
            </p>
            <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-neutral-700">
              <p>
                <span className="text-neutral-500">Razón social:</span>{" "}
                {TITULAR.razonSocial}
              </p>
              <p>
                <span className="text-neutral-500">RUC:</span> {TITULAR.ruc}
              </p>
              {!pendiente(TITULAR.domicilioFiscal) && (
                <p>
                  <span className="text-neutral-500">Domicilio:</span>{" "}
                  {TITULAR.domicilioFiscal}
                </p>
              )}
              {!pendiente(TITULAR.representanteLegal) && (
                <p>
                  <span className="text-neutral-500">Representante legal:</span>{" "}
                  {TITULAR.representanteLegal}
                </p>
              )}
            </address>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              {TITULAR.nombreComercial} es el nombre comercial de{" "}
              {TITULAR.razonSocial}.
            </p>
          </div>

          {/* Navegación del sitio */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Explora</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {enlacesExplora.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => ir(e, l.href)}
                    className="text-neutral-700 hover:text-primary hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Contacto</p>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-700">
              <li>
                <a
                  className="hover:text-primary hover:underline"
                  href={"mailto:" + TITULAR.emailContacto}
                >
                  {TITULAR.emailContacto}
                </a>
              </li>
              <li>
                <span className="text-neutral-500">
                  Protección de datos personales:
                </span>{" "}
                <a
                  className="hover:text-primary hover:underline"
                  href={"mailto:" + TITULAR.emailDatosPersonales}
                >
                  {TITULAR.emailDatosPersonales}
                </a>
              </li>
              {!pendiente(TITULAR.telefono) && (
                <li>Teléfono / WhatsApp: {TITULAR.telefono}</li>
              )}
            </ul>

            <a
              href={RUTAS_LEGALES.reclamaciones}
              onClick={(e) => ir(e, RUTAS_LEGALES.reclamaciones)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-secondary"
            >
              📕 Libro de Reclamaciones
            </a>
            {/* Aviso del Libro de Reclamaciones. El reglamento exige que el
                aviso, y no solo el enlace, esté visible en el establecimiento
                —aquí, en todas las páginas del sitio. */}
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-neutral-600">
              Conforme a lo establecido en el Código de Protección y Defensa del
              Consumidor, este establecimiento cuenta con un Libro de
              Reclamaciones a tu disposición.
            </p>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Legal</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {enlacesLegales.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => ir(e, l.href)}
                    className="text-neutral-700 hover:text-primary hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={abrirCookies}
                  className="text-neutral-700 hover:text-primary hover:underline"
                >
                  Configurar cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Portal Inspira: acceso al portal y a la app desde cualquier página */}
        <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-primary px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <MarcoTelefono captura={CAPTURAS_PORTAL.inicio} mini decorativa aspecto="aspect-[9/14]" className="w-12 shrink-0" />
            <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky">
              {NOMBRE_PORTAL} · Instala la app
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              Tus documentos, tus plazos y los mensajes con tu asesor en un portal propio que llevas como app en tu teléfono.
            </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href="/plataforma"
              onClick={(e) => ir(e, "/plataforma")}
              className="inline-flex items-center rounded-xl border-2 border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Conoce el {NOMBRE_CORTO}
            </a>
            <a
              href="/panel"
              onClick={(e) => ir(e, "/panel")}
              className="inline-flex items-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Entrar a mi {NOMBRE_CORTO}
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-xs leading-relaxed text-neutral-500">
          <p>
            © {new Date().getFullYear()} {TITULAR.razonSocial}. Todos los
            derechos reservados.
          </p>
          <p className="mt-2">
            Inspira Legal presta servicios de asesoría, gestión documental y
            acompañamiento en procesos de admisión a másteres y trámites de
            visado. No somos una universidad, ni un consulado, ni una entidad
            pública, y no garantizamos la admisión, la obtención de becas ni la
            concesión de visados, que dependen exclusivamente de las
            instituciones competentes.
          </p>
        </div>
      </div>
    </footer>
  );
}
