// src/pages/backoffice/login/BackofficeLogin.jsx
import { useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { dialog } from "../../../services/dialogService";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "../../../assets/images/logo.png";

const SITE_URL = "https://www.inspira-legal.cloud/";

export default function BackofficeLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    const r = await boPOST("/backoffice/auth/login", { email, password });

    setLoading(false);

    if (!r.ok) {
      dialog.toast(r.msg || "Credenciales inválidas", "error");
      return;
    }

    // AQUÍ ES LO QUE FALTABA:
    // guardar el token para que backofficeApi lo mande en Authorization
    localStorage.setItem("bo_token", r.token);
    localStorage.setItem("bo_user", JSON.stringify(r.user));

    if (onLogin) onLogin(r.user);

    // Redirigir a la pantalla principal del backoffice
    navigate("/backoffice/dashboard");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-neutral-50 px-4 py-10 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <a
          href={SITE_URL}
          className="flex items-center justify-center gap-2 mb-7 group"
          title="Ir a inspira-legal.cloud"
        >
          <img src={logo} alt="Inspira" className="h-10 w-auto object-contain transition group-hover:opacity-80" />
        </a>

        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-primary leading-tight">Acceso backoffice</h1>
            <p className="text-[13px] text-neutral-500 mt-1">Ingresa con tu cuenta de administración</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full h-11 border border-neutral-200 rounded-xl pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full h-11 border border-neutral-200 rounded-xl pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-50 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[.99] transition disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <a
          href={SITE_URL}
          className="mt-5 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-neutral-400 hover:text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al sitio principal
        </a>
      </div>
    </div>
  );
}
