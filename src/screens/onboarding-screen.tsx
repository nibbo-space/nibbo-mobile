import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { completeOnboarding, updateProfile } from "../api/onboarding";
import { Button } from "../components/button";
import { Logo } from "../components/logo";
import { Mascot } from "../components/mascot";
import { TextField } from "../components/text-field";
import { useSession } from "../hooks/use-session";
import { i18n } from "../lib/i18n";
import { updateSessionUser } from "../stores/session-store";

export function OnboardingScreen() {
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(session.user?.name ?? "");
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const seed = session.user?.familyId ?? session.user?.id ?? "nibbo-onboarding";

  const finishMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (trimmed) {
        await updateProfile({ name: trimmed });
        await updateSessionUser({ name: trimmed });
      }
      await completeOnboarding();
      await updateSessionUser({
        onboardingCompletedAt: new Date().toISOString(),
      });
    },
    onSuccess: async () => {
      await navigate({ to: "/" });
    },
    onError: () => {
      setError(i18n.onboarding.registrationFailed);
    },
  });

  const handleNext = () => {
    if (step === 0 && !name.trim()) {
      setError(i18n.onboarding.namePlaceholder);
      return;
    }
    setError(null);
    setStep(1);
  };

  return (
    <main className="mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#fcfaf3]">
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#fcfaf3]">
        <section
          className="relative flex-[0_0_auto] overflow-hidden bg-[linear-gradient(180deg,#b8f0d8_0%,#a8e8cc_55%,#9adfc0_100%)] px-6 pb-0 pt-5"
          style={{ height: "42%" }}
        >
          <div className="absolute -left-10 top-14 h-52 w-52 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative flex items-center gap-2">
            <Logo size={30} />
            <span className="text-lg font-semibold tracking-tight text-ink">
              Nibbo
            </span>
            <div className="ml-auto flex gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-emerald-600" : "w-1.5 bg-emerald-600/30"}`}
                />
              ))}
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Mascot
                  seed={`${seed}-step${step}`}
                  size={280}
                  mood={step === 1 ? "happy" : "smile"}
                />
              </motion.div>
            </motion.div>
          </div>

          <svg
            viewBox="0 0 400 72"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 block h-[72px] w-full"
            aria-hidden
          >
            <path
              d="M0,24 C66,0 128,2 188,20 C248,38 318,42 400,18 L400,72 L0,72 Z"
              fill="#fcfaf3"
            />
          </svg>
        </section>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-8 pt-4">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 flex-col"
              >
                <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink">
                  {i18n.onboarding.step1Title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {i18n.onboarding.step1Subtitle}
                </p>

                <div className="mt-6 space-y-3">
                  <label className="block text-xs font-semibold text-ink/70">
                    {i18n.onboarding.nameLabel}
                  </label>
                  <TextField
                    value={name}
                    onChange={setName}
                    placeholder={i18n.onboarding.namePlaceholder}
                    autoFocus
                  />
                </div>

                {error ? (
                  <p className="mt-2 text-sm text-rose-500">{error}</p>
                ) : null}

                <div className="mt-auto pt-6">
                  <Button
                    variant="dark"
                    fullWidth
                    onClick={handleNext}
                    className="h-14 rounded-3xl text-base"
                  >
                    {i18n.onboarding.next}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 flex-col"
              >
                <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink">
                  {i18n.onboarding.step2Title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {i18n.onboarding.step2Subtitle}
                </p>

                <div className="mt-6 space-y-2">
                  <label className="block text-xs font-semibold text-ink/70">
                    {i18n.onboarding.inviteLabel}
                  </label>
                  {inviteEmails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TextField
                        value={email}
                        onChange={(val) => {
                          const next = [...inviteEmails];
                          next[idx] = val;
                          setInviteEmails(next);
                        }}
                        placeholder={i18n.onboarding.invitePlaceholder}
                      />
                      {inviteEmails.length > 1 ? (
                        <button
                          onClick={() =>
                            setInviteEmails(
                              inviteEmails.filter((_, i) => i !== idx),
                            )
                          }
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 text-xl"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {inviteEmails.length < 6 ? (
                    <button
                      onClick={() => setInviteEmails([...inviteEmails, ""])}
                      className="mt-1 text-xs font-semibold text-emerald-600 underline-offset-2 hover:underline"
                    >
                      + {i18n.onboarding.addInvite}
                    </button>
                  ) : null}
                </div>

                {error ? (
                  <p className="mt-2 text-sm text-rose-500">{error}</p>
                ) : null}

                <div className="mt-auto space-y-2 pt-6">
                  <Button
                    variant="dark"
                    fullWidth
                    onClick={() => finishMutation.mutate()}
                    disabled={finishMutation.isPending}
                    className="h-14 rounded-3xl bg-emerald-500 border-emerald-600 text-base shadow-[0_10px_18px_rgba(16,185,129,0.28)] hover:bg-emerald-600"
                  >
                    {finishMutation.isPending
                      ? i18n.onboarding.finishing
                      : i18n.onboarding.finish}
                  </Button>
                  <button
                    onClick={() =>
                      !finishMutation.isPending && finishMutation.mutate()
                    }
                    disabled={finishMutation.isPending}
                    className="w-full py-2 text-center text-sm font-medium text-ink/50 hover:text-ink/80"
                  >
                    {i18n.onboarding.skipInvite}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
