// src/pages/reservar/FormularioReserva.jsx
// Último paso de /reservar: datos de contacto, preguntas previas, términos y pago.
//
// Lo normal es reservar con la cuenta de Google (queda el historial y las citas
// en el panel). Quien no quiere registrarse tiene una alternativa: deja nombre
// completo, correo y celular y reserva igual; recibe por correo el enlace para
// pagar y gestionar su cita. En los dos casos el celular y las preguntas
// previas son obligatorios: el abogado llega a la sesión sabiendo de qué se trata.
import { useState } from "react";
import { apiPOST } from "../../services/api";
import { loginGoogle } from "../../components/layout/Header/LoginButton";
import { dialog } from "../../services/dialogService";
import { registrarInicioPago } from "../../lib/analytics";
import AceptarTerminos from "../../components/legal/AceptarTerminos";
import { Icono } from "./iconos";
import { guardarToken } from "./tokenReserva";
import { INICIOS, INTERESES, borrarBorrador, celularValido, componerMotivo, correoValido, guardarBorrador, leerBorrador, nombreCompletoValido } from "./preguntas";

const campo = "mt-1.5 w-full rounded-xl border bg-fondo px-3 py-2.5 text-sm text-tinta placeholder:text-trazo focus:outline-none focus:ring-2";
const claseCampo = (error) => `${campo} ${error ? "border-alto focus:border-alto focus:ring-alto/20" : "border-linea focus:border-primary focus:ring-primary/20"}`;

function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-alto-ink" role="alert">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1 text-xs text-muted">{ayuda}</p>
      )}
    </div>
  );
}

