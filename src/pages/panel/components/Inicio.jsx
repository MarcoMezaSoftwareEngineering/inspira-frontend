// La portada del panel: qué le toca hacer hoy, quién le atiende, sus servicios.
//
// El panel estaba organizado por estructura —servicios, secciones— y no por
// acción. Al entrar, nada decía que había dos documentos observados, un plazo
// que cierra en tres días y un requerimiento sin responder. Esa información
// ya existía repartida por las tarjetas y los bloques; aquí se junta en una
// lista, ordenada por urgencia, y cada línea lleva a donde se resuelve.
import { useState } from "react";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { pendientesDe } from "../pendientes";
import ServiciosList from "./mis-servicios/ServiciosList";
import AvisoInstalarApp from "./AvisoInstalarApp";
import { ProximoPaso, ResumenExpediente } from "./ProximoPaso";
import { MiRutaResumen } from "./MiRuta";
import SaludoInicio from "./SaludoInicio";
import { EsqueletoTarjetas } from "./Esqueleto";

// Cinco a la vista y el resto tras «ver más»: el resumen va debajo y tiene
// que seguir viéndose sin bajar media pantalla.
const A_LA_VISTA = 5;

function Pendientes({ items }) {
  const [todo, setTodo] = useState(false);
  const visibles = todo ? items : items.slice(0, A_LA_VISTA);
  const ocultos = items.length - visibles.length;
  return (
    <ul className="pnl-pend">
      {visibles.map((it, i) => (
        // Toda la fila es el botón: en el móvil el dedo no apunta a una píldora.
        <li key={it.clave} className="pnl-pend-item pnl-fila-entra" data-tono={it.tono} style={{ "--i": i }}
          role="button" tabIndex={0} aria-label={`${it.texto}. ${it.accion}`}
          onClick={() => navigate(it.href)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(it.href); } }}
        >
          <span className="pnl-pend-icono"><Icono nombre={it.icono} size={17} /></span>
          <span className="pnl-pend-cuerpo">
            <span className="pnl-pend-texto">{it.texto}</span>
            {(it.detalle || it.servicio) && (
              <span className="pnl-pend-detalle">
                {[it.detalle, it.servicio].filter(Boolean).join(" · ")}
              </span>
            )}
          </span>
          <span className="pnl-pend-ir" aria-hidden="true">
            <span className="pnl-pend-ir-texto">{it.accion}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </span>
        </li>
      ))}
      {ocultos > 0 && (
        <li>
          <button type="button" className="pnl-btn ux-tap w-full justify-center" onClick={() => setTodo(true)}>
            Ver {ocultos} más
          </button>
        </li>
      )}
    </ul>
  );
}

export default function Inicio({ servicios, perfil, conAcademico, conCompleto, loading, error, onRecargar, onVerDetalle, avisoAppBloqueado = false, pagos = null, avisoPerfil = null }) {
  const lista = servicios || [];
  // `pagos`: sus planes de pago; las cuotas que vencen pronto entran en «Hoy».
  const items = loading ? [] : pendientesDe(lista, perfil, conAcademico, conCompleto, pagos);
  const hayServicios = lista.length > 0;
  // El primero ya sale en grande en «Tu próximo paso»: aquí va el resto.
  const resto = items.slice(1);

  const irAPendientes = () => {
    const el = document.getElementById("pnl-hoy") || document.getElementById("pnl-proximo");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sin servicios (o cargando la primera vez): la lista sabe pintar la espera,
  // el error y la pantalla de «todavía no tienes acceso».
  if (!hayServicios) {
    if (loading) {
      return (
        <div className="space-y-4" aria-busy="true">
          <div className="pnl-esq" style={{ height: 210, borderRadius: 26 }} />
          <div className="pnl-esq" style={{ height: 130, borderRadius: 22 }} />
          <EsqueletoTarjetas n={1} />
        </div>
      );
    }
    return (
      <ServiciosList servicios={servicios} loading={loading} error={error} onRecargar={onRecargar} onVerDetalle={onVerDetalle} />
    );
  }

  return (
    <div className="space-y-5 pnl-cascada">
      <SaludoInicio perfil={perfil} servicios={lista} pendientes={items.length} onVerPendientes={irAPendientes} />

      {!loading && (
        // Con 0 o 1 pendientes no hay «También pendiente»: el paso «hoy» del
        // recorrido señala entonces el próximo paso.
        <div id="pnl-proximo" style={{ scrollMarginTop: 12 }} data-tour={resto.length ? undefined : "hoy"}>
          <ProximoPaso items={items} servicios={lista} />
        </div>
      )}

      {/* Solo en el teléfono, fuera de la app instalada, y nunca a la vez que
          el recorrido guiado o el asistente de perfil. Va después del
          próximo paso: no compite con él. */}
      <AvisoInstalarApp bloqueado={avisoAppBloqueado} />

      {resto.length > 0 && (
        <section id="pnl-hoy" data-tour="hoy" style={{ scrollMarginTop: 12 }}>
          <div className="pnl-seccion-titulo">
            <h2>También pendiente</h2>
            <small>{resto.length} más, por urgencia</small>
          </div>
          <Pendientes items={resto} />
        </section>
      )}

      {/* El aviso de perfil, si su pendiente no es ya el próximo paso: con
          peso bajo podía quedar escondido tras «Ver más». */}
      {avisoPerfil}

      <div data-tour="servicios">
        <ResumenExpediente servicios={lista} onRecargar={onRecargar} />
      </div>

      {!loading && <MiRutaResumen servicios={lista} />}
    </div>
  );
}
