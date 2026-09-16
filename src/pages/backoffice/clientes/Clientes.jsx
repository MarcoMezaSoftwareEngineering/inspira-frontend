// src/pages/backoffice/clientes/Clientes.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPOST, boPUT } from "../../../services/backofficeApi";
import AltaRapida from "./AltaRapida";
import { dialog } from "../../../services/dialogService";
import ClientesLista from "./ClientesLista";
import Duplicados from "./Duplicados";
import ClienteForm from "./ClienteForm";
import ServiciosClienteModal from "./ServiciosClienteModal";
import PerfilClienteModal from "./PerfilClienteModal";
import FichaCliente from "./FichaCliente";
import { useAuth } from "../context/AuthContext";
import { Pagina, Cabecera, Cuerpo, Boton } from "../ui";
import { Plus, X } from "lucide-react";

const FORM_INICIAL = {
  id_cliente: null,
  nombre: "",
  email_contacto: "",
  telefono: "",
  dni: "",
  pasaporte: "",
  pais_origen: "",
  canal_origen: "",
  activo: true,
};

function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls =
    tipo === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${cls}`}
    >
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  // ?alta=1 (botón «+» del móvil) abre el alta directamente.
  const [altaAbierta, setAltaAbierta] = useState(() => new URLSearchParams(window.location.search).get("alta") === "1");
  // Lo más urgente arriba: vencido, luego lo que vence antes.
  const [orden, setOrden] = useState("urgentes");
  const [equipo, setEquipo] = useState([]);
  // Por defecto, quien tiene un proceso en marcha: es con quien se trabaja.
  const [filtro, setFiltro] = useState("activos");
  const [conteos, setConteos] = useState({});
  const [etiquetas, setEtiquetas] = useState({});
  const [etiqueta, setEtiqueta] = useState("");
  // Ficha completa: sustituye a la lista mientras esta abierta.
  // ?cliente=ID abre su ficha directamente (buscador global, enlaces).
  const [fichaDe, setFichaDe] = useState(() => {
    const id = Number(new URLSearchParams(window.location.search).get("cliente"));
    return id || null;
  });
  const [verDuplicados, setVerDuplicados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [modo, setModo] = useState("nuevo");
  const [showModal, setShowModal] = useState(false);
  const [clienteServicios, setClienteServicios] = useState(null);
  const [clientePerfil, setClientePerfil] = useState(null);
  const [toast, setToast] = useState(null); // { msg, tipo }

  const debounceRef = useRef(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    boGET("/backoffice/solicitudes/equipo").then((r) => r.ok && setEquipo(r.equipo || []));
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cierre con Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showModal) closeModal();
        if (clienteServicios) setClienteServicios(null);
        if (clientePerfil) setClientePerfil(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal, clienteServicios, clientePerfil]);

  async function cargar(qParam, ordenParam, filtroParam, etiquetaParam) {
    setLoading(true);
    const query = qParam !== undefined ? qParam : q;
    const ord = ordenParam !== undefined ? ordenParam : orden;
    const fil = filtroParam !== undefined ? filtroParam : filtro;
    const partes = [`orden=${ord}`, "pageSize=200"];
    if (fil) partes.push(`filtro=${fil}`);
    const et = etiquetaParam !== undefined ? etiquetaParam : etiqueta;
    if (et) partes.push(`etiqueta=${encodeURIComponent(et)}`);
    if (query.trim()) partes.push(`q=${encodeURIComponent(query.trim())}`);
    const url = `/backoffice/clientes?${partes.join("&")}`;
    const r = await boGET(url);
    if (r.ok) { setClientes(r.clientes || []); setConteos(r.conteos || {}); setEtiquetas(r.etiquetas || {}); }
    setLoading(false);
  }

  function onSearchChange(val) {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(val), 380);
  }

  function openModal(modo = "nuevo") {
    setModo(modo);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(FORM_INICIAL);
    setModo("nuevo");
  }

  function onEditarCliente(c) {
    if (!isAdmin) return;
    setForm({
      id_cliente: c.id_cliente,
      nombre: c.nombre || "",
      email_contacto: c.email_contacto || "",
      telefono: c.telefono || "",
      dni: c.dni || "",
      pasaporte: c.pasaporte || "",
      pais_origen: c.pais_origen || "",
      canal_origen: c.canal_origen || "",
      activo: c.activo ?? true,
    });
    openModal("editar");
  }

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onVerServiciosCliente(c) {
    setClienteServicios(c);
  }

  // Abrir un cliente lleva a su ficha completa —servicios, pagos y notas—
  // en vez del modal reducido, que solo mostraba sus datos.
  function onVerPerfilCliente(c) {
    setFichaDe(c.id_cliente);
  }

  async function onSubmitForm(e) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);

    const payload = {
      nombre: (form.nombre || "").trim(),
      email_contacto: (form.email_contacto || "").trim(),
      telefono: form.telefono || null,
      dni: form.dni || null,
      pasaporte: form.pasaporte || null,
      pais_origen: form.pais_origen || null,
      canal_origen: form.canal_origen || null,
      ...(modo === "editar" ? { activo: !!form.activo } : {}),
    };

    let r;
    if (form.id_cliente) {
      r = await boPUT(`/backoffice/clientes/${form.id_cliente}`, payload);
    } else {
      r = await boPOST("/backoffice/clientes", payload);
    }

    setSaving(false);

    if (!r.ok) {
      setToast({ msg: r.msg || "Error guardando cliente", tipo: "error" });
      return;
    }

    closeModal();
    cargar();
    setToast({
      msg: modo === "editar" ? "Cliente actualizado correctamente." : "Cliente creado. Se envió correo de bienvenida.",
      tipo: "ok",
    });
  }

  async function onToggleActivoCliente(c) {
    if (!isAdmin) return;
    const nuevoEstado = !c.activo;
    const ok = await dialog.confirm(
      nuevoEstado ? "¿Activar este cliente?" : "¿Desactivar este cliente?"
    );
    if (!ok) return;

    const r = await boPUT(`/backoffice/clientes/${c.id_cliente}`, {
      nombre: c.nombre || "",
      email_contacto: c.email_contacto || "",
      telefono: c.telefono || null,
      dni: c.dni || null,
      pasaporte: c.pasaporte || null,
      pais_origen: c.pais_origen || null,
      canal_origen: c.canal_origen || null,
      activo: nuevoEstado,
    });

    if (!r.ok) {
      setToast({ msg: r.msg || "No se pudo actualizar el estado.", tipo: "error" });
      return;
    }

    if (r.cliente) {
      setClientes((prev) =>
        prev.map((cli) => (cli.id_cliente === c.id_cliente ? r.cliente : cli))
      );
    } else {
      cargar();
    }
  }

  async function onPurgarCliente(c) {
    if (!isAdmin) return;
    const ok = await dialog.confirm(
      `¿Purgar a "${c.nombre || c.email_contacto}"?\n\nEsto borrará todos sus datos personales de forma permanente. El registro queda vacío para liberar el correo.`
    );
    if (!ok) return;

    const r = await boPOST(`/backoffice/clientes/${c.id_cliente}/purgar`);

    if (!r.ok) {
      setToast({ msg: r.msg || "No se pudo purgar el cliente.", tipo: "error" });
      return;
    }

    setToast({ msg: "Cliente purgado. Sus datos han sido eliminados.", tipo: "ok" });
    cargar();
  }


  // En pantallas anchas la ficha se abre al lado de la lista: se pasa de un
  // cliente a otro sin perder el sitio. En el móvil sustituye a la lista.
  const [ancho, setAncho] = useState(() => window.innerWidth);
  useEffect(() => {
    const r = () => setAncho(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  const dividida = ancho >= 1280;

  const ficha = fichaDe ? (
    <FichaCliente
      key={fichaDe}
      idCliente={fichaDe}
      onVolver={() => { setFichaDe(null); cargar(); }}
      onAbrirProceso={(id) => { window.location.href = `/backoffice/solicitudes/${id}`; }}
    />
  ) : null;

  if (fichaDe && !dividida) return <Pagina><Cuerpo>{ficha}</Cuerpo></Pagina>;

  if (verDuplicados) {
    return (
      <Pagina>
        <Cuerpo>
          <Duplicados
            isAdmin={isAdmin}
            avisar={(msg, tipo) => setToast({ msg, tipo })}
            onVolver={() => { setVerDuplicados(false); cargar(); }}
          />
          {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}
        </Cuerpo>
      </Pagina>
    );
  }

  const stats = [
    { n: conteos.le_toca_asesor ?? 0, l: "le toca al asesor", onClick: () => cambiarFiltro("le_toca_asesor") },
    { n: conteos.esperando_asesorado ?? 0, l: "esperando al asesorado", tono: "cielo", onClick: () => cambiarFiltro("esperando_asesorado") },
    { n: conteos.vencidos ?? 0, l: "con fecha vencida", tono: conteos.vencidos ? "rojo" : undefined, onClick: () => cambiarFiltro("vencidos") },
    { n: conteos.sin_abrir ?? 0, l: "sin abrir por su asesor", tono: conteos.sin_abrir ? "alerta" : undefined, onClick: () => cambiarFiltro("sin_abrir") },
    { n: conteos.activos ?? 0, l: "con proceso activo", tono: "ok", onClick: () => cambiarFiltro("activos") },
  ];

  function cambiarFiltro(v) {
    const nuevo = filtro === v ? "activos" : v;
    setFiltro(nuevo);
    cargar(undefined, undefined, nuevo);
  }

  const lista = (
    <>
      {altaAbierta && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--sombra)" }}>
          <AltaRapida
            onCancelar={() => setAltaAbierta(false)}
            onCreado={() => { setAltaAbierta(false); cargar(); }}
          />
        </div>
      )}

      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#62808f] pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="w-full bg-white border border-[#d8e4ef] rounded-2xl pl-10 pr-4 py-3 text-[14px] focus:outline-none focus:ring-4 focus:ring-[#013446]/10 focus:border-[#02506b] transition-shadow"
          style={{ boxShadow: "var(--sombra)" }}
          placeholder="Buscar por nombre, correo, celular o DNI…"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {loading && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 ase-spin" />}
      </div>

      <ClientesLista
        clientes={clientes}
        loading={loading}
        orden={orden}
        onOrden={(v) => { setOrden(v); cargar(undefined, v); }}
        filtro={filtro}
        onFiltro={(v) => { setFiltro(v); cargar(undefined, undefined, v); }}
        conteos={conteos}
        equipo={equipo}
        onRecargar={() => cargar()}
        etiquetas={etiquetas}
        etiqueta={etiqueta}
        onEtiqueta={(v) => { setEtiqueta(v); cargar(undefined, undefined, undefined, v); }}
        onAbrir={onVerPerfilCliente}
        onEditar={onEditarCliente}
        onServicios={onVerServiciosCliente}
        onActivo={onToggleActivoCliente}
        onPurgar={onPurgarCliente}
        isAdmin={isAdmin}
        compacta={dividida && Boolean(fichaDe)}
        seleccionado={fichaDe}
      />
    </>
  );

  return (
    <Pagina>
      <Cabecera
        eyebrow="Clientes"
        titulo="Tu cartera"
        subtitulo="Quién espera algo, de quién y para cuándo. Toca una cifra para filtrar."
        acciones={isAdmin && (
          <>
            <Boton tono="cta" icono={altaAbierta ? X : Plus} onClick={() => setAltaAbierta((v) => !v)}>
              {altaAbierta ? "Cerrar" : "Nuevo cliente"}
            </Boton>
            <Boton tono="cristal" onClick={() => openModal("nuevo")}>Solo ficha</Boton>
            <Boton tono="cristal" onClick={() => setVerDuplicados(true)}>Duplicados</Boton>
          </>
        )}
        stats={stats}
      />

      <Cuerpo className={dividida && fichaDe ? "!max-w-none" : ""}>
        {dividida && fichaDe ? (
          <div className="grid grid-cols-[minmax(380px,440px)_1fr] gap-4 items-start">
            <div className="space-y-3 sticky top-3 max-h-[calc(100vh-24px)] overflow-y-auto pr-1">{lista}</div>
            <div className="min-w-0">{ficha}</div>
          </div>
        ) : (
          <div className="space-y-3">{lista}</div>
        )}
      </Cuerpo>

      {isAdmin && showModal && (
        <ClienteForm form={form} modo={modo} onChange={onChangeForm} onSubmit={onSubmitForm} onCancel={closeModal} saving={saving} />
      )}
      {clienteServicios && <ServiciosClienteModal cliente={clienteServicios} onClose={() => setClienteServicios(null)} />}
      {clientePerfil && <PerfilClienteModal cliente={clientePerfil} onClose={() => setClientePerfil(null)} />}
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </Pagina>
  );
}
