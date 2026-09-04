// Muestra de las piezas de interfaz con datos de ejemplo.
//
// Solo existe en desarrollo: `App.jsx` la monta bajo `import.meta.env.DEV`,
// así que nunca entra en el build de producción. Sirve para mirar el diseño
// real —el mismo código que ve el asesor y el asesorado— sin cuenta y sin
// tocar producción. Los nombres de los másteres son inventados a propósito.
import { AuthProvider } from "../backoffice/context/AuthContext";
import BottomNav from "../backoffice/layout/BottomNav";
import { MasterCard } from "../panel/components/mis-servicios/sections/EleccionMastersCliente";
import { MasterRowAdmin } from "../backoffice/solicitudes/components/InformeAdmin";
import { Tarjeta, CampoUX, FormularioUX, Acordeon, TablaAdaptativa } from "../../components/ux";
import "../../styles/asesor.css";
import "../../styles/panel.css";

const BAREMO = [
  { criterio: "Expediente académico", categoria: "EXPEDIENTE_ACADEMICO", peso: 50 },
  { criterio: "Adecuación del título de acceso", categoria: "ADECUACION_TITULO", peso: 30 },
  { criterio: "Experiencia profesional", categoria: "EXPERIENCIA_PROFESIONAL", peso: 10 },
  { criterio: "Carta de motivación", categoria: "MOTIVACION", peso: 10 },
];

const MASTER_A = {
  id_master: 1, nombre_limpio: "Máster Universitario en Dirección de Empresas",
  duracion_anios: 1, ects: 60, precio_total_estimado: 4241, precio_final: null,
  es_titulo_oficial: true, baremo: BAREMO,
  url_ficha: "https://ejemplo.es/master",
  universidad: { sigla: "UEJ", nombre_completo: "Universidad de Ejemplo", ciudad: "Sevilla",
                 comunidad: "Andalucía", url: "https://ejemplo.es" },
};
const MASTER_B = {
  ...MASTER_A, id_master: 2, duracion_anios: 1.5, ects: 90, precio_final: 6750,
  nombre_limpio: "Máster de Formación Permanente en Marketing Digital",
  es_titulo_oficial: false, baremo: BAREMO.slice(0, 2),
  universidad: { ...MASTER_A.universidad, nombre_completo: "Universidad Privada de Muestra", ciudad: "Valencia" },
};

const FILAS = [
  { id: 1, nombre: "Máster Universitario en Dirección de Empresas", uni: "UEJ · Sevilla", ects: "60 ECTS", precio: "4.241 €", plazo: "12 nov 26 – 20 ene 27" },
  { id: 2, nombre: "Máster Universitario en Ingeniería Industrial", uni: "UPM · Madrid", ects: "120 ECTS", precio: "10.088 €", plazo: "1 feb 27 – 15 mar 27" },
  { id: 3, nombre: "Máster Universitario en Salud Pública", uni: "UMH · Elche", ects: "60 ECTS", precio: "4.241 €", plazo: "sin fechas" },
];

const H = ({ children }) => (
  <h2 style={{ font: "700 11px/1 Montserrat, system-ui", letterSpacing: ".12em",
               textTransform: "uppercase", color: "#62808f", margin: "28px 0 10px" }}>{children}</h2>
);

export default function MuestraUX() {
  const usuario = { id_usuario: 0, nombre: "Muestra", email: "muestra@local", rol: "admin" };
  return (
    <AuthProvider user={usuario} onLogout={() => {}}>
      <div className="ase ux-con-barra-abajo" style={{ padding: "16px 16px 40px", maxWidth: 1100, margin: "0 auto",
                                                        background: "var(--ground)", minHeight: "100dvh" }}>
        <p style={{ margin: 0, font: "800 22px/1.2 Merriweather, serif", color: "var(--primary)" }}>
          Muestra de interfaz
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
          Datos inventados. Solo en desarrollo.
        </p>

        <H>Informe del asesorado</H>
        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <MasterCard master={MASTER_A} score={92} prioridad={1} selected comentario="" onToggle={() => {}} onComentario={() => {}} />
          <MasterCard master={MASTER_B} score={74} prioridad={2} selected={false} onToggle={() => {}} />
        </div>

        <H>Informe, vista del asesor</H>
        <div style={{ display: "grid", gap: 8, background: "#fff", padding: 8, borderRadius: 16 }}>
          <MasterRowAdmin posicion={1} resultado={{ master: MASTER_A, score: 92 }} editMode={false} esFirst />
          <MasterRowAdmin posicion={2} resultado={{ master: MASTER_B, score: 74 }} editMode={false} esLast />
        </div>

        <H>Tabla que se vuelve tarjetas en móvil</H>
        <Tarjeta style={{ padding: 12 }}>
          <TablaAdaptativa
            columnas={[
              { clave: "nombre", etiqueta: "Máster", principal: true },
              { clave: "uni", etiqueta: "Universidad" },
              { clave: "ects", etiqueta: "Créditos" },
              { clave: "precio", etiqueta: "Precio", alinea: "right" },
              { clave: "plazo", etiqueta: "Postulación" },
            ]}
            filas={FILAS} claveFila={(f) => f.id} onFila={() => {}} />
        </Tarjeta>

        <H>Formulario: una columna en móvil, dos en PC</H>
        <Tarjeta style={{ padding: 16 }}>
          <FormularioUX>
            <CampoUX etiqueta="Nombre" tipo="texto" defaultValue="Emily Garnique" estado="ok" nota="Comprobado" />
            <CampoUX etiqueta="Correo" tipo="email" defaultValue="emily@correo" estado="error" nota="Falta el dominio del correo" />
            <CampoUX etiqueta="Teléfono" tipo="telefono" placeholder="+51 999 999 999" />
            <CampoUX etiqueta="Presupuesto (€)" tipo="dinero" placeholder="6000" />
            <CampoUX etiqueta="Enlace a la ficha" tipo="url" ancho placeholder="https://" />
          </FormularioUX>
        </Tarjeta>

        <H>Acordeón para lo secundario</H>
        <Acordeon titulo="Requisitos de idioma" resumen="Inglés B2 · se acredita en la matrícula">
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>
            Certificado oficial con menos de dos años, o entrevista con el coordinador.
          </p>
        </Acordeon>

        <BottomNav path="/backoffice/masteres" drawerAbierto={false} onMas={() => {}} />
      </div>
    </AuthProvider>
  );
}
