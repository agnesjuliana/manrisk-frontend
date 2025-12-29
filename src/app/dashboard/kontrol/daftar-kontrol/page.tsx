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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ControlStatistics {
  totalAnnexControl: number;
  totalAnnexControlAssessed: number;
  totalAddedControl: number;
  totalAddedControlAssessed: number;
  totalUnassessed: number;
}

interface SOA {
  id: string;
  organizationId: string;
  controlId: string;
  managerId: string;
  status: "RELEVAN" | "TIDAK_RELEVAN";
  notes?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ControlResponse {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  isAnnex: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  countRelatedTreatment: number;
  soa?: SOA;
}

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
  const [controls, setControls] = useState<ControlResponse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RelevanceStatus | "ALL">("ALL");
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<ControlStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingControls, setLoadingControls] = useState(false);

  const [form, setForm] = useState({
    code: "",
    category: "",
    title: "",
    description: "",
    isAnnex: false,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const getHeaders = (): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  };

  // Fetch statistics from API
  useEffect(() => {
    if (!token) return;

    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch(`${API_BASE_URL}/controls/statistics`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, [token]);

  // Fetch controls from API
  useEffect(() => {
    if (!token) return;

    const fetchControls = async () => {
      try {
        setLoadingControls(true);
        const response = await fetch(`${API_BASE_URL}/controls?search=&is_annex=`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data) {
          setControls(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch controls:", error);
      } finally {
        setLoadingControls(false);
      }
    };

    fetchControls();
  }, [token]);

  useEffect(() => {
    setUsers(loadUsers());
    setTreatments(loadTreatments());
  }, []);

  const handleSave = () => {
    if (!form.code?.trim()) {
      alert("Kode kontrol tidak boleh kosong");
      return;
    }
    if (!form.title?.trim()) {
      alert("Nama kontrol tidak boleh kosong");
      return;
    }
    if (!token) return;

    const payload = {
      code: form.code,
      category: form.category,
      title: form.title,
      description: form.description,
      isAnnex: form.isAnnex,
    };

    const saveControl = async () => {
      try {
        const url = editingId
          ? `${API_BASE_URL}/controls/${editingId}`
          : `${API_BASE_URL}/controls`;

        const response = await fetch(url, {
          method: editingId ? "PATCH" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status) {
          // Refresh controls list
          const controlsResponse = await fetch(
            `${API_BASE_URL}/controls?search=&is_annex=`,
            { headers: getHeaders() }
          );
          const controlsResult = await controlsResponse.json();
          if (controlsResult.status && controlsResult.data) {
            setControls(controlsResult.data);
          }

          resetForm();
          setIsOpen(false);
        } else {
          alert(result.message || "Gagal menyimpan kontrol");
        }
      } catch (error) {
        console.error("Failed to save control:", error);
        alert("Gagal menyimpan kontrol");
      }
    };

    saveControl();
  };

  const handleEdit = (control: ControlResponse) => {
    setForm({
      code: control.code,
      category: control.category,
      title: control.title,
      description: control.description,
      isAnnex: control.isAnnex,
    });
    setEditingId(control.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus kontrol ini?")) {
      // TODO: Implement API delete functionality
      // deleteControl(id);
      // const newControls = loadControls();
      // setControls(newControls);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      category: "",
      title: "",
      description: "",
      isAnnex: false,
    });
    setEditingId(null);
  };

  const filteredControls = (() => {
    if (filter === "ALL") {
      return controls;
    }
    
    return controls.filter((c) => {
      if (filter === "BELUM_DITENTUKAN") {
        return !c.soa; // No SOA means not yet determined
      } else if (filter === "RELEVAN") {
        return c.soa && c.soa.status === "RELEVAN";
      } else if (filter === "TIDAK_RELEVAN") {
        return c.soa && c.soa.status === "TIDAK_RELEVAN";
      }
      return true;
    });
  })();

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

  const getTreatmentName = (countRelatedTreatment?: number) => {
    if (!countRelatedTreatment || countRelatedTreatment === 0) return "-";
    return `${countRelatedTreatment} Treatment${countRelatedTreatment > 1 ? "s" : ""}`;
  };

  const getRelevanceStatus = (soa?: SOA): RelevanceStatus => {
    if (!soa) return "BELUM_DITENTUKAN";
    if (soa.status === "RELEVAN") return "RELEVAN";
    return "TIDAK_RELEVAN";
  };

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Kode Kontrol *</Label>
                  <Input
                    id="code"
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Misal: 8.17, A1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Input
                    id="category"
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Misal: Technological Controls"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="title">Nama Kontrol *</Label>
                  <Input
                    id="title"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Misal: Clock synchronization"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <textarea
                    id="description"
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Detail deskripsi kontrol..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
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
        {loadingStats ? (
          <div className="col-span-5 text-center py-8 text-gray-500">Loading statistics...</div>
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Control Annex
                </CardTitle>
                <CardDescription className="text-xs">ISO 27001</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalAnnexControl}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Annex Dinilai
                </CardTitle>
                <CardDescription className="text-xs">Sudah Assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalAnnexControlAssessed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Control Tambahan
                </CardTitle>
                <CardDescription className="text-xs">Organisasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAddedControl}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tambahan Dinilai
                </CardTitle>
                <CardDescription className="text-xs">Sudah Assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAddedControlAssessed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Belum Dinilai
                </CardTitle>
                <CardDescription className="text-xs">Unassessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalUnassessed}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-5 text-center py-8 text-gray-500">No statistics available</div>
        )}
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
          {loadingControls ? (
            <div className="text-center py-8 text-gray-500">Loading controls...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Kontrol</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Terkait Treatment</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredControls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 py-4"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredControls.map((control) => {
                      const relevanceStatus = getRelevanceStatus(control.soa);
                      return (
                        <TableRow key={control.id}>
                          <TableCell className="font-semibold text-sm">
                            {control.code}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{truncateText(control.title, 50)}</div>
                              {control.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {truncateText(control.description, 80)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {control.category || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getTreatmentName(control.countRelatedTreatment)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {control.soa?.targetDate
                              ? new Date(control.soa.targetDate).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[relevanceStatus]
                              }`}
                            >
                              {statusIcons[relevanceStatus]}
                              {relevanceStatus === "RELEVAN"
                                ? "Relevan"
                                : relevanceStatus === "TIDAK_RELEVAN"
                                ? "Tidak Relevan"
                                : "Belum Ditentukan"}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {control.soa?.notes ? (
                              <span className="line-clamp-2">{control.soa.notes}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
