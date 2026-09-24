// src/pages/expediente/Expediente.jsx
//
// El expediente de ejemplo: un visado de estudios desde Lima, papel por papel.
//
// Quien llega aquí ya sabe que quiere ir; lo que le asusta es «que falte un
// papel». La página responde enseñando el expediente entero de una vez, en el
// orden en que se produce (los seis pasos del servicio), y cada documento se
// abre para verse tal como tiene que quedar: formato real, datos tapados, y
// debajo lo que más se rechaza. La interacción es marcar «ya lo tengo»: al
// final se ve cuántos faltan y el WhatsApp sale ya con esa lista escrita.
//
// Los datos de los documentos están en textos.js; aquí solo se pintan. Las
// reconstrucciones (Papel) son HTML, no imágenes: pesan nada, se leen con
// lector de pantalla y se corrigen editando texto.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { DOCUMENTOS, EXPEDIENTE, IPREM_ANIO, IPREM_MES, PASOS, TOTAL } from "./textos";
import "./expediente.css";

const CLAVE = "inspira:expediente:tengo";
const T = EXPEDIENTE.doc;

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/** Lo que se marcó en otra visita. Si el navegador no deja, empieza vacío. */
function leerMarcados() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    return new Set(Array.isArray(v) ? v.filter((id) => DOCUMENTOS.some((d) => d.id === id)) : []);
  } catch {
    return new Set();
  }
}

/** Un dato tapado: una barra negra del ancho del dato, con su nombre para el lector. */
function Tapado({ n = 8 }) {
  return <span className="exp-tapado" style={{ width: `${n}ch` }} role="img" aria-label={T.tapado} />;
}

/** Una fila «etiqueta: valor» del papel. */
function Campo({ et, children }) {
  return (
    <div className="exp-campo">
      <span className="exp-et">{et}</span>
      <span className="exp-valor">{children}</span>
    </div>
  );
}

