# Rediseño V4 — Mapa de contenido y diferencias con el mockup

> **Fuente de diseño:** `inspira-legal-redesign-v4.html`
> **Alcance aplicado:** Home (React), Servicios de Máster (`public/portal-servicios-master.html`),
> Calculadora (`public/calculadora-master.html`) y Header compartido.
> **Fecha:** 2026-08-21

Este documento registra **qué información del sitio real no existe en el mockup**, dónde
quedó en la implementación, y qué se perdió deliberadamente. El mockup es una maqueta de
diseño con datos parciales de ejemplo; el sitio real tiene el catálogo completo.

---

## 1. Cómo se aplicó el diseño

| Zona | Clases del mockup | Archivo real |
|---|---|---|
| Header flotante | `.nav-wrap` / `.nav` / `.pill-free` / `.login-btn` | `src/components/layout/Header/Header.jsx` + `src/styles/v4.css` (prefijo `v4-`) |
| Home | `.hero`, `.quick-calc`, `.metrics`, `.process`, `.services`, `.compare`, `.cta` | `src/pages/home/sections/*.jsx` + `src/styles/v4.css` (scope `.v4-home`) |
| Servicios de Máster | `.svx-*` | `public/portal-servicios-master.html` |
| Calculadora | `.calcx-*` (variante “same fields”, 4 etapas) | `public/calculadora-master.html` |

La calculadora **conserva su estructura real de 4 pasos**. El mockup mostraba una variante
de 14 pantallas (`.pcx-*`) con una pregunta por vista; se descartó por decisión explícita
para no tocar la lógica de validación, cálculo de becas ni el envío a Make/API. El propio
mockup incluía una hoja `.calcx-*` pensada para 4 etapas, y es la que se usó.

---

## 2. Información del sitio real ausente en el mockup

### 2.1 Paquetes completos

El mockup solo dibuja **3** tarjetas. El catálogo real tiene **7**, todas conservadas en
`COMPLETOS` dentro de `portal-servicios-master.html`:

| Paquete | Precio | Cobertura | ¿En el mockup? |
|---|---|---|---|
| All-In Master Pack ★ | €219 | Andalucía · 10 univ. públicas · portal unificado · 3 fases | Sí |
| Full Económico | €359 | 7 comunidades · +21 universidades | Sí |
| Madrid **o** Cataluña | €400 | 7–9 universidades · portales independientes | Sí |
| **Madrid + Cataluña** | €550 | +15 universidades · máxima complejidad operativa | **No** |
| **Econ + Intermedias** | €650 | 12 comunidades · +24 universidades | **No** |
| **Premium** | €700 | 6 comunidades a elegir · +45 universidades | **No** |
| **Infinity** | €1 100 | 17 comunidades · +80 universidades · todo España | **No** |

> Los 4 últimos no aparecían en el mockup y **sí se renderizan** en la implementación real,
> con el mismo lenguaje visual `svx-card`.

### 2.2 Servicios individuales y combos

El mockup reduce esta pestaña a **6 mini-tarjetas descriptivas sin precio**
(Validación académica, Revisión de expediente, Documentación PRO, Postulación individual,
Subsanación, Matrícula y cierre).

El sitio real mantiene **dos sub-pestañas con precio y detalle completo**:

- **Servicios combo** (`COMBOS`): Pack Explorador €79, Pack Listo €149, Pack Seguro,
  Pack Completo ★, Pack Todo en Uno.
- **Servicios sueltos** (`SOLOS`): Solo Revisión Documentaria, Solo Postulación,
  Soporte en Proceso de Admisión, Soporte Post-Admisión.

Cada uno conserva su lista de features, su aviso de alcance (`svx-warning`) y su CTA.
**Nada de esto existía en el mockup.**

Reglas de negocio asociadas que el mockup tampoco recoge:

- Los servicios individuales **no se descuentan** si luego se contrata un paquete completo.
- Un servicio suelto aplica a **1 universidad** (2 según complejidad); más se presupuesta aparte.
- El Pack Explorador (€79) **sí** se aplica como crédito si se escala a un paquete completo.

### 2.3 Paquetes parciales

Coinciden en número (2), pero el mockup omite los avisos de alcance reales:

- Check-In Master €109 y Smart Master €149 son **exclusivos de Andalucía**.
- Cubren **solo 1 fase de convocatoria**, no todas.
- No incluyen búsqueda de másteres.

Estos avisos sí están en la implementación (`svx-warning` en cada tarjeta).

### 2.4 Universidades y comunidades

El mockup resume la cobertura en **3 tarjetas** (Andalucía / Full Económico / Madrid-Cataluña).

El sitio real conserva las **15 comunidades** de `REGIONES`, cada una con:

- Listado nominal de universidades con su sigla.
- **Tasas universitarias reales** (ej. Andalucía 845 €, Cantabria 1 001–1 560 €,
  C. Valenciana ~3 180 €).
- **Fases y fechas de convocatoria** por comunidad.
- Si exige **reconocimiento previo de título** y su tasa asociada.

Clasificación por franja (leyenda conservada):

- 🟢 **Económicas** — Andalucía · Galicia · Castilla y León · Cantabria · Asturias · Castilla-La Mancha · Navarra
- 🟣 **Intermedias** — La Rioja · País Vasco · Murcia · Extremadura · C. Valenciana · Aragón
- 🟠 **Premium** — Madrid · Cataluña

### 2.5 Presupuesto

