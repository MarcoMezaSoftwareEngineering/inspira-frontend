// src/components/layout/footer/Footer.jsx
import { RUTAS_LEGALES, TITULAR, pendiente } from "../../../config/legal";
import { navigate } from "../../../services/navigate";

const ir = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const enlacesExplora = [
  { label: "Todos los servicios", href: "/servicios" },
  { label: "Máster en España (360°)", href: "/servicios/master" },
  { label: "Visa y estancia por estudios", href: "/servicios/estancia" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Reservar asesoría", href: "/reservar" },
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

        <div className="mt-10 border-t border-neutral-200 pt-6 text-xs leading-relaxed text-neutral-500">
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
