// src/pages/reservar/PagarReserva.jsx
// Pago de una cita ya separada (/reservar/pago?r=<id>): tarjeta con Mercado Pago,
// transferencia con voucher o pagar después. También es el enlace que llega por
// correo, así que carga todo desde el servidor y no depende de la pantalla
// anterior. Textos de usted; colores y clases de marca de tailwind.config.js.
import { useCallback, useEffect, useState } from "react";
import { apiGET, apiPOST, apiUpload } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { loginGoogle } from "../../components/layout/Header/LoginButton";
import { dialog } from "../../services/dialogService";
import { fechaCompleta } from "./fechas";
import { descargarIcs, googleCalendarUrl } from "./calendario";
import "./reservar.css";

const BASE = "/api/reservas/cliente";

const soles = (n) => `S/ ${Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2)}`;
const soloDigitos = (t) => String(t).replace(/\D/g, "");

function esUrlMercadoPago(url) {
  try {
    return new URL(url).hostname.includes("mercadopago.com");
  } catch {
    return false;
  }
}

function hastaTexto(iso) {
  try {
    return new Date(iso).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

const boton = {
  primario:
    "rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
  secundario:
    "rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
};

function Marco({ children }) {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="rv-entrada mx-auto max-w-xl">{children}</div>
    </main>
  );
}

function Fila({ etiqueta, valor, copiable }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(soloDigitos(valor) && copiable === "digitos" ? soloDigitos(valor) : String(valor));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      dialog.toast("No se pudo copiar. Selecciónelo y cópielo manualmente.", "error");
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-linea py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">{etiqueta}</p>
        <p className="break-words font-medium text-tinta">{valor}</p>
      </div>
      {copiable && (
        <button
          type="button"
          onClick={copiar}
          className="shrink-0 rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/5 active:scale-95"
          aria-label={`Copiar ${etiqueta}`}
        >
          {copiado ? "Copiado ✓" : "Copiar"}
        </button>
      )}
    </div>
  );
}

