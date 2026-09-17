// src/pages/extranjeria/HistorialOficina.jsx
// «Hace tres meses iban por marzo; ahora, por mayo».
//
// Es un extra, no una parte esencial de la página: el histórico vive en
// /api/extranjeria/fechas/historial?oficina=… y puede no existir todavía. Si
// no responde, si viene vacío o si no sabemos leerlo, este bloque no se pinta
// y no pasa nada más (pedirHistorial ya devuelve null en vez de lanzar).
//
// Una frase y no un gráfico: con dos o tres capturas, una curva sugiere una
// tendencia que el dato no sostiene.
import { useEffect, useState } from "react";
import Icono from "../../components/common/Icono";
import { mesAnio, pedirHistorial, resumenHistorial, textoDistancia } from "./fechas";

export default function HistorialOficina({ oficina }) {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    let vivo = true;
    pedirHistorial(oficina.id).then((puntos) => {
      if (!vivo) return;
      setResumen(puntos ? resumenHistorial(puntos) : null);
    });
    return () => {
      vivo = false;
    };
  }, [oficina.id]);

  if (!resumen) return null;

  const { antes, ahora, hace, avanzo, avance } = resumen;
  const retrocedio = avance && avance.signo === -1 && !(avance.meses === 0 && avance.dias === 0);

  return (
    <p className="ext-historial">
      <Icono nombre="reloj" size={15} />
      <span>
        Hace {textoDistancia(hace)} esta oficina iba por <b>{mesAnio(antes)}</b>; ahora va por{" "}
        <b>{mesAnio(ahora)}</b>
        {avanzo && <> — ha avanzado {textoDistancia(avance)} de expedientes en ese tiempo.</>}
        {!avanzo && !retrocedio && <> — la fecha publicada no se ha movido en ese tiempo.</>}
        {retrocedio && <> — la fecha publicada ha retrocedido; suele pasar cuando la oficina corrige o reagrupa lo publicado.</>}
      </span>
    </p>
  );
}
