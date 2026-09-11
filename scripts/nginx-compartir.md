# Vista previa por ruta al compartir: configuración de nginx

`npm run build` genera, además de la app, un HTML de entrada por ruta en
`dist/compartir/<ruta-con-guiones>.html` (script `scripts/html-compartir.mjs`,
datos en `scripts/rutas-compartir.mjs`). Son copias de `dist/index.html` con
title, description, canonical, og:* y twitter:* propios; enlazan el mismo JS y
CSS, así que la app arranca igual.

Falta que nginx sirva cada HTML en su ruta. Hoy lo impide
`location / { try_files $uri /index.html; }`: todo acaba en `index.html`.

La configuración de abajo está adaptada al archivo real
`/etc/nginx/sites-enabled/inspira-front`, leído el 11/09/2026. **No se ha
aplicado todavía.**

## 1. El `map` (arriba del todo del archivo, fuera de los `server {}`)

Los archivos de `sites-enabled` se incluyen dentro del bloque `http {}`, así
que el `map` puede ir al principio de `inspira-front`.

```nginx
# Ruta de la web -> HTML de entrada con su vista previa (og:*).
# Generado por scripts/html-compartir.mjs. Si añades una ruta en
# scripts/rutas-compartir.mjs, añádela también aquí.
map $uri $html_compartir {
    default                 /index.html;
    /master-2027-2028       /compartir/master-2027-2028.html;
    /servicios/master       /compartir/servicios-master.html;
    /servicios/estancia     /compartir/servicios-estancia.html;
    /calculadora-master     /compartir/calculadora-master.html;
    /servicios              /compartir/servicios.html;
    /metodo-inspira         /compartir/metodo-inspira.html;
    /visa-o-estancia        /compartir/visa-o-estancia.html;
    /plataforma             /compartir/plataforma.html;
    /casos-de-exito         /compartir/casos-de-exito.html;
    /nosotros               /compartir/nosotros.html;
    /asistente              /compartir/asistente.html;
    /blog                   /compartir/blog.html;
    /eventos                /compartir/eventos.html;
    /tienda                 /compartir/tienda.html;
    /ruta/estudios          /compartir/ruta-estudios.html;
    /ruta/rapidas           /compartir/ruta-rapidas.html;
    /ruta/en-espana         /compartir/ruta-en-espana.html;
    /ruta/denegado          /compartir/ruta-denegado.html;
    /ruta/tramites          /compartir/ruta-tramites.html;
}
```

La portada `/` no necesita entrada: `dist/index.html` ya lleva sus datos.

## 2. Sustituir el bloque `location /` del `server` de www

Busca, dentro de `server_name www.inspira-legal.cloud;`:

```nginx
    location / {
        try_files $uri /index.html;
    }
```

y cámbialo por:

```nginx
    # Archivos reales (imágenes, sitemap, HTML sueltos) se sirven tal cual.
    # Lo demás es una ruta de la app: va a su HTML de compartir si lo tiene
    # (map $html_compartir) y, si no, a index.html. Sin $uri/ (ver arriba).
    location / {
        try_files $uri @spa;
    }
    location @spa {
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss:;" always;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        try_files $html_compartir /index.html;
    }
```

Por qué así:

- El `@spa` repite las cabeceras de seguridad y el `no-store` del bloque
  `location = /index.html`: en nginx, un `add_header` dentro de una location
  anula los heredados, y el HTML de la app no debe cachearse (builds viejos).
- `try_files $html_compartir /index.html`: si falta el archivo de compartir
  (por ejemplo, un build sin el paso posbuild), la ruta sigue abriendo la app.
- `location ^~ /backoffice` no cambia: el `^~` gana a `location /`, así que
  `/backoffice*` sigue yendo a `backoffice.html`.
- `location /assets/`, `/sw.js`, los manifiestos y los `.html` embebibles
  (`/calculadora-master.html`, `/portal-servicios-master.html`) no cambian.
  `/calculadora-master` (sin .html) es la ruta de la app y
  `/calculadora-master.html` la calculadora del iframe: por eso los HTML de
  compartir viven en `dist/compartir/` y no junto a esos archivos.
