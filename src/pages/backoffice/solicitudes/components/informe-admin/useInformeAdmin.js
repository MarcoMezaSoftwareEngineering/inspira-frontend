// Estado de InformeAdmin: la compatibilidad que calcula el motor, la lista
// curada en edición, el buscador, la revisión y la publicación del informe.
// Salió de InformeAdmin.jsx al partirlo en piezas (09/10/2026); el orden de
// los hooks y de los efectos es el mismo que tenía allí.
import { useEffect, useRef, useState } from "react";
import { boGET, boPATCH, boPOST, boUpload } from "../../../../../services/backofficeApi";
import { dialog } from "../../../../../services/dialogService";
import { euros, numero } from "../../../../../lib/formatos";
import { API_URL } from "../../utils";

export default function useInformeAdmin({ detalle, recargar, onRegenerado }) {
  const [subiendoInforme, setSubiendoInforme] = useState(false);
  const [compat, setCompat]         = useState(null);
  const [loadingCompat, setLoading] = useState(true);
  const [editMode, setEditMode]     = useState(false);
  const [listaEdit, setListaEdit]   = useState([]);
  const [searchQ, setSearchQ]       = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [showParams, setShowParams] = useState(false);

  // Búsqueda libre contra el catálogo completo
  const [searchResults, setSearchResults]     = useState([]);
  const [searchingMasters, setSearchingMasters] = useState(false);
  // Parecidos a lo que el asesorado escribió que busca (sin filtros)
  const [modoParecidos, setModoParecidos]     = useState(false);
  // Lo que salió del recálculo y aún no está en la lista curada
  const [nuevosCandidatos, setNuevosCandidatos] = useState(null);

  // Modal de crear nuevo máster
  const [modalCrear,    setModalCrear]    = useState(false);
  const [catalogData,   setCatalogData]   = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { cargarCompatibilidad(); }, [detalle.id_solicitud]); // eslint-disable-line

  // Búsqueda con debounce contra /backoffice/catalogo/masters
  useEffect(() => {
    if (!editMode) return;
    clearTimeout(debounceRef.current);

    if (searchQ.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingMasters(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await boGET(
          `/backoffice/catalogo/masters?search=${encodeURIComponent(searchQ)}&limit=10&activo=true`
        );
        if (r.ok) {
          const todosCompat = compat?.resultados ?? [];
          const resultados = (r.masters || [])
            .filter((m) => !listaEdit.some((e) => e.master.id_master === m.id_master))
            .map((m) => {
              const compat = todosCompat.find((c) => c.master.id_master === m.id_master);
              return { master: m, score: compat?.score ?? null };
            });
          setSearchResults(resultados);
        }
      } catch { /* silencioso */ }
      finally { setSearchingMasters(false); }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQ, editMode]); // eslint-disable-line

  async function cargarCompatibilidad() {
    setLoading(true);
    try {
      const r = await boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/compatibilidad`);
      if (r.ok) setCompat(r);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }

  // Recalcula con el formulario de hoy sin tocar la lista curada: lo que ya
  // decidió el asesor se queda; lo nuevo se ofrece aparte para que lo revise.
  async function recalcular() {
    // Con qué se compara: la lista curada si la hay y, si no, la automática
    // que había en pantalla. Hasta el 09/09/2026 sin lista curada no se
    // comparaba con nada: el asesor pulsaba «Recalcular», la lista cambiaba
    // sola y no aparecía ni un aviso de qué había entrado ni qué se había
    // movido. Los cambios estaban, pero no se veían.
    const curado = Array.isArray(detalle.informe_compat_curado) && detalle.informe_compat_curado.length
      ? detalle.informe_compat_curado : null;
    const anterior = curado || (compat?.resultados || []).slice(0, 20);

    setCompat(null);
    setNuevosCandidatos(null);
    setLoading(true);
    try {
      const r = await boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/compatibilidad`);
      if (r.ok) {
        setCompat(r);
        if (anterior.length) {
          const ids = new Set(anterior.map((c) => c.master.id_master));
          const res = r.resultados || [];
          const nuevos = res.slice(0, 20).filter((x) => !ids.has(x.master.id_master));
          const cambiados = anterior.filter((c) => {
            const f = res.find((x) => x.master.id_master === c.master.id_master);
            return f && f.score !== c.score;
          }).length;
          const salieron = anterior.filter((c) => !res.slice(0, 20).some((x) => x.master.id_master === c.master.id_master)).length;
          setNuevosCandidatos({ nuevos, cambiados, salieron, resultados: res, esCurada: Boolean(curado) });
        }
      }
    } catch { /* silencioso */ }
    finally { setLoading(false); }
    onRegenerado?.();
  }

  // Lleva el recálculo a la lista curada, en modo edición: puntuaciones al
  // día y los nuevos al final. El asesor decide y guarda.
  function aplicarRecalculo() {
    const curado = detalle.informe_compat_curado || [];
    const res = nuevosCandidatos?.resultados || [];
    const actualizada = curado.map((c) => {
      const f = res.find((x) => x.master.id_master === c.master.id_master);
      return f ? { ...c, score: f.score, master: { ...c.master, afinidad_deseada: f.master.afinidad_deseada, coincide_con: f.master.coincide_con } } : c;
    });
    setListaEdit([...actualizada, ...(nuevosCandidatos?.nuevos || []).map((n) => ({ ...n }))]);
    setEditMode(true);
    setSearchQ("");
    setSearchResults([]);
    setNuevosCandidatos(null);
  }

  async function volverAlAutomatico() {
    const ok = await dialog.confirm("Se descarta la lista curada y el informe vuelve al cálculo automático. ¿Continuar?", "Volver al automático");
    if (!ok) return;
    setEditMode(false);
    setListaEdit([]);
    setNuevosCandidatos(null);
    await restaurarAuto();
    await cargarCompatibilidad();
    onRegenerado?.();
  }

  // Todo el catálogo, sin filtros, ordenado por parecido a lo que escribió.
  // `listaBase` para poder encadenarlo con `entrarEdicion()`: si se lee
  // `listaEdit` en el mismo tick todavía está vacía y no filtra nada.
  async function buscarParecidos(listaBase) {
    const yaEstan = Array.isArray(listaBase) ? listaBase : listaEdit;
    setSearchingMasters(true);
    setSearchQ("");
    setModoParecidos(true);
    try {
      const r = await boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/compatibilidad/parecidos`);
      if (r.ok) {
        const res = (r.resultados || []).filter((x) => !yaEstan.some((e) => e.master.id_master === x.master.id_master));
        setSearchResults(res);
        if (!res.length) dialog.toast(r.total ? "Todos los parecidos ya están en la lista." : "El asesorado no escribió qué máster busca.", "info");
      }
    } catch { dialog.toast("No se pudo buscar", "error"); }
    finally { setSearchingMasters(false); }
  }

  // Devuelve la lista con la que se entra a editar: quien la llame para
  // encadenar una búsqueda la necesita ya, porque `listaEdit` todavía no se
  // ha actualizado en este tick.
  function entrarEdicion() {
    // Todo lo que el motor aprobó, no doce. Su paquete decide cuántos caben
    // —el Full Económico dio dieciséis— y recortar aquí a un número fijo hacía
    // desaparecer los cuatro últimos sin decírselo a nadie.
    const base = (detalle.informe_compat_curado ?? compat?.resultados ?? []).map((r) => ({ ...r }));
    setListaEdit(base);
    setEditMode(true);
    setSearchQ("");
    setSearchResults([]);
    return base;
  }

  function moverArriba(idx) {
    if (idx === 0) return;
    const l = [...listaEdit];
    [l[idx - 1], l[idx]] = [l[idx], l[idx - 1]];
    setListaEdit(l);
  }

  function moverAbajo(idx) {
    if (idx === listaEdit.length - 1) return;
    const l = [...listaEdit];
    [l[idx], l[idx + 1]] = [l[idx + 1], l[idx]];
    setListaEdit(l);
  }

  // Llevar un máster al puesto que diga el asesor. Con dieciséis en la lista,
  // subir el último a primero eran quince clics en la flecha.
  function moverAPosicion(idx, destino) {
    setListaEdit((prev) => {
      const d = Math.max(0, Math.min(prev.length - 1, Number(destino) - 1));
      if (Number.isNaN(d) || d === idx) return prev;
      const l = [...prev];
      const [m] = l.splice(idx, 1);
      l.splice(d, 0, m);
      return l;
    });
  }

  function eliminarItem(idx) {
    setListaEdit((prev) => prev.filter((_, i) => i !== idx));
  }

  // Quitar por id: los montones de adicionales no saben en qué puesto está.
  function quitarPorId(id) {
    setListaEdit((prev) => prev.filter((e) => e.master.id_master !== id));
  }

  // `foco` es para el buscador: al añadir desde ahí conviene volver al campo
  // para seguir escribiendo, pero al añadir desde el panel de relacionados el
  // salto de foco arrastra la pantalla y hace perder el sitio de la lista.
  function añadirItem(r, { foco = true } = {}) {
    if (listaEdit.some((e) => e.master.id_master === r.master.id_master)) return;
    setListaEdit((prev) => [...prev, r]);
    if (!foco) return;
    setSearchQ("");
    setSearchResults((prev) => modoParecidos ? prev.filter((x) => x.master.id_master !== r.master.id_master) : []);
    searchRef.current?.focus();
  }

  function cambiarScore(idx, valor) {
    setListaEdit((prev) => prev.map((item, i) => i === idx ? { ...item, score: valor } : item));
  }

  async function abrirModalCrear() {
    if (catalogData) { setModalCrear(true); return; }
    setLoadingCatalog(true);
    try {
      const [rRamas, rCom, rUni] = await Promise.all([
        boGET("/backoffice/catalogo/ramas"),
        boGET("/backoffice/catalogo/comunidades"),
        boGET("/backoffice/catalogo/universidades"),
      ]);
      setCatalogData({
        ramas:         rRamas.ok  ? rRamas.ramas         : [],
        comunidades:   rCom.ok    ? rCom.comunidades      : [],
        universidades: rUni.ok    ? rUni.universidades    : [],
      });
      setModalCrear(true);
    } catch { dialog.toast("Error cargando catálogo", "error"); }
    finally { setLoadingCatalog(false); }
  }

  async function onMasterCreado(masterRaw) {
    setModalCrear(false);
    if (!masterRaw?.id_master) return;
    try {
      const r = await boGET(`/backoffice/catalogo/masters/${masterRaw.id_master}`);
      if (r.ok && r.master) {
        añadirItem({ master: r.master, score: null });
      }
    } catch { /* si falla solo no lo agrega */ }
  }


  const [revisando, setRevisando] = useState(false);
  const revision = detalle.informe_revision_estado || "BORRADOR";

  /** Se lo manda a quien tiene que darle el visto bueno. */
  async function mandarARevision() {
    setRevisando(true);
    const r = await boPOST(
      `/backoffice/solicitudes/${detalle.id_solicitud}/informe/revision`,
      { filtros: filtros || null },
    );
    setRevisando(false);
    if (r?.ok) { dialog.toast(`Avisado a ${r.avisado_a}`, "success"); recargar?.(); }
    else dialog.toast(r?.msg || "No se pudo mandar a revisión", "error");
  }

  /** Aprobar, o devolverlo diciendo qué corregir. */
  async function resolverRevision(estado) {
    let nota = null;
    if (estado === "DEVUELTO") {
      nota = window.prompt("¿Qué hay que corregir?");
      if (!nota?.trim()) return;
    }
    setRevisando(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${detalle.id_solicitud}/informe/revision`,
      { estado, nota },
    );
    setRevisando(false);
    if (r?.ok) {
      dialog.toast(estado === "APROBADO" ? "Informe aprobado" : "Devuelto con observaciones", "success");
      recargar?.();
    } else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }
  async function publicarInforme() {
    setPublicando(true);
    try {
      const listaParaPublicar = listaEdit.length
        ? listaEdit
        : (detalle.informe_compat_curado ?? compat?.resultados ?? []);
      if (listaParaPublicar.length) {
        await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: listaParaPublicar });
      }
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/publicar-informe`, {});
      if (!r.ok) throw new Error(r.msg || "Error al publicar");
      await recargar();
      dialog.toast("Informe publicado · Cliente notificado por email", "success");
    } catch (e) { dialog.toast(e.message || "Error al publicar", "error"); }
    finally { setPublicando(false); }
  }

  async function guardarCurado() {
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, {
        lista: listaEdit,
      });
      if (!r.ok) throw new Error(r.msg || "Error al guardar");
      await recargar();
      setEditMode(false);
    } catch (e) { dialog.toast(e.message || "Error al guardar", "error"); }
    finally { setGuardando(false); }
  }

  async function restaurarAuto() {
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: null });
      if (!r.ok) throw new Error(r.msg || "Error al restaurar");
      await recargar();
    } catch (e) { dialog.toast(e.message || "Error al restaurar", "error"); }
    finally { setGuardando(false); }
  }

  async function handleUploadInforme(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoInforme(true);
    try {
      const r = await boUpload(`/api/admin/solicitudes/${detalle.id_solicitud}/informe`, file);
      if (!r.ok) { dialog.toast(r.msg || "No se pudo subir el informe", "error"); return; }
      await recargar();
    } finally { setSubiendoInforme(false); }
  }

  async function manejarInformeAdmin(modo) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) { dialog.toast("No existe sesión de backoffice", "error"); return; }
      const resp = await fetch(
        `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) { dialog.toast("No se pudo obtener el informe", "error"); return; }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = detalle.informe_nombre_original || "informe";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      dialog.toast("Error al abrir/descargar el informe", "error");
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const datos     = detalle?.datos_formulario || {};
  // Lo que el asesorado escribió a mano: nombres de máster y temas de interés.
  // Es contra lo que se buscan los parecidos, y va a la vista para que el
  // asesor vea si el motor está ordenando por eso o por otra cosa.
  const loQuePidio = [
    ...(Array.isArray(datos.masteres_deseados) ? datos.masteres_deseados : []),
    ...(Array.isArray(datos.especializaciones) ? datos.especializaciones : []),
  ].filter(Boolean).join(" · ");
  const planLabel = detalle?.titulo || "Plan contratado";
  const filtros   = [
    datos.comunidades_preferidas
      ? (Array.isArray(datos.comunidades_preferidas)
          ? datos.comunidades_preferidas.join(", ")
          : datos.comunidades_preferidas)
      : null,
    datos.presupuesto_hasta
      ? `Máx. ${euros(Number(datos.presupuesto_hasta))}`
      : null,
  ].filter(Boolean).join(" · ");

  // Cuántos caben en su informe lo dice su paquete, no un número fijo aquí:
  // el Full Económico son seis comunidades y el de solo Andalucía necesita
  // doce para ordenar sus seis preferencias del Distrito Único.
  const FINALISTAS  = compat?.finalistas ?? 12;
  const listaVista  = detalle.informe_compat_curado ?? compat?.resultados ?? [];
  const isCurado    = !!detalle.informe_compat_curado;
  const extras      = Math.max(0, listaVista.length - FINALISTAS);
  // Dentro de su plan pero fuera de cupo, y los de fuera del plan que sólo son
  // posibles con beca. El asesor sube a la lista los que quiera.
  const enEspera    = compat?.extras || [];
  const conBeca     = compat?.solo_con_beca || [];
  const fueraPlan   = compat?.fuera_del_plan || [];
  const relacionados = [
    { clave: "plan",  titulo: "En su plan",      items: enEspera,
      sub: "Están en las comunidades que contrató. Se quedaron fuera por cupo o porque el motor los vio menos claros: súbelos si te parecen mejores." },
    { clave: "beca",  titulo: "Sólo con beca",   items: conBeca,
      sub: "Fuera de su plan, pero los oferta una beca que paga la matrícula. Habla con él antes de incluirlos." },
    { clave: "fuera", titulo: "Fuera de su plan", items: fueraPlan,
      sub: "Encajan con lo que busca pero están en comunidades que no contrató: sólo si le vendes esa comunidad aparte." },
  ];
  // Lo que ya está en la lista, para no ofrecer un añadir que no hace nada.
  const idsEnLista = new Set((editMode ? listaEdit : listaVista).map((r) => r.master.id_master));

  // Lo que el asesorado escribió a mano va primero: es lo que de verdad busca.
  const lista = (v) => (Array.isArray(v) && v.filter(Boolean).length ? v.filter(Boolean).join(" · ") : null);
  const paramRows = [
    ["Máster que busca",   lista(datos.masteres_deseados)],
    ["Temas de interés",   lista(datos.especializaciones)],
    ["Máster de referencia", (compat?.perfil?.anclas || []).map((a) => `${a.nombre_limpio} (${a.universidad})`).join(" · ") || null],
    ["Enlaces sin localizar", (compat?.perfil?.enlaces_sin_resolver || []).join(" · ") || null],
    ["Rama del máster",    compat?.perfil?.rama_label    || datos.area_interes_master],
    ["Sub-área",           compat?.perfil?.sub_area_label || null],
    ["Área de carrera",    datos.area_carrera],
    ["Promedio",           datos.promedio_peru ? `${datos.promedio_peru} / ${datos.promedio_escala || 10}` : null],
    ["Posición académica", datos.ubicacion_grupo],
    ["Experiencia",        datos.experiencia_anios],
    ["Vinculada al área",  datos.experiencia_vinculada],
    ["Inglés",             datos.ingles_situacion],
    ["Objetivo",           datos.objetivo_master],
    ["Investigación",      datos.investigacion_experiencia],
    ["Modalidad",          datos.modalidad_preferida],
    ["Duración",           datos.duracion_preferida],
    ["Prácticas",          datos.practicas_preferencia],
    ["Presupuesto",        datos.presupuesto_hasta ? `€${numero(Number(datos.presupuesto_hasta))}` : null],
    ["CCAA preferidas",    compat?.perfil?.ccaa?.join(", ")],
  ];

  const showDropdown = (searchQ.length >= 2) || (modoParecidos && searchResults.length > 0);

  return {
    subiendoInforme, compat, loadingCompat, editMode, setEditMode, listaEdit,
    searchQ, setSearchQ, guardando, publicando, showParams, setShowParams,
    searchResults, setSearchResults, searchingMasters, modoParecidos, setModoParecidos,
    nuevosCandidatos, setNuevosCandidatos, modalCrear, setModalCrear, catalogData,
    loadingCatalog, searchRef, revisando, revision,
    recalcular, aplicarRecalculo, volverAlAutomatico, buscarParecidos, entrarEdicion,
    moverArriba, moverAbajo, moverAPosicion, eliminarItem, quitarPorId, añadirItem,
    cambiarScore, abrirModalCrear, onMasterCreado, mandarARevision, resolverRevision,
    publicarInforme, guardarCurado, handleUploadInforme, manejarInformeAdmin,
    datos, loQuePidio, planLabel, filtros, FINALISTAS, listaVista, isCurado, extras,
    relacionados, idsEnLista, paramRows, showDropdown,
  };
}
