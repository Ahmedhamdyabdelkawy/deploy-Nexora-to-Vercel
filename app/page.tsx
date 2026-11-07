"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Menu,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type PageId = "overview" | "tasks" | "projects" | "calendar" | "analytics" | "settings";
type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  project: string;
  assignee: string;
};
type Project = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  color: string;
  members: string[];
  status: "On track" | "At risk" | "Completed";
};
type CalendarEvent = { id: string; title: string; date: string; time: string; type: string };
type UserSettings = { name: string; email: string; weeklySummary: boolean; taskReminders: boolean };

const taskStatuses: TaskStatus[] = ["To Do", "In Progress", "Review", "Completed"];
const priorities: Priority[] = ["Low", "Medium", "High"];
const projectColors = ["#8b7bff", "#50c9a9", "#f0a35e", "#6db3fa", "#e88dc1"];
const chartTooltipStyle = {
  backgroundColor: "#151a2b",
  border: "1px solid #2b3146",
  borderRadius: "12px",
  color: "#f4f5fb",
};

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

const seedProjects: Project[] = [
  {
    id: "p1",
    name: "Website redesign",
    description: "A more thoughtful digital home for the Nexora community.",
    deadline: dateOffset(12),
    color: "#8b7bff",
    members: ["AM", "JL", "RK"],
    status: "On track",
  },
  {
    id: "p2",
    name: "Mobile app launch",
    description: "Bring the full Nexora workflow to iOS and Android.",
    deadline: dateOffset(24),
    color: "#50c9a9",
    members: ["AM", "SK", "MP", "JL"],
    status: "At risk",
  },
  {
    id: "p3",
    name: "Q4 content strategy",
    description: "Plan and publish a focused, high-signal content calendar.",
    deadline: dateOffset(7),
    color: "#f0a35e",
    members: ["RK", "MP"],
    status: "On track",
  },
];

const seedTasks: Task[] = [
  { id: "t1", title: "Finalize homepage wireframes", description: "Align the final desktop and mobile layouts with the product team.", status: "In Progress", priority: "High", dueDate: dateOffset(1), project: "Website redesign", assignee: "AM" },
  { id: "t2", title: "Review onboarding copy", description: "Tighten the new-user experience and make the empty states more helpful.", status: "Review", priority: "Medium", dueDate: dateOffset(2), project: "Mobile app launch", assignee: "JL" },
  { id: "t3", title: "Prepare launch checklist", description: "Collect the remaining launch dependencies and owners.", status: "To Do", priority: "High", dueDate: dateOffset(3), project: "Mobile app launch", assignee: "SK" },
  { id: "t4", title: "Draft customer story", description: "Write up the workflow improvements from the Northstar team.", status: "In Progress", priority: "Low", dueDate: dateOffset(5), project: "Q4 content strategy", assignee: "RK" },
  { id: "t5", title: "Set up analytics events", description: "Verify core product events are flowing to the dashboard.", status: "Completed", priority: "Medium", dueDate: dateOffset(-2), project: "Mobile app launch", assignee: "MP" },
  { id: "t6", title: "Collect stakeholder feedback", description: "Share the concept deck and capture feedback in one place.", status: "To Do", priority: "Medium", dueDate: dateOffset(0), project: "Website redesign", assignee: "AM" },
  { id: "t7", title: "Publish November roadmap", description: "Turn the planning notes into a clear, shareable roadmap.", status: "Completed", priority: "Low", dueDate: dateOffset(-4), project: "Q4 content strategy", assignee: "RK" },
  { id: "t8", title: "Test notification settings", description: "Check preferences and reminders across desktop and mobile.", status: "Review", priority: "High", dueDate: dateOffset(4), project: "Mobile app launch", assignee: "JL" },
];

const seedEvents: CalendarEvent[] = [
  { id: "e1", title: "Product sync", date: dateOffset(1), time: "10:00 AM", type: "Meeting" },
  { id: "e2", title: "Design review", date: dateOffset(3), time: "2:30 PM", type: "Review" },
  { id: "e3", title: "Focus time", date: dateOffset(5), time: "9:00 AM", type: "Focus" },
];

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "My tasks", icon: ListTodo },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const weeklyData = [
  { day: "Mon", completed: 8, planned: 10 },
  { day: "Tue", completed: 12, planned: 11 },
  { day: "Wed", completed: 9, planned: 12 },
  { day: "Thu", completed: 15, planned: 13 },
  { day: "Fri", completed: 11, planned: 12 },
  { day: "Sat", completed: 6, planned: 7 },
  { day: "Sun", completed: 9, planned: 8 },
];

