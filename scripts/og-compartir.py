# Genera las tres imágenes de compartir (Open Graph, 1200x630) que usan los
# HTML de entrada por ruta (scripts/rutas-compartir.mjs):
#   public/og/inspira-general.jpg     portada y todas las demás rutas
#   public/og/master-2027-2028.jpg    /master-2027-2028 y /servicios/master
#   public/og/calculadora-master.jpg  /calculadora-master
#
# Nombres nuevos a propósito: WhatsApp y Facebook cachean la imagen por URL,
# así que reutilizar default.jpg dejaría la errata antigua a la vista.
#
# Uso:  python scripts/og-compartir.py
# Tipografía: Outfit (OFL) en scripts/fuentes/. Colores de marca:
# petróleo #013446, celeste #88C4FC, naranja #FA943A, amarillo #F9C846.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SALIDA = os.path.join(RAIZ, "public", "og")
LOGO = os.path.join(RAIZ, "src", "assets", "images", "logo.png")
FOTO_MASTER = os.path.join(RAIZ, "src", "assets", "images", "landing", "master-2027", "foto-hero-aeropuerto-pasaporte.webp")
OUTFIT = os.path.join(RAIZ, "scripts", "fuentes", "Outfit-Variable.ttf")
os.makedirs(SALIDA, exist_ok=True)

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
    ancho, alto = pastilla(d, x, y, "Desde 219 €", fuente(40, "Bold"), NARANJA, PETROLEO)
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


if __name__ == "__main__":
    general()
    master()
    calculadora()