/** La reconstrucción de cada documento. Datos inventados; formato, el real. */
function Papel({ d }) {
  switch (d.tipo) {
    case "carta":
      return (
        <div className="exp-papel exp-papel-carta">
          <div className="exp-membrete">
            <span className="exp-membrete-logo">U</span>
            <span>
              <strong>UNIVERSIDAD <Tapado n={11} /></strong>
              <br />
              <small>Escuela de Posgrado · Servicio de Alumnado</small>
            </span>
          </div>
          <h4>CERTIFICADO DE ADMISIÓN Y MATRÍCULA</h4>
          <p>
            Se CERTIFICA que D.ª <strong>VALERIA <Tapado n={7} /> <Tapado n={9} /></strong>, de nacionalidad peruana, con pasaporte n.º{" "}
            <Tapado n={9} />, ha sido <mark>ADMITIDA y ha formalizado matrícula</mark> en el{" "}
            <strong>Máster Universitario en Dirección y Administración de Empresas (MBA)</strong>, título oficial de{" "}
            <mark>60 créditos ECTS</mark>, <mark>modalidad presencial</mark>, para el curso académico 2026-2027.
          </p>
          <p>
            Periodo lectivo: <mark>del 14 de septiembre de 2026 al 30 de junio de 2027</mark>, con dedicación a tiempo completo.
          </p>
          <p>Y para que conste a efectos de solicitud de visado de estudios, se expide el presente en Valencia, a 12 de junio de 2026.</p>
          <div className="exp-firma">
            <span>
              <Tapado n={10} />
              <small>Jefa del Servicio de Alumnado</small>
            </span>
            <span className="exp-sello">SELLO</span>
          </div>
        </div>
      );

    case "banco":
      return (
        <div className="exp-papel exp-papel-banco">
          <pre>{`BANCO ${"█".repeat(10)}   OFICINA: LIMA, SAN ISIDRO
ESTADO DE CUENTA               DEL 01/05/2026 AL 30/07/2026
TITULAR : VALERIA ${"█".repeat(7)} ${"█".repeat(9)}
CUENTA  : ${"█".repeat(4)} ${"█".repeat(4)} ${"█".repeat(6)} 27      MONEDA: DÓLARES (USD)

FECHA   CONCEPTO                        IMPORTE      SALDO
-----   ---------------------------   ---------   ---------
02/05   SALDO ANTERIOR                              7.410,20
15/05   ABONO HABERES                    1.150,00   8.560,20
30/05   TRANSFERENCIA RECIBIDA             800,00   9.360,20
16/06   ABONO HABERES                    1.150,00  10.510,20
28/06   RETIRO CAJERO                     -300,00  10.210,20
15/07   ABONO HABERES                    1.150,00  11.360,20
30/07   SALDO FINAL                                11.360,20`}</pre>
          <div className="exp-sello-rojo">
            BANCO · 30 JUL 2026
            <br />
            Sello y firma de la oficina
          </div>
          <p className="exp-papel-nota">
            Saldo final ≈ 9.800 € al cambio del día: cubre {IPREM_ANIO} ({IPREM_MES} × 12) con margen. Tres meses de movimientos regulares, sin ingresos de golpe.
          </p>
        </div>
      );

    case "penales":
      return (
        <div className="exp-papel exp-papel-penales">
          <div className="exp-membrete">
            <span className="exp-membrete-logo">PJ</span>
            <span>
              <strong>PODER JUDICIAL DEL PERÚ</strong>
              <br />
              <small>Registro Nacional de Condenas</small>
            </span>
          </div>
          <h4>CERTIFICADO DE ANTECEDENTES PENALES</h4>
          <Campo et="Nombre">VALERIA <Tapado n={7} /> <Tapado n={9} /></Campo>
          <Campo et="Documento">Pasaporte <Tapado n={9} /></Campo>
          <Campo et="Resultado"><mark>NO REGISTRA ANTECEDENTES PENALES</mark></Campo>
          <Campo et="Emitido">Lima, 02 de julio de 2026 · vigencia 90 días</Campo>
          <div className="exp-apostilla">
            <h5>APOSTILLE <small>(Convention de La Haye du 5 octobre 1961)</small></h5>
            <ol>
              <li>País: <strong>PERÚ</strong></li>
              <li>Firmado por: <Tapado n={12} /></li>
              <li>En calidad de: Funcionario del Poder Judicial</li>
              <li>Sello de: Poder Judicial del Perú</li>
              <li>En: Lima</li>
              <li>El: 06/07/2026</li>
              <li>Por: Ministerio de Relaciones Exteriores</li>
              <li>N.º: <Tapado n={8} /></li>
              <li>Sello</li>
              <li>Firma: <Tapado n={7} /></li>
            </ol>
          </div>
        </div>
      );

    case "medico":
      return (
        <div className="exp-papel exp-papel-medico">
          <div className="exp-membrete">
            <span className="exp-membrete-logo">+</span>
            <span>
              <strong>CLÍNICA <Tapado n={9} /></strong>
              <br />
              <small>Lima · Medicina general</small>
            </span>
          </div>
          <h4>CERTIFICADO MÉDICO</h4>
          <p>
            El/la que suscribe, Dr./Dra. <Tapado n={12} />, médico cirujano con colegiatura <strong>CMP n.º <Tapado n={6} /></strong>, CERTIFICA que{" "}
            <strong>VALERIA <Tapado n={7} /> <Tapado n={9} /></strong>, nacida el <Tapado n={10} />, de nacionalidad peruana, con pasaporte n.º <Tapado n={9} />,
          </p>
          <p className="exp-frase">
            <mark>
              no padece ninguna de las enfermedades que pueden tener repercusiones de salud pública graves de conformidad con lo dispuesto en el Reglamento Sanitario
              Internacional de 2005.
            </mark>
          </p>
          <p className="exp-papel-nota">Esta es la parte que no se puede cambiar. Palabra por palabra.</p>
          <p>Se expide a solicitud de la interesada para el trámite de visado de estudios. Lima, 03 de julio de 2026.</p>
          <div className="exp-firma">
            <span>
              <Tapado n={10} />
              <small>Firma y sello del médico</small>
            </span>
            <span className="exp-sello">COLEGIO MÉDICO · VISADO</span>
          </div>
        </div>
      );

    case "seguro":
      return (
        <div className="exp-papel exp-papel-seguro">
          <div className="exp-membrete">
            <span className="exp-membrete-logo">S</span>
            <span>
              <strong>ASEGURADORA <Tapado n={8} /></strong>
              <br />
              <small>Entidad autorizada en España</small>
            </span>
          </div>
          <h4>CERTIFICADO DE SEGURO DE ASISTENCIA SANITARIA</h4>
          <Campo et="Asegurada">VALERIA <Tapado n={7} /> <Tapado n={9} /></Campo>
          <Campo et="Póliza">ES-<Tapado n={8} /> · Estudiantes internacionales</Campo>
          <Campo et="Vigencia"><mark>01/09/2026 – 31/08/2027</mark></Campo>
          <Campo et="Ámbito">Todo el territorio español</Campo>
          <ul className="exp-lista-si">
            <li><mark>Sin copagos</mark></li>
            <li><mark>Sin periodos de carencia</mark></li>
            <li><mark>Repatriación incluida</mark></li>
            <li>Cobertura equivalente a la sanidad pública española</li>
          </ul>
          <div className="exp-firma">
            <span>
              <Tapado n={10} />
              <small>Por la aseguradora</small>
            </span>
            <span className="exp-sello">SELLO</span>
          </div>
        </div>
      );

    case "formulario":
      return (
        <div className="exp-papel exp-papel-formulario">
          <h4>SOLICITUD DE VISADO NACIONAL</h4>
          <p className="exp-papel-nota">Impreso gratuito · Todos los campos son obligatorios</p>
          <div className="exp-form">
            <Campo et="1. Apellidos"><Tapado n={7} /> <Tapado n={9} /></Campo>
            <Campo et="2. Nombre">VALERIA</Campo>
            <Campo et="3. Fecha de nacimiento"><Tapado n={10} /></Campo>
            <Campo et="5. Nacionalidad actual">PERUANA</Campo>
            <Campo et="7. Documento de viaje">Pasaporte ordinario · n.º <Tapado n={9} /> · válido hasta <Tapado n={7} /></Campo>
            <Campo et="12. Domicilio en España">Calle <Tapado n={10} />, Valencia</Campo>
            <Campo et="19. Motivo del viaje"><mark>ESTUDIOS</mark></Campo>
            <Campo et="21. Duración prevista"><mark>10 meses</mark> (14/09/2026 – 30/06/2027)</Campo>
            <Campo et="22. Centro de estudios">Universidad <Tapado n={11} /> · MBA</Campo>
          </div>
          <div className="exp-firma">
            <span>
              <Tapado n={9} />
              <small>Firma de la solicitante · Lima, 14/07/2026</small>
            </span>
            <span className="exp-foto">FOTO</span>
          </div>
        </div>
      );

    case "pasaporte":
      return (
        <div className="exp-papel exp-papel-pasaporte">
          <div className="exp-pas-cab">
            <span>REPÚBLICA DEL PERÚ · PASAPORTE</span>
            <span>Tipo P · PER</span>
          </div>
          <div className="exp-pas-cuerpo">
            <span className="exp-pas-foto">FOTO</span>
            <div>
              <Campo et="N.º de pasaporte"><Tapado n={9} /></Campo>
              <Campo et="Apellidos"><Tapado n={7} /> <Tapado n={9} /></Campo>
              <Campo et="Nombres">VALERIA</Campo>
              <Campo et="Fecha de expedición">18/03/2024</Campo>
              <Campo et="Fecha de caducidad"><mark>18/03/2029</mark></Campo>
            </div>
          </div>
          <div className="exp-mrz">
            P&lt;PER<Tapado n={7} />&lt;&lt;VALERIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            <br />
            <Tapado n={9} />PER<Tapado n={7} />F2903189&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
          <p className="exp-papel-nota">Le quedan más de dos años el día de la cita, y tiene páginas en blanco. Sirve.</p>
        </div>
      );

    case "indice":
      return (
        <div className="exp-papel exp-papel-indice">
          <div className="exp-membrete">
            <span className="exp-membrete-logo exp-membrete-inspira">IL</span>
            <span>
              <strong>INSPIRA LEGAL · Hoja de ruta</strong>
              <br />
              <small>Cita consular · Lima · 14/07/2026 · 09:40</small>
            </span>
          </div>
          <ol className="exp-orden">
            {DOCUMENTOS.filter((x) => x.tipo !== "indice" && x.tipo !== "visado").map((x, i) => (
              <li key={x.id}>
                <span>{i + 1}</span>
                {x.nombre}
                <small>original + copia</small>
              </li>
            ))}
            <li>
              <span>8</span>
              Comprobante de cita y tasa
              <small>impreso</small>
            </li>
          </ol>
          <p className="exp-papel-nota">Originales en una funda, copias en otra, nada grapado. El orden es el de la ventanilla.</p>
        </div>
      );

    case "visado":
      return (
        <div className="exp-papel exp-papel-visado">
          <div className="exp-visa">
            <div className="exp-visa-cab">
              <span>ESPAÑA</span>
              <span>VISADO</span>
            </div>
            <Campo et="Válido para">ESTADOS SCHENGEN</Campo>
            <div className="exp-visa-fila">
              <Campo et="Desde">01/09/2026</Campo>
              <Campo et="Hasta">29/11/2026</Campo>
              <Campo et="Tipo"><mark>D</mark></Campo>
              <Campo et="Entradas">MULT</Campo>
            </div>
            <Campo et="Duración de la estancia">90 días</Campo>
            <Campo et="Expedido en">LIMA · 12/08/2026</Campo>
            <Campo et="Observaciones"><mark>ESTUDIOS · TIE</mark> · <Tapado n={10} /></Campo>
            <div className="exp-mrz">
              VDESP<Tapado n={7} />&lt;&lt;VALERIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            </div>
          </div>
          <p className="exp-papel-nota">Con esto se entra. En el primer mes en España se piden las huellas para la TIE: ahí seguimos contigo.</p>
        </div>
      );

    default:
      return null;
  }
}

