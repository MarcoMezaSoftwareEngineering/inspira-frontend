// src/pages/carina/Carina.jsx
//
// La página de Carina: el destino del «link in bio» de TikTok e Instagram.
//
// Quien llega aquí viene de un vídeo de treinta segundos y tiene el pulgar en
// el aire. No busca un catálogo: quiere saber quién es la persona que acaba de
// ver, si es de fiar, y qué hace ahora. Por eso la página es corta y va en
// este orden: la cara, la prueba, los vídeos, la puerta.
//
//  - Cara: el retrato de marca, nombre y cargo. Que sea ella, sin rodeos.
//  - Prueba: las cuatro cifras de CATEGORIAS_CASOS, que son las únicas que la
//    empresa puede sustanciar (INDECOPI): ni una más.
//  - Vídeos: los TikToks servidos desde /media, no incrustados de TikTok. El
//    embed de TikTok pesa, pide cookies y no funciona dentro del propio
//    navegador de TikTok, que es justo desde donde llega el 40% del tráfico.
//    Vertical, con póster, y sin sonido hasta que se toca: un vídeo que
//    arranca solo con audio en el bus es un cierre de pestaña.
//  - Puerta: WhatsApp primero (es como escribe esta gente), la sesión después,
//    y el juego para quien todavía no quiere hablar con nadie.
//
// Los vídeos viven en /var/www/inspira-media (fuera del repositorio; nginx
// sirve /media/). Cambiarlos no requiere desplegar.
import { useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import SEOSchema from "../../components/SEOSchema";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CATEGORIAS_CASOS } from "../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { cascada, useRevelar } from "../../lib/revelar";
import VideoVertical from "../../components/common/VideoVertical";
import Opiniones from "../landing/master2027/Opiniones";
import { CARINA } from "./textos";
import "../../styles/movimiento.css";
import "./carina.css";

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function Carina() {
  useSEO(CARINA.seo);
  const [activo, setActivo] = useState(null);
  const wa = whatsappDesde("carina");
  const raiz = useRef(null);
  useRevelar(raiz);
  const pasoCifra = cascada();
  const pasoVideo = cascada();

  return (
    <main className="car" ref={raiz}>
      <SEOSchema schema={CARINA.schema} id="carina" />

      {/* La cara */}
      <header className="car-hero">
        <div className="car-hero-foto" data-revelar="escala">
          <img src={CARINA.retrato} alt="Carina Meza, CEO y consultora legal de Inspira Legal" width="640" height="619" loading="eager" />
        </div>
        <div className="car-hero-texto" data-revelar>
          <p className="car-rotulo">
            <Icono nombre="avion" size={14} />
            {CARINA.rotulo}
          </p>
          <h1 className="car-nombre">{CARINA.nombre}</h1>
          <p className="car-cargo">{CARINA.cargo}</p>
          <p className="car-promesa">{CARINA.promesa}</p>
          <div className="car-acciones">
            <a href={wa} target="_blank" rel="noopener" className="car-btn car-btn-wa mov-brillo" onClick={() => registrarEvento("carina_whatsapp", {})}>
              <Icono nombre="whatsapp" size={20} />
              {CARINA.cta.whatsapp}
            </a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener" className="car-btn car-btn-sesion" onClick={() => registrarEvento("carina_sesion", {})}>
              <Icono nombre="calendario" size={18} />
              {CARINA.cta.sesion}
            </a>
          </div>
        </div>
      </header>

      {/* La prueba: solo lo que se puede sustanciar */}
      <section className="car-cifras" aria-label="Resultados de Inspira Legal">
        {CATEGORIAS_CASOS.map((c) => (
          <div key={c.id} className="car-cifra" data-revelar="escala" style={pasoCifra()}>
            <span className="car-cifra-icono"><Icono nombre={c.icono} size={18} /></span>
            <strong>{c.cifra}</strong>
            <span>{c.titulo}</span>
          </div>
        ))}
      </section>

      {/* Los vídeos */}
      <section className="car-videos" aria-labelledby="car-videos-t">
        <h2 id="car-videos-t" className="car-h2">{CARINA.videos.titulo}</h2>
        <p className="car-lead">{CARINA.videos.lead}</p>
        <div className="vv-rejilla">
          {CARINA.videos.lista.map((v) => (
            <div key={v.id} data-revelar="escala" style={pasoVideo()}>
              <VideoVertical v={v} activo={activo === v.id} onActivar={setActivo} evento="carina_video" />
            </div>
          ))}
        </div>
        <a href={CARINA.tiktok} target="_blank" rel="noopener" className="car-enlace-tiktok">
          {CARINA.videos.masEn}
        </a>
      </section>

      {/* El juego, para quien aún no quiere hablar con nadie */}
      <section className="car-juego" data-revelar>
        <a href="/te-alcanza" onClick={irA("/te-alcanza")} className="car-juego-tarjeta">
          <span className="car-juego-icono"><Icono nombre="euro" size={22} /></span>
          <span>
            <strong>{CARINA.juego.titulo}</strong>
            <span className="car-juego-texto">{CARINA.juego.texto}</span>
          </span>
          <Icono nombre="flecha" size={18} className="car-juego-flecha" />
        </a>
      </section>

      {/* Lo que dicen los clientes */}
      <section className="car-opiniones">
        <Opiniones />
      </section>

      {/* La puerta, otra vez, para quien llegó abajo */}
      <section className="car-cierre" data-revelar="escala">
        <img src={CARINA.graduacion} alt="" width="480" height="308" loading="lazy" className="car-cierre-foto" />
        <h2 className="car-h2">{CARINA.cierre.titulo}</h2>
        <p className="car-lead">{CARINA.cierre.texto}</p>
        <a href={wa} target="_blank" rel="noopener" className="car-btn car-btn-wa" onClick={() => registrarEvento("carina_whatsapp", { donde: "cierre" })}>
          <Icono nombre="whatsapp" size={20} />
          {CARINA.cta.whatsapp}
        </a>
      </section>
    </main>
  );
}
