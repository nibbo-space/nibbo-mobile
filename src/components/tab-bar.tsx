import { Link, useRouterState } from "@tanstack/react-router";
import { Icon } from "./icon";

type TabName = "home" | "list" | "cart" | "user";

type Tab = {
  to: string;
  icon: TabName;
  label: string;
};

const tabs: Tab[] = [
  { to: "/", icon: "home", label: "Головна" },
  { to: "/tasks", icon: "list", label: "Задачі" },
  { to: "/shopping", icon: "cart", label: "Покупки" },
  { to: "/profile", icon: "user", label: "Профіль" },
];

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto relative flex w-full max-w-md items-center justify-around gap-1 rounded-[28px] border border-cream-200 bg-white px-2 py-2 shadow-[0_-6px_24px_rgba(120,70,40,0.08),0_6px_24px_rgba(120,70,40,0.12)]">
        <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent" />
        {tabs.map((tab) => {
          const active =
            tab.to === "/"
              ? pathname === "/"
              : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                active
                  ? "bg-rose-100 text-rose-500 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.28)]"
                  : "text-text/55 hover:bg-cream-50 hover:text-text/80"
              }`}
            >
              <Icon name={tab.icon} size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
