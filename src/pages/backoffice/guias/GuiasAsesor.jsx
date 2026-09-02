// Las guías, las mismas que ve el asesorado.
//
// No es una copia ni un resumen: son literalmente los mismos componentes que se
// renderizan en su portal. Si se mantuviera una versión aparte para uso interno,
// a la tercera actualización el asesor estaría leyendo una cosa y el asesorado
// otra, que es la peor forma de contradecirse delante de un cliente.
import { lazy, Suspense, useState } from "react";
import { BookOpen } from "lucide-react";
import { Pagina, Cabecera, Cuerpo, Pill, Esqueleto } from "../ui";

const GuiaMaster = lazy(() => import("../../panel/GuiaMaster"));
const GuiaEstancia = lazy(() => import("../../panel/GuiaEstancia"));
const GuiaModificatoria = lazy(() => import("../../panel/GuiaModificatoria"));
const GuiaApostilla = lazy(() => import("../../panel/GuiaApostilla"));

const GUIAS = [
  { id: "master", label: "Postulación a Máster", Comp: GuiaMaster },
  { id: "estancia", label: "Estancia por estudios", Comp: GuiaEstancia },
  { id: "modificatoria", label: "Modificación a trabajo", Comp: GuiaModificatoria },
  { id: "apostilla", label: "Apostilla digital", Comp: GuiaApostilla },
];

export default function GuiasAsesor() {
  const [activa, setActiva] = useState("master");
  const guia = GUIAS.find((g) => g.id === activa) || GUIAS[0];
  const { Comp } = guia;

  return (
    <Pagina>
      <Cabecera
        eyebrow="Guías"
        titulo="Lo mismo que lee el asesorado"
        subtitulo="Exactamente lo que ve en su portal, para consultarlo mientras le atiendes y no contradecirle sin querer."
      >
        <div className="ase-pills" style={{ marginTop: 18 }}>
          {GUIAS.map((g) => (
            <Pill key={g.id} on={activa === g.id} onClick={() => setActiva(g.id)}
              style={activa === g.id ? undefined : { background: "rgba(255,255,255,.1)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}>
              {g.label}
            </Pill>
          ))}
        </div>
      </Cabecera>

      <Cuerpo>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--muted)" }}>
          <BookOpen size={15} color="#4E9EE8" />
          <span><b style={{ color: "var(--primary)" }}>{guia.label}</b> · tal cual la ve el asesorado, sin recortes.</span>
        </div>
        {/* Las guías traen su propio ancho y su propio fondo, pensados para el
            portal. Se dejan correr enteras dentro de su caja en vez de pelearse
            con ellas desde fuera. */}
        <div key={activa} className="ase-tarjeta ase-entra" style={{ overflow: "hidden" }}>
          <Suspense fallback={<div style={{ padding: 20 }}><Esqueleto filas={5} alto={64} /></div>}>
            <Comp />
          </Suspense>
        </div>
      </Cuerpo>
    </Pagina>
  );
}
