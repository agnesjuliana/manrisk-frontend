/**
 * Tasks Store
 * Manages monitoring & review tasks for control implementation tracking
 * ISO 27005 Phase 10: Monitoring, Measurement, Analysis & Evaluation
 */

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Task = {
  id: string; // TASK001, TASK002, etc.
  title: string;
  description?: string;
  taskType: "CONTROL_VERIFICATION" | "RISK_REVIEW" | "REMEDIATION" | "AUDIT" | "OTHER";
  linkedControlId?: string; // Link to control being tracked
  linkedRiskId?: string; // Link to risk being monitored
  assignedTo?: string; // User ID
  dueDate: string; // ISO date string
  status: TaskStatus;
  priority: TaskPriority;
  completionDate?: string;
  notes?: string;
  evidence?: string[]; // Files/references
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "isms:tasks:v1";

// Mock tasks for monitoring & review
const DEFAULT_TASKS: Task[] = [
  {
    id: "TASK001",
    title: "Verifikasi Implementasi Backup Otomatis",
    description: "Verify C001 backup control is working as designed",
    taskType: "CONTROL_VERIFICATION",
    linkedControlId: "C001",
    assignedTo: "u-2",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    status: "OPEN",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK002",
    title: "Review Quarterly Risk Assessment",
    description: "Conduct quarterly risk review for Q4 2025",
    taskType: "RISK_REVIEW",
    assignedTo: "u-1",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    status: "OPEN",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK003",
    title: "Test Disaster Recovery Plan",
    description: "Execute DR plan test and document results",
    taskType: "CONTROL_VERIFICATION",
    linkedControlId: "C005",
    assignedTo: "u-2",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    notes: "Scheduled for November 20, 2025",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK004",
    title: "Update Security Awareness Training Records",
    description: "Collect & update training completion data",
    taskType: "REMEDIATION",
    assignedTo: "u-3",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    status: "OPEN",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK005",
    title: "Annual Internal Audit - Security Controls",
    description: "Conduct internal audit of security controls effectiveness",
    taskType: "AUDIT",
    assignedTo: "u-1",
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
    status: "OPEN",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK006",
    title: "Remediate Access Control Gaps",
    description: "Fix identified gaps in RBAC implementation",
    taskType: "REMEDIATION",
    linkedRiskId: "R004",
    assignedTo: "u-2",
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days
    status: "IN_PROGRESS",
    priority: "HIGH",
    notes: "35% complete - waiting for infrastructure team",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Load all tasks from localStorage
 */
export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }

  // Return default tasks on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
  return DEFAULT_TASKS;
}

/**
 * Save tasks to localStorage
 */
export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

/**
 * Get next task ID
 */
export function nextTaskId(): string {
  const tasks = loadTasks();
  if (tasks.length === 0) return "TASK001";

  const ids = tasks.map((t) => parseInt(t.id.replace(/^TASK/, ""), 10));
  const maxId = Math.max(...ids);
  return `TASK${String(maxId + 1).padStart(3, "0")}`;
}

/**
 * Add a new task
 */
export function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const tasks = loadTasks();
  const newTask: Task = {
    ...task,
    id: nextTaskId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

/**
 * Update an existing task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const updated: Task = {
    ...tasks[index],
    ...updates,
    id: tasks[index].id,
    createdAt: tasks[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  saveTasks(tasks);
  return updated;
}

/**
 * Delete a task
 */
export function deleteTask(id: string): boolean {
  const tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length === tasks.length) return false;

  saveTasks(filtered);
  return true;
}

/**
 * Get task by ID
 */
export function getTask(id: string): Task | null {
  const tasks = loadTasks();
  return tasks.find((t) => t.id === id) || null;
}

/**
 * Get tasks by status
 */
export function getTasksByStatus(status: TaskStatus): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.status === status);
}

/**
 * Get tasks by owner
 */
export function getTasksByOwner(userId: string): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.assignedTo === userId);
}

/**
 * Get tasks by priority
 */
export function getTasksByPriority(priority: TaskPriority): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.priority === priority);
}

/**
 * Get tasks by type
 */
export function getTasksByType(type: Task["taskType"]): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.taskType === type);
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(): Task[] {
  const tasks = loadTasks();
  const now = new Date();

  return tasks.filter((t) => {
    if (["COMPLETED", "CANCELLED"].includes(t.status)) return false;
    return new Date(t.dueDate) < now;
  });
}

/**
 * Get due soon tasks (within 7 days)
 */
export function getDueSoonTasks(): Task[] {
  const tasks = loadTasks();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return tasks.filter((t) => {
    if (["COMPLETED", "CANCELLED"].includes(t.status)) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= sevenDaysFromNow;
  });
}

/**
 * Calculate task statistics
 */
export function getTaskStats() {
  const tasks = loadTasks();

  const total = tasks.length;
  const open = tasks.filter((t) => t.status === "OPEN").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = tasks.filter((t) => t.status === "OVERDUE").length;
  const cancelled = tasks.filter((t) => t.status === "CANCELLED").length;

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const activeTasks = open + inProgress;

  const criticalCount = tasks.filter(
    (t) => t.priority === "CRITICAL" && !["COMPLETED", "CANCELLED"].includes(t.status)
  ).length;

  return {
    total,
    open,
    inProgress,
    completed,
    overdue,
    cancelled,
    activeTasks,
    completionRate,
    criticalCount,
  };
}

/**
 * Get tasks by control linked
 */
export function getTasksByControlId(controlId: string): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.linkedControlId === controlId);
}

/**
 * Get tasks by risk linked
 */
export function getTasksByRiskId(riskId: string): Task[] {
  const tasks = loadTasks();
  return tasks.filter((t) => t.linkedRiskId === riskId);
}

/**
 * Bulk update task status
 */
export function bulkUpdateTaskStatus(ids: string[], status: TaskStatus): number {
  const tasks = loadTasks();
  let updateCount = 0;

  for (const id of ids) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index].status = status;
      tasks[index].updatedAt = new Date().toISOString();
      if (status === "COMPLETED" && !tasks[index].completionDate) {
        tasks[index].completionDate = new Date().toISOString();
      }
      updateCount++;
    }
  }

  if (updateCount > 0) {
    saveTasks(tasks);
  }

  return updateCount;
}