// Los dos números del equipo, cada uno con el mensaje ya escrito.
function ContactosWhatsApp({ contactos, mensaje, titulo }) {
  return (
    <div>
      <p className="text-sm text-aviso-ink">{titulo}</p>
      <ul className="mt-2 space-y-2">
        {contactos.map((c) => (
          <li key={c.telefono} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-tinta">
              {c.nombre}: <b>{c.telefono}</b>
            </span>
            <a
              href={`https://wa.me/${soloDigitos(c.telefono)}?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-verde px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
            >
              Escribir por WhatsApp
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubirVoucher({ id, yaSubido, onSubido }) {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(yaSubido);

  const enviar = async () => {
    if (!archivo) return;
    setEnviando(true);
    try {
      const datos = new FormData();
      datos.append("comprobante", archivo);
      await apiUpload(`${BASE}/${id}/voucher`, datos);
      setListo(true);
      onSubido?.();
    } catch (e) {
      dialog.toast(e.message || "No se pudo enviar el voucher. Intente de nuevo.", "error");
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <p className="rv-pop rounded-2xl bg-verde-soft px-4 py-3 text-sm font-medium text-verde-ink">
        Recibimos su voucher. Verificaremos el abono y le enviaremos la confirmación de la cita por correo.
        {" "}
        <button type="button" className="underline" onClick={() => setListo(false)}>
          Enviar otro
        </button>
      </p>
    );
  }

  return (
    <div>
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-linea bg-white px-4 py-5 text-center transition hover:border-primary">
        <span className="block text-sm font-semibold text-primary">
          {archivo ? archivo.name : "Seleccionar el voucher"}
        </span>
        <span className="mt-1 block text-xs text-muted">Foto o captura de pantalla (JPG, PNG, HEIC) o PDF, hasta 10 MB</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="sr-only"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        />
      </label>
      <button type="button" onClick={enviar} disabled={!archivo || enviando} className={`${boton.primario} mt-3 w-full`}>
        {enviando ? "Enviando voucher…" : "Enviar voucher"}
      </button>
    </div>
  );
}

function Opcion({ titulo, importe, detalle, accion, onClick, cargando, deshabilitada, motivo, principal }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-linea">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-tinta">{titulo}</h3>
        {importe && <span className="font-fraunces text-xl font-semibold text-primary">{importe}</span>}
      </div>
      <p className="mt-1 text-sm text-tinta-2">{detalle}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={deshabilitada || cargando}
        className={`${principal ? boton.primario : boton.secundario} mt-3 w-full`}
      >
        {cargando ? "Un momento…" : accion}
      </button>
      {deshabilitada && motivo && <p className="mt-2 text-xs text-muted">{motivo}</p>}
    </section>
  );
}

export default function PagarReserva() {
  const { user } = useAuth();
  const id = Number(new URLSearchParams(window.location.search).get("r"));
  const [r, setR] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [haciendo, setHaciendo] = useState(null); // "tarjeta" | "transferencia" | "despues"
  const [cambiar, setCambiar] = useState(false);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cancelada, setCancelada] = useState(null); // { devolucion }

  const cargar = useCallback(async () => {
    try {
      const res = await apiGET(`${BASE}/${id}`);
      if (res?.ok) {
        setR(res.reserva);
        setError(null);
      } else {
        setError(res?.msg || "No encontramos esa reserva.");
      }
    } catch {
      setError("No pudimos cargar su reserva. Revise su conexión e intente de nuevo.");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setCargando(false);
      return;
    }
    cargar();
  }, [id, user, cargar]);

  const elegir = async (metodo) => {
    setHaciendo(metodo);
    try {
      const res = await apiPOST(`${BASE}/${id}/${metodo}`, {});
      if (!res?.ok) {
        dialog.toast(res?.msg || "No se pudo registrar el medio de pago.", "error");
        return;
      }
      if (metodo === "tarjeta") {
        const url = res.preferencia?.init_point;
        if (url && esUrlMercadoPago(url)) {
          window.location.href = url;
          return;
        }
        dialog.toast("No se pudo abrir el pago con tarjeta. Intente de nuevo.", "error");
        return;
      }
      setCambiar(false);
      await cargar();
    } catch {
      dialog.toast("Error de conexión. Intente de nuevo.", "error");
    } finally {
      setHaciendo(null);
    }
  };

  const cancelar = async () => {
    setCancelando(true);
    try {
      const res = await apiPOST(`${BASE}/${id}/cancelar`, {});
      if (res?.ok) setCancelada({ devolucion: !!res.devolucion });
      else dialog.toast(res?.msg || "No se pudo cancelar la cita.", "error");
    } catch {
      dialog.toast("Error de conexión. Intente de nuevo.", "error");
    } finally {
      setCancelando(false);
      setConfirmandoCancelar(false);
    }
  };

  if (cancelada) {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">Reserva cancelada</h1>
        <p className="mt-2 text-tinta-2">
          {cancelada.devolucion
            ? "Como faltaban más de 24 horas, procede la devolución del importe. Nos pondremos en contacto con usted para gestionarla. Le enviamos la confirmación por correo."
            : "El horario volvió a la agenda."}
        </p>
        <a href="/reservar" className={`${boton.primario} mt-6 inline-block`}>Reservar otro horario</a>
      </Marco>
    );
  }

  // Cancelar con confirmación en la misma página (sin diálogos del navegador).
  const bloqueCancelar = (pagada) =>
    confirmandoCancelar ? (
      <div className="rv-entrada rounded-2xl border border-alto/30 bg-alto-soft p-4">
        <p className="text-sm font-semibold text-alto-ink">
          {pagada ? "¿Cancelar esta cita? Procede la devolución del importe." : "¿Cancelar esta reserva?"}
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={cancelar} disabled={cancelando} className="rounded-full bg-alto px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {cancelando ? "Cancelando…" : "Sí, cancelar"}
          </button>
          <button type="button" onClick={() => setConfirmandoCancelar(false)} className={`${boton.secundario} !py-2`}>
            No, mantener
          </button>
        </div>
      </div>
    ) : (
      <button type="button" className="text-sm text-muted underline underline-offset-4" onClick={() => setConfirmandoCancelar(true)}>
        Cancelar {pagada ? "la cita" : "esta reserva"}
      </button>
    );

  if (!id) {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">No encontramos la reserva</h1>
        <a href="/reservar" className={`${boton.primario} mt-6 inline-block`}>Ir a la agenda</a>
      </Marco>
    );
  }

  if (!user) {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">Inicie sesión para ver su reserva</h1>
        <p className="mt-2 text-tinta-2">Use la misma cuenta de Google con la que separó el horario.</p>
        <button type="button" onClick={() => loginGoogle({ volverAqui: true })} className={`${boton.primario} mt-6`}>
          Iniciar sesión con Google
        </button>
      </Marco>
    );
  }

  if (cargando) {
    return (
      <Marco>
        <div className="rv-esqueleto h-8 w-2/3 rounded-full bg-linea" />
        <div className="rv-esqueleto mt-4 h-40 rounded-2xl bg-linea" />
      </Marco>
    );
  }

  if (error || !r) {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">No pudimos abrir la reserva</h1>
        <p className="mt-2 rounded-2xl bg-alto-soft px-4 py-3 text-sm text-alto-ink">{error}</p>
        <a href="/reservar" className={`${boton.secundario} mt-6 inline-block`}>Volver a la agenda</a>
      </Marco>
    );
  }

  const resumen = `${r.titulo} · ${fechaCompleta(r.fecha)} · ${r.hora_inicio} (hora Perú)`;

  if (r.estado === "CONFIRMADA" || r.estado === "COMPLETADA") {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">Su cita está confirmada</h1>
        <p className="mt-2 text-tinta-2">{resumen}</p>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-linea">
          <Fila etiqueta="Servicio" valor={r.titulo} />
          {r.modalidad === "presencial" ? (
            <Fila etiqueta="Lugar" valor={r.lugar || "San Isidro, Lima. El equipo le confirmará la dirección."} />
          ) : (
            <Fila etiqueta="Reunión" valor={r.meet_url ? <a className="text-primary underline" href={r.meet_url} target="_blank" rel="noopener noreferrer">{r.meet_url}</a> : "El enlace de Google Meet le llegará por correo."} />
          )}
          {r.motivo && <Fila etiqueta="Lo que nos contó" valor={r.motivo} />}
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={googleCalendarUrl(r)} target="_blank" rel="noopener noreferrer" className={boton.primario}>
            Agregar a Google Calendar
          </a>
          <button type="button" onClick={() => descargarIcs(r)} className={boton.secundario}>
            Descargar para Apple u Outlook (.ics)
          </button>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-linea">
          <h2 className="font-semibold text-tinta">¿Necesita hacer un cambio?</h2>
          {r.puede_gestionar ? (
            <>
              <p className="mt-1 text-sm text-tinta-2">Puede reprogramar o cancelar sin costo hasta 24 horas antes de la cita.</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a href={`/reservar?reprogramar=${r.id_reserva}`} className={boton.secundario}>Reprogramar</a>
                {bloqueCancelar(true)}
              </div>
            </>
          ) : (
            <div className="mt-1">
              <ContactosWhatsApp
                contactos={r.contactos}
                titulo="Faltan menos de 24 horas para la cita. Para cualquier cambio, escríbanos por WhatsApp:"
                mensaje={`Hola, necesito hacer un cambio en mi reserva ${r.transferencia.referencia} (${resumen}).`}
              />
            </div>
          )}
        </section>
      </Marco>
    );
  }

  if (r.estado !== "PENDIENTE_PAGO") {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">Este horario ya no está retenido</h1>
        <p className="mt-2 text-tinta-2">
          Pasó el plazo para pagar y el horario volvió a la agenda. Si ya realizó el pago, escríbanos por
          WhatsApp y lo resolvemos: {r.contactos.map((c) => c.telefono).join(" · ")}.
        </p>
        <a href="/reservar" className={`${boton.primario} mt-6 inline-block`}>Elegir otro horario</a>
      </Marco>
    );
  }

  const hasta = r.hold_expira_en ? hastaTexto(r.hold_expira_en) : null;
  const mostrarOpciones = r.metodo_pago === "PENDIENTE" || r.metodo_pago === "MERCADOPAGO" || cambiar;
  const referencia = r.transferencia.referencia;

  return (
    <Marco>
      <h1 className="font-fraunces text-3xl font-semibold text-primary">Su horario está separado</h1>
      <p className="mt-2 text-tinta-2">{resumen}</p>
      {hasta && (
        <p className="mt-1 text-sm text-muted">
          Lo retenemos hasta el <b>{hasta}</b>. Si para entonces no recibimos el pago, el horario se libera.
        </p>
      )}

      {/* Elegir cómo pagar */}
      {mostrarOpciones && (
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-tinta">¿Cómo desea pagar?</h2>
          <Opcion
            principal
            titulo="Tarjeta o Mercado Pago"
            importe={soles(r.tarjeta.total)}
            detalle={`Se confirma al instante. Incluye ${soles(r.tarjeta.recargo)} de comisión de Mercado Pago.`}
            accion="Pagar con tarjeta"
            onClick={() => elegir("tarjeta")}
            cargando={haciendo === "tarjeta"}
          />
          <Opcion
            titulo="Transferencia a Interbank"
            importe={soles(r.precio)}
            detalle="Transfiera a una cuenta peruana y suba su voucher. Confirmamos al verificar el abono."
            accion="Pagar por transferencia"
            onClick={() => elegir("transferencia")}
            cargando={haciendo === "transferencia"}
            deshabilitada={!r.puede_diferir}
            motivo="Este medio no está disponible porque la cita es muy próxima. Pague con tarjeta."
          />
          {r.metodo_pago !== "DESPUES" && (
            <Opcion
              titulo="Pagar después"
              detalle="Dejamos su horario separado y usted confirma el pago por WhatsApp."
              accion="Pagar después"
              onClick={() => elegir("despues")}
              cargando={haciendo === "despues"}
              deshabilitada={!r.puede_diferir}
              motivo="Esta opción no está disponible porque la cita es muy próxima. Pague con tarjeta."
            />
          )}
        </div>
      )}

      {/* Transferencia elegida */}
      {r.metodo_pago === "TRANSFERENCIA" && !cambiar && (
        <div className="mt-6 space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-linea">
            <p className="text-sm text-muted">Importe a transferir</p>
            <p className="font-fraunces text-4xl font-semibold text-primary">{soles(r.transferencia.importe)}</p>
            <div className="mt-3">
              <Fila etiqueta="Banco" valor={`${r.transferencia.banco} · ${r.transferencia.tipo_cuenta}`} />
              <Fila etiqueta="Titular" valor={r.transferencia.titular} />
              <Fila etiqueta="N.° de cuenta" valor={r.transferencia.cuenta} copiable="digitos" />
              <Fila etiqueta="CCI (desde otros bancos)" valor={r.transferencia.cci} copiable="digitos" />
              <Fila etiqueta="Concepto o referencia" valor={referencia} copiable="texto" />
            </div>
            <p className="mt-3 rounded-xl bg-info-soft px-3 py-2 text-sm text-info-ink">
              Escriba <b>{referencia}</b> en el concepto: nos permite reconocer su pago.
            </p>
          </section>

          <section className="rounded-2xl border border-accent/40 bg-aviso-soft p-4">
            <p className="text-sm font-semibold text-aviso-ink">
              Esta reserva no se completará hasta que envíe su comprobante.
            </p>
            <div className="mt-3">
              <SubirVoucher id={id} yaSubido={r.voucher_subido} onSubido={cargar} />
            </div>
            <div className="mt-4 border-t border-accent/30 pt-3">
              <ContactosWhatsApp
                contactos={r.contactos}
                titulo="¿Prefiere enviarlo por WhatsApp? Escriba a cualquiera de estos números:"
                mensaje={`Hola, adjunto mi voucher de la reserva ${referencia} (${resumen}).`}
              />
            </div>
          </section>

          <button type="button" className="text-sm text-muted underline underline-offset-4" onClick={() => setCambiar(true)}>
            Cambiar medio de pago
          </button>
        </div>
      )}

      {/* Pagar después elegido */}
      {r.metodo_pago === "DESPUES" && !cambiar && (
        <div className="mt-6 space-y-4">
          <section className="rounded-2xl border border-accent/40 bg-aviso-soft p-4">
            <p className="text-sm font-semibold text-aviso-ink">
              Esta reserva no se completará hasta que realice el pago.
            </p>
            <div className="mt-3">
              <ContactosWhatsApp
                contactos={r.contactos}
                titulo="Para confirmarla, escríbanos por WhatsApp a cualquiera de estos números:"
                mensaje={`Hola, quiero confirmar mi reserva ${referencia} (${resumen}).`}
              />
            </div>
          </section>
          <p className="text-sm text-tinta-2">También le enviamos este enlace por correo, para que pague cuando prefiera.</p>
          <button type="button" className={`${boton.primario} w-full`} onClick={() => setCambiar(true)}>
            Pagar ahora
          </button>
        </div>
      )}

      {cambiar && (
        <button type="button" className="mt-4 text-sm text-muted underline underline-offset-4" onClick={() => setCambiar(false)}>
          Volver
        </button>
      )}

      <div className="mt-8 text-center">{bloqueCancelar(false)}</div>

      <a href="/reservar" className="mt-4 block text-center text-sm text-muted underline underline-offset-4">
        Volver a la agenda
      </a>
    </Marco>
  );
}
