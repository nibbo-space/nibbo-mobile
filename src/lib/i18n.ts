export type AppLanguage = "uk" | "en" | "ja";
const appLanguageStorageKey = "nibbo.app.language";
const supportedLanguages: AppLanguage[] = ["uk", "en", "ja"];

function normalizeAppLanguage(value: string | null | undefined): AppLanguage | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return supportedLanguages.includes(normalized as AppLanguage)
    ? (normalized as AppLanguage)
    : null;
}

function getStoredAppLanguage(): AppLanguage | null {
  if (typeof window === "undefined") return null;
  return normalizeAppLanguage(window.localStorage.getItem(appLanguageStorageKey));
}

function detectAppLanguage(): AppLanguage {
  const candidates = [
    ...(typeof navigator !== "undefined" ? navigator.languages ?? [] : []),
    typeof navigator !== "undefined" ? navigator.language : "",
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  for (const code of candidates) {
    if (code.startsWith("uk")) return "uk";
    if (code.startsWith("en")) return "en";
    if (code.startsWith("ja")) return "ja";
  }

  return "en";
}

let currentLanguage: AppLanguage = getStoredAppLanguage() ?? detectAppLanguage();
export const appLanguage: AppLanguage = currentLanguage;
export function getAppLanguage(): AppLanguage {
  return currentLanguage;
}
export function setAppLanguage(language: AppLanguage): void {
  currentLanguage = language;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(appLanguageStorageKey, language);
  }
}