/** La tarjeta de un documento en la lista: abrirlo, o marcar que ya se tiene. */
function Tarjeta({ d, tengo, onAbrir, onMarcar }) {
  return (
    <article className={`exp-doc${tengo ? " exp-doc-tengo" : ""}`}>
      <button type="button" className="exp-doc-abrir" onClick={() => onAbrir(d.id)}>
        <span className="exp-doc-icono"><Icono nombre={d.icono} size={20} /></span>
        <span className="exp-doc-texto">
          <strong>{d.nombre}</strong>
          <span>{d.emite}</span>
        </span>
        <span className="exp-doc-ver">{T.ver}</span>
      </button>
      <label className="exp-doc-check">
        <input type="checkbox" checked={tengo} onChange={() => onMarcar(d.id)} />
        <span>{tengo ? T.loTengo : T.tengo}</span>
      </label>
    </article>
  );
}

/** El documento abierto: la reconstrucción, y debajo qué mirar y qué lo tumba. */
function Detalle({ d, tengo, onCerrar, onMarcar, onIr }) {
  const i = DOCUMENTOS.indexOf(d);
  const ant = DOCUMENTOS[i - 1];
  const sig = DOCUMENTOS[i + 1];
  const wa = whatsappDesde("expediente", EXPEDIENTE.cierre.preguntarDetalle(d.nombre));

  // Escape cierra; y mientras está abierto, la página de atrás no se mueve.
  useEffect(() => {
    const tecla = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [onCerrar]);

  // A <body> por portal: la cabecera y el contenido llevan transformaciones
  // y un position: fixed dentro de ellas se mide contra la página entera, no
  // contra la pantalla; la ficha aparecía al final de todo.
  return createPortal(
    <div className="exp-velo" onClick={onCerrar}>
      <section className="exp-detalle" role="dialog" aria-modal="true" aria-labelledby="exp-detalle-t" onClick={(e) => e.stopPropagation()}>
        <header className="exp-detalle-cab">
          <div>
            <p className="exp-detalle-paso">
              Paso {d.paso + 1} · {PASOS[d.paso].titulo}
            </p>
            <h3 id="exp-detalle-t">{d.nombre}</h3>
          </div>
          <button type="button" className="exp-cerrar" onClick={onCerrar} aria-label={T.cerrar}>
            ×
          </button>
        </header>

        <div className="exp-detalle-cuerpo">
          <div className="exp-papel-marco" data-marca={T.marca}>
            <Papel d={d} />
          </div>

          <div className="exp-aviso">
            <strong>{T.rechazo}:</strong> {d.rechazo}
          </div>

          <h4 className="exp-h4">{T.comprueba}</h4>
          <ul className="exp-check">
            {d.comprueba.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {d.rechazan.length > 0 && (
            <>
              <h4 className="exp-h4">{T.rechazan}</h4>
              <ul className="exp-check exp-no">
                {d.rechazan.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <footer className="exp-detalle-pie">
          <button type="button" className={`exp-btn ${tengo ? "exp-btn-hecho" : "exp-btn-claro"}`} onClick={() => onMarcar(d.id)}>
            <Icono nombre="check" size={16} />
            {tengo ? T.loTengo : T.tengo}
          </button>
          <a href={wa} target="_blank" rel="noopener" className="exp-btn exp-btn-wa" onClick={() => registrarEvento("expediente_whatsapp", { id: d.id })}>
            <Icono nombre="whatsapp" size={18} />
            {T.preguntar}
          </a>
          <div className="exp-nav">
            <button type="button" disabled={!ant} onClick={() => ant && onIr(ant.id)}>
              ← {T.anterior}
            </button>
            <span>
              {i + 1}/{TOTAL}
            </span>
            <button type="button" disabled={!sig} onClick={() => sig && onIr(sig.id)}>
              {T.siguiente} →
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export default function Expediente() {
  useSEO(EXPEDIENTE.seo);
  const [abierto, setAbierto] = useState(null);
  const [tengo, setTengo] = useState(leerMarcados);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify([...tengo]));
    } catch {
      /* sin memoria: la marca vive lo que dura la visita */
    }
  }, [tengo]);

  const abrir = (id) => {
    setAbierto(id);
    registrarEvento("expediente_abrir", { id });
  };
  const cerrar = () => setAbierto(null);
  const marcar = (id) => {
    setTengo((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      registrarEvento("expediente_tengo", { id, tengo: !prev.has(id), total: s.size });
      return s;
    });
  };

  const faltan = DOCUMENTOS.filter((d) => !tengo.has(d.id)).map((d) => d.corto);
  const wa = whatsappDesde("expediente", EXPEDIENTE.cierre.whatsappDetalle(tengo.size, faltan));
  const doc = abierto && DOCUMENTOS.find((d) => d.id === abierto);

  return (
    <main className="exp">
      {/* Qué es esto y de quién */}
      <header className="exp-hero">
        <p className="exp-rotulo">
          <Icono nombre="maletin" size={14} />
          {EXPEDIENTE.rotulo}
        </p>
        <h1 className="exp-titulo">{EXPEDIENTE.titulo}</h1>
        <p className="exp-lead">{EXPEDIENTE.lead}</p>
        <dl className="exp-caso">
          {EXPEDIENTE.caso.map((c) => (
            <div key={c.et}>
              <dt>{c.et}</dt>
              <dd>{c.valor}</dd>
            </div>
          ))}
        </dl>
        <p className="exp-aviso-hero">{EXPEDIENTE.aviso}</p>
      </header>

      {/* Cuántos tienes */}
      <section className="exp-cuenta" aria-live="polite">
        <div className="exp-cuenta-num">
          <strong>{EXPEDIENTE.cuenta.de(tengo.size, TOTAL)}</strong>
          <span>{EXPEDIENTE.cuenta.titulo}</span>
        </div>
        <div className="exp-cuenta-barra" aria-hidden="true">
          <span style={{ width: `${(tengo.size / TOTAL) * 100}%` }} />
        </div>
        <p>
          {tengo.size === 0 ? EXPEDIENTE.cuenta.texto : tengo.size === TOTAL ? EXPEDIENTE.cuenta.completo : EXPEDIENTE.cuenta.faltan(TOTAL - tengo.size)}
        </p>
        {tengo.size > 0 && (
          <button type="button" className="exp-enlace" onClick={() => setTengo(new Set())}>
            {EXPEDIENTE.cuenta.reiniciar}
          </button>
        )}
      </section>

      {/* Los seis pasos con sus papeles */}
      <ol className="exp-pasos">
        {PASOS.map((p, i) => {
          const docs = DOCUMENTOS.filter((d) => d.paso === i);
          return (
            <li key={p.titulo} className="exp-paso">
              <div className="exp-paso-cab">
                <span className="exp-paso-num">{i + 1}</span>
                <div>
                  <h2>{p.titulo}</h2>
                  <p>{p.texto}</p>
                </div>
              </div>
              {docs.length > 0 && (
                <div className="exp-docs">
                  {docs.map((d) => (
                    <Tarjeta key={d.id} d={d} tengo={tengo.has(d.id)} onAbrir={abrir} onMarcar={marcar} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* La puerta */}
      <section className="exp-cierre">
        <h2 className="exp-h2">{EXPEDIENTE.cierre.titulo}</h2>
        <p className="exp-lead">{EXPEDIENTE.cierre.texto}</p>
        <div className="exp-acciones">
          <a href={wa} target="_blank" rel="noopener" className="exp-btn exp-btn-wa" onClick={() => registrarEvento("expediente_whatsapp", { donde: "cierre", faltan: faltan.length })}>
            <Icono nombre="whatsapp" size={20} />
            {EXPEDIENTE.cierre.whatsapp}
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="exp-btn exp-btn-claro" onClick={() => registrarEvento("expediente_sesion", {})}>
            <Icono nombre="calendario" size={18} />
            {EXPEDIENTE.cierre.sesion}
          </a>
        </div>
        <p className="exp-otros">
          <a href="/servicios/master" onClick={irA("/servicios/master")}>{EXPEDIENTE.cierre.servicio}</a>
          <a href="/te-alcanza" onClick={irA("/te-alcanza")}>{EXPEDIENTE.cierre.juego}</a>
        </p>
        <p className="exp-descargo">{EXPEDIENTE.descargo}</p>
      </section>

      {doc && <Detalle d={doc} tengo={tengo.has(doc.id)} onCerrar={cerrar} onMarcar={marcar} onIr={abrir} />}
    </main>
  );
}
