export type AppLanguage = "uk" | "en" | "ja";
const appLanguageStorageKey = "nibbo.app.language";
const supportedLanguages: AppLanguage[] = ["uk", "en", "ja"];

function normalizeAppLanguage(
  value: string | null | undefined,
): AppLanguage | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return supportedLanguages.includes(normalized as AppLanguage)
    ? (normalized as AppLanguage)
    : null;
}

function getStoredAppLanguage(): AppLanguage | null {
  if (typeof window === "undefined") return null;
  return normalizeAppLanguage(
    window.localStorage.getItem(appLanguageStorageKey),
  );
}

let currentLanguage: AppLanguage = getStoredAppLanguage() ?? "en";
export function getAppLanguage(): AppLanguage {
  return currentLanguage;
}

export function getCalendarLocale(): string {
  switch (currentLanguage) {
    case "uk":
      return "uk-UA";
    case "ja":
      return "ja-JP";
    default:
      return "en-GB";
  }
}
export function setAppLanguage(language: AppLanguage): void {
  currentLanguage = language;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(appLanguageStorageKey, language);
  }
}

type Dictionary = {
  common: {
    loading: string;
    cancel: string;
    create: string;
  };
  tabs: {
    home: string;
    tasks: string;
    shopping: string;
    notes: string;
    profile: string;
  };
  errors: {
    userNotFound: string;
    firebaseTokenMissing: string;
    googleAuthFailed: string;
    failedLoadTasks: string;
    failedCreateTask: string;
    failedUpdateTask: string;
    failedDeleteTask: string;
    fallback: string;
    invalidCredentials: string;
    emailTaken: string;
    passwordTooShort: string;
  };
  login: {
    familyPlanner: string;
    title: string;
    subtitle: string;
    continueWithGoogle: string;
    signingIn: string;
    terms: string;
    tabGoogle: string;
    tabEmail: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    signIn: string;
    register: string;
    registering: string;
    switchToRegister: string;
    switchToLogin: string;
    orDivider: string;
    devSkipLogin: string;
  };
  onboarding: {
    step1Title: string;
    step1Subtitle: string;
    namePlaceholder: string;
    nameLabel: string;
    next: string;
    step2Title: string;
    step2Subtitle: string;
    inviteLabel: string;
    invitePlaceholder: string;
    addInvite: string;
    skipInvite: string;
    finish: string;
    finishing: string;
    welcomeBack: string;
    registrationFailed: string;
  };
  notes: {
    title: string;
    subtitle: string;
    newNote: string;
    emptyTitle: string;
    emptySubtitle: string;
    noteTitlePlaceholder: string;
    noteContentPlaceholder: string;
    save: string;
    saving: string;
    delete: string;
    pinned: string;
    pin: string;
    unpin: string;
    cancel: string;
    edit: string;
    uncategorized: string;
    filterAll: string;
    showAll: string;
    emptyInCategory: string;
    categorySection: string;
    newCategoryTitle: string;
    categoryNamePlaceholder: string;
    addCategory: string;
    deleteNoteTitle: string;
    deleteNoteSubtitle: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    newEvent: string;
    emptyTitle: string;
    emptySubtitle: string;
    today: string;
    allDay: string;
    noEvents: string;
    eventTitlePlaceholder: string;
    save: string;
    saving: string;
    delete: string;
    cancel: string;
    location: string;
    monthNames: string[];
    dayNamesShort: string[];
    startLabel: string;
    endLabel: string;
    deleteEventTitle: string;
  };
  budget: {
    title: string;
    subtitle: string;
    newExpense: string;
    emptyTitle: string;
    emptySubtitle: string;
    totalSpent: string;
    addExpense: string;
    expenseTitlePlaceholder: string;
    amount: string;
    amountPlaceholder: string;
    category: string;
    noCategory: string;
    save: string;
    saving: string;
    delete: string;
    cancel: string;
    thisMonth: string;
    byCategory: string;
    newCategoryShort: string;
    notePlaceholder: string;
    newCategorySheetTitle: string;
    deleteExpenseTitle: string;
  };
  shopping: {
    title: string;
    subtitle: string;
    newListAria: string;
    listsLabel: string;
    toBuyLabel: string;
    loadError: string;
    emptyTitle: string;
    emptySubtitle: string;
    pendingLine: (n: number) => string;
    itemsLine: (n: number) => string;
    emptyList: string;
    emptyListHint: string;
    toggleBoughtAria: (bought: boolean) => string;
    bought: string;
    unbought: string;
    addItemPlaceholder: string;
    addAria: string;
    totalItems: (n: number) => string;
    newListTitle: string;
    listNamePlaceholder: string;
    createList: string;
    creatingList: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    closeAria: string;
    backAria: string;
    markRead: string;
    loadError: string;
    empty: string;
    sheetWelcomeTitle: string;
    sheetWelcomeBody: string;
    sheetJustNow: string;
    pushDefaultTitle: string;
    pushDefaultBody: string;
  };
  profile: {
    title: string;
    subtitle: string;
    profileLoadError: string;
    defaultName: string;
    familyXp: string;
    achievementsNone: string;
    achievementsCount: (n: number) => string;
    unknownMember: string;
    familySection: string;
    familyActive: string;
    familyInactive: string;
    languageSection: string;
    notificationsSection: string;
    notificationsNew: (n: number) => string;
    notificationsConnected: string;
    notificationsNeedLogin: string;
    enablePush: string;
    pushGranted: string;
    pushDenied: string;
    pushPrompt: string;
    pushUnavailable: string;
    logOut: string;
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
    familyRibbonTitle: string;
    familyRibbonSubtitle: string;
    profileLink: string;
    loadingMembers: string;
    noMembers: string;
    memberFallback: string;
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
    allBoards: string;
    manageBoardsAria: string;
    descriptionPlaceholder: string;
    boardLabel: string;
    columnLabel: string;
    priorityLabel: string;
    deadlineLabel: string;
    privateTask: string;
    boardsManageTitle: string;
    newBoardSection: string;
    newBoardPlaceholder: string;
    newColumnSection: string;
    newColumnPlaceholder: string;
    noBoardsOption: string;
    noColumnsOption: string;
    noCategoriesInBoard: string;
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    priorityUrgent: string;
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
  common: {
    loading: "Завантаження…",
    cancel: "Скасувати",
    create: "Створити",
  },
  tabs: {
    home: "Головна",
    tasks: "Задачі",
    shopping: "Покупки",
    notes: "Нотатки",
    profile: "Профіль",
  },
  errors: {
    userNotFound: "Користувача не знайдено",
    firebaseTokenMissing: "Відсутній токен Firebase",
    googleAuthFailed: "Помилка входу через Google",
    failedLoadTasks: "Не вдалося завантажити задачі",
    failedCreateTask: "Не вдалося створити задачу",
    failedUpdateTask: "Не вдалося оновити задачу",
    failedDeleteTask: "Не вдалося видалити задачу",
    fallback: "Сталася помилка",
    invalidCredentials: "Невірний email або пароль",
    emailTaken: "Цей email вже зайнятий",
    passwordTooShort: "Пароль має бути не менше 8 символів",
  },
  login: {
    familyPlanner: "Family planner",
    title: "Вхід",
    subtitle: "Плануйте задачі, календар і покупки разом із Nibbo.",
    continueWithGoogle: "Продовжити з Google",
    signingIn: "Входимо…",
    terms: "Натискаючи, ви погоджуєтесь з умовами користування",
    tabGoogle: "Google",
    tabEmail: "Email",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Пароль",
    passwordPlaceholder: "Мінімум 8 символів",
    nameLabel: "Ім'я",
    namePlaceholder: "Ваше ім'я (необов'язково)",
    signIn: "Увійти",
    register: "Зареєструватись",
    registering: "Реєструємо…",
    switchToRegister: "Немає акаунту? Зареєструватись",
    switchToLogin: "Вже є акаунт? Увійти",
    orDivider: "або",
    devSkipLogin: "DEV: skip login",
  },
  onboarding: {
    step1Title: "Як вас звати?",
    step1Subtitle: "Це ім'я будуть бачити члени вашої сім'ї",
    namePlaceholder: "Ваше ім'я",
    nameLabel: "Ім'я",
    next: "Далі",
    step2Title: "Запросіть сім'ю",
    step2Subtitle: "Введіть email тих, кого хочете додати до свого простору",
    inviteLabel: "Email для запрошення",
    invitePlaceholder: "email@example.com",
    addInvite: "Додати ще",
    skipInvite: "Пропустити",
    finish: "Почати",
    finishing: "Завершуємо…",
    welcomeBack: "Ласкаво просимо назад!",
    registrationFailed: "Не вдалося завершити реєстрацію",
  },
  notes: {
    title: "Нотатки",
    subtitle: "Ваші думки та нотатки в одному місці",
    newNote: "Нова нотатка",
    emptyTitle: "Ще немає нотаток",
    emptySubtitle: "Додайте першу нотатку, щоб зберегти думки",
    noteTitlePlaceholder: "Заголовок нотатки",
    noteContentPlaceholder: "Напишіть тут…",
    save: "Зберегти",
    saving: "Зберігаємо…",
    delete: "Видалити",
    pinned: "Закріплено",
    pin: "Закріпити",
    unpin: "Відкріпити",
    cancel: "Відмінити",
    edit: "Редагувати",
    uncategorized: "Без категорії",
    filterAll: "Всі",
    showAll: "Показати всі",
    emptyInCategory: "Немає нотаток у цій категорії",
    categorySection: "Категорія",
    newCategoryTitle: "Нова категорія",
    categoryNamePlaceholder: "Назва категорії",
    addCategory: "Категорія",
    deleteNoteTitle: "Видалити нотатку?",
    deleteNoteSubtitle: "Цю дію не можна скасувати",
  },
  calendar: {
    title: "Календар",
    subtitle: "Плануйте події вашої родини",
    newEvent: "Нова подія",
    emptyTitle: "Немає подій",
    emptySubtitle: "Додайте першу подію до календаря",
    today: "Сьогодні",
    allDay: "Весь день",
    noEvents: "Немає подій на цей день",
    eventTitlePlaceholder: "Назва події",
    save: "Зберегти",
    saving: "Зберігаємо…",
    delete: "Видалити",
    cancel: "Відмінити",
    location: "Місце",
    monthNames: [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ],
    dayNamesShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    startLabel: "Початок",
    endLabel: "Кінець",
    deleteEventTitle: "Видалити подію?",
  },
  budget: {
    title: "Бюджет",
    subtitle: "Відстежуйте витрати сім'ї",
    newExpense: "Нова витрата",
    emptyTitle: "Немає витрат",
    emptySubtitle: "Додайте першу витрату для відстеження бюджету",
    totalSpent: "Витрачено цього місяця",
    addExpense: "Додати витрату",
    expenseTitlePlaceholder: "Назва витрати",
    amount: "Сума",
    amountPlaceholder: "0.00",
    category: "Категорія",
    noCategory: "Без категорії",
    save: "Зберегти",
    saving: "Зберігаємо…",
    delete: "Видалити",
    cancel: "Відмінити",
    thisMonth: "Цього місяця",
    byCategory: "По категоріях",
    newCategoryShort: "Нова",
    notePlaceholder: "Нотатка (необов'язково)",
    newCategorySheetTitle: "Нова категорія витрат",
    deleteExpenseTitle: "Видалити витрату?",
  },
  shopping: {
    title: "Покупки",
    subtitle: "Спільні списки покупок для сім'ї",
    newListAria: "Новий список",
    listsLabel: "Списків",
    toBuyLabel: "До покупки",
    loadError: "Не вдалося завантажити списки покупок",
    emptyTitle: "Немає списків покупок",
    emptySubtitle: "Натисніть «+» щоб створити перший список",
    pendingLine: (n) => `${n} до покупки`,
    itemsLine: (n) => (n === 0 ? "Порожньо" : `Позицій: ${n}`),
    emptyList: "У цьому списку поки немає позицій",
    emptyListHint: "Додати продукт…",
    toggleBoughtAria: (bought) =>
      bought ? "Позначити як некуплене" : "Позначити як куплене",
    bought: "Куплено",
    unbought: "Повернути",
    addItemPlaceholder: "Додати продукт…",
    addAria: "Додати",
    totalItems: (n) => `Всього позицій: ${n}`,
    newListTitle: "Новий список покупок",
    listNamePlaceholder: "Назва списку",
    createList: "Створити",
    creatingList: "Створюємо…",
  },
  notifications: {
    title: "Сповіщення",
    subtitle: "Те, що варте уваги",
    closeAria: "Закрити",
    backAria: "Назад",
    markRead: "Прочитано",
    loadError: "Не вдалося завантажити сповіщення",
    empty: "Наразі немає нових сповіщень",
    sheetWelcomeTitle: "Ласкаво просимо до Nibbo",
    sheetWelcomeBody:
      "Це місце для сповіщень про задачі, нагадування та новини сім'ї.",
    sheetJustNow: "щойно",
    pushDefaultTitle: "Нове сповіщення",
    pushDefaultBody: "Перевірте останні оновлення",
  },
  profile: {
    title: "Профіль",
    subtitle: "Ваш акаунт у Nibbo",
    profileLoadError: "Не вдалося оновити дані профілю",
    defaultName: "Друг",
    familyXp: "Сімейний XP",
    achievementsNone: "Ще немає досягнень",
    achievementsCount: (n) =>
      n === 1 ? "1 досягнення" : `${n} досягнень`,
    unknownMember: "Невідомий",
    familySection: "Сім'я",
    familyActive: "Активна",
    familyInactive: "Не налаштовано",
    languageSection: "Мова",
    notificationsSection: "Сповіщення",
    notificationsNew: (n) => `${n} нових`,
    notificationsConnected: "Підключено",
    notificationsNeedLogin: "Потрібен вхід",
    enablePush: "Увімкнути push-сповіщення",
    pushGranted: "Дозвіл надано",
    pushDenied: "Дозвіл відхилено",
    pushPrompt: "Потрібне підтвердження",
    pushUnavailable: "Недоступно в браузері",
    logOut: "Вийти з акаунту",
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
    familyRibbonTitle: "Родина",
    familyRibbonSubtitle: "Хто зараз у вашій сімейній хмарці",
    profileLink: "Профіль",
    loadingMembers: "Завантаження…",
    noMembers: "Поки що без учасників",
    memberFallback: "Учасник",
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
    allBoards: "Всі дошки",
    manageBoardsAria: "Керування дошками",
    descriptionPlaceholder: "Опис (необов'язково)",
    boardLabel: "Дошка",
    columnLabel: "Категорія",
    priorityLabel: "Пріоритет",
    deadlineLabel: "Дедлайн",
    privateTask: "Приватна задача",
    boardsManageTitle: "Дошки та категорії",
    newBoardSection: "Нова дошка",
    newBoardPlaceholder: "Назва дошки",
    newColumnSection: "Нова категорія",
    newColumnPlaceholder: "Назва категорії",
    noBoardsOption: "Немає дошок",
    noColumnsOption: "Немає категорій",
    noCategoriesInBoard: "Немає категорій",
    priorityLow: "Низький",
    priorityMedium: "Середній",
    priorityHigh: "Високий",
    priorityUrgent: "Терміново",
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
  common: {
    loading: "Loading…",
    cancel: "Cancel",
    create: "Create",
  },
  tabs: {
    home: "Home",
    tasks: "Tasks",
    shopping: "Shopping",
    notes: "Notes",
    profile: "Profile",
  },
  errors: {
    userNotFound: "User not found",
    firebaseTokenMissing: "Firebase ID token is missing",
    googleAuthFailed: "Google sign-in failed",
    failedLoadTasks: "Failed to load tasks",
    failedCreateTask: "Failed to create task",
    failedUpdateTask: "Failed to update task",
    failedDeleteTask: "Failed to delete task",
    fallback: "Something went wrong",
    invalidCredentials: "Invalid email or password",
    emailTaken: "This email is already registered",
    passwordTooShort: "Password must be at least 8 characters",
  },
  login: {
    familyPlanner: "Family planner",
    title: "Login",
    subtitle: "Plan tasks, calendar events, and shopping with Nibbo.",
    continueWithGoogle: "Continue with Google",
    signingIn: "Signing in…",
    terms: "By tapping continue, you agree to the terms of use",
    tabGoogle: "Google",
    tabEmail: "Email",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    nameLabel: "Name",
    namePlaceholder: "Your name (optional)",
    signIn: "Sign in",
    register: "Register",
    registering: "Registering…",
    switchToRegister: "No account? Register",
    switchToLogin: "Have an account? Sign in",
    orDivider: "or",
    devSkipLogin: "DEV: skip login",
  },
  onboarding: {
    step1Title: "What's your name?",
    step1Subtitle: "Your family members will see this name",
    namePlaceholder: "Your name",
    nameLabel: "Name",
    next: "Next",
    step2Title: "Invite your family",
    step2Subtitle: "Enter the emails of people you want to add to your space",
    inviteLabel: "Invite by email",
    invitePlaceholder: "email@example.com",
    addInvite: "Add another",
    skipInvite: "Skip",
    finish: "Get started",
    finishing: "Setting up…",
    welcomeBack: "Welcome back!",
    registrationFailed: "Could not complete registration",
  },
  notes: {
    title: "Notes",
    subtitle: "Your thoughts and notes in one place",
    newNote: "New note",
    emptyTitle: "No notes yet",
    emptySubtitle: "Add your first note to keep your thoughts",
    noteTitlePlaceholder: "Note title",
    noteContentPlaceholder: "Write here…",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    pinned: "Pinned",
    pin: "Pin",
    unpin: "Unpin",
    cancel: "Cancel",
    edit: "Edit",
    uncategorized: "Uncategorised",
    filterAll: "All",
    showAll: "Show all",
    emptyInCategory: "No notes in this category",
    categorySection: "Category",
    newCategoryTitle: "New category",
    categoryNamePlaceholder: "Category name",
    addCategory: "Category",
    deleteNoteTitle: "Delete note?",
    deleteNoteSubtitle: "This cannot be undone",
  },
  calendar: {
    title: "Calendar",
    subtitle: "Plan your family events",
    newEvent: "New event",
    emptyTitle: "No events",
    emptySubtitle: "Add your first event to the calendar",
    today: "Today",
    allDay: "All day",
    noEvents: "No events for this day",
    eventTitlePlaceholder: "Event title",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    cancel: "Cancel",
    location: "Location",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    dayNamesShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startLabel: "Starts",
    endLabel: "Ends",
    deleteEventTitle: "Delete event?",
  },
  budget: {
    title: "Budget",
    subtitle: "Track your family expenses",
    newExpense: "New expense",
    emptyTitle: "No expenses",
    emptySubtitle: "Add your first expense to track your budget",
    totalSpent: "Spent this month",
    addExpense: "Add expense",
    expenseTitlePlaceholder: "Expense name",
    amount: "Amount",
    amountPlaceholder: "0.00",
    category: "Category",
    noCategory: "No category",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    cancel: "Cancel",
    thisMonth: "This month",
    byCategory: "By category",
    newCategoryShort: "New",
    notePlaceholder: "Note (optional)",
    newCategorySheetTitle: "New expense category",
    deleteExpenseTitle: "Delete expense?",
  },
  shopping: {
    title: "Shopping",
    subtitle: "Shared shopping lists for your household",
    newListAria: "New list",
    listsLabel: "Lists",
    toBuyLabel: "To buy",
    loadError: "Could not load shopping lists",
    emptyTitle: "No shopping lists",
    emptySubtitle: "Tap “+” to create your first list",
    pendingLine: (n) => `${n} to buy`,
    itemsLine: (n) => (n === 0 ? "Empty" : `${n} items`),
    emptyList: "No items in this list yet",
    emptyListHint: "Add an item…",
    toggleBoughtAria: (bought) =>
      bought ? "Mark as not bought" : "Mark as bought",
    bought: "Bought",
    unbought: "Undo",
    addItemPlaceholder: "Add item…",
    addAria: "Add",
    totalItems: (n) => `Total items: ${n}`,
    newListTitle: "New shopping list",
    listNamePlaceholder: "List name",
    createList: "Create",
    creatingList: "Creating…",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Worth your attention",
    closeAria: "Close",
    backAria: "Back",
    markRead: "Mark read",
    loadError: "Could not load notifications",
    empty: "No new notifications right now",
    sheetWelcomeTitle: "Welcome to Nibbo",
    sheetWelcomeBody:
      "Task updates, reminders and family news will appear here.",
    sheetJustNow: "just now",
    pushDefaultTitle: "New notification",
    pushDefaultBody: "Check the latest updates",
  },
  profile: {
    title: "Profile",
    subtitle: "Your Nibbo account",
    profileLoadError: "Could not refresh profile",
    defaultName: "Friend",
    familyXp: "Family XP",
    achievementsNone: "No achievements yet",
    achievementsCount: (n) => `${n} achievement${n === 1 ? "" : "s"}`,
    unknownMember: "Unknown",
    familySection: "Family",
    familyActive: "Active",
    familyInactive: "Not set up",
    languageSection: "Language",
    notificationsSection: "Notifications",
    notificationsNew: (n) => `${n} new`,
    notificationsConnected: "Connected",
    notificationsNeedLogin: "Sign in required",
    enablePush: "Enable push notifications",
    pushGranted: "Permission granted",
    pushDenied: "Permission denied",
    pushPrompt: "Confirmation needed",
    pushUnavailable: "Not available in browser",
    logOut: "Sign out",
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
    familyRibbonTitle: "Family",
    familyRibbonSubtitle: "Who's in your family space right now",
    profileLink: "Profile",
    loadingMembers: "Loading…",
    noMembers: "No members yet",
    memberFallback: "Member",
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
    allBoards: "All boards",
    manageBoardsAria: "Manage boards",
    descriptionPlaceholder: "Description (optional)",
    boardLabel: "Board",
    columnLabel: "Column",
    priorityLabel: "Priority",
    deadlineLabel: "Deadline",
    privateTask: "Private task",
    boardsManageTitle: "Boards & columns",
    newBoardSection: "New board",
    newBoardPlaceholder: "Board name",
    newColumnSection: "New column",
    newColumnPlaceholder: "Column name",
    noBoardsOption: "No boards",
    noColumnsOption: "No columns",
    noCategoriesInBoard: "No columns yet",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    priorityUrgent: "Urgent",
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
  common: {
    loading: "読み込み中…",
    cancel: "キャンセル",
    create: "作成",
  },
  tabs: {
    home: "ホーム",
    tasks: "タスク",
    shopping: "買い物",
    notes: "ノート",
    profile: "プロフィール",
  },
  errors: {
    userNotFound: "ユーザーが見つかりません",
    firebaseTokenMissing: "Firebase IDトークンがありません",
    googleAuthFailed: "Googleログインに失敗しました",
    failedLoadTasks: "タスクの読み込みに失敗しました",
    failedCreateTask: "タスクの作成に失敗しました",
    failedUpdateTask: "タスクの更新に失敗しました",
    failedDeleteTask: "タスクの削除に失敗しました",
    fallback: "エラーが発生しました",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません",
    emailTaken: "このメールアドレスはすでに登録されています",
    passwordTooShort: "パスワードは8文字以上必要です",
  },
  login: {
    familyPlanner: "Family planner",
    title: "ログイン",
    subtitle: "Nibboでタスク、カレンダー、買い物をまとめて管理。",
    continueWithGoogle: "Googleで続行",
    signingIn: "ログイン中…",
    terms: "続行をタップすると利用規約に同意したことになります",
    tabGoogle: "Google",
    tabEmail: "メール",
    emailLabel: "メールアドレス",
    emailPlaceholder: "your@email.com",
    passwordLabel: "パスワード",
    passwordPlaceholder: "8文字以上",
    nameLabel: "お名前",
    namePlaceholder: "お名前（任意）",
    signIn: "ログイン",
    register: "登録",
    registering: "登録中…",
    switchToRegister: "アカウントがない？登録する",
    switchToLogin: "すでにアカウントをお持ちの方",
    orDivider: "または",
    devSkipLogin: "DEV: skip login",
  },
  onboarding: {
    step1Title: "お名前は？",
    step1Subtitle: "このお名前は家族のメンバーに表示されます",
    namePlaceholder: "お名前",
    nameLabel: "名前",
    next: "次へ",
    step2Title: "家族を招待",
    step2Subtitle: "スペースに追加したい人のメールアドレスを入力",
    inviteLabel: "招待メール",
    invitePlaceholder: "email@example.com",
    addInvite: "追加",
    skipInvite: "スキップ",
    finish: "始める",
    finishing: "設定中…",
    welcomeBack: "おかえりなさい！",
    registrationFailed: "登録を完了できませんでした",
  },
  notes: {
    title: "ノート",
    subtitle: "考えとノートを一か所に",
    newNote: "新しいノート",
    emptyTitle: "ノートはまだありません",
    emptySubtitle: "最初のノートを追加しましょう",
    noteTitlePlaceholder: "ノートのタイトル",
    noteContentPlaceholder: "ここに書いてください…",
    save: "保存",
    saving: "保存中…",
    delete: "削除",
    pinned: "ピン留め",
    pin: "ピン留め",
    unpin: "ピン解除",
    cancel: "キャンセル",
    edit: "編集",
    uncategorized: "未分類",
    filterAll: "すべて",
    showAll: "すべて表示",
    emptyInCategory: "このカテゴリにノートはありません",
    categorySection: "カテゴリ",
    newCategoryTitle: "新しいカテゴリ",
    categoryNamePlaceholder: "カテゴリ名",
    addCategory: "カテゴリ",
    deleteNoteTitle: "ノートを削除しますか？",
    deleteNoteSubtitle: "この操作は取り消せません",
  },
  calendar: {
    title: "カレンダー",
    subtitle: "家族のイベントを計画",
    newEvent: "新しいイベント",
    emptyTitle: "イベントなし",
    emptySubtitle: "最初のイベントを追加しましょう",
    today: "今日",
    allDay: "終日",
    noEvents: "この日のイベントはありません",
    eventTitlePlaceholder: "イベントのタイトル",
    save: "保存",
    saving: "保存中…",
    delete: "削除",
    cancel: "キャンセル",
    location: "場所",
    monthNames: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    dayNamesShort: ["月", "火", "水", "木", "金", "土", "日"],
    startLabel: "開始",
    endLabel: "終了",
    deleteEventTitle: "イベントを削除しますか？",
  },
  budget: {
    title: "予算",
    subtitle: "家族の支出を追跡",
    newExpense: "新しい支出",
    emptyTitle: "支出はありません",
    emptySubtitle: "最初の支出を追加しましょう",
    totalSpent: "今月の支出",
    addExpense: "支出を追加",
    expenseTitlePlaceholder: "支出の名称",
    amount: "金額",
    amountPlaceholder: "0.00",
    category: "カテゴリ",
    noCategory: "カテゴリなし",
    save: "保存",
    saving: "保存中…",
    delete: "削除",
    cancel: "キャンセル",
    thisMonth: "今月",
    byCategory: "カテゴリ別",
    newCategoryShort: "新規",
    notePlaceholder: "メモ（任意）",
    newCategorySheetTitle: "新しい支出カテゴリ",
    deleteExpenseTitle: "支出を削除しますか？",
  },
  shopping: {
    title: "買い物",
    subtitle: "家族で共有する買い物リスト",
    newListAria: "新しいリスト",
    listsLabel: "リスト",
    toBuyLabel: "未購入",
    loadError: "買い物リストを読み込めませんでした",
    emptyTitle: "リストがありません",
    emptySubtitle: "「+」で最初のリストを作成",
    pendingLine: (n) => `未購入 ${n} 件`,
    itemsLine: (n) => (n === 0 ? "空" : `${n} 件`),
    emptyList: "このリストにはまだ項目がありません",
    emptyListHint: "項目を追加…",
    toggleBoughtAria: (bought) =>
      bought ? "未購入に戻す" : "購入済みにする",
    bought: "購入済み",
    unbought: "戻す",
    addItemPlaceholder: "項目を追加…",
    addAria: "追加",
    totalItems: (n) => `合計 ${n} 件`,
    newListTitle: "新しい買い物リスト",
    listNamePlaceholder: "リスト名",
    createList: "作成",
    creatingList: "作成中…",
  },
  notifications: {
    title: "通知",
    subtitle: "チェックしたい情報",
    closeAria: "閉じる",
    backAria: "戻る",
    markRead: "既読",
    loadError: "通知を読み込めませんでした",
    empty: "新しい通知はありません",
    sheetWelcomeTitle: "Nibboへようこそ",
    sheetWelcomeBody:
      "タスクの更新、リマインダー、家族のニュースがここに表示されます。",
    sheetJustNow: "たった今",
    pushDefaultTitle: "新しい通知",
    pushDefaultBody: "最新の更新を確認してください",
  },
  profile: {
    title: "プロフィール",
    subtitle: "Nibboアカウント",
    profileLoadError: "プロフィールを更新できませんでした",
    defaultName: "ともだち",
    familyXp: "ファミリーXP",
    achievementsNone: "まだ実績がありません",
    achievementsCount: (n) => `実績 ${n} 件`,
    unknownMember: "不明",
    familySection: "家族",
    familyActive: "有効",
    familyInactive: "未設定",
    languageSection: "言語",
    notificationsSection: "通知",
    notificationsNew: (n) => `新着 ${n} 件`,
    notificationsConnected: "接続済み",
    notificationsNeedLogin: "ログインが必要です",
    enablePush: "プッシュ通知を有効にする",
    pushGranted: "許可されました",
    pushDenied: "拒否されました",
    pushPrompt: "確認が必要です",
    pushUnavailable: "ブラウザでは利用できません",
    logOut: "ログアウト",
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
    familyRibbonTitle: "家族",
    familyRibbonSubtitle: "今ファミリースペースにいるメンバー",
    profileLink: "プロフィール",
    loadingMembers: "読み込み中…",
    noMembers: "まだメンバーがいません",
    memberFallback: "メンバー",
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
    allBoards: "すべてのボード",
    manageBoardsAria: "ボードを管理",
    descriptionPlaceholder: "説明（任意）",
    boardLabel: "ボード",
    columnLabel: "カラム",
    priorityLabel: "優先度",
    deadlineLabel: "期限",
    privateTask: "プライベートタスク",
    boardsManageTitle: "ボードとカラム",
    newBoardSection: "新しいボード",
    newBoardPlaceholder: "ボード名",
    newColumnSection: "新しいカラム",
    newColumnPlaceholder: "カラム名",
    noBoardsOption: "ボードなし",
    noColumnsOption: "カラムなし",
    noCategoriesInBoard: "カラムがありません",
    priorityLow: "低",
    priorityMedium: "中",
    priorityHigh: "高",
    priorityUrgent: "緊急",
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

const dictionaries: Record<AppLanguage, Dictionary> = { uk, en, ja };

export const i18n = new Proxy({} as Dictionary, {
  get(_, prop: keyof Dictionary) {
    return dictionaries[getAppLanguage()][prop];
  },
});

const apiErrorMap: Record<string, keyof Dictionary["errors"]> = {
  "User not found": "userNotFound",
  "Firebase id token is missing": "firebaseTokenMissing",
  "Google auth failed": "googleAuthFailed",
  "Failed to load tasks": "failedLoadTasks",
  "Failed to create task": "failedCreateTask",
  "Failed to update task": "failedUpdateTask",
  "Failed to delete task": "failedDeleteTask",
  INVALID_CREDENTIALS: "invalidCredentials",
  "Email auth failed": "invalidCredentials",
  EMAIL_TAKEN: "emailTaken",
  "Registration failed": "emailTaken",
  INVALID_BODY: "passwordTooShort",
};

export function localizeApiError(message: string): string {
  const key = apiErrorMap[message];
  const dict = dictionaries[getAppLanguage()];
  if (!key) return message || dict.errors.fallback;
  return dict.errors[key];
}
