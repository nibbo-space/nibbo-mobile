import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { TaskItem } from "../../api/contracts";
import { i18n } from "../../lib/i18n";

const priorityTone: Record<string, { dot: string; chip: string }> = {
  URGENT: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-500" },
  HIGH: { dot: "bg-rose-400", chip: "bg-rose-100 text-rose-500" },
  MEDIUM: { dot: "bg-peach-400", chip: "bg-peach-100 text-peach-500" },
  LOW: { dot: "bg-sage-400", chip: "bg-sage-100 text-sage-500" },
};

type Props = {
  task: TaskItem;
  index?: number;
  interactive?: boolean;
  compact?: boolean;
  onComplete?: () => void;
  onDelete?: () => void;
};

export function TaskCard({
  task,
  index = 0,
  interactive = true,
  compact = false,
  onComplete,
  onDelete,
}: Props) {
  const tone = priorityTone[task.priority] ?? priorityTone.MEDIUM;
  const canActions = interactive && onComplete && onDelete;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ delay: index * 0.03 }}
      drag={canActions ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      onDragEnd={
        canActions
          ? (_, info) => {
              if (info.offset.x < -110) onDelete();
              else if (info.offset.x > 110) onComplete();
            }
          : undefined
      }
      className={`relative flex items-start gap-3 rounded-3xl bg-white p-4 shadow-cozy ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {canActions ? (
        <button
          onClick={onComplete}
          aria-label={i18n.tasks.toggleCompleteAria}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.completed
              ? "border-sage-400 bg-sage-400 text-white"
              : "border-border bg-cream-50 hover:border-rose-300"
          }`}
        >
          {task.completed ? <span className="text-[11px]">✓</span> : null}
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        <Link
          to="/tasks/$taskId"
          params={{ taskId: task.id }}
          className={`block text-sm font-semibold leading-snug text-ink ${
            task.completed ? "line-through" : ""
          }`}
        >
          {task.title}
        </Link>
        <div className={`mt-2 flex flex-wrap items-center gap-1.5 ${compact ? "text-[10px]" : ""}`}>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {task.priority}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-lavender-100 px-2 py-0.5 text-[10px] font-medium text-lavender-500">
            {task.boardName}
          </span>
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-medium text-text/70">
              📅 {formatShortDate(task.dueDate)}
            </span>
          ) : null}
        </div>
      </div>

      {canActions ? (
        <button
          onClick={onDelete}
          aria-label={i18n.tasks.deleteAria}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-50 text-base text-muted transition-colors hover:bg-rose-100 hover:text-rose-500"
        >
          ×
        </button>
      ) : null}
    </motion.article>
  );
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
