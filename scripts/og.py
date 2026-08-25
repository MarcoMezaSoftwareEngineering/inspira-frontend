# Genera las imágenes de compartir (Open Graph) 1200x630 con la identidad
# de Inspira: fondo azul petróleo, acentos celeste/naranja y el logotipo.
from PIL import Image, ImageDraw, ImageFont
import os

BASE = r"F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\public\og"
LOGO = r"F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\assets\images\logo.png"
os.makedirs(BASE, exist_ok=True)

W, H = 1200, 630
PETROLEO = (1, 52, 70)
PETROLEO2 = (2, 80, 107)
CELESTE = (136, 196, 252)
NARANJA = (250, 148, 58)
BLANCO = (255, 255, 255)


def fuente(tam, negrita=True):
    candidatas = [
        r"C:\Windows\Fonts\segoeuib.ttf" if negrita else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if negrita else r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidatas:
        if os.path.exists(c):
            return ImageFont.truetype(c, tam)
    return ImageFont.load_default()


def envolver(draw, texto, f, ancho_max):
    palabras, lineas, actual = texto.split(), [], ""
    for p in palabras:
        prueba = (actual + " " + p).strip()
        if draw.textlength(prueba, font=f) <= ancho_max:
            actual = prueba
        else:
            if actual:
                lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


def crear(nombre, etiqueta, titulo, sub):
    img = Image.new("RGB", (W, H), PETROLEO)
    d = ImageDraw.Draw(img)

    # Degradado diagonal suave
    for y in range(H):
        t = y / H
        c = tuple(int(PETROLEO[i] + (PETROLEO2[i] - PETROLEO[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)

    # Halos de marca
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([W - 380, -260, W + 200, 320], fill=CELESTE + (36,))
    hd.ellipse([-240, H - 300, 320, H + 240], fill=NARANJA + (30,))
    img = Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB")
    d = ImageDraw.Draw(img)

    # Barra de acento
    d.rectangle([0, 0, 10, H], fill=NARANJA)

    x = 80
    # Etiqueta
    fe = fuente(24)
    d.text((x, 92), etiqueta.upper(), font=fe, fill=NARANJA)

    # Título
    ft = fuente(64)
    lineas = envolver(d, titulo, ft, W - 260)[:3]
    y = 150
    for ln in lineas:
        d.text((x, y), ln, font=ft, fill=BLANCO)
        y += 78

    # Subtítulo
    fs = fuente(30, negrita=False)
    for ln in envolver(d, sub, fs, W - 300)[:2]:
        d.text((x, y + 16), ln, font=fs, fill=CELESTE)
        y += 42

    # Logo abajo a la izquierda
    try:
        logo = Image.open(LOGO).convert("RGBA")
        logo.thumbnail((300, 100), Image.LANCZOS)
        fondo = Image.new("RGBA", (logo.width + 44, logo.height + 30), (255, 255, 255, 240))
        fondo.paste(logo, (22, 15), logo)
        img.paste(fondo.convert("RGB"), (x - 6, H - 128))
    except Exception as e:
        print("logo:", e)

    # Dominio
    fd = fuente(24, negrita=False)
    dom = "inspira-legal.cloud"
    d.text((W - 80 - d.textlength(dom, font=fd), H - 96), dom, font=fd, fill=(255, 255, 255, 180))

    ruta = os.path.join(BASE, nombre + ".jpg")
    img.save(ruta, "JPEG", quality=86, optimize=True)
    return ruta, os.path.getsize(ruta) // 1024


PAGINAS = [
    ("default", "Abogados especialistas en extranjería",
     "Una asesoría de distancia para vivir en España",
     "Visa de estudios, máster, residencias y nacionalidad"),
    ("servicios", "Todos nuestros servicios",
     "Tu camino a España, trámite por trámite",
     "Extranjería, asesoría educativa y gestiones en España"),
    ("casos", "Casos de éxito",
     "Expedientes reales, resultados reales",
     "+2.000 admitidos · +500 visas aprobadas"),
    ("eventos", "Evento gratuito",
     "Estudia en España en 5 pasos",
     "Charla virtual · sábado 19 de septiembre"),
    ("blog", "Blog",
     "Guías claras para migrar y estudiar en España",
     "Extranjería, visados y vida académica"),
    ("asistente", "Diagnóstico gratuito",
     "Cuéntanos tu caso y te decimos cuál es tu vía",
     "Sin registro, en menos de un minuto"),
    ("calculadora", "Calculadora gratis",
     "¿Cuánto cuesta de verdad tu máster en España?",
     "Matrícula, visa, apostillas y gastos de vida"),
    ("plataforma", "Sistema propio",
     "Tu caso no vive en un chat, vive en nuestro sistema",
     "Panel privado, checklist y avisos automáticos"),
    ("nosotros", "Nosotros",
     "El equipo que mueve tu caso",
     "Abogados asociados en extranjería española"),
    ("tienda", "Tiendita",
     "Recursos digitales para avanzar por tu cuenta",
     "Guías, ebooks y herramientas"),
]

total = 0
for args in PAGINAS:
    ruta, kb = crear(*args)
    total += kb
    print(f"  {os.path.basename(ruta):<20} {kb} KB")
print(f"\n{len(PAGINAS)} imágenes · {total} KB en total")
