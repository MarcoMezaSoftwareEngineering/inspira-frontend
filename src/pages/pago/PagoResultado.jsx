// src/pages/pago/PagoResultado.jsx
// Páginas informativas de retorno desde Mercado Pago (back_urls).
// La confirmación real de la cita/servicio la realiza el webhook del backend.
import { navigate } from "../../services/navigate";

function Layout({ emoji, titulo, mensaje, acciones }) {
  return (
    <main className="min-h-[70vh] bg-neutral-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <div className="text-5xl">{emoji}</div>
        <h1 className="mt-4 font-fraunces text-2xl font-semibold text-primary">
          {titulo}
        </h1>
        <p className="mt-3 text-neutral-600">{mensaje}</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          {acciones}
        </div>
      </div>
    </main>
  );
}

const btnPrimario =
  "px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-light transition";
const btnSecundario =
  "px-5 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition";

export function PagoExitoso() {
  return (
    <Layout
      emoji="✅"
      titulo="¡Pago recibido!"
      mensaje="Estamos confirmando tu cita. En unos minutos recibirás un correo con los detalles y el enlace de Google Meet."
      acciones={
        <button type="button" className={btnPrimario} onClick={() => navigate("/panel")}>
          Ir a mi panel
        </button>
      }
    />
  );
}

export function PagoPendiente() {
  return (
    <Layout
      emoji="⏳"
      titulo="Pago en proceso"
      mensaje="Tu pago está siendo procesado. Cuando se apruebe, confirmaremos tu cita y te enviaremos el enlace de la reunión por correo."
      acciones={
        <button type="button" className={btnPrimario} onClick={() => navigate("/panel")}>
          Ir a mi panel
        </button>
      }
    />
  );
}

export function PagoFallido() {
  return (
    <Layout
      emoji="❌"
      titulo="No se pudo completar el pago"
      mensaje="El pago no se realizó y el horario quedó liberado. Puedes intentarlo de nuevo cuando quieras."
      acciones={
        <>
          <button type="button" className={btnPrimario} onClick={() => navigate("/reservar")}>
            Volver a reservar
          </button>
          <button type="button" className={btnSecundario} onClick={() => navigate("/")}>
            Ir al inicio
          </button>
        </>
      }
    />
  );
}
