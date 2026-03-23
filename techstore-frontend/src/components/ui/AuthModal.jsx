import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors outline-none text-sm";

// ─── Indicador visual de fortaleza de contraseña ──────────────────────────────
function PasswordStrength(pw) {
  const hasLen   = pw.length >= 8;
  const hasNum   = /\d/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasSpec  = /[^a-zA-Z0-9]/.test(pw);
  const score    = [hasLen, hasNum, hasUpper, hasSpec].filter(Boolean).length;
  const COLORS   = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];
  const BARS     = ['bg-red-500',   'bg-orange-400',   'bg-yellow-400',   'bg-green-500'];
  const LABELS   = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];
  const hints    = [
    ...(!hasLen   ? ['8+ chars']    : []),
    ...(!hasNum   ? ['1 número']    : []),
    ...(!hasUpper ? ['1 mayúscula'] : []),
  ].join(' · ');
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(level => (
          <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= score ? BARS[score - 1] : 'bg-border-dark'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {score > 0 && <p className={`text-[11px] font-bold ${COLORS[score - 1]}`}>{LABELS[score - 1]}</p>}
        {hints && <p className="text-[11px] text-slate-600 ml-auto">{hints}</p>}
      </div>
    </div>
  );
}

// ─── Hook: cargar script de reCAPTCHA v3 ──────────────────────────────────────
function useRecaptcha() {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey || document.getElementById('recaptcha-script')) return;
    const script    = document.createElement('script');
    script.id       = 'recaptcha-script';
    script.src      = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async    = true;
    document.head.appendChild(script);
  }, [siteKey]);

  const execute = useCallback(async (action = 'register') => {
    if (!siteKey) return 'dev-bypass';         // Sin key → bypass en desarrollo
    await new Promise(r => setTimeout(r, 500)); // Esperar que grecaptcha cargue
    return window.grecaptcha?.execute(siteKey, { action }) ?? 'dev-bypass';
  }, [siteKey]);

  return { execute };
}

// ─── Hook: cargar Google Identity Services ────────────────────────────────────
function useGoogleOAuth(onSuccess) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || document.getElementById('google-gsi-script')) return;
    const script    = document.createElement('script');
    script.id       = 'google-gsi-script';
    script.src      = 'https://accounts.google.com/gsi/client';
    script.async    = true;
    script.defer    = true;
    script.onload   = () => {
      window.google?.accounts.id.initialize({
        client_id:         clientId,
        callback:          onSuccess,
        auto_select:       false,
        cancel_on_tap_outside: true,
      });
    };
    document.head.appendChild(script);
  }, [clientId, onSuccess]);

  const prompt = useCallback(() => {
    if (!clientId) return;
    window.google?.accounts.id.prompt();
  }, [clientId]);

  const renderButton = useCallback((elementId) => {
    if (!clientId) return;
    window.google?.accounts.id.renderButton(
      document.getElementById(elementId),
      { theme: 'filled_black', size: 'large', width: '100%', text: 'continue_with', shape: 'rectangular' }
    );
  }, [clientId]);

  return { prompt, renderButton };
}