export default function FormularioReserva({ hora, servicioId, fecha, precio, isLoggedIn, user, aceptado, setAceptado, separarHorario, enviandoCuenta }) {
  const [previo] = useState(() => {
    const b = leerBorrador();
    return b && b.id_slot === hora.id_slot ? b : null;
  });
  const [invitado, setInvitado] = useState(!!previo?.invitado);
  const [nombre, setNombre] = useState(previo?.nombre || "");
  const [email, setEmail] = useState(previo?.email || "");
  const [celular, setCelular] = useState(previo?.celular || "");
  const [interes, setInteres] = useState(previo?.interes || "");
  const [inicio, setInicio] = useState(previo?.inicio || "");
  const [detalle, setDetalle] = useState(previo?.detalle || "");
  const [trampa, setTrampa] = useState("");
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const conCuenta = isLoggedIn;
  const sinCuenta = !isLoggedIn && invitado;
  const errores = {
    nombre: sinCuenta && !nombreCompletoValido(nombre) ? "Escribe tu nombre y apellido." : "",
    email: sinCuenta && !correoValido(email) ? "Revisa tu correo: parece incompleto." : "",
    celular: !celularValido(celular) ? "Escribe tu celular o WhatsApp con el código de país." : "",
    interes: !interes ? "Elige qué te interesa." : "",
    inicio: !inicio ? "Elige cuándo quieres empezar." : "",
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const mostrar = (k) => (intento ? errores[k] : "");
  const ocupado = enviando || enviandoCuenta;

  const reservar = async (modo) => {
    setIntento(true);
    if (!aceptado) return;
    if (hayErrores) {
      dialog.toast("Completa los datos marcados para continuar.", "error");
      return;
    }
    if (conCuenta) {
      borrarBorrador();
      separarHorario(hora.id_slot, servicioId, modo, { motivo: componerMotivo({ interes, inicio, detalle }), celular: celular.trim() });
      return;
    }
    setEnviando(true);
    try {
      const res = await apiPOST("/api/reservas/invitado/separar", {
        id_slot: hora.id_slot, servicio_id: servicioId, modo, acepta: true, web: trampa,
        nombre: nombre.trim(), email: email.trim(), celular: celular.trim(), interes, inicio, motivo: detalle.trim(),
      });
      if (res?.ok && res.id_reserva) {
        borrarBorrador();
        guardarToken(res.id_reserva, res.token);
        registrarInicioPago("reserva_cita_separada", { id_slot: hora.id_slot, servicio_id: servicioId, modo, invitado: true });
        window.location.assign(`/reservar/pago?r=${res.id_reserva}`);
        return;
      }
      dialog.toast(res?.msg || "No se pudo separar el horario.", "error");
    } catch {
      dialog.toast("Error de conexión. Intenta de nuevo.", "error");
    }
    setEnviando(false);
  };

  // Sin cuenta y sin haber elegido la alternativa: se ofrece Google primero.
  if (!conCuenta && !sinCuenta) {
    return (
      <div className="rv-entrada mt-5 space-y-3">
        <h3 className="font-semibold text-tinta">¿Cómo quieres reservar?</h3>
        <button
          type="button"
          onClick={() => {
            guardarBorrador({ servicioId, fecha, id_slot: hora.id_slot, celular, interes, inicio, detalle, aceptado });
            loginGoogle({ volverAqui: true });
          }}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-left text-white shadow-[0_14px_30px_-16px_rgba(1,52,70,.9)] transition hover:bg-primary-light active:scale-[0.99]"
        >
          <span>
            <span className="block text-sm font-semibold">Continuar con Google</span>
            <span className="block text-xs text-white/75">Guardamos tu historial y verás tus citas en tu panel.</span>
          </span>
          <Icono nombre="flecha" className="h-5 w-5 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => {
            setInvitado(true);
            guardarBorrador({ invitado: true });
          }}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-linea bg-white px-5 py-4 text-left transition hover:border-primary hover:bg-secondary-light active:scale-[0.99]"
        >
          <span>
            <span className="block text-sm font-semibold text-primary">Reservar sin registrarme</span>
            <span className="block text-xs text-muted">Déjanos tus datos y recibe el enlace para pagar por correo.</span>
          </span>
          <Icono nombre="usuario" className="h-5 w-5 shrink-0 text-primary" />
        </button>
      </div>
    );
  }

  return (
    <div className="rv-entrada mt-5 space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-tinta">Tus datos</h3>
        {sinCuenta && (
          <button type="button" onClick={() => setInvitado(false)} className="text-xs text-muted underline underline-offset-4">
            Prefiero entrar con Google
          </button>
        )}
      </div>

      {conCuenta && (
        <p className="rounded-xl bg-verde-soft px-3.5 py-2.5 text-xs text-verde-ink">
          Reservando como <strong>{user?.email || user?.nombre || "tu cuenta"}</strong>.
        </p>
      )}

      {sinCuenta && (
        <>
          <input type="text" name="web" value={trampa} onChange={(e) => setTrampa(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Campo id="rv-nombre" etiqueta="Nombre completo *" error={mostrar("nombre")}>
            <input id="rv-nombre" type="text" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} placeholder="Nombre y apellido" aria-invalid={!!mostrar("nombre")} className={claseCampo(mostrar("nombre"))} />
          </Campo>
          <Campo id="rv-email" etiqueta="Correo *" error={mostrar("email")} ayuda="Aquí te enviamos el enlace para pagar y gestionar tu cita.">
            <input id="rv-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} placeholder="tucorreo@ejemplo.com" aria-invalid={!!mostrar("email")} className={claseCampo(mostrar("email"))} />
          </Campo>
        </>
      )}

      <Campo id="rv-celular" etiqueta="Celular o WhatsApp *" error={mostrar("celular")} ayuda="Con el código de país. Solo lo usamos para tu cita.">
        <input id="rv-celular" type="tel" inputMode="tel" autoComplete="tel" value={celular} onChange={(e) => setCelular(e.target.value)} maxLength={30} placeholder="+51 999 999 999" aria-invalid={!!mostrar("celular")} className={claseCampo(mostrar("celular"))} />
      </Campo>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Campo id="rv-interes" etiqueta="¿Qué te interesa? *" error={mostrar("interes")}>
          <select id="rv-interes" value={interes} onChange={(e) => setInteres(e.target.value)} aria-invalid={!!mostrar("interes")} className={claseCampo(mostrar("interes"))}>
            <option value="">Elige una opción</option>
            {INTERESES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Campo>
        <Campo id="rv-inicio" etiqueta="¿Cuándo quieres empezar? *" error={mostrar("inicio")}>
          <select id="rv-inicio" value={inicio} onChange={(e) => setInicio(e.target.value)} aria-invalid={!!mostrar("inicio")} className={claseCampo(mostrar("inicio"))}>
            <option value="">Elige una opción</option>
            {INICIOS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo id="rv-detalle" etiqueta={<>Cuéntanos algo que nos ayude a prepararnos <span className="font-normal text-muted">(opcional)</span></>}>
        <textarea id="rv-detalle" value={detalle} onChange={(e) => setDetalle(e.target.value)} maxLength={500} rows={3} placeholder="Ej.: tu país de residencia, el máster que te interesa, si ya tuviste una denegatoria…" className={`${claseCampo("")} resize-y`} />
      </Campo>

      <AceptarTerminos
        checked={aceptado}
        onChange={setAceptado}
        resumen="Separamos tu horario y eliges cómo pagar: tarjeta, transferencia con voucher o pagar después. La cita se confirma cuando recibimos el pago. Puedes reprogramar o cancelar sin costo avisando con 24 horas de antelación."
      />
      {intento && !aceptado && (
        <p className="text-xs text-alto-ink" role="alert">
          Acepta los términos para continuar.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => reservar("ahora")}
          disabled={ocupado}
          className="rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(1,52,70,.9)] transition hover:bg-primary-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {ocupado ? "Separando tu horario…" : `Pagar ahora · ${precio} →`}
        </button>
        <button
          type="button"
          onClick={() => reservar("despues")}
          disabled={ocupado}
          className="rounded-full border border-primary px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pagar después
        </button>
      </div>
      <p className="text-center text-xs text-muted">Separamos el horario en el acto. Con «pagar después» lo confirmas luego por WhatsApp.</p>
    </div>
  );
}
