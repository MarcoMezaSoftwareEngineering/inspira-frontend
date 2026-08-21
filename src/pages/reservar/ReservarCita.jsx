// src/pages/reservar/ReservarCita.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../services/api";
import { useReservarCita } from "../../hooks/useReservarCita";
import AceptarTerminos from "../../components/legal/AceptarTerminos";

// "YYYY-MM-DD" -> "Lunes 21 de julio de 2026" (hora de Perú)
function fechaLarga(fechaISO) {
  const d = new Date(`${fechaISO}T12:00:00-05:00`);
  const txt = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function precioLabel(cita) {
  if (!cita || !cita.precio) return "";
  const simbolo = cita.moneda === "PEN" ? "S/ " : "";
  const sufijo = cita.moneda && cita.moneda !== "PEN" ? ` ${cita.moneda}` : "";
  return `${simbolo}${cita.precio}${sufijo}`;
}

export default function ReservarCita() {
  const [dias, setDias] = useState([]);
  const [cita, setCita] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [seleccion, setSeleccion] = useState(null); // { id_slot, fecha, hora_inicio, hora_fin }
  const [aceptado, setAceptado] = useState(false);

  const { reservarSlot, loadingSlot, isLoggedIn } = useReservarCita();

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await apiGET("/api/reservas/disponibilidad");
        if (!vivo) return;
        if (res?.ok) {
          setDias(res.dias || []);
          setCita(res.cita || null);
        } else {
          setError(res?.msg || "No se pudo cargar la disponibilidad.");
        }
      } catch {
        if (vivo) setError("Error de conexión al cargar la disponibilidad.");
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const hayDisponibilidad = useMemo(
    () => dias.some((d) => d.slots && d.slots.length > 0),
    [dias]
  );

  const precio = precioLabel(cita);

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center">
          <h1 className="font-fraunces text-3xl md:text-4xl font-semibold text-primary">
            {cita?.titulo || "Reserva tu cita"}
          </h1>
          <p className="mt-2 text-neutral-600">
            Elige el día y la hora que prefieras. Las citas duran{" "}
            {cita?.duracion_min || 30} minutos y se realizan por Google Meet.
          </p>
          {precio && (
            <p className="mt-3 inline-block rounded-full bg-accent/10 text-accent font-semibold px-4 py-1">
              Precio de la cita: {precio}
            </p>
          )}
        </header>

        <section className="mt-8">
          {cargando && (
            <p className="text-center text-neutral-500">Cargando disponibilidad…</p>
          )}

          {!cargando && error && (
            <p className="text-center text-red-600">{error}</p>
          )}

          {!cargando && !error && !hayDisponibilidad && (
            <div className="text-center bg-white rounded-2xl border border-neutral-200 p-8">
              <p className="text-neutral-700">
                Ahora mismo no hay horarios disponibles. Vuelve a intentarlo más tarde.
              </p>
            </div>
          )}

          {!cargando && !error && hayDisponibilidad && (
            <div className="space-y-6">
              {dias
                .filter((d) => d.slots && d.slots.length > 0)
                .map((dia) => (
                  <div
                    key={dia.fecha}
                    className="bg-white rounded-2xl border border-neutral-200 p-5"
                  >
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {fechaLarga(dia.fecha)}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dia.slots.map((s) => (
                        <button
                          key={s.id_slot}
                          type="button"
                          onClick={() => {
                            setAceptado(false);
                            setSeleccion({
                              id_slot: s.id_slot,
                              fecha: dia.fecha,
                              hora_inicio: s.hora_inicio,
                              hora_fin: s.hora_fin,
                            });
                          }}
                          className="rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition"
                        >
                          {s.hora_inicio}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de confirmación */}
      {seleccion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-neutral-900">Confirmar cita</h2>

            <div className="mt-4 border border-neutral-200 rounded-xl p-4 bg-neutral-50">
              <p className="text-sm text-neutral-600">{cita?.titulo}</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {fechaLarga(seleccion.fecha)}
              </p>
              <p className="text-neutral-700">
                {seleccion.hora_inicio} – {seleccion.hora_fin} (hora Perú)
              </p>
              {precio && (
                <p className="mt-3 text-xl font-bold text-neutral-900">{precio}</p>
              )}
            </div>

            <AceptarTerminos
              checked={aceptado}
              onChange={setAceptado}
              resumen={
                isLoggedIn
                  ? "Al confirmar serás redirigido a Mercado Pago. Cuando el pago se apruebe, recibirás por correo el enlace de Google Meet. Puedes reprogramar sin costo avisando con 24 horas de antelación."
                  : "Para reservar necesitas iniciar sesión con Google. Al continuar te llevaremos al inicio de sesión y luego podrás pagar. Puedes reprogramar sin costo avisando con 24 horas de antelación."
              }
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSeleccion(null)}
                disabled={loadingSlot === seleccion.id_slot}
                className="px-4 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => reservarSlot(seleccion.id_slot)}
                disabled={loadingSlot === seleccion.id_slot || !aceptado}
                className="px-5 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingSlot === seleccion.id_slot
                  ? "Redirigiendo…"
                  : isLoggedIn
                  ? "Confirmar y pagar"
                  : "Iniciar sesión y reservar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
