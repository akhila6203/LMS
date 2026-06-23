import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Sparkles, Shield } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { isPublicOnlyPath } from "@/utils/publicRoutes";
import LearnerGoogleLogin from "@/components/LearnerGoogleLogin";
import loginbg from "@/assets/photos/login.jpg";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const emptyForm = () => ({ email: "", password: "" });

function LiveRegisterLink() {
  const fullText = "New admin? Register here";
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const typeTimer = setInterval(() => {
      index += 1;
      setDisplayText(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(typeTimer);
    }, 55);

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typeTimer);
      clearInterval(cursorTimer);
    };
  }, []);

  return (
    <p className="mt-4 text-center text-xs text-slate-500">
      <Link
        to="/admin/register"
        className="inline-flex items-center gap-0.5 font-medium text-emerald-600 hover:underline"
      >
        <span>{displayText}</span>
        <span
          className={`inline-block h-3 w-[1px] bg-emerald-600 ml-0.5 ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        />
      </Link>
    </p>
  );
}

function AdminLoginFormFields({
  email,
  password,
  showPassword,
  errors,
  onEmailChange,
  onPasswordChange,
  onToggleShow,
}) {
  return (
    <>
      <label htmlFor="admin-email" className="text-sm font-medium text-slate-600">
        Email
      </label>
      <div
        className={`mt-1 mb-1 flex items-center rounded-xl px-3 ${
          errors.email ? "border border-red-400 bg-red-50" : "bg-slate-100"
        }`}
      >
        <FaEnvelope className="mr-2 shrink-0 text-sm text-slate-400" />
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="admin@gmail.com"
          className="w-full bg-transparent py-2.5 text-sm outline-none sm:text-base"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      {errors.email && <p className="mb-2 text-xs text-red-500">{errors.email}</p>}

      <label htmlFor="admin-password" className="text-sm font-medium text-slate-600">
        Password
      </label>
      <div
        className={`relative mt-1 mb-6 flex items-center rounded-xl px-3 ${
          errors.password ? "border border-red-400 bg-red-50" : "bg-slate-100"
        }`}
      >
        <FaLock className="mr-2 shrink-0 text-sm text-slate-400" />
        <input
          id="admin-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter password"
          className="w-full bg-transparent py-2.5 pr-8 text-sm outline-none sm:text-base"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors.password && (
        <p className="mb-4 text-xs text-red-500">{errors.password}</p>
      )}
    </>
  );
}

function UserGoogleSignIn({ onSuccess, onGoogleError, loading, inviteEmail }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur-sm sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-cyan-200/40 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Welcome, learner
          </h2>
          <p className="text-sm text-slate-500">
            Sign in with your admin-registered Gmail account
          </p>
        </div>
      </div>

      <ul className="relative mt-5 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          One tap — no password to remember
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Only Gmail accounts added by admin can sign in
        </li>
      </ul>

      {inviteEmail && (
        <p className="relative mt-5 rounded-xl bg-blue-50 px-3 py-2 text-center text-sm text-blue-600">
          Continue with Google using: {inviteEmail}
        </p>
      )}

      {!googleClientId ? (
        <div className="relative mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Google sign-in is not configured. Set{" "}
          <code className="rounded bg-white px-1">VITE_GOOGLE_CLIENT_ID</code> in{" "}
          <code className="rounded bg-white px-1">.env</code> (must match backend{" "}
          <code className="rounded bg-white px-1">GOOGLE_CLIENT_ID</code>).
        </div>
      ) : (
        <>
          <div className="relative mt-6">
            <LearnerGoogleLogin
              onSuccess={onSuccess}
              onError={onGoogleError}
              disabled={loading}
            />
          </div>
          {/* <p className="relative mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            If Google sign-in fails, add these origins in Google Cloud Console →
            Credentials → OAuth client → Authorized JavaScript origins:{" "}
            <code className="font-semibold text-slate-700">{appOrigin}</code>
            {appOrigin.includes("localhost") && (
              <>
                {" "}
                and{" "}
                <code className="font-semibold text-slate-700">
                  {appOrigin.replace("localhost", "127.0.0.1")}
                </code>
              </>
            )}
          </p> */}
        </>
      )}

      <p className="relative mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <FcGoogle className="h-4 w-4" />
        Secured with Google OAuth
      </p>

      {loading && (
        <p className="relative mt-3 text-center text-sm font-medium text-violet-600">
          Signing you in…
        </p>
      )}

      {/* Legacy email + password user login (uses `users` table) — disabled; admin uses password below */}
      {/*
      <form onSubmit={handleUserPasswordLogin}>
        <LoginFormFields idPrefix="user" ... />
        <button type="submit">Login with email</button>
      </form>
      */}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [loginType, setLoginType] = useState(
    searchParams.get("type") === "admin" ? "admin" : "user"
  );
  const [adminForm, setAdminForm] = useState(emptyForm);
  const [adminShow, setAdminShow] = useState(false);
  const [adminErrors, setAdminErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const inviteToken = searchParams.get("invite");
  const inviteEmail = searchParams.get("email");

  const isAdmin = loginType === "admin";

  useEffect(() => {
    setLoginType(searchParams.get("type") === "admin" ? "admin" : "user");
  }, [searchParams]);

  const validateAdmin = () => {
    const newErrors = {};
    const { email, password } = adminForm;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (email !== email.toLowerCase()) {
      newErrors.email = "Only lowercase allowed";
    } else if (!email.endsWith("@gmail.com")) {
      newErrors.email = "Must be a gmail.com email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char";
    }

    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectAfterAuth = (user) => {
    const redirect = searchParams.get("redirect");
    const decodedRedirect = redirect ? decodeURIComponent(redirect) : null;
    const safeRedirect =
      decodedRedirect &&
      !decodedRedirect.startsWith("/login") &&
      !isPublicOnlyPath(decodedRedirect)
        ? decodedRedirect
        : null;
    const isAdminUser = user?.role === "admin";
    const target = isAdminUser ? "/dashboard" : safeRedirect || "/dashboard";
    navigate(target, { replace: true });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!validateAdmin()) return;

    setLoading(true);
    try {
      const res = await authService.adminLogin({
        email: adminForm.email,
        password: adminForm.password,
      });
      const user = res.data.user;
      login(user);
      redirectAfterAuth(user);
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    const origin = window.location.origin;
    const altOrigin = origin.includes("localhost")
      ? origin.replace("localhost", "127.0.0.1")
      : null;
    alert(
      `Google sign-in blocked. In Google Cloud Console → Credentials → OAuth client, add under Authorized JavaScript origins:\n${origin}${altOrigin ? `\n${altOrigin}` : ""}\n\nAlso ensure VITE_GOOGLE_CLIENT_ID (frontend .env) matches GOOGLE_CLIENT_ID (backend .env).`
    );
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      handleGoogleError();
      return;
    }

    setLoading(true);
    try {
      const res = await authService.googleLogin({
        token: credentialResponse.credential,
        inviteToken,
      });
      const user = res.data.user;
      if (!user?.id) {
        throw new Error("Login response missing user");
      }
      login(user);
      redirectAfterAuth(user);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /*
  // Legacy user email/password login — POST /auth/login → `users` table
  const handleUserPasswordLogin = async (e) => {
    e.preventDefault();
    ...
    const res = await authService.userLogin({ email, password });
  };
  */

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">

      
      {/* <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-600 to-cyan-500 lg:block lg:w-1/2"> */}
  
          <div className="relative hidden lg:flex lg:w-1/2">
  <img
    src={loginbg}
    alt="Login"
    className="absolute inset-0 w-full h-full object-cover"
  />


        <div className="absolute inset-0 bg-gradient-to-br from-violet-700/70 via-indigo-600/55 to-cyan-500/45" />
        <div className="absolute left-1/2 top-[56%] z-20 max-w-md -translate-x-1/2 -translate-y-1/2 px-6 text-center text-white">
          <h1 className="text-2xl font-bold leading-snug drop-shadow-xl xl:text-4xl">
            Learning today <br /> leading tomorrow.
          </h1>
          <p className="mt-4 text-sm opacity-95 drop-shadow-md">
            Small steps today, big success tomorrow.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-5 py-16 sm:px-8 lg:w-1/2 lg:py-20">
        <div className="w-full max-w-md">
          <div className="mb-6 flex rounded-2xl bg-slate-200/80 p-1">
            <button
              type="button"
              onClick={() => setLoginType("user")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                loginType === "user"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Learner
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${
                loginType === "admin"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>

          {!isAdmin ? (
            <UserGoogleSignIn
              onSuccess={handleGoogleSuccess}
              onGoogleError={handleGoogleError}
              loading={loading}
              inviteEmail={inviteEmail}
            />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
              <h2 className="text-center text-2xl font-bold text-slate-900">
                Admin sign in
              </h2>
              <p className="mb-6 mt-2 text-center text-sm text-slate-500">
                Email and password from the admins database
              </p>

              <form key="admin-login-form" onSubmit={handleAdminLogin} autoComplete="on">
                <AdminLoginFormFields
                  email={adminForm.email}
                  password={adminForm.password}
                  showPassword={adminShow}
                  errors={adminErrors}
                  onEmailChange={(v) =>
                    setAdminForm((p) => ({
                      ...p,
                      email: v.toLowerCase(),
                    }))
                  }
                  // onEmailChange={(v) => setAdminForm((p) => ({ ...p, email: v }))}
                  onPasswordChange={(v) =>
                    setAdminForm((p) => ({ ...p, password: v }))
                  }
                  onToggleShow={() => setAdminShow((s) => !s)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 sm:text-base"
                >
                  {loading ? "Signing in…" : "Sign in as admin"}
                </button>
              </form>

              <LiveRegisterLink />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
