# Portadas del blog: 1200x600, una por categoría, con la identidad de marca.
from PIL import Image, ImageDraw, ImageFont
import os, math

BASE = r"F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\public\blog"
os.makedirs(BASE, exist_ok=True)
W, H = 1200, 600

PALETAS = {
    "extranjeria": ((1, 52, 70), (2, 80, 107), (136, 196, 252)),
    "educativa":   ((2, 62, 84), (4, 96, 120), (249, 200, 70)),
    "nacionalidad":((1, 45, 62), (13, 90, 96), (250, 148, 58)),
}

def fuente(t, b=True):
    for c in ([r"C:\Windows\Fonts\segoeuib.ttf"] if b else [r"C:\Windows\Fonts\segoeui.ttf"]):
        if os.path.exists(c): return ImageFont.truetype(c, t)
    return ImageFont.load_default()

def envolver(d, txt, f, ancho):
    out, cur = [], ""
    for p in txt.split():
        t = (cur + " " + p).strip()
        if d.textlength(t, font=f) <= ancho: cur = t
        else:
            if cur: out.append(cur)
            cur = p
    if cur: out.append(cur)
    return out

def crear(nombre, categoria, titulo, paleta):
    c1, c2, ac = PALETAS[paleta]
    img = Image.new("RGB", (W, H), c1)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(c1[i] + (c2[i]-c1[i])*t) for i in range(3)))

    # Trama de puntos sutil
    capa = Image.new("RGBA", (W, H), (0,0,0,0))
    cd = ImageDraw.Draw(capa)
    for gx in range(0, W, 44):
        for gy in range(0, H, 44):
            cd.ellipse([gx, gy, gx+3, gy+3], fill=(255,255,255,16))
    # Arcos de marca
    cd.ellipse([W-330, -200, W+180, 320], fill=ac + (30,))
    cd.ellipse([-200, H-220, 260, H+200], fill=(255,255,255,14))
    img = Image.alpha_composite(img.convert("RGBA"), capa).convert("RGB")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 8], fill=ac)

    x = 74
    d.text((x, 92), categoria.upper(), font=fuente(22), fill=ac)
    ft = fuente(52)
    y = 142
    for ln in envolver(d, titulo, ft, W - 300)[:4]:
        d.text((x, y), ln, font=ft, fill=(255,255,255)); y += 66

    fd = fuente(21, False)
    d.text((x, H - 78), "inspira-legal.cloud", font=fd, fill=(255,255,255,150))

    ruta = os.path.join(BASE, nombre + ".jpg")
    img.save(ruta, "JPEG", quality=84, optimize=True)
    return os.path.getsize(ruta)//1024

POSTS = [
    ("residencia-doctorado-espana-nacionalidad","Extranjería","El doctorado en España ya es residencia y cuenta para la nacionalidad","nacionalidad"),
    ("visa-estudios-vs-estancia-por-estudios","Extranjería","Visa de Estudios vs. Estancia por Estudios","extranjeria"),
    ("residencia-nomada-digital-espana","Extranjería","Residencia de Nómada Digital: requisitos reales","extranjeria"),
    ("nacionalidad-espanola-latinoamericanos-2-anos","Nacionalidad","Nacionalidad española: la vía de los 2 años","nacionalidad"),
    ("master-en-espana-guia-de-pasos","Asesoría educativa","Estudiar un Máster en España: guía completa","educativa"),
    ("homologacion-titulo-universitario-espana","Asesoría educativa","Homologación de tu título universitario en España","educativa"),
    ("formacion-profesional-espana-carrera-tecnica","Asesoría educativa","Formación Profesional en España: la vía rápida","educativa"),
    ("denegacion-visa-estudios-recurso-reposicion","Extranjería","Te denegaron la visa de estudios: qué hacer","extranjeria"),
    ("calendario-estudiar-espana-2026-2027","Asesoría educativa","Calendario para estudiar en España 2026/2027","educativa"),
]
tot = 0
for p in POSTS:
    kb = crear(*p); tot += kb
    print(f"  {p[0][:42]:<44} {kb} KB")
print(f"\n{len(POSTS)} portadas · {tot} KB")
