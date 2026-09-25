// src/pages/blog/BlogPost.jsx
//
// La plantilla de todas las entradas del blog. Desde el 25/09/2026 va al
// nivel de las landings de venta (Marco: «transición, efectos, botones,
// interactivo, colores, desplazamiento, iconos»): progreso de lectura, barra
// fija de WhatsApp y sesión, índice que salta a cada sección, numerales e
// iconos por sección, subrayados que se dibujan al asomar, «lo que tumba»
// como etiqueta, preguntas en acordeón y llamadas a la acción con pulso. Todo
// opacity/transform; quieto con prefers-reduced-motion.
//
// El contenido sigue siendo bloques de blog.data.js (p, h2, ul, ol, faq,
// nota, enlace, cta). Opcionales por entrada: `chips` (bajo el título) y
// `cinta` (la cinta que pasa). El HTML para rastreadores lo genera
// scripts/html-compartir.mjs a partir de los mismos bloques.
import { useMemo, useRef, useState } from "react";
import { getPost, POSTS, autorDe, portadaDe } from "./blog.data";
import SEOSchema from "../../components/SEOSchema";
import Icono from "../../components/common/Icono";
import BarraCta, { ProgresoLectura } from "../../components/common/BarraCta";
import { Cinta } from "../../components/common/EfectosLanding";
import { navigate } from "../../services/navigate";
import { useSEO } from "../../hooks/useSEO";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { RESENAS_GOOGLE } from "../../config/testimonios";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import { useParallax } from "../../lib/parallax";
import NotFound from "../NotFound";
import "../../styles/movimiento.css";
import "./blog-post.css";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

const idDe = (texto) =>
  String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

// Icono de cada sección: el que diga el bloque o, si no, uno según la palabra
// clave del título; y, si nada encaja, se van rotando.
const ICONOS_POR_PALABRA = [
  [/dinero|cuesta|coste|precio|euro|iprem/i, "euro"],
  [/plazo|tarda|dura|tiempo|calendario|fecha/i, "reloj"],
  [/requisit|document|papel/i, "documento"],
  [/denieg|denegac|rechaz|recurso/i, "balanza"],
  [/trabaj/i, "maletin"],
  [/inspira|nosotros|c[oó]mo lo hacemos/i, "escudo"],
  [/pregunta|faq/i, "chat"],
  [/visado|visa|consulado/i, "pasaporte"],
  [/universidad|m[aá]ster|estudi|beca/i, "birrete"],
  [/nacionalidad|residencia|espa[nñ]a/i, "bandera"],
];
const ICONOS_RUEDA = ["destello", "diana", "libro", "mapa", "estrella", "brujula"];
const iconoDe = (texto, i) => {
  const hallado = ICONOS_POR_PALABRA.find(([re]) => re.test(texto));
  return hallado ? hallado[1] : ICONOS_RUEDA[i % ICONOS_RUEDA.length];
};

/** Un ítem de lista: si lleva «Lo que tumba:», esa parte va como etiqueta roja. */
function Item({ texto }) {
  const partes = String(texto).split(/\s*Lo que tumba:\s*/i);
  if (partes.length < 2) return <span>{texto}</span>;
  return (
    <span>
      {partes[0]}
      <span className="bp-tumba"><b>Lo que tumba</b>{partes[1]}</span>
    </span>
  );
}

