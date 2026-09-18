# Genera las tres imágenes de compartir (Open Graph, 1200x630) que usan los
# HTML de entrada por ruta (scripts/rutas-compartir.mjs):
#   public/og/inspira-general.jpg     portada y todas las demás rutas
#   public/og/master-2027-2028.jpg    /master-2027-2028 y /servicios/master
#   public/og/calculadora-master.jpg  /calculadora-master
#   public/og/expediente-digital.jpg  /plataforma (Expediente Digital Inspira)
#   public/og/grado-en-espana.jpg     /grado-en-espana (guía para familias)
#   public/og/mapa-estudiar-en-espana.jpg  /mapa-estudiar-en-espana (costos de máster)
#
# Nombres nuevos a propósito: WhatsApp y Facebook cachean la imagen por URL,
# así que reutilizar default.jpg dejaría la errata antigua a la vista.
#
# Uso:  python scripts/og-compartir.py
# Tipografía: Outfit (OFL) en scripts/fuentes/. Colores de marca:
# petróleo #013446, celeste #88C4FC, naranja #FA943A, amarillo #F9C846.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json
import math
import os
import re
import sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SALIDA = os.path.join(RAIZ, "public", "og")
LOGO = os.path.join(RAIZ, "src", "assets", "images", "logo.png")
FOTO_MASTER = os.path.join(RAIZ, "src", "assets", "images", "landing", "master-2027", "foto-hero-aeropuerto-pasaporte.webp")
OUTFIT = os.path.join(RAIZ, "scripts", "fuentes", "Outfit-Variable.ttf")
os.makedirs(SALIDA, exist_ok=True)

# Importes de la fuente única (copia del backend: src/config/precios-inspira.json).
with open(os.path.join(RAIZ, "src", "config", "precios-inspira.json"), encoding="utf-8") as _f:
    PRECIOS = json.load(_f)
DESDE_MASTER = min([p["eur"] for l in PRECIOS["master"]["listas"] for p in l["planes"]] + [p["eur"] for p in PRECIOS["master"]["avanzados"]])

W, H = 1200, 630
PETROLEO = (1, 52, 70)
PETROLEO2 = (2, 84, 110)
CELESTE = (136, 196, 252)
NARANJA = (250, 148, 58)
AMARILLO = (249, 200, 70)
BLANCO = (255, 255, 255)
MAX_KB = 300


def fuente(tam, peso="Bold"):
    if os.path.exists(OUTFIT):
        f = ImageFont.truetype(OUTFIT, tam)
        f.set_variation_by_name(peso)
        return f
    respaldo = r"C:\Windows\Fonts\segoeuib.ttf" if peso in ("Bold", "ExtraBold", "SemiBold") else r"C:\Windows\Fonts\segoeui.ttf"
    return ImageFont.truetype(respaldo, tam)


def envolver(d, texto, f, ancho):
    lineas, actual = [], ""
    for p in texto.split():
        prueba = (actual + " " + p).strip()
        if d.textlength(prueba, font=f) <= ancho or not actual:
            actual = prueba
        else:
            lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


def fondo_marca():
    img = Image.new("RGB", (W, H), PETROLEO)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(PETROLEO[i] + (PETROLEO2[i] - PETROLEO[i]) * t) for i in range(3)))
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([W - 420, -300, W + 220, 330], fill=CELESTE + (40,))
    hd.ellipse([-260, H - 300, 330, H + 260], fill=NARANJA + (34,))
    return Image.alpha_composite(img.convert("RGBA"), halo)


def pegar_logo(img, x, y, alto=64):
    logo = Image.open(LOGO).convert("RGBA")
    ancho = int(logo.width * alto / logo.height)
    logo = logo.resize((ancho, alto), Image.LANCZOS)
    pad_x, pad_y = 26, 14
    caja = Image.new("RGBA", (ancho + 2 * pad_x, alto + 2 * pad_y), (0, 0, 0, 0))
    ImageDraw.Draw(caja).rounded_rectangle([0, 0, caja.width - 1, caja.height - 1], radius=18, fill=BLANCO + (255,))
    caja.alpha_composite(logo, (pad_x, pad_y))
    img.alpha_composite(caja, (x, y))
    return caja.width, caja.height