export default function AuthModal() {
  const { authModal, closeAuth, login, register, loginWithGoogle } = useAuth();
  const { open, tab } = authModal;

  const [activeTab,    setActiveTab]    = useState(tab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const { execute: executeRecaptcha } = useRecaptcha();

  // Callback cuando Google devuelve el credential
  const handleGoogleCredential = useCallback(async ({ credential }) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle]);

  const { renderButton } = useGoogleOAuth(handleGoogleCredential);

  // Renderizar botón de Google cuando el tab de login esté activo
  useEffect(() => {
    if (open && activeTab === "login") {
      setTimeout(() => renderButton("google-btn-login"),    300);
    }
    if (open && activeTab === "register") {
      setTimeout(() => renderButton("google-btn-register"), 300);
    }
  }, [open, activeTab, renderButton]);

  useEffect(() => {
    setActiveTab(tab);
    setError("");
  }, [tab, open]);

  // Formularios
  const [loginData,    setLoginData]    = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleLoginChange    = f => e => setLoginData(p    => ({ ...p, [f]: e.target.value }));
  const handleRegisterChange = f => e => setRegisterData(p => ({ ...p, [f]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) { setError("Completa todos los campos."); return; }
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirm } = registerData;
    if (!name || !email || !password || !confirm) { setError("Completa todos los campos."); return; }
    if (password !== confirm)    { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8)     { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (!/\d/.test(password))    { setError("La contraseña debe contener al menos un número."); return; }

    setLoading(true);
    try {
      // Obtener token reCAPTCHA v3 antes de enviar
      const recaptchaToken = await executeRecaptcha('register');
      await register(name, email, password, recaptchaToken);
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={closeAuth}
        role="button"
        tabIndex={0}
        aria-label="Cerrar modal"
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") closeAuth(); }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-surface-dark border border-border-dark rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />

          {/* Cerrar */}
          <button onClick={closeAuth} className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center pt-8 pb-2 px-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-[20px]">memory</span>
              </div>
              <span className="text-lg font-bold text-white">TechStore</span>
            </div>
            <p className="text-slate-400 text-sm">
              {activeTab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta gratis"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mt-4 bg-background-dark rounded-lg p-1 gap-1">
            {[{ id: "login", label: "Iniciar Sesión" }, { id: "register", label: "Registrarse" }].map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setError(""); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Error global */}
          {error && (
            <div className="mx-8 mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* ── LOGIN ── */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 px-8 py-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Correo electrónico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">email</span>
                  <input id="auth-email" className={`${inputClass} pl-11`} type="email" placeholder="tu@correo.com"
                    value={loginData.email} onChange={handleLoginChange("email")} autoComplete="email" />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-password" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contraseña</label>
                  <button type="button" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
                  <input id="auth-password" className={`${inputClass} pl-11 pr-11`}
                    type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={loginData.password} onChange={handleLoginChange("password")} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Recordarme */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-4 h-4" />
                <span className="text-sm text-slate-400">Recordarme</span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                {loading
                  ? <><span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>Iniciando sesión...</>
                  : <><span className="material-symbols-outlined text-[20px]">login</span>Iniciar Sesión</>}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border-dark" />
                <span className="text-xs text-slate-500">o continúa con</span>
                <div className="flex-1 h-px bg-border-dark" />
              </div>

              {/* Botón Google (renderizado por Google Identity Services) */}
              <div id="google-btn-login" className="w-full flex justify-center" />

              <p className="text-center text-sm text-slate-500 pb-2">
                ¿No tienes cuenta?{" "}
                <button type="button" onClick={() => setActiveTab("register")} className="text-primary hover:underline font-medium">
                  Regístrate gratis
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTRO ── */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4 px-8 py-6">
              {/* Nombre */}
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nombre completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">person</span>
                  <input id="auth-name" className={`${inputClass} pl-11`} type="text" placeholder="Tu nombre"
                    value={registerData.name} onChange={handleRegisterChange("name")} />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Correo electrónico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">email</span>
                  <input id="auth-register-email" className={`${inputClass} pl-11`} type="email" placeholder="tu@correo.com"
                    value={registerData.email} onChange={handleRegisterChange("email")} autoComplete="email" />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-password" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contraseña</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
                  <input id="auth-register-password" className={`${inputClass} pl-11 pr-11`}
                    type={showPassword ? "text" : "password"} placeholder="Mín. 8 caracteres con un número"
                    value={registerData.password} onChange={handleRegisterChange("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña + strength */}
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-confirm" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirmar contraseña</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock_reset</span>
                  <input id="auth-register-confirm" className={`${inputClass} pl-11`}
                    type={showPassword ? "text" : "password"} placeholder="Repite tu contraseña"
                    value={registerData.confirm} onChange={handleRegisterChange("confirm")} />
                </div>
                {registerData.password && PasswordStrength(registerData.password)}
              </div>

              {/* Términos */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400 leading-snug">
                  Acepto los <span className="text-primary cursor-pointer hover:underline">Términos de Servicio</span> y la{" "}
                  <span className="text-primary cursor-pointer hover:underline">Política de Privacidad</span>
                </span>
              </label>

              {/* reCAPTCHA badge info */}
              <p className="text-[11px] text-slate-600 text-center -mt-1">
                Protegido por reCAPTCHA —{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:text-slate-400">Privacidad</a>
                {" · "}
                <a href="https://policies.google.com/terms"   target="_blank" rel="noreferrer" className="hover:text-slate-400">Términos</a>
              </p>

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1">
                {loading
                  ? <><span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>Creando cuenta...</>
                  : <><span className="material-symbols-outlined text-[20px]">person_add</span>Crear Cuenta</>}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border-dark" />
                <span className="text-xs text-slate-500">o regístrate con</span>
                <div className="flex-1 h-px bg-border-dark" />
              </div>

              {/* Botón Google */}
              <div id="google-btn-register" className="w-full flex justify-center" />

              <p className="text-center text-sm text-slate-500 pb-2">
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={() => setActiveTab("login")} className="text-primary hover:underline font-medium">
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
