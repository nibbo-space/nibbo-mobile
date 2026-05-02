import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icon";
import { i18n } from "../lib/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NotificationsSheet({ open, onClose }: Props) {
  const placeholders = [
    {
      emoji: "🌱",
      title: i18n.notifications.sheetWelcomeTitle,
      body: i18n.notifications.sheetWelcomeBody,
      when: i18n.notifications.sheetJustNow,
    },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-[36px] bg-white p-6 shadow-cozy-lg"
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">{i18n.notifications.title}</h2>
                <p className="mt-0.5 text-xs text-muted">{i18n.notifications.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-50 text-text/70"
                aria-label={i18n.notifications.closeAria}
              >
                <Icon name="back" size={16} className="rotate-90" />
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {placeholders.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-3xl bg-cream-50 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-cozy">
                    <span className="text-base">{item.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                      <span className="shrink-0 text-[10px] font-medium text-muted">
                        {item.when}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-text/70">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
