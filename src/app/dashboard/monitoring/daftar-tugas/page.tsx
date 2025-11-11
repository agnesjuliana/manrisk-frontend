"use client";

import React, { useState, useEffect } from "react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  loadTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getOverdueTasks,
  getDueSoonTasks,
} from "@/lib/tasksStore";
import { loadUsers, User } from "@/lib/usersStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function DaftarTugasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "ALL">("ALL");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterOwner, setFilterOwner] = useState<string>("ALL");
  const [stats, setStats] = useState<ReturnType<typeof getTaskStats> | null>(null);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [dueSoon, setDueSoon] = useState<Task[]>([]);

  const [form, setForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    taskType: "OTHER",
    linkedControlId: undefined,
    linkedRiskId: undefined,
    assignedTo: undefined,
    dueDate: "",
    status: "OPEN",
    priority: "MEDIUM",
    notes: "",
    evidence: [],
  });

  useEffect(() => {
    setTasks(loadTasks());
    setUsers(loadUsers());
    setStats(getTaskStats());
    setOverdue(getOverdueTasks());
    setDueSoon(getDueSoonTasks());
  }, []);

  const handleSave = () => {
    if (!form.title?.trim()) {
      alert("Judul tugas tidak boleh kosong");
      return;
    }

    if (!form.dueDate) {
      alert("Due date tidak boleh kosong");
      return;
    }

    if (editingId) {
      const updated = updateTask(editingId, form);
      if (updated) {
        const newTasks = loadTasks();
        setTasks(newTasks);
        setStats(getTaskStats());
      }
    } else {
      const newTask = addTask(form as Omit<Task, "id" | "createdAt" | "updatedAt">);
      if (newTask) {
        const newTasks = loadTasks();
        setTasks(newTasks);
        setStats(getTaskStats());
      }
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (task: Task) => {
    setForm(task);
    setEditingId(task.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus tugas ini?")) {
      deleteTask(id);
      const newTasks = loadTasks();
      setTasks(newTasks);
      setStats(getTaskStats());
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      taskType: "OTHER",
      linkedControlId: undefined,
      linkedRiskId: undefined,
      assignedTo: undefined,
      dueDate: "",
      status: "OPEN",
      priority: "MEDIUM",
      notes: "",
      evidence: [],
    });
    setEditingId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "ALL" || task.status === filterStatus;
    const priorityMatch = filterPriority === "ALL" || task.priority === filterPriority;
    const ownerMatch = filterOwner === "ALL" || task.assignedTo === filterOwner;
    return statusMatch && priorityMatch && ownerMatch;
  });

  const statusColors: Record<TaskStatus, string> = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<TaskPriority, string> = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  const priorityIcons: Record<TaskPriority, React.ReactNode> = {
    LOW: <Clock className="w-4 h-4" />,
    MEDIUM: <AlertCircle className="w-4 h-4" />,
    HIGH: <AlertTriangle className="w-4 h-4" />,
    CRITICAL: <Zap className="w-4 h-4" />,
  };

  const getOwnerName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u) => u.id === userId);
    return user?.name || userId;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "OVERDUE":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daftar Tugas</h1>
          <p className="text-gray-600 mt-1">Kelola tugas monitoring, review, dan remediation</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Tugas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Tugas" : "Tambah Tugas Baru"}</DialogTitle>
              <DialogDescription>
                Buat tugas untuk monitoring, review, atau remediation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Judul Tugas *</Label>
                  <Input
                    id="title"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Misal: Verifikasi Backup Control"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipe Tugas</Label>
                  <Select
                    value={form.taskType || "OTHER"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        taskType: value as Task["taskType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTROL_VERIFICATION">Verifikasi Kontrol</SelectItem>
                      <SelectItem value="RISK_REVIEW">Review Risiko</SelectItem>
                      <SelectItem value="REMEDIATION">Remediasi</SelectItem>
                      <SelectItem value="AUDIT">Audit</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status || "OPEN"}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value as TaskStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Terbuka</SelectItem>
                      <SelectItem value="IN_PROGRESS">Sedang Berjalan</SelectItem>
                      <SelectItem value="COMPLETED">Selesai</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioritas</Label>
                  <Select
                    value={form.priority || "MEDIUM"}
                    onValueChange={(value) =>
                      setForm({ ...form, priority: value as TaskPriority })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Rendah</SelectItem>
                      <SelectItem value="MEDIUM">Sedang</SelectItem>
                      <SelectItem value="HIGH">Tinggi</SelectItem>
                      <SelectItem value="CRITICAL">Kritis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detail tugas yang akan dikerjakan"
                    className="h-20 align-top"
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate || ""}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="owner">Assigned To</Label>
                  <Select
                    value={form.assignedTo || "NONE"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        assignedTo: value === "NONE" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Belum ditugaskan</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Input
                    id="notes"
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Catatan tambahan"
                    className="h-16 align-top"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>{editingId ? "Update" : "Simpan"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tugas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.activeTasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.completionRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kritis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.criticalCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Tugas Overdue ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdue.map((t) => (
                <div key={t.id} className="text-sm text-red-700">
                  • <strong>{t.id}</strong> - {t.title} (Due: {new Date(t.dueDate).toLocaleDateString("id-ID")})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dueSoon.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Due Soon - Dalam 7 Hari ({dueSoon.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueSoon.map((t) => (
                <div key={t.id} className="text-sm text-yellow-700">
                  • <strong>{t.id}</strong> - {t.title} (Due: {new Date(t.dueDate).toLocaleDateString("id-ID")})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === "ALL" ? "default" : "outline"}
          onClick={() => setFilterStatus("ALL")}
          className="text-sm"
        >
          Semua
        </Button>
        {(["OPEN", "IN_PROGRESS", "COMPLETED", "OVERDUE"] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status)}
            className="text-sm"
          >
            {status === "OPEN"
              ? "Terbuka"
              : status === "IN_PROGRESS"
                ? "Berjalan"
                : status === "COMPLETED"
                  ? "Selesai"
                  : "Overdue"}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Label className="text-sm font-semibold">Prioritas:</Label>
        <Button
          variant={filterPriority === "ALL" ? "default" : "outline"}
          onClick={() => setFilterPriority("ALL")}
          className="text-sm"
        >
          Semua
        </Button>
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => (
          <Button
            key={priority}
            variant={filterPriority === priority ? "default" : "outline"}
            onClick={() => setFilterPriority(priority)}
            className="text-sm"
          >
            {priority === "CRITICAL"
              ? "🔴 Kritis"
              : priority === "HIGH"
                ? "🟠 Tinggi"
                : priority === "MEDIUM"
                  ? "🟡 Sedang"
                  : "🟢 Rendah"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                      Tidak ada tugas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-semibold">{task.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.taskType === "CONTROL_VERIFICATION"
                          ? "Verifikasi"
                          : task.taskType === "RISK_REVIEW"
                            ? "Review"
                            : task.taskType === "REMEDIATION"
                              ? "Remediasi"
                              : task.taskType === "AUDIT"
                                ? "Audit"
                                : "Lainnya"}
                      </TableCell>
                      <TableCell className="text-sm">{getOwnerName(task.assignedTo)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                          {getStatusIcon(task.status)}
                          {task.status === "OPEN"
                            ? "Terbuka"
                            : task.status === "IN_PROGRESS"
                              ? "Berjalan"
                              : task.status === "COMPLETED"
                                ? "Selesai"
                                : task.status === "OVERDUE"
                                  ? "Overdue"
                                  : "Dibatalkan"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                          {priorityIcons[task.priority]}
                          {task.priority === "CRITICAL"
                            ? "Kritis"
                            : task.priority === "HIGH"
                              ? "Tinggi"
                              : task.priority === "MEDIUM"
                                ? "Sedang"
                                : "Rendah"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
