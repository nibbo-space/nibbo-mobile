import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import { fetchFamilyMembers, fetchProfile } from "../api/profile";
import { Avatar } from "../components/avatar";
import { Icon } from "../components/icon";
import { Mascot } from "../components/mascot";
import { useSession } from "../hooks/use-session";
import { i18n } from "../lib/i18n";

const HERO_HEIGHT = 380;
const SHEET_OVERLAP = 64;

export function DashboardScreen() {
  const navigate = useNavigate();
  const session = useSession();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
  const familyMembersQuery = useQuery({
    queryKey: ["family-members"],
    queryFn: fetchFamilyMembers,
  });
  const userName =
    session.user?.name?.split(" ")[0] ?? i18n.tasks.defaultUserName;
  const avatarUrl = profileQuery.data?.image ?? session.user?.image ?? null;
  const mascotSeed = session.user?.familyId ?? session.user?.id ?? "nibbo";

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  return (
    <main
      ref={scrollRef}
      className="relative mx-auto h-screen w-full max-w-md overflow-y-auto overflow-x-hidden bg-cream-200"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
        style={{ height: HERO_HEIGHT, y: scrollY }}
      >
        <ScenicBackdrop />
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2"
          style={{ top: 70 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Mascot seed={mascotSeed} size={280} mood="smile" />
          </motion.div>
        </div>
      </motion.div>

      <header className="sticky top-0 z-30 flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="rounded-full bg-gradient-to-br from-rose-200 via-lavender-200 to-sky-200 p-0.5 shadow-[0_8px_18px_rgba(236,72,153,0.22)] transition-transform active:scale-95"
          aria-label="Open profile"
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size={42}
            className="rounded-full ring-2 ring-white/90"
          />
        </button>
        <button
          onClick={() => navigate({ to: "/notifications" })}
          className="rounded-2xl bg-gradient-to-br from-rose-200 via-lavender-200 to-sky-200 p-0.5 shadow-[0_8px_18px_rgba(147,51,234,0.2)] transition-transform active:scale-95"
          aria-label={i18n.tasks.notificationsAria}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/90 text-text/70 shadow-cozy backdrop-blur">
            <Icon name="bell" size={18} />
          </span>
        </button>
      </header>

      <div
        className="relative z-20"
        style={{ marginTop: HERO_HEIGHT - SHEET_OVERLAP - 64 }}
      >
        <section className="relative rounded-t-[36px] bg-white px-5 pb-32 pt-7 shadow-cozy-lg">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" />

          <div className="relative overflow-hidden rounded-[28px] border border-rose-100/70 bg-gradient-to-br from-rose-50 via-cream-50 to-lavender-50 px-4 py-4 shadow-cozy">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-lavender-200/40 blur-md" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h1 className="text-[26px] font-bold tracking-tight text-ink">
                  {i18n.tasks.hello(userName)}
                </h1>
                <p className="mt-1 max-w-[220px] text-[13px] leading-relaxed text-warm-600">
                  {i18n.dashboard.subtitle}
                </p>
              </div>
              <div className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-white text-base shadow-cozy">
                ✨
              </div>
            </div>
          </div>

          <section className="mt-5 rounded-3xl bg-gradient-to-br from-lavender-100 via-white to-rose-50 p-4 shadow-cozy">
            <h2 className="text-sm font-bold tracking-tight text-ink">
              {i18n.dashboard.hubTitle}
            </h2>
            <p className="mt-1 text-xs text-warm-500">
              {i18n.dashboard.hubSubtitle}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <HubAction
                title={i18n.dashboard.openTasks}
                emoji="📋"
                tone="rose"
                onClick={() => navigate({ to: "/tasks" })}
              />
              <HubAction
                title={i18n.dashboard.openShopping}
                emoji="🛒"
                tone="peach"
                onClick={() => navigate({ to: "/shopping" })}
              />
              <HubAction
                title={i18n.notes.title}
                emoji="📓"
                tone="lavender"
                onClick={() => navigate({ to: "/notes" })}
              />
              <HubAction
                title={i18n.calendar.title}
                emoji="📅"
                tone="sky"
                onClick={() => navigate({ to: "/calendar" })}
              />
              <HubAction
                title={i18n.budget.title}
                emoji="💰"
                tone="mint"
                onClick={() => navigate({ to: "/budget" })}
              />
              <HubAction
                title={i18n.dashboard.openNotifications}
                emoji="🔔"
                tone="sky"
                onClick={() => navigate({ to: "/notifications" })}
              />
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-3xl border border-sky-100 bg-white p-4 shadow-cozy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-sky-500">{i18n.dashboard.familyRibbonTitle}</p>
                <p className="mt-1 text-[11px] text-warm-500">
                  {i18n.dashboard.familyRibbonSubtitle}
                </p>
              </div>
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="rounded-xl bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-500"
              >
                {i18n.dashboard.profileLink}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(familyMembersQuery.data ?? []).slice(0, 8).map((member) => (
                <button
                  key={member.id}
                  onClick={() => navigate({ to: "/profile" })}
                  className="flex items-center gap-2 rounded-full bg-cream-50 px-2.5 py-2 shadow-cozy transition-transform active:scale-[0.98]"
                >
                  <Avatar
                    src={member.image ?? null}
                    name={member.name}
                    size={28}
                    className="rounded-full"
                  />
                  <span className="max-w-[108px] truncate text-xs font-medium text-ink">
                    {member.name || i18n.dashboard.memberFallback}
                  </span>
                </button>
              ))}
              {familyMembersQuery.isLoading ? (
                <div className="rounded-full bg-cream-50 px-3 py-2 text-xs text-muted">
                  {i18n.dashboard.loadingMembers}
                </div>
              ) : null}
              {!familyMembersQuery.isLoading &&
              (familyMembersQuery.data ?? []).length === 0 ? (
                <div className="rounded-full bg-cream-50 px-3 py-2 text-xs text-muted">
                  {i18n.dashboard.noMembers}
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ScenicBackdrop() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#d4cbf3_0%,#e7dff7_45%,#f7e1e6_85%,#fde0d2_100%)]" />

      <motion.div
        className="absolute left-8 top-20 h-12 w-20 rounded-full bg-white/70 blur-[2px]"
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-10 top-32 h-10 w-16 rounded-full bg-white/55 blur-[2px]"
        animate={{ x: [0, -4, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-12 h-8 w-14 rounded-full bg-white/45 blur-[1.5px]"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute right-12 top-16 h-12 w-12 rounded-full bg-rose-200/80 blur-[1px]" />

      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 block h-[55%] w-full"
        aria-hidden
      >
        <path
          d="M0,200 L0,110 C40,80 100,80 160,108 C220,134 290,128 400,90 L400,200 Z"
          fill="#fbcfd9"
          opacity="0.85"
        />
        <path
          d="M0,200 L0,140 C50,118 110,120 170,140 C240,164 320,160 400,138 L400,200 Z"
          fill="#fbb6c5"
          opacity="0.9"
        />
        <path
          d="M0,200 L0,170 C60,158 120,160 200,172 C280,184 340,182 400,168 L400,200 Z"
          fill="#f9a8b6"
        />
      </svg>

      <span className="absolute right-7 top-1/3 text-xl">✨</span>
      <span className="absolute left-10 top-44 text-base opacity-70">✨</span>
      <span className="absolute right-1/3 top-24 text-xs opacity-60">✦</span>
    </div>
  );
}

function HubAction({
  title,
  emoji,
  tone,
  onClick,
}: {
  title: string;
  emoji: string;
  tone: "rose" | "peach" | "sky" | "lavender" | "mint";
  onClick: () => void;
}) {
  const toneClass = {
    rose: "bg-rose-100 text-rose-500",
    peach: "bg-peach-100 text-peach-500",
    sky: "bg-sky-100 text-sky-400",
    lavender: "bg-lavender-100 text-lavender-500",
    mint: "bg-emerald-100 text-emerald-600",
  }[tone];
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-left shadow-cozy transition-transform active:scale-[0.98]"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneClass}`}
      >
        {emoji}
      </span>
      <span className="text-xs font-semibold text-ink">{title}</span>
    </button>
  );
}
