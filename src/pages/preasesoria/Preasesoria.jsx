// src/pages/preasesoria/Preasesoria.jsx
// Formulario previo a la asesoría. El enlace llega por correo (…/preasesoria?c=<id>&t=<token>)
// al confirmar la cita o cuando el equipo lo envía a quien agendó por Calendar u otra vía.
// Lo que se responde queda en la ficha del asesorado y llega al informe.
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../services/api";
import { whatsappUrl } from "../../config/contacto";
import { Icono } from "../reservar/iconos";
import "../reservar/reservar.css";

const campo = "mt-1.5 w-full rounded-xl border border-linea bg-white px-3 py-2.5 text-sm text-tinta placeholder:text-trazo focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Seccion({ icono, titulo, ayuda, children, i }) {
  return (
    <section className="rv-sube rounded-3xl bg-white p-5 shadow-sm ring-1 ring-linea" style={{ animationDelay: `${i * 70}ms` }}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-accent">
          <Icono nombre={icono} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-extrabold text-primary">{titulo}</h2>
          {ayuda && <p className="text-xs text-muted">{ayuda}</p>}
        </div>
      </div>
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const Etiqueta = ({ id, texto, ancho, children }) => (
  <div className={ancho ? "sm:col-span-2" : ""}>
    <label htmlFor={id} className="text-sm font-medium text-tinta">{texto}</label>
    {children}
  </div>
);

function Opciones({ lista, valor, onCambio }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 sm:col-span-2">
      {lista.map((o) => {
        const on = valor.includes(o);
        return (
          <button key={o} type="button" onClick={() => onCambio(on ? valor.filter((x) => x !== o) : [...valor, o])} aria-pressed={on}
            className={`rv-dia rounded-full border px-3.5 py-2 text-[13px] font-semibold active:scale-95 ${on ? "border-accent bg-accent text-white" : "border-linea bg-white text-tinta hover:border-primary"}`}>
            {on && "✓ "}{o}
          </button>
        );
      })}
    </div>
  );
}

