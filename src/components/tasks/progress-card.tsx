import { motion } from "framer-motion";
import { Logo } from "../logo";
import { Mascot } from "../mascot";
import { i18n } from "../../lib/i18n";

type Props = {
  progress: number;
  doneCount: number;
  totalCount: number;
  isSyncing: boolean;
  seed: string;
  className?: string;
};

export function ProgressCard({
  progress,
  doneCount,
  totalCount,
  isSyncing,
  seed,
  className = "mt-5",
}: Props) {
  const mood =
    totalCount === 0
      ? "sleepy"
      : progress >= 100
        ? "happy"
        : progress >= 50
          ? "smile"
          : "neutral";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-4xl bg-cream-100 px-5 pb-6 pt-5 shadow-cozy ${className}`}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-peach-200/60 blur-2xl" />
      <div className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-rose-200/50 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-text/70">
          <Logo size={12} />
          {i18n.tasks.today}
        </span>
        <span className="text-[11px] font-medium text-muted">
          {isSyncing ? i18n.tasks.syncing : i18n.tasks.updated}
        </span>
      </div>

      <div className="relative my-1 flex justify-center">
        <Mascot seed={seed} size={220} mood={mood} />
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {i18n.tasks.dayProgress}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-ink">
            {progress}
            <span className="text-xl text-muted">%</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {i18n.tasks.done}
          </p>
          <p className="mt-1 text-base font-semibold text-ink">
            {doneCount}
            <span className="text-muted"> / {totalCount}</span>
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-400"
        />
      </div>
    </motion.section>
  );
}