const avatarColors = ["#8b7bff", "#50c9a9", "#f0a35e", "#e88dc1", "#6db3fa"];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error);
  }
}

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options ?? { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dateLabel(value: string) {
  if (value === dateOffset(0)) return "Today";
  if (value === dateOffset(1)) return "Tomorrow";
  return formatDate(value, { weekday: "short", month: "short", day: "numeric" });
}

function AvatarStack({ members, size = "small" }: { members: string[]; size?: "small" | "large" }) {
  return (
    <div className="avatar-stack" aria-label={`${members.length} team members`}>
      {members.slice(0, 4).map((member, index) => (
        <span
          className={`avatar ${size === "large" ? "avatar-large" : ""}`}
          key={`${member}-${index}`}
          style={{ background: avatarColors[index % avatarColors.length] }}
          title={member}
        >
          {member}
        </span>
      ))}
      {members.length > 4 && <span className="avatar avatar-overflow">+{members.length - 4}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${className}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      <span className="priority-dot" />
      {priority}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.section
          aria-labelledby="modal-title"
          aria-modal="true"
          className="modal-card"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          role="dialog"
        >
          <div className="modal-heading">
            <h2 id="modal-title">{title}</h2>
            <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><X size={18} /></button>
          </div>
          {children}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const [page, setPage] = useState<PageId>("overview");
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [taskModal, setTaskModal] = useState<Task | "new" | null>(null);
  const [projectModal, setProjectModal] = useState<Project | "new" | null>(null);
  const [eventModal, setEventModal] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("To Do");
  const [calendarMode, setCalendarMode] = useState<"Month" | "Week">("Month");
  const [calendarDate, setCalendarDate] = useState(() => new Date(0));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<UserSettings>({
    name: "Alex Morgan",
    email: "alex.morgan@nexora.app",
    weeklySummary: true,
    taskReminders: true,
  });

  useEffect(() => {
    // Load persisted state after hydration to keep server and client markup consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(readStorage("nexora-tasks", seedTasks));
    setProjects(readStorage("nexora-projects", seedProjects));
    setEvents(readStorage("nexora-events", seedEvents));
    setSettings(readStorage("nexora-settings", settings));
    setTheme(readStorage("nexora-theme", "dark"));
    // Calendar dates are initialized on the client to avoid prerendering a stale "today".
    setCalendarDate(new Date());
    setIsHydrated(true);
  // The initializer is used only as the first-visit fallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeStorage("nexora-tasks", tasks);
    writeStorage("nexora-projects", projects);
    writeStorage("nexora-events", events);
    writeStorage("nexora-settings", settings);
    writeStorage("nexora-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [tasks, projects, events, settings, theme, isHydrated]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const productivityScore = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const searchMatches = `${task.title} ${task.description} ${task.project}`.toLowerCase().includes(query.toLowerCase());
        return (
          searchMatches &&
          (priorityFilter === "All" || task.priority === priorityFilter) &&
          (statusFilter === "All" || task.status === statusFilter)
        );
      }),
    [tasks, query, priorityFilter, statusFilter],
  );
  const searchResults = useMemo(
    () => (query.trim() ? tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : []),
    [query, tasks],
  );

  const navigate = (nextPage: PageId) => {
    setPage(nextPage);
    setMobileSidebarOpen(false);
    setNotificationsOpen(false);
  };

  const openNewTask = (status: TaskStatus = "To Do") => {
    setNewTaskStatus(status);
    setTaskModal("new");
  };

  const saveTask = (task: Task) => {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists ? current.map((item) => (item.id === task.id ? task : item)) : [task, ...current];
    });
    setTaskModal(null);
  };

  const deleteTask = (task: Task) => {
    if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
      setTasks((current) => current.filter((item) => item.id !== task.id));
    }
  };

  const saveProject = (project: Project) => {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id);
      return exists ? current.map((item) => (item.id === project.id ? project : item)) : [project, ...current];
    });
    setProjectModal(null);
  };

  const deleteProject = (project: Project) => {
    if (window.confirm(`Delete “${project.name}”? The tasks will remain in your workspace.`)) {
      setProjects((current) => current.filter((item) => item.id !== project.id));
    }
  };

  const moveTask = (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents((current) => [...current, event]);
    setEventModal(false);
  };

  const changeCalendar = (direction: number) => {
    setCalendarDate((current) => {
      const next = new Date(current);
      if (calendarMode === "Month") {
        next.setDate(1);
        next.setMonth(next.getMonth() + direction);
      }
      else next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const title = navItems.find((item) => item.id === page)?.label ?? "Settings";

  return (
    <main className="app-shell">
      {mobileSidebarOpen && <button aria-label="Close navigation" className="mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className={`sidebar ${mobileSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.2} /></div>
          <span className="brand-name">nexora</span>
          <button aria-label="Close navigation" className="icon-button sidebar-close" onClick={() => setMobileSidebarOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-icon">N</span>
          <span className="workspace-copy"><strong>Northstar Studio</strong><small>Free plan</small></span>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={`nav-link ${page === id ? "nav-link-active" : ""}`} key={id} onClick={() => navigate(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === "tasks" && <span className="nav-count">{tasks.filter((task) => task.status !== "Completed").length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <span className="tip-icon"><Zap size={15} fill="currentColor" /></span>
          <strong>A little progress<br />goes a long way.</strong>
          <span>Keep your momentum going.</span>
          <div className="tip-progress"><i style={{ width: `${productivityScore}%` }} /></div>
          <small>{productivityScore}% of tasks complete</small>
        </div>
        <button className={`nav-link ${page === "settings" ? "nav-link-active" : ""}`} onClick={() => navigate("settings")}>
          <Settings size={18} strokeWidth={1.8} /><span>Settings</span>
        </button>
        <div className="profile-row">
          <span className="profile-avatar">{initials(settings.name)}</span>
          <span className="profile-copy"><strong>{settings.name}</strong><small>Personal workspace</small></span>
          <button aria-label="Profile options" className="icon-button profile-more" onClick={() => navigate("settings")}><MoreHorizontal size={18} /></button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button aria-label="Open navigation" className="icon-button mobile-menu" onClick={() => setMobileSidebarOpen(true)}><Menu size={20} /></button>
            <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <Search size={16} />
              <input
                aria-label="Search tasks"
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && query.trim()) navigate("tasks");
                  if (event.key === "Escape") setQuery("");
                }}
                placeholder="Search anything..."
                ref={searchInputRef}
                value={query}
              />
              <kbd>⌘ K</kbd>
              {searchFocused && query.trim() && (
                <div className="search-popover">
                  <span className="popover-label">TASKS</span>
                  {searchResults.length ? searchResults.map((task) => (
                    <button className="search-result" key={task.id} onMouseDown={() => { navigate("tasks"); setQuery(task.title); }}>
                      <ListTodo size={15} /><span>{task.title}</span><StatusBadge status={task.status} />
                    </button>
                  )) : <p className="search-empty">No tasks found for “{query}”.</p>}
                  {searchResults.length > 0 && <button className="search-all" onMouseDown={() => navigate("tasks")}>See all results <ArrowRight size={13} /></button>}
                </div>
              )}
            </div>
            <div className="notification-wrap">
              <button aria-label="Notifications" aria-expanded={notificationsOpen} className="icon-button notification-button" onClick={() => setNotificationsOpen((open) => !open)}>
                <Bell size={18} /><span className="notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading"><strong>Notifications</strong><span>2 new</span></div>
                  <div className="notification-item"><span className="notification-icon purple"><CheckCircle2 size={15} /></span><span><strong>Nice work!</strong><small>You completed “Set up analytics events”.</small><time>2 hours ago</time></span></div>
                  <div className="notification-item"><span className="notification-icon orange"><Clock3 size={15} /></span><span><strong>Coming up tomorrow</strong><small>“Finalize homepage wireframes” is due soon.</small><time>4 hours ago</time></span></div>
                </div>
              )}
            </div>
            <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="icon-button theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button aria-label="Open profile settings" className="top-avatar" onClick={() => navigate("settings")}>{initials(settings.name)}</button>
            <button className="primary-button add-task-button" onClick={() => openNewTask()}><Plus size={16} /> <span>New task</span></button>
          </div>
        </header>

        <div className="page-content">
          {!isHydrated ? <div className="loading-state"><span className="loading-spinner" />Getting your workspace ready…</div> : (
            <motion.div key={page} className="page-transition" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                {page === "overview" && (
                  <DashboardPage
                    activeProjects={activeProjects}
                    completedTasks={completedTasks}
                    onNavigate={navigate}
                    onNewTask={() => openNewTask()}
                    tasks={tasks}
                    userName={settings.name}
                  />
                )}
                {page === "tasks" && (
                  <TasksPage
                    filteredTasks={filteredTasks}
                    onDelete={deleteTask}
                    onEdit={setTaskModal}
                    onMove={moveTask}
                    onNew={openNewTask}
                    onPriorityChange={setPriorityFilter}
                    onStatusChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    projects={projects}
                    query={query}
                    setQuery={setQuery}
                    statusFilter={statusFilter}
                    tasks={tasks}
                  />
                )}
                {page === "projects" && <ProjectsPage onDelete={deleteProject} onEdit={setProjectModal} onNew={() => setProjectModal("new")} projects={projects} tasks={tasks} />}
                {page === "calendar" && (
                  <CalendarPage
                    calendarDate={calendarDate}
                    calendarMode={calendarMode}
                    events={events}
                    onChangeDate={changeCalendar}
                    onModeChange={setCalendarMode}
                    onNewEvent={() => setEventModal(true)}
                    onSelectDate={setCalendarDate}
                    tasks={tasks}
                  />
                )}
                {page === "analytics" && <AnalyticsPage completedTasks={completedTasks} projects={projects} tasks={tasks} />}
                {page === "settings" && <SettingsPage onSettingsChange={setSettings} onThemeChange={setTheme} settings={settings} theme={theme} />}
            </motion.div>
          )}
        </div>
      </section>

      {taskModal && <TaskForm initialStatus={newTaskStatus} initialTask={taskModal === "new" ? null : taskModal} onClose={() => setTaskModal(null)} onSave={saveTask} projects={projects} />}
      {projectModal && <ProjectForm initialProject={projectModal === "new" ? null : projectModal} onClose={() => setProjectModal(null)} onSave={saveProject} />}
      {eventModal && <EventForm onClose={() => setEventModal(false)} onSave={addEvent} />}
    </main>
  );
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}

function DashboardPage({
  userName,
  tasks,
  completedTasks,
  activeProjects,
  onNavigate,
  onNewTask,
}: {
  userName: string;
  tasks: Task[];
  completedTasks: number;
  activeProjects: number;
  onNavigate: (page: PageId) => void;
  onNewTask: () => void;
}) {
  const today = new Date();
  const dueSoon = tasks.filter((task) => task.status !== "Completed" && task.dueDate >= dateOffset(0)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const attention = tasks.filter((task) => task.status !== "Completed" && (task.priority === "High" || task.dueDate <= dateOffset(1))).slice(0, 3);
  const completedToday = tasks.filter((task) => task.status === "Completed").length;
  const firstName = userName.split(" ")[0] || "there";

  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="welcome-date">{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1>Good {today.getHours() < 12 ? "morning" : today.getHours() < 18 ? "afternoon" : "evening"}, {firstName}<span className="wave">✦</span></h1>
          <p>You’re making great progress. Here’s what’s happening with your workspace.</p>
          <button className="welcome-cta" onClick={onNewTask}><Plus size={15} /> Create a task</button>
        </div>
        <div aria-hidden="true" className="welcome-art">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-glow" />
          <div className="art-center"><Sparkles size={25} /></div>
          <div className="art-chip chip-one"><Check size={12} /> In flow</div>
          <div className="art-chip chip-two"><span /> 4 day streak</div>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard label="Total tasks" value={tasks.length.toString()} note="Across all projects" icon={ListTodo} color="violet" trend="+12%" />
        <StatCard label="Completed" value={completedTasks.toString()} note="Keep the momentum" icon={CheckCircle2} color="green" trend="+8%" />
        <StatCard label="Active projects" value={activeProjects.toString()} note="Moving forward" icon={FolderKanban} color="blue" trend="On track" />
        <StatCard label="Productivity score" value={`${tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%`} note="You’re in a great rhythm" icon={Target} color="orange" trend="+5.4%" />
      </div>
      <div className="dashboard-grid">
        <section className="panel productivity-panel">
          <div className="panel-heading">
            <div><h2>Productivity</h2><p>Your focus at a glance</p></div>
            <span className="select-button">This week</span>
          </div>
          <div className="chart-summary"><strong>61</strong><span className="summary-change"><TrendingUp size={14} /> 12.8%</span><small>tasks completed this week</small></div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9385ff" stopOpacity={0.28} /><stop offset="100%" stopColor="#9385ff" stopOpacity={0} /></linearGradient>
                  <linearGradient id="plannedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54d6b1" stopOpacity={0.12} /><stop offset="100%" stopColor="#54d6b1" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey="day" tick={{ fill: "var(--muted)", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="planned" name="Planned" stroke="#54d6b1" strokeDasharray="4 4" strokeWidth={1.5} fill="url(#plannedFill)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#9385ff" strokeWidth={2.5} fill="url(#completedFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend"><span><i className="legend-dot purple-dot" /> Completed</span><span><i className="legend-dot green-dot" /> Planned</span><span className="legend-period">Last 7 days</span></div>
        </section>
        <section className="panel focus-panel">
          <div className="panel-heading"><div><h2>Today’s focus</h2><p>A clear path to a good day</p></div><span className="focus-date">{formatDate(dateOffset(0), { month: "short", day: "numeric" })}</span></div>
          <div className="focus-score-wrap">
            <div className="focus-ring" style={{ "--score": `${tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%` } as React.CSSProperties}><span><strong>{tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%</strong><small>complete</small></span></div>
            <div className="focus-copy"><strong>{completedToday} tasks done</strong><span>You’re right on track.<br />Keep it up!</span></div>
          </div>
          <div className="focus-divider" />
          <div className="focus-footer"><span><CheckCircle2 size={15} /> Your week is off to a good start</span><ArrowUpRight size={15} /></div>
        </section>
      </div>
      <div className="dashboard-grid bottom-grid">
        <section className="panel activity-panel">
          <div className="panel-heading"><div><h2>Recent activity</h2><p>The latest from your team</p></div><button className="text-button" onClick={() => onNavigate("tasks")}>View all <ArrowRight size={14} /></button></div>
          <div className="activity-list">
            <ActivityItem initials="JL" color="#50c9a9" title="Jordan Lee" action="completed" subject="Set up analytics events" time="2 hours ago" />
            <ActivityItem initials="RK" color="#f0a35e" title="Riley Kim" action="shared an update on" subject="Q4 content strategy" time="4 hours ago" />
            <ActivityItem initials="AM" color="#8b7bff" title="You" action="moved" subject="Finalize homepage wireframes to In Progress" time="Yesterday" />
            <ActivityItem initials="SK" color="#e88dc1" title="Sam Kim" action="created a new task in" subject="Mobile app launch" time="Yesterday" />
          </div>
        </section>
        <section className="panel deadline-panel">
          <div className="panel-heading"><div><h2>Upcoming deadlines</h2><p>Stay one step ahead</p></div><button className="icon-button subtle-icon" aria-label="View calendar" onClick={() => onNavigate("calendar")}><CalendarDays size={17} /></button></div>
          {dueSoon.length ? <div className="deadline-list">{dueSoon.map((task) => (
            <div className="deadline-item" key={task.id}>
              <span className={`deadline-date ${task.dueDate === dateOffset(0) ? "deadline-today" : ""}`}><strong>{new Date(`${task.dueDate}T12:00:00`).getDate()}</strong><small>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("en-US", { month: "short" })}</small></span>
              <span className="deadline-copy"><strong>{task.title}</strong><small>{task.project}</small></span>
              <PriorityBadge priority={task.priority} />
            </div>
          ))}</div> : <EmptyState title="No upcoming deadlines" description="Enjoy a little breathing room." />}
          <button className="panel-footer-link" onClick={() => onNavigate("calendar")}>Open calendar <ArrowRight size={14} /></button>
        </section>
      </div>
      <section className="panel attention-panel">
        <div className="panel-heading"><div><h2>Needs your attention</h2><p>A few things to keep on your radar</p></div><button className="text-button" onClick={() => onNavigate("tasks")}>See all tasks <ArrowRight size={14} /></button></div>
        {attention.length ? <div className="attention-list">{attention.map((task) => (
          <div className="attention-item" key={task.id}><span className="attention-icon"><Clock3 size={15} /></span><span className="attention-copy"><strong>{task.title}</strong><small>{task.project}</small></span><PriorityBadge priority={task.priority} /><span className="attention-due">{dateLabel(task.dueDate)}</span></div>
        ))}</div> : <EmptyState title="You’re all caught up" description="Nothing needs attention right now." />}
      </section>
    </>
  );
}

function StatCard({ label, value, note, icon: Icon, color, trend }: { label: string; value: string; note: string; icon: typeof ListTodo; color: string; trend: string }) {
  return (
    <section className="stat-card">
      <div className="stat-top"><span className={`stat-icon ${color}`}><Icon size={17} /></span><span className={`stat-trend ${trend === "On track" ? "trend-neutral" : ""}`}><TrendingUp size={12} />{trend}</span></div>
      <div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-note">{note}</div>
    </section>
  );
}

function ActivityItem({ initials: avatar, color, title, action, subject, time }: { initials: string; color: string; title: string; action: string; subject: string; time: string }) {
  return <div className="activity-item"><span className="activity-avatar" style={{ background: color }}>{avatar}</span><span className="activity-copy"><strong>{title}</strong> {action} <b>{subject}</b><small>{time}</small></span><span className="activity-pulse" /></div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-icon"><Sparkles size={17} /></span><strong>{title}</strong><p>{description}</p></div>;
}

function TasksPage({
  tasks,
  filteredTasks,
  projects,
  onEdit,
  onDelete,
  onMove,
  onNew,
  query,
  setQuery,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
}: {
  tasks: Task[];
  filteredTasks: Task[];
  projects: Project[];
  onEdit: (task: Task | "new") => void;
  onDelete: (task: Task) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  onNew: (status?: TaskStatus) => void;
  query: string;
  setQuery: (query: string) => void;
  priorityFilter: "All" | Priority;
  onPriorityChange: (value: "All" | Priority) => void;
  statusFilter: "All" | TaskStatus;
  onStatusChange: (value: "All" | TaskStatus) => void;
}) {
  const [view, setView] = useState<"Board" | "List">("Board");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const visibleStatuses = statusFilter === "All" ? taskStatuses : [statusFilter];
  return (
    <>
      <PageHeading eyebrow="YOUR WORKSPACE" title="My tasks" description="Keep the important things moving forward.">
        <button className="primary-button" onClick={() => onNew()}><Plus size={16} /> New task</button>
      </PageHeading>
      <div className="task-toolbar">
        <div className="task-view-tabs"><button className={view === "Board" ? "tab-active" : ""} onClick={() => setView("Board")}><LayoutDashboard size={15} /> Board</button><button className={view === "List" ? "tab-active" : ""} onClick={() => setView("List")}><ListTodo size={15} /> List</button></div>
        <div className="task-filters">
          <label className="filter-search"><Search size={15} /><input aria-label="Filter tasks" onChange={(event) => setQuery(event.target.value)} placeholder="Filter tasks..." value={query} />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={13} /></button>}</label>
          <label className="filter-select"><Filter size={14} /><select aria-label="Filter by priority" onChange={(event) => onPriorityChange(event.target.value as "All" | Priority)} value={priorityFilter}><option value="All">Priority</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          {view === "List" && <label className="filter-select"><select aria-label="Filter by status" onChange={(event) => onStatusChange(event.target.value as "All" | TaskStatus)} value={statusFilter}><option value="All">All statuses</option>{taskStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>}
        </div>
      </div>
      {!filteredTasks.length ? <EmptyState title="No tasks match your filters" description={tasks.length ? "Try changing the search or filters." : "Create your first task to get started."} /> : view === "Board" ? (
        <div className="kanban-board">
          {visibleStatuses.map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status);
            return (
              <section className="kanban-column" key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedTask) onMove(draggedTask, status); setDraggedTask(null); }}>
                <div className="column-heading"><span className={`column-dot dot-${status.toLowerCase().replaceAll(" ", "-")}`} /><h2>{status}</h2><span className="column-count">{columnTasks.length}</span><button aria-label={`Add task to ${status}`} className="icon-button column-add" onClick={() => onNew(status)}><Plus size={16} /></button></div>
                <div className="column-cards">
                  {columnTasks.map((task) => <TaskCard key={task.id} onDelete={onDelete} onDragStart={() => setDraggedTask(task.id)} onEdit={onEdit} onMove={onMove} projects={projects} task={task} />)}
                  <button className="add-card-button" onClick={() => onNew(status)}><Plus size={15} /> Add task</button>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="panel task-list-panel">
          <div className="task-list-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due date</span><span /></div>
          {filteredTasks.map((task) => (
            <div className="task-list-row" key={task.id}><button className="list-task-title" onClick={() => onEdit(task)}><span className={`list-check ${task.status === "Completed" ? "is-done" : ""}`}>{task.status === "Completed" && <Check size={12} />}</span><span><strong>{task.title}</strong><small>{task.description}</small></span></button><span className="list-project">{task.project}</span><PriorityBadge priority={task.priority} /><select aria-label={`Change status for ${task.title}`} className="inline-status-select" onChange={(event) => onMove(task.id, event.target.value as TaskStatus)} value={task.status}>{taskStatuses.map((status) => <option key={status}>{status}</option>)}</select><span className="list-date">{formatDate(task.dueDate)}</span><button aria-label={`Delete ${task.title}`} className="icon-button row-delete" onClick={() => onDelete(task)}><Trash2 size={15} /></button></div>
          ))}
        </section>
      )}
    </>
  );
}

function TaskCard({ task, projects, onEdit, onDelete, onMove, onDragStart }: { task: Task; projects: Project[]; onEdit: (task: Task) => void; onDelete: (task: Task) => void; onMove: (taskId: string, status: TaskStatus) => void; onDragStart: () => void }) {
  const project = projects.find((item) => item.name === task.project);
  const nextStatus = taskStatuses[(taskStatuses.indexOf(task.status) + 1) % taskStatuses.length];
  return (
    <article className="task-card" draggable onDragStart={onDragStart} onDragEnd={() => undefined}>
      <div className="task-card-top"><span className="task-project-marker" style={{ background: project?.color ?? "#8b7bff" }} /><span className="task-project-name">{task.project}</span><button aria-label={`Edit ${task.title}`} className="icon-button card-menu" onClick={() => onEdit(task)}><MoreHorizontal size={16} /></button></div>
      <button className="task-card-title" onClick={() => onEdit(task)}>{task.title}</button>
      {task.description && <p className="task-card-description">{task.description}</p>}
      <div className="task-card-meta"><PriorityBadge priority={task.priority} /><span className={`task-due ${task.dueDate < dateOffset(0) && task.status !== "Completed" ? "overdue" : ""}`}><CalendarDays size={13} />{dateLabel(task.dueDate)}</span></div>
      <div className="task-card-footer"><span className="assignee-avatar" title={`Assigned to ${task.assignee}`} style={{ background: avatarColors[task.assignee.charCodeAt(0) % avatarColors.length] }}>{task.assignee}</span><button className="move-task-button" onClick={() => onMove(task.id, nextStatus)} title={`Move to ${nextStatus}`}><ArrowRight size={14} /></button><button aria-label={`Delete ${task.title}`} className="delete-task-button" onClick={() => onDelete(task)}><Trash2 size={14} /></button></div>
    </article>
  );
}

function ProjectsPage({ projects, tasks, onEdit, onDelete, onNew }: { projects: Project[]; tasks: Task[]; onEdit: (project: Project) => void; onDelete: (project: Project) => void; onNew: () => void }) {
  return (
    <>
      <PageHeading eyebrow="YOUR WORKSPACE" title="Projects" description="Big ideas, made manageable.">
        <button className="primary-button" onClick={onNew}><Plus size={16} /> New project</button>
      </PageHeading>
      <div className="project-summary-row"><div className="project-summary"><span className="summary-icon purple"><FolderKanban size={16} /></span><span><strong>{projects.length}</strong><small>Total projects</small></span></div><div className="project-summary"><span className="summary-icon green"><Activity size={16} /></span><span><strong>{projects.filter((project) => project.status === "On track").length}</strong><small>On track</small></span></div><div className="project-summary"><span className="summary-icon orange"><Clock3 size={16} /></span><span><strong>{projects.filter((project) => project.status === "At risk").length}</strong><small>Need attention</small></span></div></div>
      {projects.length ? <div className="projects-grid">{projects.map((project) => {
        const projectTasks = tasks.filter((task) => task.project === project.name);
        const completed = projectTasks.filter((task) => task.status === "Completed").length;
        const progress = projectTasks.length ? Math.round(completed / projectTasks.length * 100) : 0;
        return (
          <article className="project-card" key={project.id}>
            <div className="project-card-top"><span className="project-symbol" style={{ background: `${project.color}20`, color: project.color }}><FolderKanban size={19} /></span><button aria-label={`Edit ${project.name}`} className="icon-button project-menu" onClick={() => onEdit(project)}><MoreHorizontal size={18} /></button></div>
            <div className="project-status"><span className={`project-status-dot ${project.status === "At risk" ? "risk-dot" : project.status === "Completed" ? "complete-dot" : ""}`} />{project.status}</div>
            <h2>{project.name}</h2><p className="project-description">{project.description}</p>
            <div className="project-progress-label"><span>Progress</span><strong>{progress}%</strong></div>
            <div className="progress-track"><span style={{ width: `${progress}%`, background: project.color }} /></div>
            <div className="project-card-stats"><span><CheckCircle2 size={14} /> {completed} of {projectTasks.length} tasks</span><span><CalendarDays size={14} /> {formatDate(project.deadline, { month: "short", day: "numeric" })}</span></div>
            <div className="project-card-footer"><AvatarStack members={project.members} /><span className="project-members">{project.members.length} members</span><div className="project-actions"><button aria-label={`Edit ${project.name}`} className="icon-button" onClick={() => onEdit(project)}><Pencil size={14} /></button><button aria-label={`Delete ${project.name}`} className="icon-button project-delete" onClick={() => onDelete(project)}><Trash2 size={14} /></button></div></div>
          </article>
        );
      })}</div> : <EmptyState title="No projects yet" description="Create a project to bring your next big idea to life." />}
    </>
  );
}

function CalendarPage({ tasks, events, calendarDate, calendarMode, onChangeDate, onModeChange, onNewEvent, onSelectDate }: { tasks: Task[]; events: CalendarEvent[]; calendarDate: Date; calendarMode: "Month" | "Week"; onChangeDate: (direction: number) => void; onModeChange: (mode: "Month" | "Week") => void; onNewEvent: () => void; onSelectDate: (date: Date) => void }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOfMonthGrid = new Date(year, month, 1 - ((firstOfMonth.getDay() + 6) % 7));
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startOfMonthGrid);
    date.setDate(startOfMonthGrid.getDate() + index);
    return date;
  });
  const weekStart = new Date(calendarDate);
  weekStart.setDate(calendarDate.getDate() - ((calendarDate.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const days = calendarMode === "Month" ? monthDays : weekDays;
  const selectedDay = dateKey(calendarDate);
  const dayItems = [...tasks.filter((task) => task.dueDate === selectedDay && task.status !== "Completed").map((task) => ({ title: task.title, time: "Due today", color: "violet" })), ...events.filter((event) => event.date === selectedDay).map((event) => ({ title: event.title, time: event.time, color: "green" }))];
  const periodTitle = calendarMode === "Month"
    ? calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : `${formatDate(dateKey(weekDays[0]), { month: "short", day: "numeric" })} – ${formatDate(dateKey(weekDays[6]), { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <>
      <PageHeading eyebrow="PLAN YOUR TIME" title="Calendar" description="Make room for what matters.">
        <button className="primary-button" onClick={onNewEvent}><Plus size={16} /> New event</button>
      </PageHeading>
      <section className="panel calendar-panel">
        <div className="calendar-toolbar"><div className="calendar-period-controls"><div className="calendar-nav-buttons"><button aria-label="Previous period" className="icon-button" onClick={() => onChangeDate(-1)}><ChevronLeft size={17} /></button><button aria-label="Next period" className="icon-button" onClick={() => onChangeDate(1)}><ChevronRight size={17} /></button></div><h2>{periodTitle}</h2><button className="today-button" onClick={() => onSelectDate(new Date())}>Today</button></div><div className="segmented-control">{(["Month", "Week"] as const).map((mode) => <button className={calendarMode === mode ? "selected" : ""} key={mode} onClick={() => onModeChange(mode)}>{mode}</button>)}</div></div>
        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
          {days.map((date) => {
            const dateString = dateKey(date);
            const dateTasks = tasks.filter((task) => task.dueDate === dateString && task.status !== "Completed");
            const dateEvents = events.filter((event) => event.date === dateString);
            const isToday = dateString === dateOffset(0);
            const isCurrentMonth = date.getMonth() === month;
            return (
              <button className={`calendar-day ${!isCurrentMonth && calendarMode === "Month" ? "outside-month" : ""} ${isToday ? "calendar-today" : ""} ${dateString === selectedDay ? "calendar-selected" : ""}`} key={dateString} onClick={() => onSelectDate(date)}>
                <span className="calendar-day-number">{isToday ? <b>{date.getDate()}</b> : date.getDate()}</span>
                <span className="calendar-day-events">
                  {dateTasks.slice(0, calendarMode === "Week" ? 3 : 2).map((task) => <span className="calendar-event event-task" key={task.id}>{task.title}</span>)}
                  {dateEvents.slice(0, calendarMode === "Week" ? 2 : 1).map((event) => <span className="calendar-event event-meeting" key={event.id}>{event.title}</span>)}
                  {dateTasks.length + dateEvents.length > (calendarMode === "Week" ? 5 : 3) && <span className="more-events">+{dateTasks.length + dateEvents.length - (calendarMode === "Week" ? 5 : 3)} more</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="panel selected-day-panel">
        <div className="panel-heading"><div><h2>{selectedDay === dateOffset(0) ? "Today’s schedule" : `${formatDate(selectedDay, { weekday: "long", month: "long", day: "numeric" })}`}</h2><p>Tasks and events for this day</p></div><span className="selected-day-count">{dayItems.length} items</span></div>
        {dayItems.length ? <div className="schedule-list">{dayItems.map((item, index) => <div className="schedule-item" key={`${item.title}-${index}`}><span className={`schedule-indicator ${item.color}`} /><span className="schedule-time">{item.time}</span><strong>{item.title}</strong><span className="schedule-type">{item.color === "green" ? "Event" : "Task"}</span></div>)}</div> : <EmptyState title="Nothing planned for this day" description="Take a breath, or add something to your calendar." />}
      </section>
    </>
  );
}

function AnalyticsPage({ tasks, projects, completedTasks }: { tasks: Task[]; projects: Project[]; completedTasks: number }) {
  const distribution = taskStatuses.map((status, index) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length,
    color: ["#6e69d8", "#8b7bff", "#f0a35e", "#50c9a9"][index],
  })).filter((item) => item.value > 0);
  const monthlyData = [
    { month: "Jun", tasks: 26 }, { month: "Jul", tasks: 34 }, { month: "Aug", tasks: 30 },
    { month: "Sep", tasks: 42 }, { month: "Oct", tasks: 38 }, { month: "Nov", tasks: Math.max(completedTasks, 8) },
  ];
  return (
    <>
      <PageHeading eyebrow="INSIGHTS" title="Analytics" description="A clearer picture of your progress.">
        <span className="select-button"><CalendarDays size={14} /> Last 30 days</span>
      </PageHeading>
      <div className="stats-grid analytics-stats"><StatCard label="Tasks completed" value={completedTasks.toString()} note="vs. last 30 days" icon={CheckCircle2} color="green" trend="+18%" /><StatCard label="Completion rate" value={`${tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0}%`} note="Across all tasks" icon={Target} color="violet" trend="+6.2%" /><StatCard label="Focus hours" value="34.5" note="This month" icon={Clock3} color="blue" trend="+4.1%" /><StatCard label="Team members" value="6" note="Across your workspace" icon={Users} color="orange" trend="Active" /></div>
      <div className="analytics-grid">
        <section className="panel analytics-wide"><div className="panel-heading"><div><h2>Weekly productivity</h2><p>Tasks completed compared to your plan</p></div><span className="chart-subtitle">This week</span></div><div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weeklyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b7bff" stopOpacity={0.26} /><stop offset="100%" stopColor="#8b7bff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} /><Area type="monotone" dataKey="planned" name="Planned" stroke="#54d6b1" strokeDasharray="4 4" strokeWidth={1.5} fill="transparent" /><Area type="monotone" dataKey="completed" name="Completed" stroke="#9385ff" strokeWidth={2.5} fill="url(#analyticsGradient)" /></AreaChart></ResponsiveContainer></div></section>
        <section className="panel distribution-panel"><div className="panel-heading"><div><h2>Task distribution</h2><p>Current status breakdown</p></div></div><div className="distribution-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={72} paddingAngle={4} stroke="none">{distribution.map((item) => <Cell fill={item.color} key={item.name} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{tasks.length}</strong><small>Total tasks</small></div></div><div className="distribution-legend">{taskStatuses.map((status, index) => <div key={status}><span><i style={{ background: ["#6e69d8", "#8b7bff", "#f0a35e", "#50c9a9"][index] }} />{status}</span><strong>{tasks.filter((task) => task.status === status).length}</strong></div>)}</div></div></section>
        <section className="panel monthly-panel"><div className="panel-heading"><div><h2>Monthly task completion</h2><p>Tasks wrapped up over time</p></div><span className="chart-subtitle">Last 6 months</span></div><div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}><defs><linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54d6b1" stopOpacity={0.2} /><stop offset="100%" stopColor="#54d6b1" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} /><Area type="monotone" dataKey="tasks" name="Completed tasks" stroke="#54d6b1" strokeWidth={2.5} fill="url(#monthlyGradient)" /></AreaChart></ResponsiveContainer></div></section>
        <section className="panel project-progress-panel"><div className="panel-heading"><div><h2>Project progress</h2><p>Completion across active projects</p></div></div>{projects.length ? <div className="project-analytics-list">{projects.map((project) => { const projectTasks = tasks.filter((task) => task.project === project.name); const done = projectTasks.filter((task) => task.status === "Completed").length; const progress = projectTasks.length ? Math.round(done / projectTasks.length * 100) : 0; return <div className="project-analytics-row" key={project.id}><span className="analytics-project-icon" style={{ color: project.color, background: `${project.color}20` }}><FolderKanban size={15} /></span><span className="analytics-project-copy"><strong>{project.name}</strong><small>{done} of {projectTasks.length} tasks</small></span><div className="analytics-progress"><span style={{ width: `${progress}%`, background: project.color }} /></div><strong className="analytics-percent">{progress}%</strong></div>; })}</div> : <EmptyState title="No projects yet" description="Create projects to see progress here." />}</section>
      </div>
    </>
  );
}

function SettingsPage({ settings, theme, onSettingsChange, onThemeChange }: { settings: UserSettings; theme: "dark" | "light"; onSettingsChange: (settings: UserSettings) => void; onThemeChange: (theme: "dark" | "light") => void }) {
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<UserSettings>) => { onSettingsChange({ ...settings, ...patch }); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  return (
    <>
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="Make Nexora feel like your own." />
      <div className="settings-layout">
        <nav aria-label="Settings sections" className="settings-nav"><a className="settings-nav-active" href="#profile"><Users size={16} /> Profile</a><a href="#appearance"><Sun size={16} /> Appearance</a><a href="#notifications"><Bell size={16} /> Notifications</a><a href="#account"><Settings size={16} /> Account</a></nav>
        <div className="settings-sections">
          <section className="panel settings-card" id="profile"><div className="settings-section-heading"><div><h2>Profile</h2><p>Update your personal details.</p></div></div><div className="profile-edit-row"><span className="profile-edit-avatar">{initials(settings.name)}</span><div><strong>Profile photo</strong><small>Initials are shown in this workspace.</small></div></div><div className="form-grid"><label className="form-field"><span>Full name</span><input onChange={(event) => update({ name: event.target.value })} value={settings.name} /></label><label className="form-field"><span>Email address</span><input onChange={(event) => update({ email: event.target.value })} type="email" value={settings.email} /></label></div></section>
          <section className="panel settings-card" id="appearance"><div className="settings-section-heading"><div><h2>Appearance</h2><p>Choose the look that works best for you.</p></div></div><div className="appearance-options"><button className={`appearance-choice ${theme === "dark" ? "appearance-selected" : ""}`} onClick={() => onThemeChange("dark")}><span className="theme-preview dark-preview"><i /><i /><i /></span><span><strong>Dark</strong><small>Easy on the eyes</small></span>{theme === "dark" && <CheckCircle2 size={17} />}</button><button className={`appearance-choice ${theme === "light" ? "appearance-selected" : ""}`} onClick={() => onThemeChange("light")}><span className="theme-preview light-preview"><i /><i /><i /></span><span><strong>Light</strong><small>Bright and focused</small></span>{theme === "light" && <CheckCircle2 size={17} />}</button></div></section>
          <section className="panel settings-card" id="notifications"><div className="settings-section-heading"><div><h2>Notifications</h2><p>Stay in the loop, without the noise.</p></div></div><ToggleSetting title="Task reminders" description="Get a reminder when a task is coming up." checked={settings.taskReminders} onChange={(checked) => update({ taskReminders: checked })} /><ToggleSetting title="Weekly summary" description="A Monday recap of your team's progress." checked={settings.weeklySummary} onChange={(checked) => update({ weeklySummary: checked })} /></section>
          <section className="panel settings-card" id="account"><div className="settings-section-heading"><div><h2>Account</h2><p>Manage your workspace preferences.</p></div></div><div className="account-row"><span><strong>Workspace</strong><small>Northstar Studio · Free plan</small></span><span className="account-plan">Personal workspace</span></div></section>
          <div className="settings-save-row"><span>{saved ? <><CheckCircle2 size={15} /> Changes saved automatically</> : "Your preferences are saved on this device."}</span></div>
        </div>
      </div>
    </>
  );
}

function ToggleSetting({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="toggle-setting"><span><strong>{title}</strong><small>{description}</small></span><button aria-checked={checked} aria-label={`${title} ${checked ? "on" : "off"}`} className={`toggle-switch ${checked ? "toggle-on" : ""}`} onClick={() => onChange(!checked)} role="switch"><i /></button></div>;
}

function TaskForm({ initialTask, initialStatus, projects, onSave, onClose }: { initialTask: Task | null; initialStatus: TaskStatus; projects: Project[]; onSave: (task: Task) => void; onClose: () => void }) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? initialStatus);
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? "Medium");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? dateOffset(1));
  const [project, setProject] = useState(initialTask?.project ?? projects[0]?.name ?? "");
  const [assignee, setAssignee] = useState(initialTask?.assignee ?? "AM");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { setError("Give your task a title before saving."); return; }
    onSave({ id: initialTask?.id ?? crypto.randomUUID(), title: title.trim(), description: description.trim(), status, priority, dueDate, project, assignee });
  };
  return <Modal onClose={onClose} title={initialTask ? "Edit task" : "Create a task"}><form className="modal-form" onSubmit={submit}><label className="form-field"><span>Task name</span><input autoFocus onChange={(event) => { setTitle(event.target.value); setError(""); }} placeholder="What needs to get done?" value={title} /></label><label className="form-field"><span>Description <small>Optional</small></span><textarea onChange={(event) => setDescription(event.target.value)} placeholder="Add a few details..." rows={3} value={description} /></label><div className="form-grid"><label className="form-field"><span>Status</span><select onChange={(event) => setStatus(event.target.value as TaskStatus)} value={status}>{taskStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Priority</span><select onChange={(event) => setPriority(event.target.value as Priority)} value={priority}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Due date</span><input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label><label className="form-field"><span>Project</span><select onChange={(event) => setProject(event.target.value)} value={project}>{projects.length ? projects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>) : <option value="Personal">Personal</option>}</select></label><label className="form-field"><span>Assignee initials</span><input maxLength={3} onChange={(event) => setAssignee(event.target.value.toUpperCase())} value={assignee} /></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="primary-button" type="submit">{initialTask ? "Save changes" : "Create task"}</button></div></form></Modal>;
}

function ProjectForm({ initialProject, onSave, onClose }: { initialProject: Project | null; onSave: (project: Project) => void; onClose: () => void }) {
  const [name, setName] = useState(initialProject?.name ?? "");
  const [description, setDescription] = useState(initialProject?.description ?? "");
  const [deadline, setDeadline] = useState(initialProject?.deadline ?? dateOffset(14));
  const [status, setStatus] = useState<Project["status"]>(initialProject?.status ?? "On track");
  const [members, setMembers] = useState(initialProject?.members.join(", ") ?? "AM, JL");
  const [color, setColor] = useState(initialProject?.color ?? projectColors[0]);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError("Add a project name before saving."); return; }
    onSave({ id: initialProject?.id ?? crypto.randomUUID(), name: name.trim(), description: description.trim(), deadline, status, color, members: members.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean) });
  };
  return <Modal onClose={onClose} title={initialProject ? "Edit project" : "Create a project"}><form className="modal-form" onSubmit={submit}><label className="form-field"><span>Project name</span><input autoFocus onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Website refresh" value={name} /></label><label className="form-field"><span>Description</span><textarea onChange={(event) => setDescription(event.target.value)} placeholder="What is this project about?" rows={3} value={description} /></label><div className="form-grid"><label className="form-field"><span>Deadline</span><input onChange={(event) => setDeadline(event.target.value)} type="date" value={deadline} /></label><label className="form-field"><span>Status</span><select onChange={(event) => setStatus(event.target.value as Project["status"])} value={status}><option>On track</option><option>At risk</option><option>Completed</option></select></label></div><label className="form-field"><span>Team member initials <small>Comma separated</small></span><input onChange={(event) => setMembers(event.target.value)} placeholder="AM, JL, RK" value={members} /></label><div className="form-field"><span>Project color</span><div className="color-options">{projectColors.map((item) => <button aria-label={`Select color ${item}`} className={`color-choice ${color === item ? "color-selected" : ""}`} key={item} onClick={() => setColor(item)} style={{ background: item }} type="button" />)}</div></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="primary-button" type="submit">{initialProject ? "Save changes" : "Create project"}</button></div></form></Modal>;
}

function EventForm({ onSave, onClose }: { onSave: (event: CalendarEvent) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dateOffset(1));
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState("Meeting");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { setError("Add an event name before saving."); return; }
    const [hour, minute] = time.split(":").map(Number);
    const formattedTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    onSave({ id: crypto.randomUUID(), title: title.trim(), date, time: formattedTime, type });
  };
  return <Modal onClose={onClose} title="Add an event"><form className="modal-form" onSubmit={submit}><label className="form-field"><span>Event name</span><input autoFocus onChange={(event) => { setTitle(event.target.value); setError(""); }} placeholder="e.g. Team sync" value={title} /></label><div className="form-grid"><label className="form-field"><span>Date</span><input onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label><label className="form-field"><span>Time</span><input onChange={(event) => setTime(event.target.value)} type="time" value={time} /></label><label className="form-field"><span>Event type</span><select onChange={(event) => setType(event.target.value)} value={type}><option>Meeting</option><option>Review</option><option>Focus</option><option>Personal</option></select></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="primary-button" type="submit">Add event</button></div></form></Modal>;
}