def pastilla(d, x, y, texto, f, fondo, color, pad_x=24, pad_y=12):
    ancho = d.textlength(texto, font=f)
    asc, desc = f.getmetrics()
    alto = asc + desc
    d.rounded_rectangle([x, y, x + ancho + 2 * pad_x, y + alto + 2 * pad_y], radius=(alto + 2 * pad_y) // 2, fill=fondo)
    d.text((x + pad_x, y + pad_y), texto, font=f, fill=color)
    return ancho + 2 * pad_x, alto + 2 * pad_y


def guardar(img, nombre):
    ruta = os.path.join(SALIDA, nombre)
    rgb = img.convert("RGB")
    for q in (88, 84, 80, 75, 70):
        rgb.save(ruta, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(ruta) <= MAX_KB * 1024:
            break
    kb = os.path.getsize(ruta) // 1024
    print(f"  {nombre:<26} {rgb.size[0]}x{rgb.size[1]}  {kb} KB")
    return ruta


def dominio(d, y):
    f = fuente(26, "Medium")
    t = "inspira-legal.cloud"
    d.text((W - 72 - d.textlength(t, font=f), y), t, font=f, fill=BLANCO)


# (a) General ---------------------------------------------------------------
def general():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)
    x = 72
    d.text((x, 70), "ABOGADOS ESPECIALISTAS EN EXTRANJERÍA", font=fuente(28, "SemiBold"), fill=NARANJA)
    ft = fuente(84, "Bold")
    y = 124
    for ln in ["Asesoría a distancia", "para vivir en España"]:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 98
    fs = fuente(36, "Regular")
    for ln in envolver(d, "Visas de estudios, máster, residencias y nacionalidad", fs, W - 2 * x):
        d.text((x, y + 18), ln, font=fs, fill=CELESTE)
        y += 46
    _, alto = pegar_logo(img, x, H - 72 - 92, alto=64)
    dominio(ImageDraw.Draw(img), H - 72 - 92 + (alto - 34) // 2)
    return guardar(img, "inspira-general.jpg")


# (b) Máster 2027/2028 ------------------------------------------------------
def master():
    img = Image.new("RGBA", (W, H), PETROLEO + (255,))
    foto = Image.open(FOTO_MASTER).convert("RGB")
    # La foto ocupa la mitad derecha (recorte tipo cover).
    zona_w = 640
    esc = max(zona_w / foto.width, H / foto.height)
    foto = foto.resize((int(foto.width * esc) + 1, int(foto.height * esc) + 1), Image.LANCZOS)
    ox = (foto.width - zona_w) // 2
    oy = (foto.height - H) // 2
    foto = foto.crop((ox, oy, ox + zona_w, oy + H))
    img.paste(foto, (W - zona_w, 0))
    # Degradado del petróleo hacia la foto para que el texto respire.
    velo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(velo)
    inicio, fin = W - zona_w, W - zona_w + 260
    for xx in range(inicio, fin):
        a = int(255 * (1 - (xx - inicio) / (fin - inicio)) ** 1.6)
        vd.line([(xx, 0), (xx, H)], fill=PETROLEO + (a,))
    img.alpha_composite(velo)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)

    x = 64
    d.text((x, 62), "UNIVERSIDADES PÚBLICAS DE ESPAÑA", font=fuente(24, "SemiBold"), fill=CELESTE)
    ft = fuente(88, "Bold")
    d.text((x, 100), "Paquete", font=ft, fill=BLANCO)
    d.text((x, 196), "Máster", font=ft, fill=BLANCO)
    d.text((x, 292), "2027/2028", font=ft, fill=AMARILLO)
    y = 420
    ancho, alto = pastilla(d, x, y, f"Desde {DESDE_MASTER} €", fuente(40, "Bold"), NARANJA, PETROLEO)
    d.text((x, y + alto + 18), "Primera ventana: noviembre 2026", font=fuente(32, "Medium"), fill=BLANCO)
    pegar_logo(img, W - 48 - 250, 40, alto=48)
    return guardar(img, "master-2027-2028.jpg")


# (c) Calculadora -----------------------------------------------------------
def calculadora():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)
    x = 72
    pastilla(d, x, 64, "Calculadora gratis", fuente(32, "Bold"), AMARILLO, PETROLEO, pad_x=22, pad_y=10)
    ft = fuente(80, "Bold")
    y = 150
    for ln in ["¿Cuánto cuesta estudiar", "un máster en España?"]:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 94
    d.text((x, y + 20), "Matrícula, visado, apostillas y gastos de vida", font=fuente(34, "Regular"), fill=CELESTE)
    _, alto = pegar_logo(img, x, H - 60 - 92, alto=64)
    dominio(ImageDraw.Draw(img), H - 60 - 92 + (alto - 34) // 2)
    return guardar(img, "calculadora-master.jpg")


# (d) Portal --------------------------------------------------------------
# Nombre provisional: debe coincidir con NOMBRE_PORTAL de src/config/portalMarca.js.
NOMBRE_OG = ["Expediente", "Digital Inspira"]
CAPTURA_PORTAL = os.path.join(RAIZ, "src", "assets", "images", "portal", "inicio-movil.webp")


def portal():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)

    # Teléfono a la derecha, con la captura desenfocada horneada (se sale por abajo).
    tel_w, tel_h, borde, radio = 300, 640, 14, 46
    tx, ty = W - 96 - tel_w, 64
    captura = Image.open(CAPTURA_PORTAL).convert("RGB")
    cw, ch = tel_w - 2 * borde, tel_h - 2 * borde
    captura = captura.resize((cw, int(captura.height * cw / captura.width)), Image.LANCZOS).crop((0, 0, cw, ch))
    captura = captura.filter(ImageFilter.GaussianBlur(3))
    sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle([tx + 18, ty + 26, tx + tel_w + 18, ty + tel_h + 26], radius=radio, fill=(0, 0, 0, 90))
    img.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(18)))
    marco = Image.new("RGBA", (tel_w, tel_h), (0, 0, 0, 0))
    ImageDraw.Draw(marco).rounded_rectangle([0, 0, tel_w - 1, tel_h - 1], radius=radio, fill=(1, 34, 46, 255))
    mascara = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=radio - borde, fill=255)
    marco.paste(captura, (borde, borde), mascara)
    img.alpha_composite(marco, (tx, ty))

    x = 72
    d = ImageDraw.Draw(img)
    d.text((x, 76), "INSPIRA LEGAL", font=fuente(26, "SemiBold"), fill=NARANJA)
    ft = fuente(80, "Bold")
    for i, palabra in enumerate(NOMBRE_OG):
        d.text((x, 118 + 104 * i), palabra, font=ft, fill=AMARILLO if i == len(NOMBRE_OG) - 1 else BLANCO)
    fs = fuente(38, "Regular")
    y = 118 + 104 * len(NOMBRE_OG) + 26
    for ln in ["Tu caso en un portal propio", "y en tu app"]:
        d.text((x, y), ln, font=fs, fill=CELESTE)
        y += 50
    pegar_logo(img, x, H - 60 - 92, alto=64)
    return guardar(img, "expediente-digital.jpg")