function Marco({ children }) {
  return (
    <main className="min-h-screen bg-fondo px-4 py-10">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}

export default function Preasesoria() {
  const { c, t } = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    return { c: Number(q.get("c")), t: q.get("t") || "" };
  }, []);
  const sinEnlace = !c || !t;
  const [estado, setEstado] = useState(sinEnlace ? "error" : "cargando"); // cargando | listo | enviado | error
  const [msg, setMsg] = useState(sinEnlace ? "El enlace está incompleto. Escríbanos por WhatsApp y se lo reenviamos." : "");
  const [opc, setOpc] = useState({ intereses: [], inicios: [], becas: [], documentos: [] });
  const [nombre, setNombre] = useState("");
  const [f, setF] = useState({ carrera: "", universidad: "", anio_titulacion: "", promedio: "", cargo: "", anios: "", experiencia_detalle: "", idiomas: "", residencia: "", celular: "", interes: "", inicio: "", presupuesto: "", masteres_pensados: "", dudas: "", web: "" });
  const [becas, setBecas] = useState([]);
  const [docs, setDocs] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (sinEnlace) return;
    (async () => {
      try {
        const res = await apiGET(`/api/preasesoria/${c}?t=${encodeURIComponent(t)}`);
        if (!res?.ok) {
          setEstado("error");
          setMsg(res?.msg || "No pudimos abrir el formulario.");
          return;
        }
        setNombre(res.nombre || "");
        setOpc(res.opciones || {});
        const g = res.respuestas;
        if (g) {
          setF((p) => ({ ...p, carrera: g.formacion?.carrera || "", universidad: g.formacion?.universidad || "", anio_titulacion: g.formacion?.anio_titulacion || "", promedio: g.formacion?.promedio || "", cargo: g.experiencia?.cargo || "", anios: g.experiencia?.anios || "", experiencia_detalle: g.experiencia?.detalle || "", idiomas: g.idiomas || "", residencia: g.residencia || "", interes: g.interes || "", inicio: g.inicio || "", presupuesto: g.presupuesto || "", masteres_pensados: g.masteres_pensados || "", dudas: g.dudas || "" }));
          setBecas(g.becas_interes || []);
          setDocs(g.documentos_listos || []);
        }
        setEstado("listo");
      } catch {
        setEstado("error");
        setMsg("Error de conexión. Intente de nuevo.");
      }
    })();
  }, [c, t, sinEnlace]);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await apiPOST(`/api/preasesoria/${c}?t=${encodeURIComponent(t)}`, { ...f, becas_interes: becas, documentos_listos: docs });
      if (res?.ok) setEstado("enviado");
      else setMsg(res?.msg || "No se pudo guardar.");
    } catch {
      setMsg("Error de conexión. Intente de nuevo.");
    }
    setEnviando(false);
  };

  if (estado === "cargando") {
    return (
      <Marco>
        <div className="rv-esqueleto h-10 w-2/3 rounded-full bg-linea" />
        <div className="rv-esqueleto mt-4 h-64 rounded-3xl bg-linea" />
      </Marco>
    );
  }
  if (estado === "error") {
    return (
      <Marco>
        <h1 className="font-fraunces text-3xl font-semibold text-primary">No pudimos abrir su formulario</h1>
        <p className="mt-2 text-tinta-2">{msg}</p>
        <a href={whatsappUrl("Hola Inspira, necesito el enlace de mi formulario previo a la asesoría.")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">
          <Icono nombre="whatsapp" className="h-4 w-4" /> Escribir por WhatsApp
        </a>
      </Marco>
    );
  }
  if (estado === "enviado") {
    return (
      <Marco>
        <div className="rv-pop-grande rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-linea">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-verde-soft text-verde"><Icono nombre="check" className="h-8 w-8" /></span>
          <h1 className="mt-4 font-fraunces text-3xl font-semibold text-primary">¡Gracias{nombre ? `, ${nombre.split(" ")[0]}` : ""}!</h1>
          <p className="mt-2 text-tinta-2">Recibimos su información. Llegaremos a su asesoría conociendo su perfil, y podrá completar o corregir este formulario con el mismo enlace hasta el momento de la reunión.</p>
          <a href="/" className="mt-6 inline-block rounded-full border border-primary px-5 py-2.5 text-sm font-bold text-primary">Volver a Inspira</a>
        </div>
      </Marco>
    );
  }

  return (
    <main className="min-h-screen bg-fondo pb-16">
      <header className="rv-hero-claro relative overflow-hidden px-4 pb-10 pt-9 text-primary">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true"><span className="rv-liquido rv-liquido-a" /><span className="rv-liquido rv-liquido-b" /></div>
        <div className="relative mx-auto max-w-2xl">
          <p className="rv-entra-izq inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">Antes de su asesoría</p>
          <h1 className="rv-sube mt-3 text-[2rem] font-black uppercase leading-[1.05] tracking-tight md:text-5xl">Cuéntenos <span className="text-accent">sobre usted</span></h1>
          <p className="rv-sube mt-3 text-[15px] leading-relaxed text-tinta-2" style={{ animationDelay: "120ms" }}>
            {nombre ? <>Hola, <strong className="text-primary">{nombre.split(" ")[0]}</strong>. </> : null}
            Son unos 5 minutos. Así la especialista llega a la sesión conociendo su perfil y usted aprovecha cada minuto. <strong className="text-primary">No necesita enviar documentos</strong> ahora.
          </p>
        </div>
      </header>

      <form onSubmit={enviar} className="relative mx-auto -mt-2 max-w-2xl space-y-4 px-4" noValidate>
        <input type="text" name="web" value={f.web} onChange={set("web")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        <Seccion i={0} icono="gorro" titulo="Sus estudios" ayuda="Aproximado está bien.">
          <Etiqueta id="p-carrera" texto="Carrera o título"><input id="p-carrera" value={f.carrera} onChange={set("carrera")} maxLength={120} className={campo} placeholder="Ej.: Arquitectura" /></Etiqueta>
          <Etiqueta id="p-uni" texto="Universidad"><input id="p-uni" value={f.universidad} onChange={set("universidad")} maxLength={120} className={campo} placeholder="Ej.: Universidad Nacional de Trujillo" /></Etiqueta>
          <Etiqueta id="p-anio" texto="Año de titulación"><input id="p-anio" inputMode="numeric" value={f.anio_titulacion} onChange={set("anio_titulacion")} maxLength={10} className={campo} placeholder="Ej.: 2021" /></Etiqueta>
          <Etiqueta id="p-prom" texto="Promedio (con su escala)"><input id="p-prom" value={f.promedio} onChange={set("promedio")} maxLength={40} className={campo} placeholder="Ej.: 16,8 sobre 20" /></Etiqueta>
        </Seccion>

        <Seccion i={1} icono="pasaporte" titulo="Su experiencia laboral" ayuda="Lo principal: cargo, años y funciones.">
          <Etiqueta id="p-cargo" texto="Cargo o área"><input id="p-cargo" value={f.cargo} onChange={set("cargo")} maxLength={120} className={campo} placeholder="Ej.: Proyectista" /></Etiqueta>
          <Etiqueta id="p-anios" texto="Años de experiencia"><input id="p-anios" value={f.anios} onChange={set("anios")} maxLength={20} className={campo} placeholder="Ej.: 3" /></Etiqueta>
          <Etiqueta id="p-exp" texto="Funciones principales (opcional)" ancho><textarea id="p-exp" value={f.experiencia_detalle} onChange={set("experiencia_detalle")} rows={3} maxLength={500} className={`${campo} resize-y`} /></Etiqueta>
          <Etiqueta id="p-idiomas" texto="Idiomas y certificados" ancho><input id="p-idiomas" value={f.idiomas} onChange={set("idiomas")} maxLength={200} className={campo} placeholder="Ej.: inglés B2 certificado" /></Etiqueta>
        </Seccion>

        <Seccion i={2} icono="globo" titulo="Lo que busca" ayuda="Aunque sean ideas sueltas.">
          <Etiqueta id="p-interes" texto="¿Qué le interesa?">
            <select id="p-interes" value={f.interes} onChange={set("interes")} className={campo}><option value="">Elija una opción</option>{(opc.intereses || []).map((o) => <option key={o}>{o}</option>)}</select>
          </Etiqueta>
          <Etiqueta id="p-inicio" texto="¿Cuándo quiere empezar?">
            <select id="p-inicio" value={f.inicio} onChange={set("inicio")} className={campo}><option value="">Elija una opción</option>{(opc.inicios || []).map((o) => <option key={o}>{o}</option>)}</select>
          </Etiqueta>
          <Etiqueta id="p-mast" texto="Másteres o universidades que ya investigó" ancho><textarea id="p-mast" value={f.masteres_pensados} onChange={set("masteres_pensados")} rows={3} maxLength={600} className={`${campo} resize-y`} placeholder="Nombres, enlaces o ideas: lo que tenga" /></Etiqueta>
          <Etiqueta id="p-pres" texto="Presupuesto aproximado de matrícula"><input id="p-pres" value={f.presupuesto} onChange={set("presupuesto")} maxLength={80} className={campo} placeholder="Ej.: hasta 3 000 €" /></Etiqueta>
          <Etiqueta id="p-resid" texto="País donde vive"><input id="p-resid" value={f.residencia} onChange={set("residencia")} maxLength={80} className={campo} placeholder="Ej.: Perú" /></Etiqueta>
        </Seccion>

        <Seccion i={3} icono="medalla" titulo="Becas" ayuda="Marque las que le interesen.">
          <Opciones lista={opc.becas || []} valor={becas} onCambio={setBecas} />
        </Seccion>

        <Seccion i={4} icono="check" titulo="Documentos que ya tiene" ayuda="Solo para saber por dónde empezar: no los envíe todavía.">
          <Opciones lista={opc.documentos || []} valor={docs} onCambio={setDocs} />
        </Seccion>

        <Seccion i={5} icono="usuario" titulo="Para contactarle y resolver dudas">
          <Etiqueta id="p-cel" texto="Celular o WhatsApp"><input id="p-cel" type="tel" inputMode="tel" value={f.celular} onChange={set("celular")} maxLength={30} className={campo} placeholder="+51 999 999 999" /></Etiqueta>
          <Etiqueta id="p-dudas" texto="¿Qué duda quiere resolver sí o sí?" ancho><textarea id="p-dudas" value={f.dudas} onChange={set("dudas")} rows={3} maxLength={800} className={`${campo} resize-y`} /></Etiqueta>
        </Seccion>

        {msg && <p className="rounded-xl bg-alto-soft px-4 py-3 text-sm text-alto-ink" role="alert">{msg}</p>}
        <button type="submit" disabled={enviando} className="rv-cta relative w-full overflow-hidden rounded-full bg-primary px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_14px_30px_-16px_rgba(1,52,70,.9)] transition hover:bg-primary-light active:scale-[0.99] disabled:opacity-50">
          {enviando ? "Guardando…" : "Enviar mi información"}
        </button>
        <p className="text-center text-xs text-muted">Puede volver a este mismo enlace para completar o corregir antes de la reunión. Su información es confidencial.</p>
      </form>
    </main>
  );
}