El mockup implementa una **suma estática de dos selects** (servicio principal + sesión extra)
que solo muestra un total.

El sitio real mantiene el **formulario de captación completo**, que el mockup no tiene:

- Selección múltiple de 15 comunidades.
- Rango de universidades (5 tramos: €219 / €310 / €449 / €700 / €1 100).
- Selección múltiple de servicios necesarios.
- Nombre, WhatsApp/email y descripción libre de la situación.
- Estimación orientativa dinámica (`calcBudget`), con la regla de que >4 comunidades
  no económicas eleva el mínimo a €700.
- **Envío real a `POST https://api.inspira-legal.cloud/api/presupuesto`** con número de
  solicitud de respuesta. El mockup no envía nada.

### 2.6 Medios y facilidades de pago

El mockup los recoge correctamente y se conservaron íntegros:

- Interbank — Proyecta Producciones Group · Cta. Cte. Soles **200 300 532 988 2** ·
  CCI **003 200 0030 0532 9882 31**
- Plin — **908 945 354**
- PayPal / link de pago para el extranjero
- Reserva de asesoría vía Calendly
- Fraccionamiento en 2 partes (50 % + 50 %)
- 3 cuotas sin intereses vía Mercado Pago
- Upgrade sin penalización (solo se paga la diferencia al plan superior)

### 2.7 Calculadora

El mockup (`.pcx-*`) es una maqueta sin lógica. La calculadora real conserva:

- Detección automática de universidad **AUIP** por texto (`UNIS_AUIP`).
- Escala de notas por país (`ESCALA_PAIS`) y conversión a equivalencia española `/10`.
- Campo de **ranking de promoción** que solo aparece si el país es Perú
  (requisito de la Beca Generación Bicentenario / PRONABEC).
- Motor de elegibilidad de becas: AUIP, MAEC-AECID (funcionario público),
  Fundación Carolina (perfil ODS), PRONABEC.
- Top 5 de universidades filtrado por área y presupuesto (`UNIS`).
- Recomendación de paquete Inspira y generación de enlaces de WhatsApp y Calendly
  con los datos del lead precargados.
- Envío del lead a Make.com.
- Aviso de **plan B**: calificar a una beca no garantiza obtenerla.

Preguntas del formulario real que el mockup no contempla: presupuesto anual de matrícula
(slider 500–15 000 €), tipo de vida (económico / equilibrado / ambicioso) con su mapeo a
comunidades, y comunidades preferidas.

### 2.8 Home

El mockup tiene un proceso de **6 pasos genéricos** (Diagnóstico, Estrategia, Postulación,
Admisión, Matrícula, Visa). El proceso real de Inspira son **8 pasos**, y son los que se
implementaron:

1. Diagnóstico — reserva de asesoría inicial
2. Formulario previo — perfil académico
3. Pago y confirmación — automático, email + WhatsApp
4. Reunión con asesor — análisis del caso
5. Contrata tu paquete — activación del panel
6. Documentos y checklist — plazos y alertas
7. Postulación y seguimiento — subsanaciones
8. Matrícula o visa

---

## 3. Información que sí se perdió

Elementos del sitio anterior que **no** tienen sitio en el diseño V4 y se retiraron:

| Elemento | Dónde estaba | Motivo |
|---|---|---|
| Wordmark `Inspira ✈` como hero de la página de Máster | Hero de `portal-servicios-master.html` | El V4 usa un hero de dos columnas con titular editorial; la marca ya está en el header compartido |
| Badges «Especialistas en Extranjería» y «Todas las universidades españolas» | Hero de Máster | Sustituidos por la barra `svx-proof` (98 % admitidos · +80 universidades · 6 categorías · 3 monedas). El claim de extranjería sigue en el pie de página |
| Bloque duplicado de «Facilidades de Pago» | `portal-servicios-master.html` (aparecía dos veces) | Duplicado del original; se dejó una sola copia |
| Barra `.cur-bar` separada de la navegación | Máster | El V4 fusiona pestañas y selector de moneda en un único control sticky |

Todo lo demás (precios, coberturas, features, avisos, datos bancarios, tasas por comunidad,
lógica de becas y endpoints) se conserva sin cambios.

---

## 4. Notas de implementación

- `src/styles/v4.css` está **scopeado** bajo `.v4-home` y `.v4-nav-wrap` para que nombres
  genéricos (`.btn`, `.field`, `.step`, `.metric`) no colisionen con Tailwind ni con el
  resto de componentes.
- En Home el header flotante **no** lleva spacer: el hero reserva el espacio con
  `padding-top: 160px`, como en el mockup. En el resto de rutas sí se inserta
  `.v4-route-spacer`.
- El componente `Reveal` replica el patrón `[data-reveal]` del mockup
  (IntersectionObserver + clase `.in`), no estilos inline.
- En los HTML standalone se reescribieron **solo** `<style>` y el markup de presentación.
  Todos los `id`, `data-*` y clases que consulta el JS se mantuvieron
  (`.pv`/`data-e`, `.nav-btn`, `.cur-btn`, `.panel`, `#g-*`, `#dot1..4`, `#line1..3`,
  `.card.active`, `.pill.selected`, `.vida-card`, `.check-item`, `#res-*`).
- Verificado con Playwright: 7 paquetes completos, 15 comunidades, cambio de moneda a PEN,
  estimador de presupuesto y flujo completo de los 4 pasos de la calculadora hasta el
  resultado, **sin errores de consola**.