# (e) Grado en España, guía para familias -----------------------------------
def grado():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)
    x = 72
    pastilla(d, x, 64, "Guía para familias", fuente(32, "Bold"), AMARILLO, PETROLEO, pad_x=22, pad_y=10)
    ft = fuente(78, "Bold")
    y = 150
    for ln in ["¿Cuánto cuesta estudiar", "un grado en España?"]:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 92
    d.text((x, y + 20), "Simula la inversión año a año", font=fuente(34, "Regular"), fill=CELESTE)
    _, alto = pegar_logo(img, x, H - 60 - 92, alto=64)
    dominio(ImageDraw.Draw(img), H - 60 - 92 + (alto - 34) // 2)
    return guardar(img, "grado-en-espana.jpg")


# (e2) Doctorado en España --------------------------------------------------
def doctorado():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)
    x = 72
    pastilla(d, x, 64, "Doctorado en España", fuente(32, "Bold"), AMARILLO, PETROLEO, pad_x=22, pad_y=10)
    ft = fuente(78, "Bold")
    y = 150
    for ln in ["Residencia desde", "el primer día"]:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 92
    d.text((x, y + 20), "Cuenta para la nacionalidad · desde 300 €", font=fuente(34, "Regular"), fill=CELESTE)
    _, alto = pegar_logo(img, x, H - 60 - 92, alto=64)
    dominio(ImageDraw.Draw(img), H - 60 - 92 + (alto - 34) // 2)
    return guardar(img, "doctorado-en-espana.jpg")


# (f) Mapa de costos de máster ------------------------------------------------
# Silueta real del mapa de la web (pages/landing/master2027/mapaEspana.data.js,
# trazados solo con M y Z) coloreada por lista, con la paleta del kit de marca
# que usa la página del mapa: Noche #003648, Cielo #96CCFC y Sol #F09C48.
MAPA_GEO = os.path.join(RAIZ, "src", "pages", "landing", "master2027", "mapaEspana.data.js")
NOCHE = (0, 54, 72)
CIELO = (150, 204, 252)
SOL = (240, 156, 72)
LISTAS_MAPA = {
    "economicas": ["andalucia", "asturias", "cantabria", "castilla-y-leon", "castilla-la-mancha", "galicia", "navarra"],
    "intermedias": ["aragon", "extremadura", "la-rioja", "murcia", "pais-vasco"],
    "premium": ["cataluna", "madrid", "comunidad-valenciana"],
}
# (cara, canto) como en src/pages/mapa/tonosMapa.js
TONOS_MAPA = {"economicas": ((10, 88, 115), NOCHE), "intermedias": (CIELO, (91, 155, 213)), "premium": (SOL, (184, 102, 31))}
TONO_FUERA = ((227, 233, 239), (191, 201, 210))
# Ciudades con más másteres oficiales (GET /api/mapa, 14/09/2026): nombre, lat, lon, másteres.
CIUDADES_OG = [
    ("Madrid", 40.4168, -3.7038, 358), ("Barcelona", 41.3874, 2.1686, 353), ("Valencia", 39.4699, -0.3763, 237),
    ("Sevilla", 37.3891, -5.9845, 144), ("Santiago", 42.8782, -8.5448, 139), ("Granada", 37.1773, -3.5986, 127),
    ("Bilbao", 43.2630, -2.9350, 84), ("Salamanca", 40.9701, -5.6635, 82), ("Málaga", 36.7213, -4.4214, 79),
    ("Murcia", 37.9922, -1.1307, 71), ("Zaragoza", 41.6488, -0.8891, 55), ("Oviedo", 43.3619, -5.8494, 47),
]
PINES_EURO = ["Madrid", "Sevilla", "Barcelona"]


def proyectar_og(lat, lon):
    # Mismas constantes que src/pages/mapa/proyeccion.js (península).
    esc = 94.63173169197005
    return 6 + (lon + 9.291981574999909) * 0.766044443118978 * esc, 6 + (43.79344310100004 - lat) * esc


def geometria_mapa():
    with open(MAPA_GEO, encoding="utf-8") as f:
        texto = f.read()
    comunidades = []
    for cid, d in re.findall(r"id: '([^']+)',[\s\S]*?\n\s+d: '([^']+)'", texto):
        trazos = []
        for trozo in re.split(r"[MZ]", d):
            nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", trozo)]
            puntos = list(zip(nums[0::2], nums[1::2]))
            if len(puntos) >= 3:
                trazos.append(puntos)
        comunidades.append((cid, trazos))
    m = re.search(r"recuadroCanarias = \{ x: ([\d.]+), y: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}", texto)
    return comunidades, tuple(float(v) for v in m.groups())


def mapa():
    img = Image.new("RGBA", (W, H), NOCHE + (255,))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(6 * t), int(54 + 24 * t), int(72 + 28 * t), 255))
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse([-280, H - 300, 360, H + 300], fill=SOL + (28,))
    img.alpha_composite(halo)

    # Tarjeta del mar a la derecha; se dibuja al doble y se reduce (bordes suaves).
    SS = 2
    cx0, cy0, cw, ch = 540, 34, 626, 562
    tw, th = cw * SS, ch * SS
    mar = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    md = ImageDraw.Draw(mar)
    for yy in range(th):
        t = yy / th
        md.line([(0, yy), (tw, yy)], fill=(int(246 - 36 * t), int(251 - 19 * t), int(255 - 3 * t), 255))
    for yy in range(12 * SS, th, 18 * SS):
        for xx in range(12 * SS, tw, 18 * SS):
            md.ellipse([xx - 1.3 * SS, yy - 1.3 * SS, xx + 1.3 * SS, yy + 1.3 * SS], fill=(214, 230, 244, 255))
    capa = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    mascara = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, tw - 1, th - 1], radius=34 * SS, fill=255)
    capa.paste(mar, (0, 0), mascara)

    s = min((cw - 36) / 1000, (ch - 40) / 828.8) * SS
    ox = (tw - 1000 * s) / 2
    oy = (th - 828.8 * s) / 2 + 6 * SS

    def P(x, y, dx=0, dy=0):
        return (ox + x * s + dx, oy + y * s + dy)

    comunidades, (rx, ry, rw, rh) = geometria_mapa()
    lista_de = {c: l for l, cs in LISTAS_MAPA.items() for c in cs}
    cd = ImageDraw.Draw(capa)
    cd.rounded_rectangle([P(rx, ry), P(rx + rw, ry + rh)], radius=14 * SS, fill=(255, 255, 255, 120), outline=NOCHE + (90,), width=2 * SS)

    sombra = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sombra)
    for cid, trazos in comunidades:
        for t in trazos:
            sd.polygon([P(x, y, 4 * SS, 11 * SS) for x, y in t], fill=NOCHE + (45,))
    capa.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(3 * SS)))
    cd = ImageDraw.Draw(capa)
    for cid, trazos in comunidades:
        cara, canto = TONOS_MAPA.get(lista_de.get(cid), TONO_FUERA)
        for t in trazos:
            cd.polygon([P(x, y, 0, 5 * SS) for x, y in t], fill=canto + (255,))
    for cid, trazos in comunidades:
        cara, canto = TONOS_MAPA.get(lista_de.get(cid), TONO_FUERA)
        for t in trazos:
            cd.polygon([P(x, y) for x, y in t], fill=cara + (255,), outline=(255, 255, 255, 255), width=int(1.4 * SS))

    # Ruta punteada Sol desde la izquierda de la tarjeta hasta Madrid.
    burbujas = {n: (P(*proyectar_og(la, lo)), m) for n, la, lo, m in CIUDADES_OG}
    (mx, my), _ = burbujas["Madrid"]
    o = (-10 * SS, th * 0.9)
    dist = math.hypot(mx - o[0], my - o[1])
    c = ((o[0] + mx) / 2, min(o[1], my) - dist * 0.32)
    previo, recorrido = o, 0.0
    for i in range(1, 401):
        k = i / 400
        p = ((1 - k) ** 2 * o[0] + 2 * (1 - k) * k * c[0] + k * k * mx, (1 - k) ** 2 * o[1] + 2 * (1 - k) * k * c[1] + k * k * my)
        tramo = math.hypot(p[0] - previo[0], p[1] - previo[1])
        if (recorrido % (22 * SS)) < 13 * SS and k < 0.93:
            cd.line([previo, p], fill=SOL + (255,), width=int(3.4 * SS))
        recorrido += tramo
        previo = p

    for nombre, ((x, y), n) in burbujas.items():
        r = (3.5 + math.sqrt(n) * 1.05) * 0.95 * SS
        cd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 248), outline=NOCHE + (255,), width=int(2 * SS))
    feuro = fuente(22 * SS, "Bold")
    for nombre in PINES_EURO:
        (x, y), n = burbujas[nombre]
        r = (3.5 + math.sqrt(n) * 1.05) * 0.95 * SS
        px_, py_ = x + r * 0.75 + 12 * SS, y - r * 0.75 - 12 * SS
        rp = 17 * SS
        cd.ellipse([px_ - rp, py_ - rp, px_ + rp, py_ + rp], fill=SOL + (255,), outline=(255, 255, 255, 255), width=3 * SS)
        cd.text((px_, py_ + 1 * SS), "€", font=feuro, fill=NOCHE + (255,), anchor="mm")

    # Leyenda de las tres listas, arriba a la derecha (sobre Francia, vacía en el mapa).
    fl = fuente(17 * SS, "SemiBold")
    for i, (lista, texto) in enumerate([("economicas", "Económicas"), ("intermedias", "Intermedias"), ("premium", "Premium")]):
        yy = 18 * SS + i * 25 * SS
        xx = tw - 168 * SS
        cara, canto = TONOS_MAPA[lista]
        cd.rounded_rectangle([xx, yy, xx + 16 * SS, yy + 16 * SS], radius=4 * SS, fill=cara + (255,), outline=canto + (255,), width=SS)
        cd.text((xx + 24 * SS, yy + 8 * SS), texto, font=fl, fill=NOCHE + (255,), anchor="lm")

    capa = capa.resize((cw, ch), Image.LANCZOS)
    sombra_t = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sombra_t).rounded_rectangle([cx0 + 8, cy0 + 16, cx0 + cw + 8, cy0 + ch + 16], radius=34, fill=(0, 0, 0, 80))
    img.alpha_composite(sombra_t.filter(ImageFilter.GaussianBlur(16)))
    img.alpha_composite(capa, (cx0, cy0))

    # Texto a la izquierda.
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=SOL)
    x, ancho = 60, 452
    d.text((x, 56), "MAPA INTERACTIVO · MÁSTER", font=fuente(22, "SemiBold"), fill=CIELO)
    y = 98
    ft = fuente(60, "Bold")
    for ln in envolver(d, "¿Cuánto cuesta un máster en España?", ft, ancho):
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 70
    fs = fuente(42, "Bold")
    for ln in envolver(d, "Descúbrelo en el mapa", fs, ancho):
        d.text((x, y + 10), ln, font=fs, fill=SOL)
        y += 52
    fsub = fuente(26, "Regular")
    y += 30
    for ln in envolver(d, "Matrícula de un máster al año por comunidad y universidad", fsub, ancho):
        d.text((x, y), ln, font=fsub, fill=CIELO)
        y += 34
    pegar_logo(img, x, H - 40 - 84, alto=56)
    return guardar(img, "mapa-estudiar-en-espana.jpg")