function Faq({ items }) {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="bp-faq">
      {items.map((f, i) => (
        <div key={f.q} className={`bp-faq-item${abierta === i ? " bp-faq-on" : ""}`}>
          <button type="button" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
            {f.q}
            <span aria-hidden="true">+</span>
          </button>
          {abierta === i && <p className="bp-entra">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function Bloque({ bloque, numero, paso }) {
  if (bloque.type === "h2") {
    return (
      <section className="bp-seccion" id={idDe(bloque.text)} data-revelar>
        <span className="bp-num" aria-hidden="true">{String(numero).padStart(2, "0")}</span>
        <h2 className="bp-h2">
          <span className="bp-h2-icono"><Icono nombre={bloque.icono || iconoDe(bloque.text, numero)} size={18} /></span>
          <span>{bloque.text}</span>
        </h2>
      </section>
    );
  }
  if (bloque.type === "ul" || bloque.type === "ol") {
    const numerada = bloque.type === "ol";
    return (
      <ul className={`bp-lista${numerada ? " bp-lista-num" : ""}`}>
        {bloque.items.map((item, i) => (
          <li key={item} data-revelar="izquierda" style={paso()}>
            {numerada ? <b>{i + 1}</b> : <Icono nombre="check" size={16} />}
            <Item texto={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (bloque.type === "faq") return <div data-revelar="escala"><Faq items={bloque.items} /></div>;
  if (bloque.type === "nota") {
    return (
      <p className="bp-nota" data-revelar>
        <Icono nombre="balanza" size={16} />
        <span>{bloque.text}</span>
      </p>
    );
  }
  if (bloque.type === "enlace") {
    return (
      <p data-revelar>
        <a href={bloque.href} onClick={(e) => go(e, bloque.href)} className="bp-enlace">
          {bloque.texto} <Icono nombre="flecha" size={14} />
        </a>
      </p>
    );
  }
  if (bloque.type === "cta") {
    return (
      <div className="bp-cta" data-revelar="escala">
        <span className="bp-cta-icono"><Icono nombre="calendario" size={22} /></span>
        <h3>{bloque.titulo}</h3>
        <p>{bloque.texto}</p>
        <a href={bloque.href} onClick={(e) => { registrarEvento("blog_cta", { href: bloque.href }); go(e, bloque.href); }} className="bp-btn mov-brillo lfx-latido">
          <Icono nombre="calendario" size={18} />
          {bloque.boton}
        </a>
      </div>
    );
  }
  return <p className="bp-p" data-revelar>{bloque.text}</p>;
}

export default function BlogPost({ slug }) {
  const post = getPost(slug);
  const raiz = useRef(null);
  useRevelar(raiz, [slug]);
  const portada = useRef(null);
  useParallax(portada, 0.08, 40);

  useSEO(
    post
      ? {
          title: post.titulo,
          description: post.extracto,
          path: `/blog/${post.slug}`,
          imagen: portadaDe(post),
          tipo: "article",
          publicado: post.fecha,
          autor: autorDe(post).nombre,
        }
      : { omitir: true }
  );

  // La ficha Article es lo que permite a Google mostrar fecha y autor junto al
  // resultado; la FAQPage, enseñar las preguntas desplegadas y citarlas.
  const schema = useMemo(() => {
    if (!post) return null;
    const autorPost = autorDe(post);
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.titulo,
      description: post.extracto,
      image: `https://www.inspira-legal.cloud${portadaDe(post)}`,
      datePublished: post.fecha,
      dateModified: post.actualizado || post.fecha,
      inLanguage: "es",
      author: { "@type": "Person", name: autorPost.nombre, jobTitle: autorPost.cargo },
      publisher: { "@type": "Organization", name: "Inspira Legal" },
      mainEntityOfPage: `https://www.inspira-legal.cloud/blog/${post.slug}`,
    };
  }, [post]);
  const schemaFaq = useMemo(() => {
    const faq = post?.content?.find((b) => b.type === "faq");
    if (!faq) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    };
  }, [post]);

  if (!post) return <NotFound />;
  const autor = autorDe(post);
  const secciones = post.content.filter((b) => b.type === "h2");
  const relacionados = POSTS.filter((p) => p.slug !== slug).slice(0, 2);
  const wa = whatsappDesde("blog", `Leí «${post.titulo}» y quiero que revisen mi caso.`);
  const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Numeral de cada h2 (cuántos h2 hay hasta ese bloque) y cascada de las listas.
  const numeroDe = (i) => post.content.slice(0, i + 1).filter((b) => b.type === "h2").length;
  const pasoLista = cascada(50, 350);

  return (
    <main className="bp" ref={raiz}>
      <SEOSchema schema={schema} id="post" />
      {schemaFaq && <SEOSchema schema={schemaFaq} id="post-faq" />}
      <ProgresoLectura />

      <article className="bp-cuerpo">
        <a href="/blog" onClick={(e) => go(e, "/blog")} className="bp-volver">← Volver al blog</a>

        <div className="bp-meta" data-revelar="suave">
          <span className="bp-cat">{post.categoria}</span>
          <span>{fechaLarga(post.fecha)} · {post.minutos} min de lectura</span>
        </div>

        <figure className="bp-portada" data-revelar="escala">
          <div className="lfx-parallax" ref={portada}>
            <img src={portadaDe(post)} alt="" width="1200" height="600" fetchPriority="high" decoding="async" />
          </div>
        </figure>

        <h1 className="bp-titulo" data-revelar>{post.titulo}</h1>
        <p className="bp-extracto" data-revelar>{post.extracto}</p>

        {Array.isArray(post.chips) && post.chips.length > 0 && (
          <ul className="bp-chips" aria-label="Datos clave">
            {post.chips.map((c, i) => (
              <li key={c.texto || c} style={{ "--i": i }}>
                {c.icono && <Icono nombre={c.icono} size={14} />}
                {c.texto || c}
              </li>
            ))}
          </ul>
        )}

        <div className="bp-autora" data-revelar>
          <span className="bp-autora-ini">{autor.iniciales}</span>
          <span>
            <strong>{autor.nombre}</strong>
            <small>{autor.cargo}</small>
          </span>
          {RESENAS_GOOGLE?.url && (
            <a href={RESENAS_GOOGLE.url} target="_blank" rel="noopener">
              <Icono nombre="estrella" size={12} />
              {RESENAS_GOOGLE.cabecera}
            </a>
          )}
        </div>

        {secciones.length > 2 && (
          <nav className="bp-indice" aria-label="Secciones" data-revelar>
            <p>En esta guía</p>
            <div className="bp-indice-pista">
              {secciones.map((s, i) => (
                <button type="button" key={s.text} onClick={() => irA(idDe(s.text))}>
                  <span>{i + 1}</span>
                  {s.text.length > 34 ? `${s.text.slice(0, 32)}…` : s.text}
                </button>
              ))}
            </div>
          </nav>
        )}

        {Array.isArray(post.cinta) && post.cinta.length > 0 && (
          <div className="bp-cinta"><Cinta items={post.cinta} tono="noche" /></div>
        )}

        {post.content.map((bloque, i) => (
          <Bloque key={i} bloque={bloque} numero={numeroDe(i)} paso={pasoLista} />
        ))}

        <div className="bp-cierre" data-revelar="escala">
          <h3>¿Tu caso necesita una respuesta concreta?</h3>
          <p>Sesión diagnóstico de 30 minutos con un abogado: sales con tu vía y un plan escrito. O escríbenos y te decimos por dónde empezar.</p>
          <div className="bp-cierre-acciones">
            <a href={wa} target="_blank" rel="noopener" className="bp-btn bp-btn-wa mov-brillo" onClick={() => registrarEvento("blog_whatsapp", { slug })}>
              <Icono nombre="whatsapp" size={18} />
              Escríbenos por WhatsApp
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="bp-btn" onClick={() => registrarEvento("blog_sesion", { slug })}>
              <Icono nombre="calendario" size={18} />
              Reservar la sesión
            </a>
          </div>
        </div>

        {relacionados.length > 0 && (
          <div className="bp-relacionados" data-revelar>
            <h3>Sigue leyendo</h3>
            {relacionados.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} onClick={(e) => go(e, `/blog/${p.slug}`)} className="bp-relacionado">
                <img src={portadaDe(p)} alt="" loading="lazy" width="96" height="60" />
                <span>
                  <strong>{p.titulo}</strong>
                  <small>{p.categoria} · {p.minutos} min</small>
                </span>
              </a>
            ))}
          </div>
        )}
      </article>

      <BarraCta
        whatsapp={wa}
        sesion={CALENDLY_URL}
        textoWhatsapp="WhatsApp"
        textoSesion="Sesión · 25 €"
        desde={700}
        onWhatsapp={() => registrarEvento("blog_whatsapp", { slug, donde: "barra" })}
        onSesion={() => registrarEvento("blog_sesion", { slug, donde: "barra" })}
      />
    </main>
  );
}
