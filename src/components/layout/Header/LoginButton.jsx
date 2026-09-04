// src/components/layout/Header/LoginButton.jsx
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/**
 * Empieza el login con Google.
 *
 * Quien pulsa «Iniciar» quiere entrar a lo suyo, así que por defecto se
 * aterriza en el panel. Antes se volvía a la página donde estaba el botón —la
 * portada, casi siempre— y había que buscar el panel en el menú del avatar.
 *
 * `volverAqui` es para los flujos que sí necesitan regresar a donde estaban:
 * reservar una cita a mitad de página, por ejemplo. Y si ya se estaba dentro
 * del panel —un enlace de correo a un expediente, con la sesión caducada— se
 * vuelve exactamente a esa URL.
 */
export const loginGoogle = ({ volverAqui = false } = {}) => {
  const actual =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  let destino = "/panel";
  if (volverAqui || actual.startsWith("/panel")) destino = actual;
  if (!destino || destino === "/auth/success") destino = "/panel";

  localStorage.setItem("post_login_redirect", destino);
  window.location.href = `${API_URL}/auth/google`;
};

export default function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => loginGoogle()}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
    >
      Iniciar con Google
    </button>
  );
}
