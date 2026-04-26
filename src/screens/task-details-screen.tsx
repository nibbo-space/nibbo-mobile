import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fetchTasks } from "../api/tasks";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { i18n } from "../lib/i18n";

const priorityTone: Record<string, string> = {
  URGENT: "bg-rose-100 text-rose-500",
  HIGH: "bg-rose-100 text-rose-500",
  MEDIUM: "bg-peach-100 text-peach-500",
  LOW: "bg-sage-100 text-sage-500",
};

export function TaskDetailsScreen() {
  const { taskId } = useParams({ strict: false });
  const navigate = useNavigate();
  const tasksQuery = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => fetchTasks("all"),
  });

  const task = tasksQuery.data?.find((item) => item.id === taskId);

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/tasks" })}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-text/70 shadow-cozy"
          aria-label={i18n.taskDetails.backAria}
        >
          <Icon name="back" size={18} />
        </button>
        <span className="text-xs font-medium text-muted">{i18n.taskDetails.taskLabel}</span>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-text/70 shadow-cozy"
          aria-label={i18n.taskDetails.moreAria}
        >
          <Icon name="dots" size={18} />
        </button>
      </header>

      {!task ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="text-5xl">🍃</span>
          <h2 className="mt-4 text-base font-semibold text-ink">
            {i18n.taskDetails.notFoundTitle}
          </h2>
          <p className="mt-1 text-xs text-muted">{i18n.taskDetails.notFoundSubtitle}</p>
        </div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <div className="relative overflow-hidden rounded-4xl bg-lavender-100 p-6 shadow-cozy">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lavender-200/70 blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    priorityTone[task.priority] ?? priorityTone.MEDIUM
                  }`}
                >
                  {task.priority}
                </span>
                {task.completed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sage-500">
                    ✓ {i18n.taskDetails.completed}
                  </span>
                ) : null}
              </div>
              <h1
                className={`mt-3 text-2xl font-bold leading-tight tracking-tight text-ink ${
                  task.completed ? "line-through opacity-70" : ""
                }`}
              >
                {task.title}
              </h1>
              {task.description ? (
                <p className="mt-2 text-sm leading-relaxed text-text/75">{task.description}</p>
              ) : (
                <p className="mt-2 text-sm italic text-text/50">{i18n.taskDetails.noDescription}</p>
              )}
            </div>
          </div>

          <section className="mt-5 space-y-3">
            <DetailRow
              icon="📅"
              label={i18n.taskDetails.deadline}
              value={task.dueDate ? formatDate(task.dueDate) : i18n.taskDetails.notSet}
              tone="peach"
            />
            <DetailRow icon="📋" label={i18n.taskDetails.board} value={task.boardName} tone="sky" />
            <DetailRow icon="📍" label={i18n.taskDetails.column} value={task.columnName} tone="cream" />
          </section>
        </motion.article>
      )}
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: "peach" | "sky" | "cream";
}) {
  const toneCls =
    tone === "peach" ? "bg-peach-100" : tone === "sky" ? "bg-sky-100" : "bg-cream-100";
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-cozy">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneCls}`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long" });
  } catch {
    return iso;
  }
}
