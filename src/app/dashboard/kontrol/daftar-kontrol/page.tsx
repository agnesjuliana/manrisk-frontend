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
import { useAuth } from "@/hooks/use-auth";

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

interface ControlDetail extends ControlResponse {
  treatments?: TreatmentInControl[];
}

interface TreatmentInControl {
  id: string;
  treatmentOpt: string;
  detailedActionPlan: string;
  startAction: string;
  endAction: string;
  isApprovedByTop: boolean;
  risk?: {
    id: string;
    customRiskId: string;
    identifiedRisk: string;
    impactSeverity: number;
    likelihoodOccurence: number;
    detection: number;
  };
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
  Eye,
} from "lucide-react";

type RelevanceStatus = "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN";

export default function DaftarKontrolPage() {
  const { user } = useAuth();
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
  const [isSoaModalOpen, setIsSoaModalOpen] = useState(false);
  const [selectedControlForSoA, setSelectedControlForSoA] = useState<ControlDetail | null>(null);
  const [loadingControlDetail, setLoadingControlDetail] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [isEditSoaModalOpen, setIsEditSoaModalOpen] = useState(false);
  const [selectedControlForViewDetail, setSelectedControlForViewDetail] = useState<ControlDetail | null>(null);
  const [selectedControlForEditSoA, setSelectedControlForEditSoA] = useState<ControlDetail | null>(null);
  const [editSoaForm, setEditSoaForm] = useState({
    status: "BELUM_DITENTUKAN" as "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN",
    managerId: "",
    targetDate: "",
    notes: "",
  });
  const [soaForm, setSoaForm] = useState({
    status: "BELUM_DITENTUKAN" as "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN",
    managerId: "",
    targetDate: "",
    notes: "",
  });
  const [isEditCustomControlModalOpen, setIsEditCustomControlModalOpen] = useState(false);
  const [selectedCustomControlForEdit, setSelectedCustomControlForEdit] = useState<ControlResponse | null>(null);
  const [editCustomControlForm, setEditCustomControlForm] = useState({
    code: "",
    category: "",
    title: "",
    description: "",
  });

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

  // Fetch users from API
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(`${API_BASE_URL}/user-management?page=1&per_page=1000`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data && result.data.data) {
          setUsers(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
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

  const openSoAModal = async (controlId: string) => {
    if (!token) return;
    
    setLoadingControlDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/controls/${controlId}`, {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (result.status && result.data) {
        setSelectedControlForSoA(result.data);
        setSoaForm({
          status: "BELUM_DITENTUKAN",
          managerId: "",
          targetDate: "",
          notes: "",
        });
        setIsSoaModalOpen(true);
      } else {
        alert(result.message || "Gagal mengambil detail kontrol");
      }
    } catch (error) {
      console.error("Failed to fetch control detail:", error);
      alert("Gagal mengambil detail kontrol");
    } finally {
      setLoadingControlDetail(false);
    }
  };

  const handleSoASave = async () => {
    if (!selectedControlForSoA || !token) return;
    
    if (!soaForm.managerId) {
      alert("Manager tidak boleh kosong");
      return;
    }
    if (!soaForm.targetDate) {
      alert("Target date tidak boleh kosong");
      return;
    }

    const payload = {
      controlId: selectedControlForSoA.id,
      managerId: soaForm.managerId,
      status: soaForm.status,
      targetDate: soaForm.targetDate,
      notes: soaForm.notes,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/soa`, {
        method: "POST",
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

        setIsSoaModalOpen(false);
        setSelectedControlForSoA(null);
      } else {
        alert(result.message || "Gagal membuat SOA");
      }
    } catch (error) {
      console.error("Failed to create SOA:", error);
      alert("Gagal membuat SOA");
    }
  };

  const openViewDetailModal = async (controlId: string) => {
    if (!token) return;
    
    setLoadingControlDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/controls/${controlId}`, {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (result.status && result.data) {
        setSelectedControlForViewDetail(result.data);
        setIsViewDetailModalOpen(true);
      } else {
        alert(result.message || "Gagal mengambil detail kontrol");
      }
    } catch (error) {
      console.error("Failed to fetch control detail:", error);
      alert("Gagal mengambil detail kontrol");
    } finally {
      setLoadingControlDetail(false);
    }
  };

  const openEditSoAModal = async (controlId: string) => {
    if (!token) return;
    
    setLoadingControlDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/controls/${controlId}`, {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (result.status && result.data) {
        setSelectedControlForEditSoA(result.data);
        // Pre-fill form with existing SOA data
        if (result.data.soa) {
          setEditSoaForm({
            status: result.data.soa.status || "BELUM_DITENTUKAN",
            managerId: result.data.soa.managerId || "",
            targetDate: result.data.soa.targetDate ? result.data.soa.targetDate.split('T')[0] : "",
            notes: result.data.soa.notes || "",
          });
        }
        setIsEditSoaModalOpen(true);
      } else {
        alert(result.message || "Gagal mengambil detail kontrol");
      }
    } catch (error) {
      console.error("Failed to fetch control detail:", error);
      alert("Gagal mengambil detail kontrol");
    } finally {
      setLoadingControlDetail(false);
    }
  };

  const handleEditSoASave = async () => {
    if (!selectedControlForEditSoA || !selectedControlForEditSoA.soa || !token) return;
    
    if (!editSoaForm.managerId) {
      alert("Manager tidak boleh kosong");
      return;
    }
    if (!editSoaForm.targetDate) {
      alert("Target date tidak boleh kosong");
      return;
    }

    const payload = {
      status: editSoaForm.status,
      managerId: editSoaForm.managerId,
      targetDate: editSoaForm.targetDate,
      notes: editSoaForm.notes,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/soa/${selectedControlForEditSoA.soa.id}`, {
        method: "PATCH",
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

        setIsEditSoaModalOpen(false);
        setSelectedControlForEditSoA(null);
      } else {
        alert(result.message || "Gagal mengubah SOA");
      }
    } catch (error) {
      console.error("Failed to update SOA:", error);
      alert("Gagal mengubah SOA");
    }
  };

  const openEditCustomControlModal = (control: ControlResponse) => {
    setSelectedCustomControlForEdit(control);
    setEditCustomControlForm({
      code: control.code,
      category: control.category,
      title: control.title,
      description: control.description,
    });
    setIsEditCustomControlModalOpen(true);
  };

  const handleEditCustomControlSave = async () => {
    if (!selectedCustomControlForEdit || !token) return;
    
    if (!editCustomControlForm.code?.trim()) {
      alert("Kode kontrol tidak boleh kosong");
      return;
    }
    if (!editCustomControlForm.title?.trim()) {
      alert("Nama kontrol tidak boleh kosong");
      return;
    }

    const payload = {
      code: editCustomControlForm.code,
      category: editCustomControlForm.category,
      title: editCustomControlForm.title,
      description: editCustomControlForm.description,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/controls/${selectedCustomControlForEdit.id}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

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

        setIsEditCustomControlModalOpen(false);
        setSelectedCustomControlForEdit(null);
        alert("Kontrol berhasil diperbarui");
      } else {
        alert(result.message || "Gagal mengubah kontrol");
      }
    } catch (error) {
      console.error("Failed to update custom control:", error);
      alert("Gagal mengubah kontrol");
    }
  };

  const handleDeleteCustomControl = async () => {
    if (!selectedCustomControlForEdit || !token) {
      return;
    }

    if (!confirm("Yakin ingin menghapus kontrol ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/controls/${selectedCustomControlForEdit.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

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

        setIsEditCustomControlModalOpen(false);
        setSelectedCustomControlForEdit(null);
        alert("Kontrol berhasil dihapus");
      } else {
        alert(result.message || "Gagal menghapus kontrol");
      }
    } catch (error) {
      console.error("Failed to delete custom control:", error);
      alert("Gagal menghapus kontrol");
    }
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penetapan Relevansi Kontrol</h1>
          <p className="text-sm text-gray-600 mt-1">
            Evaluasi dan tentukan relevansi kontrol ISO 27001 Annex A terhadap organisasi
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
              <Plus className="w-4 h-4" />
              Tambah Kontrol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="border-b border-sky-100 pb-4">
              <DialogTitle className="text-xl text-gray-900">
                {editingId ? "Edit Kontrol" : "Tambah Kontrol Baru"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Kelola detail kontrol dan progress implementasi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kode Kontrol *</Label>
                  <Input
                    id="code"
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Misal: 8.17, A1"
                    className="mt-1 border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kategori *</Label>
                  <Input
                    id="category"
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Misal: Technological Controls"
                    className="mt-1 border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="title" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Nama Kontrol *</Label>
                  <Input
                    id="title"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Misal: Clock synchronization"
                    className="mt-1 border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Deskripsi</Label>
                  <textarea
                    id="description"
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Detail deskripsi kontrol..."
                    className="mt-1 w-full px-3 py-2 border border-sky-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-sky-100">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="text-gray-700">
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-sky-600 hover:bg-sky-700 text-white">
                {editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {loadingStats ? (
          <div className="col-span-5 text-center py-8 text-gray-500">Memuat statistik...</div>
        ) : stats ? (
          <>
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Total Control Annex
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">ISO 27001</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-600">
                  {stats.totalAnnexControl}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Annex Dinilai
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Sudah Assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalAnnexControlAssessed}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Total Control Tambahan
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Organisasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAddedControl}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Tambahan Dinilai
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Sudah Assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAddedControlAssessed}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
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
            className={`text-sm font-medium transition-colors ${
              filter === s
                ? "bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
                : "border border-gray-300 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
            }`}
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
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b py-4 px-6 ">
          <CardTitle className="text-lg font-semibold text-sky-900">Daftar Kontrol ({filteredControls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingControls ? (
            <div className="text-center py-8 text-gray-500">Loading controls...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-sky-50 to-sky-100 border-b border-sky-200">
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Kode</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Nama Kontrol</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Kategori</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Terkait Treatment</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Target Date</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredControls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 py-8"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredControls.map((control) => {
                      const relevanceStatus = getRelevanceStatus(control.soa);
                      return (
                        <TableRow key={control.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <TableCell className="font-semibold text-sm text-gray-900">
                            {control.code}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{truncateText(control.title, 50)}</div>
                                {control.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {truncateText(control.description, 80)}
                                  </div>
                                )}
                              </div>
                              {control.organizationId && (
                                <button
                                  onClick={() => openEditCustomControlModal(control)}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                  title="Edit kontrol custom"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {control.category || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {getTreatmentName(control.countRelatedTreatment)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
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
                          <TableCell>
                            {!control.soa ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openSoAModal(control.id)}
                                className="text-xs border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-800 font-medium"
                              >
                                Buat SoA
                              </Button>
                            ) : user && (user.role === "RISK_MANAGER" || user.role === "TOP_MANAGEMENT") ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openViewDetailModal(control.id)}
                                  className="text-xs gap-1 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-800 font-medium"
                                  title="Lihat Detail SoA"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditSoAModal(control.id)}
                                  className="text-xs gap-1 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-800 font-medium"
                                  title="Edit SoA"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
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

      {/* SOA Modal */}
      <Dialog open={isSoaModalOpen} onOpenChange={setIsSoaModalOpen}>
      <DialogContent className="!w-[98vw] !max-w-[1400px] !max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Buat Statement of Applicability (SoA)</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Tentukan relevansi kontrol terhadap organisasi
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
        {loadingControlDetail ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading detail kontrol...</div>
          </div>
        ) : selectedControlForSoA ? (
          <div className="grid grid-cols-5 gap-6">
            {/* Left: Control Details - 3 columns */}
            <div className="col-span-3 space-y-6">
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-base mb-6">Detail Kontrol</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kode</p>
                    <p className="font-semibold text-lg text-blue-700">{selectedControlForSoA.code}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Nama Kontrol</p>
                    <p className="font-semibold text-base">{selectedControlForSoA.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kategori</p>
                    <p className="text-sm text-gray-700">{selectedControlForSoA.category}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Deskripsi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedControlForSoA.description}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Tipe</p>
                    <p className="text-sm text-gray-700">
                      {selectedControlForSoA.isAnnex ? "Annex A" : "Kontrol Tambahan"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Treatments */}
              <div className="border rounded-lg p-6 bg-gray-50 max-h-[250px] overflow-y-auto">
                <h3 className="font-semibold text-base mb-4">Treatment Terkait ({selectedControlForSoA.treatments?.length || 0})</h3>

                {selectedControlForSoA.treatments && selectedControlForSoA.treatments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedControlForSoA.treatments.map((treatment) => (
                      <div
                        key={treatment.id}
                        className="p-3 bg-white border-l-4 border-l-blue-500 rounded text-xs"
                      >
                        <p className="font-semibold text-blue-700 mb-1 text-sm">
                          {treatment.risk?.customRiskId}: {treatment.risk?.identifiedRisk}
                        </p>
                        <p className="text-gray-600 mb-1">
                          Opsi: <span className="font-medium text-gray-800">{treatment.treatmentOpt}</span>
                        </p>
                        <p className="text-gray-600">
                          Rencana: <span className="text-gray-700">{treatment.detailedActionPlan}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada treatment terkait</p>
                )}
              </div>
            </div>

            {/* Right: SOA Form - 2 columns */}
            <div className="col-span-2">
              <div className="border border-gray-200 rounded-lg p-6 bg-white h-fit shadow-sm">
                <h3 className="font-semibold text-base mb-6 text-gray-900 uppercase tracking-wide">Form SoA</h3>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="status" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Status *</Label>
                    <Select
                      value={soaForm.status}
                      onValueChange={(value) =>
                        setSoaForm({
                          ...soaForm,
                          status: value as "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN",
                        })
                      }
                    >
                      <SelectTrigger id="status" className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BELUM_DITENTUKAN">Belum Ditentukan</SelectItem>
                        <SelectItem value="RELEVAN">Relevan</SelectItem>
                        <SelectItem value="TIDAK_RELEVAN">Tidak Relevan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="managerId" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Manager/Penanggungjawab *</Label>
                    <Select
                      value={soaForm.managerId}
                      onValueChange={(value) =>
                        setSoaForm({ ...soaForm, managerId: value })
                      }
                      disabled={loadingUsers}
                    >
                      <SelectTrigger id="managerId" className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1">
                        <SelectValue placeholder={loadingUsers ? "Loading..." : "Pilih manager"} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            {loadingUsers ? "Loading users..." : "No users available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetDate" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Target Date *</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={soaForm.targetDate}
                      onChange={(e) =>
                        setSoaForm({ ...soaForm, targetDate: e.target.value })
                      }
                      className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Catatan</Label>
                    <textarea
                      id="notes"
                      value={soaForm.notes}
                      onChange={(e) =>
                        setSoaForm({ ...soaForm, notes: e.target.value })
                      }
                      placeholder="Catatan tambahan tentang relevansi kontrol ini..."
                      className="w-full px-3 py-2 border border-sky-200 rounded-md text-sm focus:outline-none focus:border-sky-400 focus:ring-sky-100 mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-sky-100">
                    <Button
                      onClick={handleSoASave}
                      className="w-full h-10 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      Simpan SoA
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsSoaModalOpen(false)}
                      className="w-full h-10 text-sm font-medium border-sky-200 text-sky-600 hover:bg-sky-50"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </DialogContent>
    </Dialog>

    {/* View Detail Modal */}
    <Dialog open={isViewDetailModalOpen} onOpenChange={setIsViewDetailModalOpen}>
      <DialogContent className="!w-[98vw] !max-w-[1400px] !max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Detail Statement of Applicability (SoA)</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Informasi lengkap tentang relevansi kontrol terhadap organisasi
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {loadingControlDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading detail kontrol...</div>
            </div>
          ) : selectedControlForViewDetail ? (
            <div className="grid grid-cols-5 gap-6">
              {/* Left: Control Details - 3 columns */}
              <div className="col-span-3 space-y-6">
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="font-semibold text-base mb-6">Detail Kontrol</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kode</p>
                      <p className="font-semibold text-lg text-blue-700">{selectedControlForViewDetail.code}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Nama Kontrol</p>
                      <p className="font-semibold text-base">{selectedControlForViewDetail.title}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kategori</p>
                      <p className="text-sm text-gray-700">{selectedControlForViewDetail.category}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Deskripsi</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedControlForViewDetail.description}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Tipe</p>
                      <p className="text-sm text-gray-700">
                        {selectedControlForViewDetail.isAnnex ? "Annex A" : "Kontrol Tambahan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Treatments */}
                <div className="border rounded-lg p-6 bg-gray-50 max-h-[250px] overflow-y-auto">
                  <h3 className="font-semibold text-base mb-4">Treatment Terkait ({selectedControlForViewDetail.treatments?.length || 0})</h3>

                  {selectedControlForViewDetail.treatments && selectedControlForViewDetail.treatments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedControlForViewDetail.treatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className="p-3 bg-white border-l-4 border-l-blue-500 rounded text-xs"
                        >
                          <p className="font-semibold text-blue-700 mb-1 text-sm">
                            {treatment.risk?.customRiskId}: {treatment.risk?.identifiedRisk}
                          </p>
                          <p className="text-gray-600 mb-1">
                            Opsi: <span className="font-medium text-gray-800">{treatment.treatmentOpt}</span>
                          </p>
                          <p className="text-gray-600">
                            Rencana: <span className="text-gray-700">{treatment.detailedActionPlan}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada treatment terkait</p>
                  )}
                </div>
              </div>

              {/* Right: SoA Details - 2 columns (Read-only) */}
              <div className="col-span-2">
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 h-fit shadow-sm">
                  <h3 className="font-semibold text-base mb-6 text-gray-900 uppercase tracking-wide">Detail SoA</h3>

                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        statusColors[getRelevanceStatus(selectedControlForViewDetail.soa)]
                      }`}>
                        {statusIcons[getRelevanceStatus(selectedControlForViewDetail.soa)]}
                        {getRelevanceStatus(selectedControlForViewDetail.soa) === "RELEVAN"
                          ? "Relevan"
                          : getRelevanceStatus(selectedControlForViewDetail.soa) === "TIDAK_RELEVAN"
                          ? "Tidak Relevan"
                          : "Belum Ditentukan"}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Manager/Penanggungjawab</p>
                      <p className="text-sm text-gray-700 font-medium">
                        {selectedControlForViewDetail.soa?.manager?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{selectedControlForViewDetail.soa?.manager?.email}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Target Date</p>
                      <p className="text-sm text-gray-700 font-medium">
                        {selectedControlForViewDetail.soa?.targetDate
                          ? new Date(selectedControlForViewDetail.soa.targetDate).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Catatan</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedControlForViewDetail.soa?.notes || "Tidak ada catatan"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Dibuat</p>
                      <p className="text-xs text-gray-600">
                        {selectedControlForViewDetail.soa?.createdAt
                          ? new Date(selectedControlForViewDetail.soa.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-sky-100">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDetailModalOpen(false)}
                        className="w-full h-10 text-sm font-medium border-sky-200 text-sky-600 hover:bg-sky-50"
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit SoA Modal */}
    <Dialog open={isEditSoaModalOpen} onOpenChange={setIsEditSoaModalOpen}>
      <DialogContent className="!w-[98vw] !max-w-[1400px] !max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Statement of Applicability (SoA)</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Ubah penilaian relevansi kontrol terhadap organisasi
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {loadingControlDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading detail kontrol...</div>
            </div>
          ) : selectedControlForEditSoA ? (
            <div className="grid grid-cols-5 gap-6">
              {/* Left: Control Details - 3 columns */}
              <div className="col-span-3 space-y-6">
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="font-semibold text-base mb-6">Detail Kontrol</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kode</p>
                      <p className="font-semibold text-lg text-blue-700">{selectedControlForEditSoA.code}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Nama Kontrol</p>
                      <p className="font-semibold text-base">{selectedControlForEditSoA.title}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Kategori</p>
                      <p className="text-sm text-gray-700">{selectedControlForEditSoA.category}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Deskripsi</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedControlForEditSoA.description}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Tipe</p>
                      <p className="text-sm text-gray-700">
                        {selectedControlForEditSoA.isAnnex ? "Annex A" : "Kontrol Tambahan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Treatments */}
                <div className="border rounded-lg p-6 bg-gray-50 max-h-[250px] overflow-y-auto">
                  <h3 className="font-semibold text-base mb-4">Treatment Terkait ({selectedControlForEditSoA.treatments?.length || 0})</h3>

                  {selectedControlForEditSoA.treatments && selectedControlForEditSoA.treatments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedControlForEditSoA.treatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className="p-3 bg-white border-l-4 border-l-blue-500 rounded text-xs"
                        >
                          <p className="font-semibold text-blue-700 mb-1 text-sm">
                            {treatment.risk?.customRiskId}: {treatment.risk?.identifiedRisk}
                          </p>
                          <p className="text-gray-600 mb-1">
                            Opsi: <span className="font-medium text-gray-800">{treatment.treatmentOpt}</span>
                          </p>
                          <p className="text-gray-600">
                            Rencana: <span className="text-gray-700">{treatment.detailedActionPlan}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada treatment terkait</p>
                  )}
                </div>
              </div>

              {/* Right: Edit Form - 2 columns */}
              <div className="col-span-2">
                <div className="border border-gray-200 rounded-lg p-6 bg-white h-fit shadow-sm">
                  <h3 className="font-semibold text-base mb-6 text-gray-900 uppercase tracking-wide">Edit Form SoA</h3>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="edit-status" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Status *</Label>
                      <Select
                        value={editSoaForm.status}
                        onValueChange={(value) =>
                          setEditSoaForm({
                            ...editSoaForm,
                            status: value as "BELUM_DITENTUKAN" | "RELEVAN" | "TIDAK_RELEVAN",
                          })
                        }
                      >
                        <SelectTrigger id="edit-status" className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BELUM_DITENTUKAN">Belum Ditentukan</SelectItem>
                          <SelectItem value="RELEVAN">Relevan</SelectItem>
                          <SelectItem value="TIDAK_RELEVAN">Tidak Relevan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-managerId" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Manager/Penanggungjawab *</Label>
                      <Select
                        value={editSoaForm.managerId}
                        onValueChange={(value) =>
                          setEditSoaForm({ ...editSoaForm, managerId: value })
                        }
                        disabled={loadingUsers}
                      >
                        <SelectTrigger id="edit-managerId" className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1">
                          <SelectValue placeholder={loadingUsers ? "Loading..." : "Pilih manager"} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length > 0 ? (
                            users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              {loadingUsers ? "Loading users..." : "No users available"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-targetDate" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Target Date *</Label>
                      <Input
                        id="edit-targetDate"
                        type="date"
                        value={editSoaForm.targetDate}
                        onChange={(e) =>
                          setEditSoaForm({ ...editSoaForm, targetDate: e.target.value })
                        }
                        className="w-full h-10 border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-notes" className="text-xs font-semibold text-sky-900 block mb-2 uppercase tracking-widest">Catatan</Label>
                      <textarea
                        id="edit-notes"
                        value={editSoaForm.notes}
                        onChange={(e) =>
                          setEditSoaForm({ ...editSoaForm, notes: e.target.value })
                        }
                        placeholder="Catatan tambahan tentang relevansi kontrol ini..."
                        className="w-full px-3 py-2 border border-sky-200 rounded-md text-sm focus:outline-none focus:border-sky-400 focus:ring-sky-100 mt-1"
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-sky-100">
                      <Button
                        onClick={handleEditSoASave}
                        className="w-full h-10 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        Simpan Perubahan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditSoaModalOpen(false)}
                        className="w-full h-10 text-sm font-medium border-sky-200 text-sky-600 hover:bg-sky-50"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Custom Control Modal */}
    <Dialog open={isEditCustomControlModalOpen} onOpenChange={setIsEditCustomControlModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">Edit Kontrol Custom</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Ubah detail kontrol yang telah ditambahkan oleh organisasi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-code" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kode Kontrol *</Label>
              <Input
                id="edit-code"
                value={editCustomControlForm.code || ""}
                onChange={(e) =>
                  setEditCustomControlForm({
                    ...editCustomControlForm,
                    code: e.target.value,
                  })
                }
                placeholder="Misal: 8.17, A1"
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-category" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kategori *</Label>
              <Input
                id="edit-category"
                value={editCustomControlForm.category || ""}
                onChange={(e) =>
                  setEditCustomControlForm({
                    ...editCustomControlForm,
                    category: e.target.value,
                  })
                }
                placeholder="Misal: Technological Controls"
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit-title" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Nama Kontrol *</Label>
              <Input
                id="edit-title"
                value={editCustomControlForm.title || ""}
                onChange={(e) =>
                  setEditCustomControlForm({
                    ...editCustomControlForm,
                    title: e.target.value,
                  })
                }
                placeholder="Misal: Clock synchronization"
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-100 mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit-description" className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Deskripsi</Label>
              <textarea
                id="edit-description"
                value={editCustomControlForm.description || ""}
                onChange={(e) =>
                  setEditCustomControlForm({
                    ...editCustomControlForm,
                    description: e.target.value,
                  })
                }
                placeholder="Detail deskripsi kontrol..."
                className="w-full px-3 py-2 border border-sky-200 rounded-md text-sm focus:outline-none focus:border-sky-400 focus:ring-sky-100 mt-1"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-between border-t border-sky-100 pt-4">
          <Button
            variant="destructive"
            onClick={handleDeleteCustomControl}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditCustomControlModalOpen(false)}
              className="border-sky-200 text-sky-600 hover:bg-sky-50"
            >
              Batal
            </Button>
            <Button onClick={handleEditCustomControlSave} className="bg-sky-600 hover:bg-sky-700 text-white">
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
