// /app: la puerta pública a la App Inspira (03/11/2026).
//
// Es el enlace que se manda a quien comenta «ESPAÑA» y el de la bio de redes.
// Una sola decisión por pantalla: crear la cuenta gratis con Google. Debajo,
// lo que incluye y cómo instalarla en el celular (es una PWA: sin tienda).
// Quien ya instaló la app y la abre entra directo al panel.
import { useEffect, useState } from "react";
import logo from "../../assets/images/logo.webp";
import inicio from "../../assets/images/app/inicio.jpg";
import match from "../../assets/images/app/match.jpg";
import { loginGoogle } from "../../components/layout/Header/LoginButton";
import { navigate } from "../../services/navigate";
import { sistema, yaInstalada } from "../panel/instalarApp";
import { marcarRegistroApp } from "../panel/herramientas/referido";
import { IconoAnadir, IconoCompartir, IconoListo, IconoMenuPuntos } from "../panel/components/PasosInstalar";
import { ALIADOS } from "../../config/aliados";
import "./app.css";

const INCLUYE = [
  ["Con cuántos másteres haces match", "Escribes tu carrera y ves cuántos másteres oficiales de España encajan contigo."],
  ["Tracker de becas", "Sigues cada beca y te avisamos antes del cierre."],
  ["Calendario con avisos", "Tus fechas y la cuenta atrás de tu viaje, en tu celular."],
  ["Presupuesto y nota en España", "Cuánto cuesta y cómo se lee tu nota media en la escala española."],
  ["Días Schengen y listas", "Cuántos días te quedan como turista y qué papeles llevar."],
];

const PASOS = {
  iphone: [
    [<IconoCompartir key="c" />, <>Abre este enlace en <b>Safari</b> y pulsa <b>Compartir</b>.</>],
    [<IconoAnadir key="a" />, <>Elige <b>«Añadir a pantalla de inicio»</b>.</>],
    [<IconoListo key="l" />, <>Pulsa <b>«Añadir»</b>. Ya tienes el icono de Inspira.</>],
  ],
  android: [
    [<IconoMenuPuntos key="m" />, <>En <b>Chrome</b>, pulsa el menú <b>⋮</b>.</>],
    [<IconoAnadir key="a" />, <>Elige <b>«Instalar aplicación»</b>.</>],
    [<IconoListo key="l" />, <>Confirma con <b>«Instalar»</b>.</>],
  ],
};

function Pantalla({ src, alt }) {
  return (
    <span className="ap-tel">
      <img src={src} alt={alt} width="280" height="606" loading="lazy" decoding="async" />
    </span>
  );
}

export default function AppInspira() {
  const [os, setOs] = useState(() => (sistema() === "android" ? "android" : "iphone"));
  useEffect(() => {
    // Ya la instaló y la abrió desde su icono: directo al panel.
    if (yaInstalada() && window.matchMedia?.("(display-mode: standalone)").matches) navigate("/panel", { replace: true });
  }, []);
  const crear = () => { marcarRegistroApp(); loginGoogle(); };
  const aliados = ALIADOS.filter((a) => a.href);

  return (
    <main className="ap">
      <header className="ap-top">
        <img src={logo} alt="Inspira Legal" height="34" />
      </header>

      <section className="ap-hero">
        <h1>Tu viaje a España, en tu celular</h1>
        <p>Mira con cuántos másteres haces match, sigue tus becas y arma tu presupuesto. Gratis, con tu cuenta de Google.</p>
        <div className="ap-botones">
          <button type="button" className="ap-cta" onClick={crear}>Crear mi cuenta gratis</button>
          <button type="button" className="ap-sec" onClick={() => loginGoogle()}>Ya soy cliente de Inspira</button>
        </div>
        <small>Sin contraseña ni tarjeta. Se instala desde el navegador, sin tienda de apps.</small>
        <div className="ap-pantallas">
          <Pantalla src={inicio} alt="Inicio de la App Inspira con las herramientas gratis" />
          <Pantalla src={match} alt="Resultado de con cuántos másteres haces match" />
        </div>
        <small className="ap-ejemplo">Pantallas con datos de ejemplo.</small>
      </section>

      <section className="ap-bloque">
        <h2>Qué tienes gratis</h2>
        <dl className="ap-lista">
          {INCLUYE.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
        </dl>
      </section>

      <section className="ap-bloque">
        <h2>Instálala en tu celular</h2>
        <div className="ap-os" role="tablist" aria-label="Tu celular">
          <button type="button" role="tab" aria-selected={os === "iphone"} onClick={() => setOs("iphone")}>iPhone</button>
          <button type="button" role="tab" aria-selected={os === "android"} onClick={() => setOs("android")}>Android</button>
        </div>
        <ol className="ap-pasos">
          {PASOS[os].map(([icono, texto], i) => (
            <li key={i}><span className="ap-paso-i">{icono}</span><span>{texto}</span></li>
          ))}
        </ol>
      </section>

      {aliados.length > 0 && (
        <section className="ap-bloque">
          <h2>Para tu viaje</h2>
          <ul className="ap-aliados">
            {aliados.map((a) => (
              <li key={a.clave}>
                <a href={a.href} target="_blank" rel="noopener noreferrer"><b>{a.titulo}</b><span>{a.texto}</span></a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="ap-cierre">
        <h2>¿Prefieres que un asesor lo haga contigo?</h2>
        <p>Con tu cuenta puedes pasar de las herramientas gratis a tu Expediente Digital cuando quieras.</p>
        <button type="button" className="ap-cta" onClick={crear}>Crear mi cuenta gratis</button>
        <a href="/reservar" onClick={(e) => { e.preventDefault(); navigate("/reservar"); }}>Reservar una asesoría</a>
        <small>Inspira Legal y Asesorías Educativas</small>
      </section>
    </main>
  );
}
