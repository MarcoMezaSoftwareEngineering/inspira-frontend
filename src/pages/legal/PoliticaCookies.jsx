// src/pages/legal/PoliticaCookies.jsx
import LegalLayout, { Seccion, Tabla } from "./LegalLayout";
import { CATEGORIAS, INVENTARIO, TERCEROS_EN_PAGINA } from "../../config/cookies";
import { RUTAS_LEGALES, TITULAR, VERSIONES } from "../../config/legal";

const A = ({ href, children }) => (
  <a className="font-medium text-primary underline underline-offset-2" href={href}>
    {children}
  </a>
);

export default function PoliticaCookies() {
  const { version, fecha } = VERSIONES.cookies;
  const abrirPanel = () =>
    window.dispatchEvent(new CustomEvent("inspira:abrir-cookies"));

  return (
    <LegalLayout
      titulo="Política de Cookies"
      version={version}
      fecha={fecha}
      resumen={
        "Esta política describe una a una las cookies y los almacenamientos locales que este sitio utiliza realmente. No es una plantilla genérica: el listado se genera a partir del inventario técnico del propio sitio y se actualiza cada vez que se añade o se retira una tecnología."
      }
    >
      <Seccion n="1" titulo="Qué son y cómo las usamos">
        <p>
          Una cookie es un pequeño archivo que un sitio guarda en tu navegador.
          El <em>almacenamiento local</em> (Local Storage) cumple una función
          parecida: guarda información en tu equipo. Ambos se tratan aquí bajo
          las mismas reglas.
        </p>
        <p>
          Las cookies <strong>estrictamente necesarias</strong> se instalan
          siempre, porque sin ellas no puedes iniciar sesión, mantener tu sesión
          abierta ni completar un pago. Todas las demás{" "}
          <strong>permanecen bloqueadas hasta que las aceptas</strong>: no se
          cargan al entrar al sitio, ni mientras navegas, ni si cierras el
          banner sin elegir.
        </p>
      </Seccion>

      <Seccion n="2" titulo="Inventario de cookies y almacenamiento">
        {INVENTARIO.map((bloque) => {
          const cat = CATEGORIAS[bloque.categoria];
          return (
            <div key={bloque.categoria} className="space-y-2 pt-2">
              <h3 className="text-base font-semibold text-neutral-900">
                {cat.nombre}
                {cat.obligatoria && (
                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-primary">
                    Siempre activas
                  </span>
                )}
              </h3>
              <p className="text-sm text-neutral-600">{cat.descripcion}</p>
              {bloque.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 p-3 text-sm text-neutral-500">
                  A la fecha de esta versión{" "}
                  <strong>no tenemos ninguna tecnología instalada</strong> en
                  esta categoría. Si en el futuro incorporamos alguna, se
                  detallará aquí y solo se activará con tu consentimiento previo.
                </p>
              ) : (
                <Tabla
                  cabeceras={["Nombre", "Tipo", "Titular", "Finalidad", "Duración"]}
                  filas={bloque.items.map((i) => [
                    i.nombre,
                    i.tipo,
                    i.titular,
                    i.finalidad,
                    i.duracion,
                  ])}
                />
              )}
            </div>
          );
        })}
      </Seccion>

      <Seccion n="3" titulo="Servicios de terceros integrados en las páginas">
        <p>
          Además de lo anterior, algunas funciones del sitio conectan con
          servicios de terceros. Estos son, y qué reciben:
        </p>
        <Tabla
          cabeceras={["Servicio", "Para qué", "Qué datos recibe"]}
          filas={TERCEROS_EN_PAGINA.map((t) => [t.nombre, t.finalidad, t.dato])}
        />
      </Seccion>

      <Seccion n="4" titulo="Cómo gestionar o retirar tu consentimiento">
        <p>
          Puedes cambiar tu decisión en cualquier momento y con la misma
          facilidad con la que la diste. Retirar el consentimiento no afecta a
          la licitud del tratamiento realizado antes de retirarlo.
        </p>
        <p>
          <button
            type="button"
            onClick={abrirPanel}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Abrir el panel de configuración de cookies
          </button>
        </p>
        <p>
          También puedes bloquear o eliminar cookies desde la configuración de tu
          navegador. Ten en cuenta que si bloqueas las estrictamente necesarias,
          el inicio de sesión y el pago dejarán de funcionar.
        </p>
        <p>
          Guardamos tu decisión durante <strong>12 meses</strong>. Pasado ese
          plazo, o si publicamos una versión nueva de esta política, volveremos
          a preguntarte.
        </p>
      </Seccion>

      <Seccion n="5" titulo="Responsable y contacto">
        <p>
          {TITULAR.razonSocial} (RUC {TITULAR.ruc}). Para cualquier consulta
          sobre esta política escribe a{" "}
          <A href={"mailto:" + TITULAR.emailDatosPersonales}>
            {TITULAR.emailDatosPersonales}
          </A>
          . El tratamiento de tus datos personales se explica en el{" "}
          <A href={RUTAS_LEGALES.privacidad}>Aviso de Privacidad</A>.
        </p>
      </Seccion>
    </LegalLayout>
  );
}
