import { useMemo } from "react";
import { FLabel, EMsg } from "../Campos";
import ListaTemas from "../ListaTemas";
import { OBJETIVOS, OBJETIVO_LEGADO } from "../constantes";
import { sugerirTemas } from "../utilidades";

// ── PASO 7: Rama de conocimiento + sub-área ─────────────────────────
export default function PasoTipoMaster({ formData, set, has, ramas, subareas }) {
  // Solo cambia al elegir otra rama o al llegar el catálogo: no se vuelve a
  // filtrar con cada tecla en los campos de texto de este paso.
  const subAreasFiltradas = useMemo(() => subareas.filter(
    (sa) => sa.rama === formData.area_interes_master
  ), [subareas, formData.area_interes_master]);
  // Lo más directo primero: qué máster busca, con su nombre. Con eso el
  // informe encuentra ese y los parecidos; la rama y la sub-área acotan.
  // Hasta tres másteres y dos especializaciones, en texto libre.
  const deseados = Array.isArray(formData.masteres_deseados) ? formData.masteres_deseados : [];
  const especialidades = Array.isArray(formData.especializaciones) ? formData.especializaciones : [];
  const enlaces = Array.isArray(formData.masteres_enlaces) ? formData.masteres_enlaces : [];
  const objetivoActual = OBJETIVO_LEGADO[formData.objetivo_master] || formData.objetivo_master;
  const ponerLista = (key, lista, largo, i, valor) => {
    const next = [...lista]; while (next.length < largo) next.push("");
    next[i] = valor; set(key, next);
  };
  const campoTexto = "w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
  return (
    <div className="space-y-5">
      <div>
        <FLabel>¿Qué máster estás buscando?</FLabel>
        <p className="text-xs text-neutral-400 mb-3">
          Escribe hasta tres, con el nombre que conozcas —aunque no sepas la universidad—.
          Buscaremos esos y los parecidos. Ej.: «Máster en Marketing Digital».
        </p>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <input key={i} type="text" className={campoTexto} value={deseados[i] || ""}
              placeholder={["Primera opción", "Segunda opción (opcional)", "Tercera opción (opcional)"][i]}
              onChange={(e) => ponerLista("masteres_deseados", deseados, 3, i, e.target.value)} />
          ))}
        </div>
      </div>

      <div>
        <FLabel>¿Qué temas te interesan?</FLabel>
        <p className="text-xs text-neutral-400 mb-3">
          Cuéntanos con más detalle qué quieres estudiar, aunque no sepas el nombre del
          máster. Escribe un tema y pulsa «Añadir» (hasta seis), o toca los que te sugerimos.
        </p>
        <ListaTemas
          valor={especialidades}
          onChange={(lista) => set("especializaciones", lista)}
          sugerencias={sugerirTemas(formData.area_carrera, formData.area_interes_master)}
          campo={campoTexto}
        />
      </div>

      <div>
        <FLabel>¿Has visto ya algún máster que te guste? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
        <p className="text-xs text-neutral-400 mb-3">
          Pega el enlace de su página en la web de la universidad. Lo usamos como referencia:
          buscamos ese y los que se le parecen.
        </p>
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <input key={i} type="url" inputMode="url" className={campoTexto} value={enlaces[i] || ""}
              placeholder={["https://…", "Otro enlace (opcional)"][i]}
              onChange={(e) => ponerLista("masteres_enlaces", enlaces, 2, i, e.target.value)} />
          ))}
        </div>
      </div>

      <div>
        <FLabel>
          ¿A qué rama pertenece el máster que te interesa?
          {deseados.some((t) => String(t || "").trim()) && (
            <span className="font-normal text-neutral-400"> (opcional: la deducimos de lo que escribiste)</span>
          )}
        </FLabel>
        <p className="text-xs text-neutral-400 mb-3">
          Puede ser diferente a tu carrera de origen.
        </p>
        {ramas.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">Cargando opciones…</p>
        ) : (
          <div className={`grid grid-cols-2 gap-2 ${has("area_interes_master") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
            {ramas.map((r) => {
              const active = formData.area_interes_master === r.valor;
              return (
                <button key={r.valor} type="button"
                  onClick={() => {
                    const newVal = active ? "" : r.valor;
                    set("area_interes_master", newVal);
                    set("sub_area_interes", "");
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] text-left ${
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "border-neutral-200 bg-white hover:border-primary hover:text-primary text-neutral-700"
                  }`}>
                  <span className="leading-snug">{r.etiqueta}</span>
                  {active && <span className="shrink-0 text-white/80 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        )}
        <EMsg show={has("area_interes_master")} msg="Selecciona la rama de tu interés o escribe arriba qué máster buscas" />
      </div>

      {formData.area_interes_master && subAreasFiltradas.length > 0 && (
        <div>
          <FLabel>¿Tienes alguna especialidad en mente? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
          <p className="text-xs text-neutral-400 mb-3">
            Si aún no lo sabes, puedes dejarlo en blanco.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {subAreasFiltradas.map((sa) => {
              const active = formData.sub_area_interes === sa.valor;
              return (
                <button key={sa.valor} type="button"
                  onClick={() => set("sub_area_interes", active ? "" : sa.valor)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] text-left ${
                    active
                      ? "bg-primary/10 text-primary border-primary shadow-sm"
                      : "border-neutral-200 bg-white hover:border-primary/50 hover:text-primary text-neutral-600"
                  }`}>
                  <span className="leading-snug">{sa.etiqueta}</span>
                  {active && <span className="shrink-0 text-primary text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <FLabel>¿Cuál es tu principal objetivo con el máster? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
        <div className="flex flex-col gap-2 mt-1">
          {OBJETIVOS.map(({ val, label }) => (
            <button key={val} type="button"
              onClick={() => set("objetivo_master", objetivoActual === val ? "" : val)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-[0.99] ${
                objetivoActual === val
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