# (g) Beca Generación del Bicentenario 2026 ----------------------------------
# Sin logotipos ni colores de PRONABEC: la pieza es de Inspira.
def bicentenario():
    img = fondo_marca()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 12, H], fill=NARANJA)
    x = 72
    pastilla(d, x, 60, "Nuevas bases · Convocatoria 2026", fuente(30, "Bold"), AMARILLO, PETROLEO, pad_x=22, pad_y=10)
    ft = fuente(70, "Bold")
    y = 140
    for ln in ["Beca Generación del", "Bicentenario 2026"]:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 82
    fsolo = fuente(40, "SemiBold")
    fnum = fuente(150, "Bold")
    d.text((x, y + 24), "Solo", font=fsolo, fill=CELESTE)
    ancho_solo = d.textlength("Solo ", font=fsolo)
    d.text((x + ancho_solo, y - 30), "20", font=fnum, fill=AMARILLO)
    ancho_num = d.textlength("20", font=fnum) + 22
    d.text((x + ancho_solo + ancho_num, y + 24), "becas", font=fsolo, fill=CELESTE)
    d.text((x, y + 150), "¿Calificas? Calcula tu puntaje", font=fuente(34, "Medium"), fill=BLANCO)
    pegar_logo(img, W - 72 - 250, H - 60 - 76, alto=48)
    return guardar(img, "beca-generacion-bicentenario-2026.jpg")


if __name__ == "__main__":
    # Sin argumentos genera todas; con nombres, solo esas (p. ej. «portal»).
    FUNCIONES = {"general": general, "master": master, "calculadora": calculadora, "portal": portal, "grado": grado, "doctorado": doctorado, "mapa": mapa, "bicentenario": bicentenario}
    for nombre in sys.argv[1:] or FUNCIONES:
        FUNCIONES[nombre]()
