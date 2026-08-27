// Quién más entra a un expediente.
//
// Bloque propio y no un campo de la ficha: no es un dato del expediente, es
// darle a alguien la llave de los datos de extranjería de otra persona. Tiene
// que costar un gesto deliberado, verse después, y poder deshacerse.
//
// Dos como mucho. No es un límite técnico: a partir de ahí nadie sabe ya quién
// está mirando el expediente de quién.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST, boDELETE } from "../../../../services/backofficeApi";

const input = "text-[12.5px] border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B]";

function fecha(v) {
  if (!v) return null;
  return new Date(v).toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function Ficha({ i, onQuitar }) {
  const [quitando, setQuitando] = useState(false);

  async function quitar() {
    const seguro = window.confirm(
      `¿Quitarle el acceso a ${i.correo}?\n\n` +
      "Dejará de recibir los avisos y no podrá entrar al expediente."
    );
    if (!seguro) return;
    setQuitando(true);
    await onQuitar(i.id_invitado);
    setQuitando(false);
  }

  return (
    <div className="rounded-xl border border-[#1A3557]/25 bg-[#EEF2F8]/50 px-3.5 py-3">
      <div className="flex items-start gap-2.5 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-neutral-900 break-words">{i.correo}</p>
          <p className="text-[12px] text-neutral-600 mt-0.5">{i.quien}</p>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
            {i.aceptado_at
              ? `Entró por primera vez el ${fecha(i.aceptado_at)}.`
              : "Todavía no ha entrado al portal."}
            {i.puede_editar
              ? " Puede subir documentos y completar datos."
              : " Sólo puede mirar."}
          </p>
        </div>
        <button type="button" onClick={quitar} disabled={quitando}
          className="shrink-0 text-[11.5px] text-neutral-400 hover:text-red-600 disabled:opacity-40">
          {quitando ? "…" : "Quitar acceso"}
        </button>
      </div>
    </div>
  );
}

export default function Invitados({ idSolicitud, numero = "6" }) {
  const [lista, setLista] = useState([]);
  const [maximo, setMaximo] = useState(2);
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState("");
  const [quien, setQuien] = useState("");
  const [puedeEditar, setPuedeEditar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  const cargar = useCallback(
    () => boGET(`/backoffice/solicitudes/${idSolicitud}/invitados`).then((r) => {
      if (r?.ok) { setLista(r.invitados || []); setMaximo(r.maximo || 2); }
    }),
    [idSolicitud],
  );

  useEffect(() => { cargar(); }, [cargar]);

  async function invitar() {
    setEnviando(true); setMsg(null);
    const r = await boPOST(`/backoffice/solicitudes/${idSolicitud}/invitados`, {
      correo: correo.trim(), quien: quien.trim(), puede_editar: puedeEditar,
    });
    setEnviando(false);
    if (r?.ok) {
      setCorreo(""); setQuien(""); setAbierto(false);
      setMsg({ texto: `Listo. Le avisamos a ${r.invitado.correo} y también al asesorado.` });
      cargar();
    } else {
      setMsg({ mal: true, texto: r?.msg || "No se pudo invitar" });
    }
  }

  async function quitar(id) {
    const r = await boDELETE(`/backoffice/solicitudes/${idSolicitud}/invitados/${id}`);
    if (r?.ok) { setMsg({ texto: "Acceso retirado." }); cargar(); }
    else setMsg({ mal: true, texto: r?.msg || "No se pudo quitar" });
  }

  const lleno = lista.length >= maximo;

  return (
    <div id="bloque-invitados"
      className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
          font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Quién más entra</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">
          {lista.length === 0 ? "sólo el asesorado" : `${lista.length} de ${maximo}`}
        </span>
      </div>

      <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-3">
        Lo normal es que entre sólo el asesorado. Se usa cuando hace falta de verdad —el padre
        de un menor, quien lleva el tema en la empresa—. Quien entra <b>ve todo el expediente y
        recibe todos los avisos</b>, y se le avisa por correo de que le has dado acceso. Al
        asesorado también.
      </p>

      {lista.length > 0 && (
        <div className="space-y-2 mb-3">
          {lista.map((i) => <Ficha key={i.id_invitado} i={i} onQuitar={quitar} />)}
        </div>
      )}

      {abierto ? (
        <div className="rounded-xl border border-dashed border-[#023A4B]/40 p-3 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com" className={`${input} flex-1 min-w-0`} />
            <input type="text" value={quien} onChange={(e) => setQuien(e.target.value)}
              placeholder="Quién es (su hermana, RR. HH.…)"
              className={`${input} flex-1 min-w-0`} />
          </div>

          <label className="flex items-start gap-2 text-[12px] text-neutral-600">
            <input type="checkbox" className="mt-0.5 accent-[#023A4B]"
              checked={puedeEditar} onChange={(e) => setPuedeEditar(e.target.checked)} />
            <span>
              Puede subir documentos y completar datos.
              <span className="block text-[11px] text-neutral-400">
                Si lo desmarcas, sólo podrá mirar.
              </span>
            </span>
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={invitar}
              disabled={enviando || !correo.trim() || !quien.trim()}
              className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1A3557]
                text-white hover:opacity-90 disabled:opacity-40">
              {enviando ? "Invitando…" : "Dar acceso y avisar"}
            </button>
            <button type="button" onClick={() => { setAbierto(false); setMsg(null); }}
              className="text-[12px] text-neutral-500 hover:text-neutral-700">cancelar</button>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Esa persona va a ver el pasaporte, el domicilio, los documentos y las
            comunicaciones de Extranjería del asesorado. Asegúrate de que él está de acuerdo.
          </p>
        </div>
      ) : (
        <button type="button" onClick={() => setAbierto(true)} disabled={lleno}
          title={lleno ? `Ya hay ${maximo}. Quita a una antes de añadir otra.` : undefined}
          className="text-[12px] font-semibold px-4 py-2 rounded-lg border-2 border-dashed
            border-neutral-300 text-neutral-500 w-full hover:border-[#023A4B]
            hover:text-[#023A4B] disabled:opacity-40 disabled:hover:border-neutral-300">
          {lleno ? `Ya hay ${maximo} personas con acceso` : "+ Dar acceso a alguien más"}
        </button>
      )}

      {msg && (
        <p className={`text-[11.5px] mt-2 leading-relaxed ${
          msg.mal ? "text-red-600" : "text-[#1D6A4A]"
        }`}>{msg.texto}</p>
      )}
    </div>
  );
}
