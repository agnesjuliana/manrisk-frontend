"use client";

import React, { useState, useEffect } from "react";
import {
  Control,
  loadControls,
  saveControls,
  addControl,
  updateControl,
  deleteControl,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  X,
} from "lucide-react";

type RelevanceStatus = "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN";

export default function DaftarKontrolPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RelevanceStatus | "ALL">("ALL");

  const [form, setForm] = useState<Partial<Control>>({
    name: "",
    description: "",
    treatmentId: undefined,
    owner: undefined,
    targetDate: "",
    relevanceStatus: "BELUM_DITENTUKAN",
    evidence: [],
    effectivenessRating: undefined,
    remarks: "",
    isAnnexA: true,
  });

  useEffect(() => {
    setControls(loadControls());
    setUsers(loadUsers());
    setTreatments(loadTreatments());
  }, []);

  // Calculate statistics
  const stats = {
    total: controls.length,
    annexA: controls.filter((c) => c.isAnnexA).length,
    additional: controls.filter((c) => !c.isAnnexA).length,
    relevant: controls.filter((c) => c.relevanceStatus === "RELEVAN").length,
    notYetDetermined: controls.filter(
      (c) => c.relevanceStatus === "BELUM_DITENTUKAN"
    ).length,
  };

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
      }
    } else {
      const newControl = addControl(
        form as Omit<Control, "id" | "createdAt" | "updatedAt">
      );
      if (newControl) {
        const newControls = loadControls();
        setControls(newControls);
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
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      treatmentId: undefined,
      owner: undefined,
      targetDate: "",
      relevanceStatus: "BELUM_DITENTUKAN",
      evidence: [],
      effectivenessRating: undefined,
      remarks: "",
      isAnnexA: true,
    });
    setEditingId(null);
  };

  const filteredControls =
    filter === "ALL"
      ? controls
      : controls.filter((c) => c.relevanceStatus === filter);

  const statusColors: Record<RelevanceStatus, string> = {
    BELUM_DITENTUKAN: "bg-gray-100 text-gray-800",
    RELEVAN: "bg-green-100 text-green-800",
    TIDAK_RELEVAN: "bg-red-100 text-red-800",
  };

  const statusIcons: Record<RelevanceStatus, React.ReactNode> = {
    BELUM_DITENTUKAN: <Clock className="w-4 h-4" />,
    RELEVAN: <CheckCircle2 className="w-4 h-4" />,
    TIDAK_RELEVAN: <X className="w-4 h-4" />,
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
          <h1 className="text-3xl font-bold">Penetapan Relevansi Kontrol</h1>
          <p className="text-gray-600 mt-1">
            Evaluasi dan tentukan relevansi kontrol ISO 27001 Annex A terhadap
            organisasi
          </p>
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
              <DialogTitle>
                {editingId ? "Edit Kontrol" : "Tambah Kontrol Baru"}
              </DialogTitle>
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
                  <Label htmlFor="status">Status Relevansi</Label>
                  <Select
                    value={form.relevanceStatus || "BELUM_DITENTUKAN"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        relevanceStatus: value as RelevanceStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BELUM_DITENTUKAN">
                        Belum Ditentukan
                      </SelectItem>
                      <SelectItem value="RELEVAN">Relevan</SelectItem>
                      <SelectItem value="TIDAK_RELEVAN">
                        Tidak Relevan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="annexA">Tipe Kontrol</Label>
                  <Select
                    value={form.isAnnexA ? "ANNEX_A" : "ADDITIONAL"}
                    onValueChange={(value) =>
                      setForm({ ...form, isAnnexA: value === "ANNEX_A" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNEX_A">
                        Annex A (ISO 27001)
                      </SelectItem>
                      <SelectItem value="ADDITIONAL">
                        Tambahan Organisasi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
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
                  <Label htmlFor="targetDate">
                    Target Tanggal Implementasi
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={form.targetDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, targetDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating Efektivitas (1-5)</Label>
                  <Select
                    value={String(form.effectivenessRating || "NONE")}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        effectivenessRating:
                          value === "NONE" ? undefined : parseInt(value),
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
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                    placeholder="Catatan tambahan mengenai implementasi"
                    className="h-20 align-top"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="evidence">
                    Evidence / Bukti (comma-separated)
                  </Label>
                  <Input
                    id="evidence"
                    value={(form.evidence || []).join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        evidence: e.target.value
                          .split(",")
                          .map((v) => v.trim()),
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
              <Button onClick={handleSave}>
                {editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Kontrol
            </CardTitle>
            <CardDescription className="text-xs">Annex + Org</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kontrol Annex A
            </CardTitle>
            <CardDescription className="text-xs">ISO 27001</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.annexA}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kontrol Tambahan
            </CardTitle>
            <CardDescription className="text-xs">Organisasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.additional}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kontrol Relevan
            </CardTitle>
            <CardDescription className="text-xs">(SOA)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.relevant}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Belum Dievaluasi
            </CardTitle>
            <CardDescription className="text-xs">(SOA)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.notYetDetermined}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Warning */}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "BELUM_DITENTUKAN", "RELEVAN", "TIDAK_RELEVAN"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s as RelevanceStatus | "ALL")}
            className="text-sm"
          >
            {s === "ALL"
              ? "Semua"
              : s === "BELUM_DITENTUKAN"
              ? "Belum Ditentukan"
              : s === "RELEVAN"
              ? "Relevan"
              : "Tidak Relevan"}
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
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-4"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-semibold">
                        {control.id}
                      </TableCell>
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
                      <TableCell className="text-sm">
                        {getTreatmentName(control.treatmentId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getOwnerName(control.owner)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {control.targetDate
                          ? new Date(control.targetDate).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[
                              control.relevanceStatus || "BELUM_DITENTUKAN"
                            ]
                          }`}
                        >
                          {
                            statusIcons[
                              control.relevanceStatus || "BELUM_DITENTUKAN"
                            ]
                          }
                          {control.relevanceStatus === "RELEVAN"
                            ? "Relevan"
                            : control.relevanceStatus === "TIDAK_RELEVAN"
                            ? "Tidak Relevan"
                            : "Belum Ditentukan"}
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