- `$uri` no incluye la query: `/master-2027-2028?v=2` usa el mismo HTML.
- «compartir» no es ninguna ruta de la app, así que la carpeta no provoca la
  redirección a la barra final.

## 3. Despliegue (en el VPS)

Primero sube el build nuevo (el `dist/` debe traer `dist/compartir/` y
`dist/og/inspira-general.jpg`, `master-2027-2028.jpg`, `calculadora-master.jpg`).
Después:

```bash
# Copia de seguridad del .conf (fuera de sites-enabled, para que nginx no la cargue)
cp /etc/nginx/sites-enabled/inspira-front /root/inspira-front.$(date +%Y%m%d-%H%M).bak

# Editar: añadir el map arriba y cambiar location /
nano /etc/nginx/sites-enabled/inspira-front

# Comprobar sintaxis; si falla, NO recargar
nginx -t

# Aplicar sin cortar conexiones
systemctl reload nginx
```

Para volver atrás: copiar el `.bak` encima, `nginx -t` y `systemctl reload nginx`.

## 4. Verificación

```bash
# Cada ruta devuelve sus etiquetas og (user-agent de WhatsApp)
curl -s -A "WhatsApp/2.23" https://www.inspira-legal.cloud/master-2027-2028 | grep og:
curl -s -A "WhatsApp/2.23" https://www.inspira-legal.cloud/servicios/master | grep og:
curl -s -A "WhatsApp/2.23" https://www.inspira-legal.cloud/calculadora-master | grep og:
curl -s -A "WhatsApp/2.23" https://www.inspira-legal.cloud/ | grep og:

# La imagen responde 200 y es JPEG
curl -sI https://www.inspira-legal.cloud/og/master-2027-2028.jpg

# Sin romper lo existente
curl -sI https://www.inspira-legal.cloud/backoffice | grep -i cache-control   # no-store
curl -s  https://www.inspira-legal.cloud/calculadora-master.html | head -6     # la calculadora del iframe
curl -s  https://www.inspira-legal.cloud/ruta-que-no-existe | grep "<title>"   # index.html (la app muestra su 404)
```

Y abrir en el navegador `/master-2027-2028` y `/servicios/master`: la app debe
cargar en esa ruta.

## 5. Refrescar vistas previas ya compartidas

Las plataformas cachean la tarjeta por URL durante días.

- **Facebook, Instagram y Messenger (Meta):** abrir
  <https://developers.facebook.com/tools/debug/>, pegar la URL y pulsar
  «Volver a extraer» (Scrape Again). Repetir por cada URL importante
  (`/`, `/master-2027-2028`, `/servicios/master`, `/calculadora-master`).
- **WhatsApp:** no tiene herramienta de refresco y guarda su propia caché.
  Para enlaces nuevos, compartir con un parámetro distinto, por ejemplo
  `https://www.inspira-legal.cloud/master-2027-2028?v=2` (el servidor lo trata
  igual). Lo ya enviado en chats conserva la tarjeta vieja; se renueva sola con
  el tiempo.
- **LinkedIn:** <https://www.linkedin.com/post-inspector/> y volver a
  inspeccionar la URL.
- **X (Twitter):** ya no hay validador; toma la tarjeta al publicar. Si sale la
  vieja, usar `?v=2`.
- **iMessage:** genera la vista previa en el teléfono al enviar; basta con
  `?v=2` si ese dispositivo ya la tenía.

Las imágenes tienen nombres nuevos (`inspira-general.jpg` en lugar de
`default.jpg`), así que la imagen con la errata «de distancia» no se reutiliza
aunque la plataforma cachee por URL de imagen.

## Mantenimiento

- Ruta nueva con vista previa propia: añadirla en `scripts/rutas-compartir.mjs`
  y en el `map` de este archivo.
- Imágenes: `npm run og` (o `python scripts/og-compartir.py`) regenera las tres
  en `public/og/`.
- Si cambia el `<head>` de `index.html`, cada etiqueta og/twitter debe seguir
  existiendo una vez; si no, `npm run build` falla con un aviso claro.
