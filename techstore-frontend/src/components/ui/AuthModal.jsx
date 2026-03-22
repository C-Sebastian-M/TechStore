import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg bg-background-dark border border-border-dark text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors outline-none text-sm";

// Indicador visual de fortaleza de contraseña
// Evalúa 4 criterios: longitud ≥8, tiene número, tiene mayúscula, tiene carácter especial
function PasswordStrength(pw) {
  const hasLen   = pw.length >= 8;
  const hasNum   = /\d/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasSpec  = /[^a-zA-Z0-9]/.test(pw);
  const score    = [hasLen, hasNum, hasUpper, hasSpec].filter(Boolean).length;
  const COLORS   = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];
  const BARS     = ['bg-red-500',   'bg-orange-400',   'bg-yellow-400',   'bg-green-500'];
  const LABELS   = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];
  const hints    = [...(!hasLen ? ['8+ chars'] : []), ...(!hasNum ? ['1 número'] : []), ...(!hasUpper ? ['1 mayúscula'] : [])].join(' · ');
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(level => (
          <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= score ? BARS[score-1] : 'bg-border-dark'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {score > 0 && <p className={`text-[11px] font-bold ${COLORS[score-1]}`}>{LABELS[score-1]}</p>}
        {hints && <p className="text-[11px] text-slate-600 ml-auto">{hints}</p>}
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { authModal, closeAuth, login, register } = useAuth();
  const { open, tab } = authModal;

  const [activeTab, setActiveTab] = useState(tab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sincronizar tab externo (cuando se llama openLogin vs openRegister)
  useEffect(() => {
    setActiveTab(tab);
    setError("");
  }, [tab, open]);

  // Formulario login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  // Formulario register
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleLoginChange = (field) => (e) =>
    setLoginData((prev) => ({ ...prev, [field]: e.target.value }));
  const handleRegisterChange = (field) => (e) =>
    setRegisterData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirm } = registerData;
    if (!name || !email || !password || !confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("La contraseña debe contener al menos un número.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={closeAuth}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            closeAuth();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-surface-dark border border-border-dark rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in">
          {/* Header decorativo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />

          {/* Close button */}
          <button
            onClick={closeAuth}
            className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center pt-8 pb-2 px-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  memory
                </span>
              </div>
              <span className="text-lg font-bold text-white">TechStore</span>
            </div>
            <p className="text-slate-400 text-sm">
              {activeTab === "login"
                ? "Bienvenido de vuelta"
                : "Crea tu cuenta gratis"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mt-4 bg-background-dark rounded-lg p-1 gap-1">
            {[
              { id: "login", label: "Iniciar Sesión" },
              { id: "register", label: "Registrarse" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setError("");
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === t.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-8 mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {activeTab === "login" && (
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-4 px-8 py-6"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    email
                  </span>
                  <input
                    id="auth-email"
                    className={`${inputClass} pl-11`}
                    type="email"
                    placeholder="tu@correo.com"
                    value={loginData.email}
                    onChange={handleLoginChange("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-password" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    lock
                  </span>
                  <input
                    id="auth-password"
                    className={`${inputClass} pl-11 pr-11`}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange("password")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm text-slate-400">Recordarme</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">
                      progress_activity
                    </span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      login
                    </span>
                    Iniciar Sesión
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border-dark" />
                <span className="text-xs text-slate-500">o continúa con</span>
                <div className="flex-1 h-px bg-border-dark" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-10 rounded-lg border border-border-dark bg-background-dark text-white text-sm font-medium hover:border-primary/50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-10 rounded-lg border border-border-dark bg-background-dark text-white text-sm font-medium hover:border-primary/50 transition-colors"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>

              <p className="text-center text-sm text-slate-500 pb-2">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate gratis
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === "register" && (
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-4 px-8 py-6"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="auth-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Nombre completo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    person
                  </span>
                  <input
                    id="auth-name"
                    className={`${inputClass} pl-11`}
                    type="text"
                    placeholder="Tu nombre"
                    value={registerData.name}
                    onChange={handleRegisterChange("name")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    email
                  </span>
                  <input
                    id="auth-register-email"
                    className={`${inputClass} pl-11`}
                    type="email"
                    placeholder="tu@correo.com"
                    value={registerData.email}
                    onChange={handleRegisterChange("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-password" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    lock
                  </span>
                  <input
                    id="auth-register-password"
                    className={`${inputClass} pl-11 pr-11`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mín. 8 caracteres con un número"
                    value={registerData.password}
                    onChange={handleRegisterChange("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="auth-register-confirm" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                    lock_reset
                  </span>
                  <input
                    id="auth-register-confirm"
                    className={`${inputClass} pl-11`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={registerData.confirm}
                    onChange={handleRegisterChange("confirm")}
                  />
                </div>
{/* Password strength indicator */}
                {registerData.password && PasswordStrength(registerData.password)}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-slate-400 leading-snug">
                  Acepto los{" "}
                  <span className="text-primary hover:underline cursor-pointer">
                    Términos de Servicio
                  </span>{" "}
                  y la{" "}
                  <span className="text-primary hover:underline cursor-pointer">
                    Política de Privacidad
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">
                      progress_activity
                    </span>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      person_add
                    </span>
                    Crear Cuenta
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pb-2">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-primary hover:underline font-medium"
                >
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