type Dictionary = {
  errors: {
    userNotFound: string;
    firebaseTokenMissing: string;
    googleAuthFailed: string;
    failedLoadTasks: string;
    failedCreateTask: string;
    failedUpdateTask: string;
    failedDeleteTask: string;
    fallback: string;
  };
  login: {
    familyPlanner: string;
    title: string;
    subtitle: string;
    continueWithGoogle: string;
    signingIn: string;
    terms: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    hubTitle: string;
    hubSubtitle: string;
    pulseTitle: string;
    pulseSubtitle: string;
    activeNow: string;
    completedToday: string;
    overdueNow: string;
    familyActions: string;
    openShopping: string;
    openProfile: string;
    openNotifications: string;
    quickActions: string;
    openTasks: string;
    createTask: string;
    focusTitle: string;
    viewAll: string;
    todayTasks: string;
    overdueTasks: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  tasks: {
    scopeAll: string;
    scopeMine: string;
    scopeToday: string;
    scopeOverdue: string;
    defaultUserName: string;
    hello: (name: string) => string;
    notificationsAria: string;
    scheduleTitle: string;
    tasksCount: (count: number) => string;
    loadErrorTitle: string;
    loadErrorSubtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    newTask: string;
    newTaskSheetTitle: string;
    newTaskSheetSubtitle: string;
    newTaskPlaceholder: string;
    cancel: string;
    create: string;
    creating: string;
    today: string;
    syncing: string;
    updated: string;
    dayProgress: string;
    done: string;
    toggleCompleteAria: string;
    deleteAria: string;
    managerTitle: string;
    managerSubtitle: string;
  };
  taskDetails: {
    backAria: string;
    taskLabel: string;
    moreAria: string;
    notFoundTitle: string;
    notFoundSubtitle: string;
    completed: string;
    noDescription: string;
    deadline: string;
    notSet: string;
    board: string;
    column: string;
  };
};

const uk: Dictionary = {
  errors: {
    userNotFound: "Користувача не знайдено",
    firebaseTokenMissing: "Відсутній токен Firebase",
    googleAuthFailed: "Помилка входу через Google",
    failedLoadTasks: "Не вдалося завантажити задачі",
    failedCreateTask: "Не вдалося створити задачу",
    failedUpdateTask: "Не вдалося оновити задачу",
    failedDeleteTask: "Не вдалося видалити задачу",
    fallback: "Сталася помилка",
  },
  login: {
    familyPlanner: "Family planner",
    title: "Вхід",
    subtitle: "Плануйте задачі, календар і покупки разом із Nibbo.",
    continueWithGoogle: "Продовжити з Google",
    signingIn: "Входимо…",
    terms: "Натискаючи, ви погоджуєтесь з умовами користування",
  },
  dashboard: {
    title: "Головна",
    subtitle: "Тут живе ваш затишний план дня",
    hubTitle: "Сімейний хаб",
    hubSubtitle: "Керуйте справами, покупками та комунікацією з одного місця",
    pulseTitle: "Пульс дня",
    pulseSubtitle: "Швидкий стан родинних задач",
    activeNow: "Активні",
    completedToday: "Виконано",
    overdueNow: "Прострочені",
    familyActions: "Сімейні дії",
    openShopping: "Покупки",
    openProfile: "Профіль",
    openNotifications: "Сповіщення",
    quickActions: "Швидкі дії",
    openTasks: "Відкрити задачі",
    createTask: "Нова задача",
    focusTitle: "Фокус на зараз",
    viewAll: "Дивитися всі",
    todayTasks: "На сьогодні",
    overdueTasks: "Прострочені",
    emptyTitle: "Все під контролем",
    emptySubtitle: "Немає термінових задач. Можна трохи видихнути.",
  },
  tasks: {
    scopeAll: "Усі",
    scopeMine: "Мої",
    scopeToday: "Сьогодні",
    scopeOverdue: "Прострочені",
    defaultUserName: "друже",
    hello: (name) => `Привіт, ${name}`,
    notificationsAria: "Сповіщення",
    scheduleTitle: "Розклад на сьогодні",
    tasksCount: (count) => `${count} задач`,
    loadErrorTitle: "Щось пішло не так",
    loadErrorSubtitle: "Не вдалося завантажити задачі",
    emptyTitle: "Все спокійно",
    emptySubtitle: "Поки що жодної задачі — додайте першу",
    newTask: "Нова задача",
    newTaskSheetTitle: "Нова задача",
    newTaskSheetSubtitle: "Що потрібно зробити?",
    newTaskPlaceholder: "Наприклад: купити молоко",
    cancel: "Відмінити",
    create: "Додати",
    creating: "Створюємо…",
    today: "Сьогодні",
    syncing: "синхронізація…",
    updated: "оновлено",
    dayProgress: "Прогрес дня",
    done: "Виконано",
    toggleCompleteAria: "Перемкнути виконання",
    deleteAria: "Видалити",
    managerTitle: "Задачі",
    managerSubtitle: "Керуйте своїми задачами в одному місці",
  },
  taskDetails: {
    backAria: "Назад",
    taskLabel: "Задача",
    moreAria: "Більше",
    notFoundTitle: "Задача не знайдена",
    notFoundSubtitle: "Можливо, її було видалено або завершено",
    completed: "Завершено",
    noDescription: "Опис відсутній",
    deadline: "Дедлайн",
    notSet: "Не встановлено",
    board: "Дошка",
    column: "Колонка",
  },
};

const en: Dictionary = {
  errors: {
    userNotFound: "User not found",
    firebaseTokenMissing: "Firebase ID token is missing",
    googleAuthFailed: "Google sign-in failed",
    failedLoadTasks: "Failed to load tasks",
    failedCreateTask: "Failed to create task",
    failedUpdateTask: "Failed to update task",
    failedDeleteTask: "Failed to delete task",
    fallback: "Something went wrong",
  },
  login: {
    familyPlanner: "Family planner",
    title: "Login",
    subtitle: "Plan tasks, calendar events, and shopping with Nibbo.",
    continueWithGoogle: "Continue with Google",
    signingIn: "Signing in…",
    terms: "By tapping continue, you agree to the terms of use",
  },
  dashboard: {
    title: "Home",
    subtitle: "Your cozy place for today's flow",
    hubTitle: "Family hub",
    hubSubtitle: "Manage tasks, shopping, and communication in one place",
    pulseTitle: "Day pulse",
    pulseSubtitle: "Quick view of your family tasks",
    activeNow: "Active",
    completedToday: "Done",
    overdueNow: "Overdue",
    familyActions: "Family actions",
    openShopping: "Shopping",
    openProfile: "Profile",
    openNotifications: "Notifications",
    quickActions: "Quick actions",
    openTasks: "Open tasks",
    createTask: "New task",
    focusTitle: "Focus now",
    viewAll: "View all",
    todayTasks: "Today",
    overdueTasks: "Overdue",
    emptyTitle: "Everything is under control",
    emptySubtitle: "No urgent tasks right now. You can breathe.",
  },
  tasks: {
    scopeAll: "All",
    scopeMine: "Mine",
    scopeToday: "Today",
    scopeOverdue: "Overdue",
    defaultUserName: "friend",
    hello: (name) => `Hello, ${name}`,
    notificationsAria: "Notifications",
    scheduleTitle: "Schedule for today",
    tasksCount: (count) => `${count} tasks`,
    loadErrorTitle: "Something went wrong",
    loadErrorSubtitle: "Failed to load tasks",
    emptyTitle: "All calm",
    emptySubtitle: "No tasks yet — add your first one",
    newTask: "New task",
    newTaskSheetTitle: "New task",
    newTaskSheetSubtitle: "What needs to be done?",
    newTaskPlaceholder: "For example: buy milk",
    cancel: "Cancel",
    create: "Add",
    creating: "Creating…",
    today: "Today",
    syncing: "syncing…",
    updated: "updated",
    dayProgress: "Day progress",
    done: "Done",
    toggleCompleteAria: "Toggle complete",
    deleteAria: "Delete",
    managerTitle: "Tasks",
    managerSubtitle: "Manage your tasks in one place",
  },
  taskDetails: {
    backAria: "Back",
    taskLabel: "Task",
    moreAria: "More",
    notFoundTitle: "Task not found",
    notFoundSubtitle: "It may have been deleted or completed",
    completed: "Completed",
    noDescription: "No description",
    deadline: "Deadline",
    notSet: "Not set",
    board: "Board",
    column: "Column",
  },
};

const ja: Dictionary = {
  errors: {
    userNotFound: "ユーザーが見つかりません",
    firebaseTokenMissing: "Firebase IDトークンがありません",
    googleAuthFailed: "Googleログインに失敗しました",
    failedLoadTasks: "タスクの読み込みに失敗しました",
    failedCreateTask: "タスクの作成に失敗しました",
    failedUpdateTask: "タスクの更新に失敗しました",
    failedDeleteTask: "タスクの削除に失敗しました",
    fallback: "エラーが発生しました",
  },
  login: {
    familyPlanner: "Family planner",
    title: "ログイン",
    subtitle: "Nibboでタスク、カレンダー、買い物をまとめて管理。",
    continueWithGoogle: "Googleで続行",
    signingIn: "ログイン中…",
    terms: "続行をタップすると利用規約に同意したことになります",
  },
  dashboard: {
    title: "ホーム",
    subtitle: "今日をやさしく整える、ほっとする場所",
    hubTitle: "ファミリーハブ",
    hubSubtitle: "タスク、買い物、連絡をひとつの場所で管理",
    pulseTitle: "今日のパルス",
    pulseSubtitle: "家族タスクのクイックステータス",
    activeNow: "進行中",
    completedToday: "完了",
    overdueNow: "期限切れ",
    familyActions: "ファミリーアクション",
    openShopping: "買い物",
    openProfile: "プロフィール",
    openNotifications: "通知",
    quickActions: "クイック操作",
    openTasks: "タスクを開く",
    createTask: "新しいタスク",
    focusTitle: "今のフォーカス",
    viewAll: "すべて見る",
    todayTasks: "今日",
    overdueTasks: "期限切れ",
    emptyTitle: "すべて順調です",
    emptySubtitle: "今すぐ必要なタスクはありません。ひと息つけます。",
  },
  tasks: {
    scopeAll: "すべて",
    scopeMine: "自分",
    scopeToday: "今日",
    scopeOverdue: "期限切れ",
    defaultUserName: "ともだち",
    hello: (name) => `こんにちは、${name}`,
    notificationsAria: "通知",
    scheduleTitle: "今日の予定",
    tasksCount: (count) => `${count}件のタスク`,
    loadErrorTitle: "問題が発生しました",
    loadErrorSubtitle: "タスクを読み込めませんでした",
    emptyTitle: "今日は落ち着いています",
    emptySubtitle: "まだタスクはありません。最初のタスクを追加しましょう",
    newTask: "新しいタスク",
    newTaskSheetTitle: "新しいタスク",
    newTaskSheetSubtitle: "何をしますか？",
    newTaskPlaceholder: "例：牛乳を買う",
    cancel: "キャンセル",
    create: "追加",
    creating: "作成中…",
    today: "今日",
    syncing: "同期中…",
    updated: "更新済み",
    dayProgress: "今日の進捗",
    done: "完了",
    toggleCompleteAria: "完了を切り替え",
    deleteAria: "削除",
    managerTitle: "タスク",
    managerSubtitle: "タスクをまとめて管理",
  },
  taskDetails: {
    backAria: "戻る",
    taskLabel: "タスク",
    moreAria: "その他",
    notFoundTitle: "タスクが見つかりません",
    notFoundSubtitle: "削除されたか、完了済みの可能性があります",
    completed: "完了",
    noDescription: "説明なし",
    deadline: "締切",
    notSet: "未設定",
    board: "ボード",
    column: "カラム",
  },
};

export const i18n: Dictionary = { uk, en, ja }[currentLanguage];

const apiErrorMap: Record<string, keyof Dictionary["errors"]> = {
  "User not found": "userNotFound",
  "Firebase id token is missing": "firebaseTokenMissing",
  "Google auth failed": "googleAuthFailed",
  "Failed to load tasks": "failedLoadTasks",
  "Failed to create task": "failedCreateTask",
  "Failed to update task": "failedUpdateTask",
  "Failed to delete task": "failedDeleteTask",
};

export function localizeApiError(message: string): string {
  const key = apiErrorMap[message];
  if (!key) return message || i18n.errors.fallback;
  return i18n.errors[key];
}
