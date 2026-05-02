import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "../api/auth";
import type { MobileUser } from "../api/contracts";
import { Button } from "../components/button";
import { Logo } from "../components/logo";
import { Mascot } from "../components/mascot";
import { i18n, localizeApiError } from "../lib/i18n";
import { setSession } from "../stores/session-store";

const previewSeed = `nibbo-preview-${crypto.randomUUID()}`;

type AuthTab = "google" | "email";
type EmailMode = "login" | "register";

export function LoginScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTab>("google");
  const [emailMode, setEmailMode] = useState<EmailMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signInDev = async () => {
    const mockUser: MobileUser = {
      id: "dev-user",
      email: "dev@nibbo.local",
      name: "Dev",
      image: null,
      familyId: "dev-family",
      onboardingCompletedAt: null,
    };
    await setSession(mockUser, "dev-access-token", "dev-refresh-token");
    await navigate({ to: "/" });
  };

  const onSuccess = async (data: {
    user: MobileUser | null;
    accessToken: string;
    refreshToken: string;
  }) => {
    if (!data.user) throw new Error("User not found");
    await setSession(data.user, data.accessToken, data.refreshToken);
    await navigate({ to: "/" });
  };

  const googleMutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess,
  });

  const emailLoginMutation = useMutation({
    mutationFn: () => signInWithEmail(email.trim(), password),
    onSuccess,
  });

  const emailRegisterMutation = useMutation({
    mutationFn: () =>
      registerWithEmail(email.trim(), password, name.trim() || undefined),
    onSuccess,
  });

  const activeEmailMutation =
    emailMode === "login" ? emailLoginMutation : emailRegisterMutation;
  const anyError = googleMutation.error ?? activeEmailMutation.error;

  return (
    <main className="mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#fcfaf3]">
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#fcfaf3]">
        <section className="relative flex flex-col flex-1 overflow-hidden bg-[linear-gradient(180deg,#c8bdf5_0%,#c3b8f2_55%,#beb4ee_100%)] px-6 pb-0 pt-5">
          <div className="absolute -left-10 top-14 h-52 w-52 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute left-1/2 top-[46%] h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-[50%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-100/20 blur-3xl" />
          <motion.svg
            viewBox="0 0 400 520"
            className="absolute inset-0 h-full w-full opacity-50"
            aria-hidden
            animate={{ y: [0, 1.2, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          >
            <g fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
              <path d="M28,62 C72,16 128,30 156,74 C184,116 146,162 92,166 C44,170 4,124 28,62 Z" />
              <path d="M208,44 C246,10 306,22 338,64 C366,102 352,150 304,168 C252,188 190,164 176,112 C168,82 184,62 208,44 Z" />
              <path d="M54,220 C98,184 158,192 188,236 C214,274 194,330 140,346 C84,362 30,330 18,282 C10,250 24,236 54,220 Z" />
              <path d="M248,220 C286,192 346,198 376,238 C402,272 394,322 348,346 C300,370 246,356 226,318 C208,286 214,248 248,220 Z" />
            </g>
            <g fill="none" stroke="rgba(245,220,255,0.34)" strokeWidth="1">
              <path d="M42,72 C74,36 124,44 146,78 C168,108 146,146 104,154 C68,162 34,138 30,102 C28,88 34,80 42,72 Z" />
              <path d="M220,56 C252,28 300,34 326,68 C350,98 342,134 306,152 C268,170 220,154 206,126 C194,102 198,78 220,56 Z" />
              <path d="M70,232 C104,206 148,212 170,244 C190,272 176,312 136,326 C94,340 54,322 42,292 C32,266 42,248 70,232 Z" />
            </g>
          </motion.svg>
          <motion.div
            className="absolute left-10 top-28 h-14 w-14 rounded-full bg-white/30 blur-[1px]"
            animate={{ y: [0, -1.6, 0] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-16 top-40 h-10 w-10 rounded-full bg-rose-100/65"
            animate={{ y: [0, 1.6, 0] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-center gap-2">
            <Logo size={30} />
            <span className="text-lg font-semibold tracking-tight text-ink">
              Nibbo
            </span>
            <span className="ml-auto rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-ink/70 backdrop-blur">
              {i18n.login.familyPlanner}
            </span>
          </div>

          <div className="relative flex-1">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-12">
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <motion.div
                  animate={{ y: [0, -1.2, 0] }}
                  transition={{
                    duration: 17,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Mascot seed={previewSeed} size={600} mood="happy" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          <svg
            viewBox="0 0 400 72"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 block h-[72px] w-full"
            aria-hidden
          >
            <defs>
              <filter
                id="curve-shadow"
                x="-10%"
                y="-40%"
                width="120%"
                height="220%"
              >
                <feGaussianBlur stdDeviation="2.8" />
              </filter>
              <filter
                id="curve-highlight"
                x="-10%"
                y="-40%"
                width="120%"
                height="220%"
              >
                <feGaussianBlur stdDeviation="1.2" />
              </filter>
            </defs>
            <path
              d="M0,24 C66,0 128,2 188,20 C248,38 318,42 400,18"
              fill="none"
              stroke="rgba(112, 89, 176, 0.36)"
              strokeWidth="14"
              strokeLinecap="round"
              transform="translate(0,4)"
              filter="url(#curve-shadow)"
            />
            <path
              d="M0,24 C66,0 128,2 188,20 C248,38 318,42 400,18"
              fill="none"
              stroke="rgba(155, 132, 222, 0.78)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M0,24 C66,0 128,2 188,20 C248,38 318,42 400,18"
              fill="none"
              stroke="rgba(255, 255, 255, 0.78)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              transform="translate(0,-1)"
              filter="url(#curve-highlight)"
            />
            <path
              d="M0,24 C66,0 128,2 188,20 C248,38 318,42 400,18 L400,72 L0,72 Z"
              fill="#fcfaf3"
            />
          </svg>
        </section>

        <section className="relative -mt-2 flex-none overflow-hidden bg-[#fcfaf3] px-7 pb-8 pt-1">
          <svg
            viewBox="0 0 400 220"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
            aria-hidden
          >
            <g fill="none" stroke="rgba(174, 161, 217, 0.3)" strokeWidth="1.2">
              <path d="M-24,36 C24,16 78,18 112,42 C142,62 186,66 224,48 C258,32 304,28 344,46 C370,58 392,56 424,42" />
              <path d="M-30,76 C18,58 70,60 104,82 C136,102 180,106 220,90 C254,76 298,72 338,88 C366,100 392,98 430,84" />
              <path d="M-20,116 C26,98 74,100 108,122 C140,142 186,146 228,130 C264,114 308,110 348,126 C376,138 400,136 430,122" />
              <path d="M-24,156 C22,140 72,142 108,164 C142,184 188,188 230,172 C266,158 312,154 352,170 C380,182 404,180 434,166" />
              <path d="M-26,196 C18,182 68,184 104,204 C130,218 168,222 204,214 C240,206 286,202 324,214 C356,224 390,224 426,212" />
            </g>
            <g fill="none" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.7">
              <path d="M12,26 C52,12 92,16 124,34 C156,50 198,52 234,38 C270,24 314,22 352,38" />
              <path d="M6,104 C48,88 92,90 126,110 C160,130 204,132 242,116 C278,102 322,100 360,116" />
              <path d="M20,178 C58,166 98,168 132,186 C164,202 204,204 238,190 C274,176 316,174 352,188" />
            </g>
          </svg>
          <div className="relative z-10">
            <h1
              className="text-[38px] font-bold leading-[0.95] tracking-tight text-ink"
              style={{ fontFamily: "Nunito, Nunito Fallback" }}
            >
              {i18n.login.title}
            </h1>

            {/* Tab switcher */}
            <div className="mt-4 flex gap-1 rounded-2xl bg-cream-100 p-1">
              <button
                type="button"
                onClick={() => setTab("google")}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                  tab === "google"
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted"
                }`}
              >
                {i18n.login.tabGoogle}
              </button>
              <button
                type="button"
                onClick={() => setTab("email")}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                  tab === "email" ? "bg-white text-ink shadow-sm" : "text-muted"
                }`}
              >
                {i18n.login.tabEmail}
              </button>
            </div>

            {tab === "google" ? (
              <div className="mt-4">
                <p className="mb-4 text-sm leading-relaxed text-muted">
                  {i18n.login.subtitle}
                </p>
                <Button
                  variant="dark"
                  fullWidth
                  onClick={() => googleMutation.mutate()}
                  disabled={googleMutation.isPending}
                  className="h-14 rounded-3xl border border-rose-700 bg-rose-600 text-base text-white shadow-[0_10px_18px_rgba(225,29,72,0.28)] hover:bg-rose-700"
                >
                  {googleMutation.isPending
                    ? i18n.login.signingIn
                    : i18n.login.continueWithGoogle}
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {emailMode === "register" ? (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">
                      {i18n.login.nameLabel}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={i18n.login.namePlaceholder}
                      autoComplete="name"
                      className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                ) : null}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">
                    {i18n.login.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={i18n.login.emailPlaceholder}
                    autoComplete="email"
                    inputMode="email"
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">
                    {i18n.login.passwordLabel}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={i18n.login.passwordPlaceholder}
                    autoComplete={
                      emailMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>
                <Button
                  variant="dark"
                  fullWidth
                  onClick={() =>
                    emailMode === "login"
                      ? emailLoginMutation.mutate()
                      : emailRegisterMutation.mutate()
                  }
                  disabled={
                    activeEmailMutation.isPending ||
                    !email.trim() ||
                    password.length < 8
                  }
                  className="h-14 rounded-3xl border border-rose-700 bg-rose-600 text-base text-white shadow-[0_10px_18px_rgba(225,29,72,0.28)] hover:bg-rose-700"
                >
                  {activeEmailMutation.isPending
                    ? emailMode === "login"
                      ? i18n.login.signingIn
                      : i18n.login.registering
                    : emailMode === "login"
                      ? i18n.login.signIn
                      : i18n.login.register}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === "login" ? "register" : "login");
                    emailLoginMutation.reset();
                    emailRegisterMutation.reset();
                  }}
                  className="w-full text-center text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  {emailMode === "login"
                    ? i18n.login.switchToRegister
                    : i18n.login.switchToLogin}
                </button>
              </div>
            )}

            {import.meta.env.DEV ? (
              <button
                onClick={signInDev}
                className="mt-3 w-full text-center text-xs font-medium text-ink/55 underline-offset-2 hover:text-ink/80 hover:underline"
              >
                {i18n.login.devSkipLogin}
              </button>
            ) : null}

            {anyError ? (
              <p className="mt-3 text-center text-sm text-rose-500">
                {localizeApiError((anyError as Error).message)}
              </p>
            ) : null}

            <p className="mt-4 text-center text-xs text-muted">
              {i18n.login.terms}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
