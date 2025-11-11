"use client";

import React, { useState, useEffect } from "react";
import {
  Control,
  ImplementationStatus,
  loadControls,
  saveControls,
  addControl,
  updateControl,
  deleteControl,
  getImplementationStats,
  getOverdueControls,
} from "@/lib/controlsStore";
import { loadUsers, User } from "@/lib/usersStore";
import { loadTreatments, Treatment } from "@/lib/treatmentsStore";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, Plus, Trash2, Edit2, AlertTriangle } from "lucide-react";

type Status = ImplementationStatus;

export default function DaftarKontrolPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [stats, setStats] = useState<ReturnType<typeof getImplementationStats> | null>(null);
  const [overdue, setOverdue] = useState<Control[]>([]);

  const [form, setForm] = useState<Partial<Control>>({
    name: "",
    description: "",
    treatmentId: undefined,
    owner: undefined,
    targetDate: "",
    implementationStatus: "PLANNED",
    evidence: [],
    effectivenessRating: undefined,
    remarks: "",
  });

  useEffect(() => {
    setControls(loadControls());
    setUsers(loadUsers());
    setTreatments(loadTreatments());
    setStats(getImplementationStats());
    setOverdue(getOverdueControls());
  }, []);

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert("Nama kontrol tidak boleh kosong");
      return;
    }

    if (editingId) {
      const updated = updateControl(editingId, form);
      if (updated) {
        const newControls = loadControls();
        setControls(newControls);
        setStats(getImplementationStats());
      }
    } else {
      const newControl = addControl(form as Omit<Control, "id" | "createdAt" | "updatedAt">);
      if (newControl) {
        const newControls = loadControls();
        setControls(newControls);
        setStats(getImplementationStats());
      }
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (control: Control) => {
    setForm(control);
    setEditingId(control.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus kontrol ini?")) {
      deleteControl(id);
      const newControls = loadControls();
      setControls(newControls);
      setStats(getImplementationStats());
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      treatmentId: undefined,
      owner: undefined,
      targetDate: "",
      implementationStatus: "PLANNED",
      evidence: [],
      effectivenessRating: undefined,
      remarks: "",
    });
    setEditingId(null);
  };

  const filteredControls =
    filter === "ALL" ? controls : controls.filter((c) => c.implementationStatus === filter);

  const statusColors: Record<Status, string> = {
    PLANNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    IMPLEMENTED: "bg-green-100 text-green-800",
    TESTING: "bg-purple-100 text-purple-800",
    VERIFIED: "bg-emerald-100 text-emerald-800",
  };

  const statusIcons: Record<Status, React.ReactNode> = {
    PLANNED: <Clock className="w-4 h-4" />,
    IN_PROGRESS: <AlertCircle className="w-4 h-4" />,
    IMPLEMENTED: <CheckCircle2 className="w-4 h-4" />,
    TESTING: <AlertTriangle className="w-4 h-4" />,
    VERIFIED: <CheckCircle2 className="w-4 h-4" />,
  };

  const getOwnerName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u) => u.id === userId);
    return user?.name || userId;
  };

  const getTreatmentName = (treatmentId?: string) => {
    if (!treatmentId) return "-";
    const treatment = treatments.find((t) => t.id === treatmentId);
    return treatment?.id || treatmentId;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daftar Kontrol</h1>
          <p className="text-gray-600 mt-1">Kelola implementasi kontrol dan tindakan mitigasi risiko</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Kontrol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Kontrol" : "Tambah Kontrol Baru"}</DialogTitle>
              <DialogDescription>
                Kelola detail kontrol dan progress implementasi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Kontrol *</Label>
                  <Input
                    id="name"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Misal: Backup Otomatis"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status Implementasi</Label>
                  <Select
                    value={form.implementationStatus || "PLANNED"}
                    onValueChange={(value) =>
                      setForm({ ...form, implementationStatus: value as Status })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Direncanakan</SelectItem>
                      <SelectItem value="IN_PROGRESS">Sedang Berjalan</SelectItem>
                      <SelectItem value="IMPLEMENTED">Terimplementasi</SelectItem>
                      <SelectItem value="TESTING">Testing</SelectItem>
                      <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detail implementasi kontrol"
                    className="h-20 align-top"
                  />
                </div>

                <div>
                  <Label htmlFor="treatment">Terkait Treatment</Label>
                  <Select
                    value={form.treatmentId || "NONE"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        treatmentId: value === "NONE" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Tidak ada</SelectItem>
                      {treatments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="owner">Pemilik Implementasi</Label>
                  <Select
                    value={form.owner || "NONE"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        owner: value === "NONE" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Belum ditentukan</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Tanggal Implementasi</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={form.targetDate || ""}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating Efektivitas (1-5)</Label>
                  <Select
                    value={String(form.effectivenessRating || "NONE")}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        effectivenessRating: value === "NONE" ? undefined : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Belum dinilai</SelectItem>
                      <SelectItem value="1">1 - Sangat Lemah</SelectItem>
                      <SelectItem value="2">2 - Lemah</SelectItem>
                      <SelectItem value="3">3 - Cukup</SelectItem>
                      <SelectItem value="4">4 - Baik</SelectItem>
                      <SelectItem value="5">5 - Sangat Baik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="remarks">Catatan / Remarks</Label>
                  <Input
                    id="remarks"
                    value={form.remarks || ""}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Catatan tambahan mengenai implementasi"
                    className="h-20 align-top"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="evidence">Evidence / Bukti (comma-separated)</Label>
                  <Input
                    id="evidence"
                    value={(form.evidence || []).join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        evidence: e.target.value.split(",").map((v) => v.trim()),
                      })
                    }
                    placeholder="Misal: backup_log.txt, test_restore_20250110.log"
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Kontrol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.progressPercentage || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Terverifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.verified || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sedang Berjalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(stats?.inProgress || 0) + (stats?.testing || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Efektivitas Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgEffectiveness || 0}/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Warning */}
      {overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Kontrol Overdue ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdue.map((c) => (
                <div key={c.id} className="text-sm text-red-700">
                  • <strong>{c.id}</strong> - {c.name} (Target: {c.targetDate})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PLANNED", "IN_PROGRESS", "IMPLEMENTED", "TESTING", "VERIFIED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s as Status | "ALL")}
            className="text-sm"
          >
            {s === "ALL"
              ? "Semua"
              : s === "PLANNED"
                ? "Direncanakan"
                : s === "IN_PROGRESS"
                  ? "Berjalan"
                  : s === "IMPLEMENTED"
                    ? "Implementasi"
                    : s === "TESTING"
                      ? "Testing"
                      : "Terverifikasi"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kontrol ({filteredControls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Kontrol</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Pemilik</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Efektivitas</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-semibold">{control.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{control.name}</div>
                          {control.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {control.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{getTreatmentName(control.treatmentId)}</TableCell>
                      <TableCell className="text-sm">{getOwnerName(control.owner)}</TableCell>
                      <TableCell className="text-sm">
                        {control.targetDate
                          ? new Date(control.targetDate).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[control.implementationStatus]}`}>
                          {statusIcons[control.implementationStatus]}
                          {control.implementationStatus === "PLANNED"
                            ? "Direncanakan"
                            : control.implementationStatus === "IN_PROGRESS"
                              ? "Berjalan"
                              : control.implementationStatus === "IMPLEMENTED"
                                ? "Implementasi"
                                : control.implementationStatus === "TESTING"
                                  ? "Testing"
                                  : "Terverifikasi"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {control.effectivenessRating
                          ? `${control.effectivenessRating}/5 ⭐`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(control)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(control.id)}
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
