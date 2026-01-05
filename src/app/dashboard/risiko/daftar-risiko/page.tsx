"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaginatedTable } from "@/components/paginated-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash,
  Edit,
  Eye,
  CheckCircle,
  X,
  ArchiveX,
  ArchiveRestore,
  SendHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/api/config";
import { RiskStatus } from "@/lib/risksStore";
import { useAuth } from "@/hooks/use-auth";

interface Risk {
  id: string;
  customRiskId: string;
  vulnerability: string;
  threat: string;
  identifiedRisk: string;
  assetId?: string;
  contextId?: string;
  detail?: string;
  isConfidentiality?: boolean;
  isIntegrity?: boolean;
  isAvailability?: boolean;
  impactSeverity?: number;
  likelihoodOccurence?: number;
  detection?: number;
  status: string;
  category?: { id: string; title: string };
  source?: { id: string; title: string };
  asset?: { id: string; name: string };
  context?: { id: string; name: string };
  owner?: { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
}

interface CategoryOption {
  id: string;
  title: string;
}

interface SourceOption {
  id: string;
  title: string;
}

interface AssetOption {
  id: string;
  name: string;
}

interface ContextOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  email: string;
  name: string;
}

interface ScaleStatus {
  id: string;
  level: number;
  title: string;
}

interface RiskCriteria {
  id: string;
  isFMEA: boolean;
  scale: number;
  threshold: number;
  scaleStatuses: ScaleStatus[];
}

export default function DaftarRisikoPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // ALL STATE DECLARATIONS FIRST (never conditional)
  const [mounted, setMounted] = React.useState(false);
  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRisks, setTotalRisks] = React.useState(0);

  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [sources, setSources] = React.useState<SourceOption[]>([]);
  const [assets, setAssets] = React.useState<AssetOption[]>([]);
  const [contexts, setContexts] = React.useState<ContextOption[]>([]);
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedRisk, setSelectedRisk] = React.useState<Risk | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [riskCriteria, setRiskCriteria] = React.useState<RiskCriteria | null>(
    null
  );
  const [scaleStatuses, setScaleStatuses] = React.useState<ScaleStatus[]>([]);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = React.useState<{
    title: string;
    description: string;
    message?: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteDialogConfig, setDeleteDialogConfig] = React.useState<{
    itemName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [form, setForm] = React.useState<Partial<Risk>>({
    vulnerability: "",
    threat: "",
    identifiedRisk: "",
    detail: "",
    isConfidentiality: false,
    isIntegrity: false,
    isAvailability: false,
    impactSeverity: 3,
    likelihoodOccurence: 3,
    detection: undefined,
  });
  const [categorySearch, setCategorySearch] = React.useState("");
  const [sourceSearch, setSourceSearch] = React.useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = React.useState(false);
  const [showCustomRiskId, setShowCustomRiskId] = React.useState(false);
  const [customRiskId, setCustomRiskId] = React.useState("");

  // Role variables (derived from user)
  const isRiskOwner = user?.role === "RISK_OWNER";
  const isRiskManager = user?.role === "RISK_MANAGER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  // THEN EFFECTS
  // Check if user has allowed roles
  React.useEffect(() => {
    if (!isAuthLoading && !isRiskOwner && !isRiskManager && !isTopManagement) {
      toast.error("Akses ditolak. Hanya Risk Owner, Risk Manager, dan Top Management yang dapat akses halaman ini.");
      router.back();
    }
  }, [isAuthLoading, isRiskOwner, isRiskManager, isTopManagement, router]);

  // Mark component as mounted to prevent hydration mismatches
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load risks from API
  React.useEffect(() => {
    const loadRisks = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/risk-registers", {
          params: {
            page: currentPage,
            per_page: 10,
          },
        });

        if (response.data?.status && response.data?.data?.data) {
          setRisks(response.data.data.data);
          if (response.data.data.metadata) {
            setTotalPages(response.data.data.metadata.total_page);
            setTotalRisks(response.data.data.metadata.total_data);
          }
        }
      } catch (err) {
        console.error("Error loading risks:", err);
        toast.error("Gagal memuat daftar risiko");
      } finally {
        setIsLoading(false);
      }
    };

    loadRisks();
  }, [currentPage]);

  // Load dropdown data
  React.useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const requests = [
          apiClient.get("/risk-registers/category"),
          apiClient.get("/risk-registers/source"),
          apiClient.get("/assets"),
          apiClient.get("/contexts"),
          apiClient.get("/risk-criteria"),
        ];

        // Only fetch users if RISK_MANAGER
        if (isRiskManager) {
          requests.push(apiClient.get("/user-management"));
        }

        const responses = await Promise.all(requests);

        const [catRes, srcRes, assetRes, ctxRes, criteriaRes, usersRes] = responses;

        if (catRes.data?.data) setCategories(catRes.data.data);
        if (srcRes.data?.data) setSources(srcRes.data.data);
        if (assetRes.data?.data?.data) setAssets(assetRes.data.data.data);
        if (ctxRes.data?.data?.data) setContexts(ctxRes.data.data.data);

        if (criteriaRes.data?.data) {
          setRiskCriteria(criteriaRes.data.data);
          if (criteriaRes.data.data.scaleStatuses) {
            setScaleStatuses(criteriaRes.data.data.scaleStatuses);
          }
        }

        // Handle users response only if RISK_MANAGER and response exists
        if (isRiskManager && usersRes) {
          if (usersRes.data?.data?.data) {
            setUsers(usersRes.data.data.data);
          } else if (usersRes.data?.data) {
            setUsers(usersRes.data.data);
          } else if (Array.isArray(usersRes.data)) {
            setUsers(usersRes.data);
          }
        }
      } catch (err) {
        console.error("Error loading dropdown data:", err);
      }
    };

    loadDropdownData();
  }, [isRiskManager]);

  const handleAdd = async () => {
    if (!form.vulnerability?.trim() || !form.category?.title || !form.source?.title) {
      toast.error("Isi field yang diperlukan");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextRiskId =
        customRiskId.trim() ||
        `RISK-${String(totalRisks + 1).padStart(3, "0")}`;
      
      // Build payload with conditional category and source
      const payload: any = {
        customRiskId: nextRiskId,
        vulnerability: form.vulnerability,
        threat: form.threat || "",
        identifiedRisk: form.identifiedRisk || "",
        assetId: form.assetId,
        contextId: form.contextId,
        detail: form.detail || "",
        isConfidentiality: form.isConfidentiality || false,
        isIntegrity: form.isIntegrity || false,
        isAvailability: form.isAvailability || false,
        impactSeverity: form.impactSeverity || 3,
        likelihoodOccurence: form.likelihoodOccurence,
        detection: form.detection,
        ownerId: form.owner?.id,
      };

      // Add category - with id if exists, otherwise just name
      if (form.category?.id) {
        payload.riskcategory = { id: form.category.id, name: form.category.title };
      } else {
        payload.riskcategory = { name: form.category?.title };
      }

      // Add source - with id if exists, otherwise just name
      if (form.source?.id) {
        payload.source = { id: form.source.id, name: form.source.title };
      } else {
        payload.source = { name: form.source?.title };
      }

      let response;
      if (selectedRisk?.id) {
        // Update existing risk
        response = await apiClient.patch(`/risk-registers/${selectedRisk.id}`, payload);
      } else {
        // Create new risk
        response = await apiClient.post("/risk-registers", payload);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(selectedRisk?.id ? "Risiko berhasil diperbarui" : "Risiko berhasil ditambahkan");
        setOpen(false);
        setForm({
          vulnerability: "",
          threat: "",
          identifiedRisk: "",
          detail: "",
          isConfidentiality: false,
          isIntegrity: false,
          isAvailability: false,
          impactSeverity: 3,
          likelihoodOccurence: 3,
        });
        setShowCustomRiskId(false);
        setCustomRiskId("");
        setCategorySearch("");
        setSourceSearch("");
        setSelectedRisk(null);
        // Reload risks list to show new/updated data
        setCurrentPage(1);
        const reloadResponse = await apiClient.get("/risk-registers", {
          params: {
            page: 1,
            per_page: 10,
          },
        });
        if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
          setRisks(reloadResponse.data.data.data);
          if (reloadResponse.data.data.metadata) {
            setTotalPages(reloadResponse.data.data.metadata.total_page);
            setTotalRisks(reloadResponse.data.data.metadata.total_data);
          }
        }
      }
    } catch (err) {
      console.error("Error adding/updating risk:", err);
      toast.error(selectedRisk?.id ? "Gagal memperbarui risiko" : "Gagal menambahkan risiko");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetail = (risk: Risk) => {
    setSelectedRisk(risk);
    setDetailOpen(true);
  };

  const handleEdit = async (risk: Risk) => {
    setSelectedRisk(risk);
    setForm({
      vulnerability: risk.vulnerability,
      threat: risk.threat || "",
      identifiedRisk: risk.identifiedRisk || "",
      assetId: risk.assetId,
      contextId: risk.contextId,
      detail: risk.detail || "",
      isConfidentiality: risk.isConfidentiality || false,
      isIntegrity: risk.isIntegrity || false,
      isAvailability: risk.isAvailability || false,
      impactSeverity: risk.impactSeverity || 3,
      likelihoodOccurence: risk.likelihoodOccurence || 3,
      detection: risk.detection,
      category: risk.category,
      source: risk.source,
      owner: risk.owner,
    });
    setCustomRiskId(risk.customRiskId || "");
    setShowCustomRiskId(true);
    setOpen(true);
  };

  const handleSubmitForApproval = (risk: Risk) => {
    setConfirmDialogConfig({
      title: "Ajukan Risiko untuk Persetujuan",
      description: "Apakah Anda yakin ingin mengajukan risiko ini untuk persetujuan RM?",
      message: `Risiko: ${risk.customRiskId} - ${risk.identifiedRisk}`,
      confirmText: "Ajukan",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const payload = {
            status: "MENUNGGU_PERSETUJUAN_RM",
          };

          const response = await apiClient.patch(`/risk-registers/${risk.id}`, payload);

          if (response.status === 200) {
            toast.success("Risiko berhasil diajukan untuk persetujuan");
            setConfirmDialogOpen(false);
            setCurrentPage(1);
            const reloadResponse = await apiClient.get("/risk-registers", {
              params: {
                page: 1,
                per_page: 10,
              },
            });
            if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
              setRisks(reloadResponse.data.data.data);
              if (reloadResponse.data.data.metadata) {
                setTotalPages(reloadResponse.data.data.metadata.total_page);
                setTotalRisks(reloadResponse.data.data.metadata.total_data);
              }
            }
          }
        } catch (err) {
          console.error("Error submitting for approval:", err);
          toast.error("Gagal mengajukan risiko untuk persetujuan");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleReturnToDraft = async (risk: Risk) => {
    setIsSubmitting(true);
    try {
      const payload = {
        status: "DRAFT",
      };

      const response = await apiClient.patch(`/risk-registers/${risk.id}`, payload);

      if (response.status === 200) {
        toast.success("Risiko berhasil dikembalikan ke draft");
        setCurrentPage(1);
        const reloadResponse = await apiClient.get("/risk-registers", {
          params: {
            page: 1,
            per_page: 10,
          },
        });
        if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
          setRisks(reloadResponse.data.data.data);
          if (reloadResponse.data.data.metadata) {
            setTotalPages(reloadResponse.data.data.metadata.total_page);
            setTotalRisks(reloadResponse.data.data.metadata.total_data);
          }
        }
      }
    } catch (err) {
      console.error("Error returning to draft:", err);
      toast.error("Gagal mengembalikan risiko ke draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRisk = async (risk: Risk) => {
    setIsSubmitting(true);
    try {
      const payload = {
        status: "DISETUJUI_RM",
      };

      const response = await apiClient.patch(`/risk-registers/${risk.id}`, payload);

      if (response.status === 200) {
        toast.success("Risiko berhasil disetujui");
        setCurrentPage(1);
        const reloadResponse = await apiClient.get("/risk-registers", {
          params: {
            page: 1,
            per_page: 10,
          },
        });
        if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
          setRisks(reloadResponse.data.data.data);
          // Update selectedRisk dengan data terbaru
          const updatedRisk = reloadResponse.data.data.data.find((r: Risk) => r.id === risk.id);
          if (updatedRisk) {
            setSelectedRisk(updatedRisk);
          }
          if (reloadResponse.data.data.metadata) {
            setTotalPages(reloadResponse.data.data.metadata.total_page);
            setTotalRisks(reloadResponse.data.data.metadata.total_data);
          }
        }
        // Close modal after action
        setDetailOpen(false);
      }
    } catch (err) {
      console.error("Error approving risk:", err);
      toast.error("Gagal menyetujui risiko");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async (risk: Risk) => {
    setIsSubmitting(true);
    try {
      const payload = {
        status: "REVISI",
      };

      const response = await apiClient.patch(`/risk-registers/${risk.id}`, payload);

      if (response.status === 200) {
        toast.success("Risiko diminta untuk direvisi");
        setCurrentPage(1);
        const reloadResponse = await apiClient.get("/risk-registers", {
          params: {
            page: 1,
            per_page: 10,
          },
        });
        if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
          setRisks(reloadResponse.data.data.data);
          // Update selectedRisk dengan data terbaru
          const updatedRisk = reloadResponse.data.data.data.find((r: Risk) => r.id === risk.id);
          if (updatedRisk) {
            setSelectedRisk(updatedRisk);
          }
          if (reloadResponse.data.data.metadata) {
            setTotalPages(reloadResponse.data.data.metadata.total_page);
            setTotalRisks(reloadResponse.data.data.metadata.total_data);
          }
        }
        // Close modal after action
        setDetailOpen(false);
      }
    } catch (err) {
      console.error("Error requesting revision:", err);
      toast.error("Gagal meminta revisi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRisk = async (risk: Risk) => {
    setIsSubmitting(true);
    try {
      const payload = {
        status: "DITOLAK",
      };

      const response = await apiClient.patch(`/risk-registers/${risk.id}`, payload);

      if (response.status === 200) {
        toast.success("Risiko berhasil ditolak");
        setCurrentPage(1);
        const reloadResponse = await apiClient.get("/risk-registers", {
          params: {
            page: 1,
            per_page: 10,
          },
        });
        if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
          setRisks(reloadResponse.data.data.data);
          // Update selectedRisk dengan data terbaru
          const updatedRisk = reloadResponse.data.data.data.find((r: Risk) => r.id === risk.id);
          if (updatedRisk) {
            setSelectedRisk(updatedRisk);
          }
          if (reloadResponse.data.data.metadata) {
            setTotalPages(reloadResponse.data.data.metadata.total_page);
            setTotalRisks(reloadResponse.data.data.metadata.total_data);
          }
        }
        // Close modal after action
        setDetailOpen(false);
      }
    } catch (err) {
      console.error("Error rejecting risk:", err);
      toast.error("Gagal menolak risiko");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (risk: Risk) => {
    setDeleteDialogConfig({
      itemName: `${risk.customRiskId} - ${risk.identifiedRisk}`,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const response = await apiClient.delete(`/risk-registers/${risk.id}`);

          if (response.status === 200) {
            toast.success("Risiko berhasil dihapus");
            setDeleteDialogOpen(false);
            setCurrentPage(1);
            const reloadResponse = await apiClient.get("/risk-registers", {
              params: {
                page: 1,
                per_page: 10,
              },
            });
            if (reloadResponse.data?.status && reloadResponse.data?.data?.data) {
              setRisks(reloadResponse.data.data.data);
              if (reloadResponse.data.data.metadata) {
                setTotalPages(reloadResponse.data.data.metadata.total_page);
                setTotalRisks(reloadResponse.data.data.metadata.total_data);
              }
            }
          }
        } catch (err) {
          console.error("Error deleting risk:", err);
          toast.error("Gagal menghapus risiko");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case RiskStatus.DRAFT:
        return "bg-gray-100 text-gray-700";
      case RiskStatus.MENUNGGU_PERSETUJUAN_RM:
        return "bg-yellow-100 text-yellow-700";
      case RiskStatus.DISETUJUI_RM:
        return "bg-lime-100 text-lime-700";
      case RiskStatus.MENUNGGU_PERSETUJUAN_FINAL:
        return "bg-blue-100 text-blue-700";
      case RiskStatus.REVISI:
        return "bg-orange-100 text-orange-700";
      case RiskStatus.DISETUJUI:
        return "bg-green-100 text-green-700";
      case RiskStatus.DITOLAK:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getRiskScoreColor(score: number) {
    const threshold = riskCriteria?.threshold ?? 9;

    if (score <= threshold) {
      return "bg-green-100 text-green-800";
    } else if (score <= 10) {
      return "bg-orange-100 text-orange-800";
    } else if (score <= 15) {
      return "bg-yellow-100 text-yellow-800";
    } else if (score <= 20) {
      return "bg-pink-100 text-pink-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  }

  function getStatusLabel(status?: string) {
    const statusMap: Record<string, string> = {
      [RiskStatus.DRAFT]: "Draft",
      [RiskStatus.MENUNGGU_PERSETUJUAN_RM]: "Menunggu Persetujuan RM",
      [RiskStatus.DISETUJUI_RM]: "Disetujui RM",
      [RiskStatus.MENUNGGU_PERSETUJUAN_FINAL]: "Menunggu Persetujuan Final",
      [RiskStatus.REVISI]: "Revisi",
      [RiskStatus.DISETUJUI]: "Disetujui",
      [RiskStatus.DITOLAK]: "Ditolak",
    };
    return statusMap[String(status)] || status || "-";
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      // Format: DD/MM/YYYY, HH:MM:SS
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return "-";
    }
  }

  // Show loading skeleton while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If user doesn't have allowed roles, don't render anything (will redirect)
  if (!isRiskOwner && !isRiskManager && !isTopManagement) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      {!mounted ? null : (
        <>
          <div className="flex items-center justify-between gap-4 flex-shrink-0">
            <h1 className="text-2xl font-semibold">Daftar & Penilaian Risiko</h1>
            {(isRiskOwner || isRiskManager) && (
          <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
              setSelectedRisk(null);
              setForm({
                vulnerability: "",
                threat: "",
                identifiedRisk: "",
                detail: "",
                isConfidentiality: false,
                isIntegrity: false,
                isAvailability: false,
                impactSeverity: 3,
                likelihoodOccurence: 3,
              });
              setShowCustomRiskId(false);
              setCustomRiskId("");
              setCategorySearch("");
              setSourceSearch("");
              setShowCategoryDropdown(false);
              setShowSourceDropdown(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Tambah Risiko
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b border-sky-100 pb-4">
                <DialogTitle className="text-xl text-gray-900">{selectedRisk?.id ? "Edit Risiko" : "Tambah Risiko"}</DialogTitle>
                <DialogDescription>
                  {selectedRisk?.id ? "Perbarui detail risiko dan metrik penilaian." : "Isi detail risiko dan metrik penilaian."}
                </DialogDescription>
              </DialogHeader>

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">
                      Risk ID
                    </p>
                    <p className="text-lg font-mono font-bold text-sky-900">
                      {showCustomRiskId && customRiskId.trim()
                        ? customRiskId
                        : `RISK-${String(totalRisks + 1).padStart(3, "0")}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomRiskId(!showCustomRiskId)}
                    className="text-xs whitespace-nowrap border-sky-300 text-sky-700 hover:bg-sky-100 hover:border-sky-400 hover:text-sky-900 font-medium"
                  >
                    {!showCustomRiskId ? "Gunakan Custom" : "Gunakan Auto"}
                  </Button>
                </div>
                {showCustomRiskId && (
                  <div className="mt-4 pt-4 border-t border-sky-200">
                    <Input
                      placeholder="Masukkan Risk ID Custom"
                      value={customRiskId}
                      onChange={(e) => setCustomRiskId(e.target.value)}
                      className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kategori *</FieldLabel>
                      <div className="relative">
                        <Input
                          placeholder="Pilih atau ketik kategori"
                          value={categorySearch || form.category?.title || ""}
                          onChange={(e) => {
                            setCategorySearch(e.target.value);
                            setForm((p) => ({
                              ...p,
                              category: { id: "", title: e.target.value },
                            }));
                            setShowCategoryDropdown(true);
                          }}
                          onFocus={() => setShowCategoryDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                          className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                        />
                        {showCategoryDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 mt-1">
                            {categories
                              .filter((c) =>
                                c.title
                                  .toLowerCase()
                                  .includes(
                                    (categorySearch || form.category?.title || "").toLowerCase()
                                  )
                              )
                              .map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-slate-900"
                                  onClick={() => {
                                    setForm((p) => ({
                                      ...p,
                                      category: { id: c.id, title: c.title },
                                    }));
                                    setCategorySearch("");
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {c.title}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Risiko</FieldLabel>
                      <Input
                        value={String(form.identifiedRisk || "")}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            identifiedRisk: e.target.value,
                          }))
                        }
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Kerentanan *</FieldLabel>
                      <Input
                        value={String(form.vulnerability || "")}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            vulnerability: e.target.value,
                          }))
                        }
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Ancaman</FieldLabel>
                      <Input
                        value={String(form.threat || "")}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, threat: e.target.value }))
                        }
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Asal Risiko *</FieldLabel>
                      <div className="relative">
                        <Input
                          placeholder="Pilih atau ketik sumber"
                          value={sourceSearch || form.source?.title || ""}
                          onChange={(e) => {
                            setSourceSearch(e.target.value);
                            setForm((p) => ({
                              ...p,
                              source: { id: "", title: e.target.value },
                            }));
                            setShowSourceDropdown(true);
                          }}
                          onFocus={() => setShowSourceDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                          className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                        />
                        {showSourceDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 mt-1">
                            {sources
                              .filter((s) =>
                                s.title
                                  .toLowerCase()
                                  .includes(
                                    (sourceSearch || form.source?.title || "").toLowerCase()
                                  )
                              )
                              .map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-slate-900"
                                  onClick={() => {
                                    setForm((p) => ({
                                      ...p,
                                      source: { id: s.id, title: s.title },
                                    }));
                                    setSourceSearch("");
                                    setShowSourceDropdown(false);
                                  }}
                                >
                                  {s.title}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Aset</FieldLabel>
                      <Select
                        value={form.assetId || ""}
                        onValueChange={(id) =>
                          setForm((p) => ({ ...p, assetId: id }))
                        }
                      >
                        <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                          <SelectValue placeholder="Pilih aset" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Ruang Lingkup</FieldLabel>
                      <Select
                        value={form.contextId || ""}
                        onValueChange={(id) =>
                          setForm((p) => ({ ...p, contextId: id }))
                        }
                      >
                        <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                          <SelectValue placeholder="Pilih ruang lingkup" />
                        </SelectTrigger>
                        <SelectContent>
                          {contexts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {isRiskManager && (
                    <div>
                      <Field>
                        <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Risk Owner</FieldLabel>
                        <Select
                          value={form.owner?.id || ""}
                          onValueChange={(id) => {
                            const selectedUser = users.find((u) => u.id === id);
                            if (selectedUser) {
                              setForm((p) => ({
                                ...p,
                                owner: { id: selectedUser.id, name: selectedUser.name },
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                            <SelectValue placeholder="Pilih risk owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}
                </div>

                <div>
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">CIA Impact</FieldLabel>
                    <div className="flex gap-3 flex-wrap">
                      <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          form.isConfidentiality
                            ? "border-sky-500 bg-sky-50"
                            : "border-sky-200 hover:border-sky-400 hover:bg-sky-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.isConfidentiality || false}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              isConfidentiality: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 cursor-pointer accent-sky-600"
                        />
                        <span className="text-sm font-medium">
                          Confidentiality
                        </span>
                      </label>
                      <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          form.isIntegrity
                            ? "border-sky-500 bg-sky-50"
                            : "border-sky-200 hover:border-sky-400 hover:bg-sky-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.isIntegrity || false}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              isIntegrity: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 cursor-pointer accent-sky-600"
                        />
                        <span className="text-sm font-medium">Integrity</span>
                      </label>
                      <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          form.isAvailability
                            ? "border-sky-500 bg-sky-50"
                            : "border-sky-200 hover:border-sky-400 hover:bg-sky-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.isAvailability || false}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              isAvailability: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 cursor-pointer accent-sky-600"
                        />
                        <span className="text-sm font-medium">
                          Availability
                        </span>
                      </label>
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Impact Severity</FieldLabel>
                      <Select
                        value={String(form.impactSeverity ?? "")}
                        onValueChange={(value) =>
                          setForm((p) => ({
                            ...p,
                            impactSeverity: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                          <SelectValue placeholder="Pilih severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {scaleStatuses.map((scale) => (
                            <SelectItem
                              key={scale.id}
                              value={String(scale.level)}
                            >
                              {scale.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div>
                    <Field>
                      <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Likelihood</FieldLabel>
                      <Select
                        value={String(form.likelihoodOccurence ?? "")}
                        onValueChange={(value) =>
                          setForm((p) => ({
                            ...p,
                            likelihoodOccurence: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                          <SelectValue placeholder="Pilih likelihood" />
                        </SelectTrigger>
                        <SelectContent>
                          {scaleStatuses.map((scale) => (
                            <SelectItem
                              key={scale.id}
                              value={String(scale.level)}
                            >
                              {scale.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  {riskCriteria?.isFMEA && (
                    <div>
                      <Field>
                        <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Detection</FieldLabel>
                        <Select
                          value={String(form.detection ?? "")}
                          onValueChange={(value) =>
                            setForm((p) => ({
                              ...p,
                              detection: value ? Number(value) : undefined,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                            <SelectValue placeholder="Pilih detection" />
                          </SelectTrigger>
                          <SelectContent>
                            {scaleStatuses.map((scale) => (
                              <SelectItem
                                key={scale.id}
                                value={String(scale.level)}
                              >
                                {scale.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}
                </div>

                <div>
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Detail</FieldLabel>
                    <Textarea
                      value={String(form.detail ?? "")}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, detail: e.target.value }))
                      }
                      rows={3}
                      className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                    />
                  </Field>
                </div>
              </div>

              <DialogFooter className="border-t border-sky-100 pt-4 mt-6">
                <div className="flex justify-end w-full gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setSelectedRisk(null);
                    }}
                    disabled={isSubmitting}
                    className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-900"
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAdd} disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-700 text-white">
                    {isSubmitting ? (selectedRisk?.id ? "Memperbarui..." : "Menambahkan...") : (selectedRisk?.id ? "Perbarui Risiko" : "Tambah Risiko")}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <PaginatedTable<Risk>
        data={risks}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row) => {
              const index = risks.findIndex((r) => r.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Risk ID",
            key: "customRiskId",
            render: (value) => (
              <span className="font-medium">{String(value)}</span>
            ),
          },
          {
            header: "Kategori",
            key: "category",
            render: (value: any) => value?.title || "-",
          },
          {
            header: "Risiko",
            key: "identifiedRisk",
            render: (value) => (
              <span className="font-bold">{String(value || "-")}</span>
            ),
          },
          {
            header: "Vulnerability",
            key: "vulnerability",
          },
          {
            header: "Threat",
            key: "threat",
          },
          {
            header: "CIA Impact",
            key: (row) => {
              const cias = [];
              if (row.isConfidentiality) cias.push("C");
              if (row.isIntegrity) cias.push("I");
              if (row.isAvailability) cias.push("A");
              return cias.join(", ") || "-";
            },
          },
          {
            header: riskCriteria?.isFMEA ? "Severity" : "Impact",
            key: "impactSeverity",
            render: (value) => (
              <span className="text-center">{String(value ?? "-")}</span>
            ),
            searchable: false,
          },
          {
            header: riskCriteria?.isFMEA ? "Occurence" : "Likelihood",
            key: "likelihoodOccurence",
            render: (value) => (
              <span className="text-center">{String(value ?? "-")}</span>
            ),
            searchable: false,
          },
          ...(riskCriteria?.isFMEA
            ? [
                {
                  header: "Detection",
                  key: "detection" as const,
                  render: (value: any) => (
                    <span className="text-center">{String(value ?? "-")}</span>
                  ),
                  searchable: false,
                } as const,
                {
                  header: "RPN",
                  key: (row: Risk) => {
                    const rpn =
                      (row.impactSeverity ?? 1) *
                      (row.likelihoodOccurence ?? 1) *
                      (row.detection ?? 1);
                    return rpn;
                  },
                  render: (value: any) => {
                    const score = Number(value);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskScoreColor(
                          score
                        )}`}
                      >
                        {String(value ?? "-")}
                      </span>
                    );
                  },
                  searchable: false,
                } as const,
              ]
            : [
                {
                  header: "Skor Risiko",
                  key: (row: Risk) => {
                    const score =
                      (row.impactSeverity ?? 1) *
                      (row.likelihoodOccurence ?? 1);
                    return score;
                  },
                  render: (value: any) => {
                    const score = Number(value);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskScoreColor(
                          score
                        )}`}
                      >
                        {String(value ?? "-")}
                      </span>
                    );
                  },
                  searchable: false,
                } as const,
              ]),
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  String(value)
                )}`}
              >
                {getStatusLabel(String(value))}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (value: any, row: Risk) => {
              const isOwner = row.owner?.id === user?.id || isRiskOwner;
              const isPending =
                row.status === RiskStatus.MENUNGGU_PERSETUJUAN_RM;
              const isRevisi = row.status === RiskStatus.REVISI;
              const isDisetujuiRM = row.status === RiskStatus.DISETUJUI_RM;

              return (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Lihat detail"
                          onClick={() => handleViewDetail(row)}
                        >
                          <Eye size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat detail risiko</TooltipContent>
                    </Tooltip>

                    {isOwner && row.status === RiskStatus.DRAFT && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEdit(row)}
                              disabled={isSubmitting}
                            >
                              <Edit size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit risiko</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleSubmitForApproval(row)}
                              disabled={isSubmitting}
                            >
                              <SendHorizontal size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Ajukan untuk persetujuan
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              onClick={() => handleDelete(row)}
                              disabled={isSubmitting}
                            >
                              <Trash size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Hapus risiko</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {isOwner && isPending && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() => handleReturnToDraft(row)}
                              disabled={isSubmitting}
                            >
                              <ArchiveRestore size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Kembalikan ke draft</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {isRiskManager && isPending && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApproveRisk(row)}
                              disabled={isSubmitting}
                            >
                              <CheckCircle size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Setujui risiko</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => handleRequestRevision(row)}
                              disabled={isSubmitting}
                            >
                              <ArchiveX size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Minta revisi</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRejectRisk(row)}
                              disabled={isSubmitting}
                            >
                              <X size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Tolak risiko</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TooltipProvider>
              );
            },
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Belum ada risiko yang terdaftar"
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalRisks}{" "}
            total risiko)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={isLoading}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-5xl w-full">
          <DialogHeader className="border-b border-sky-100 pb-4">
            <DialogTitle className="text-xl text-gray-900">Detail Risiko</DialogTitle>
            <DialogDescription>
              Informasi lengkap risiko:{" "}
              <span className="font-mono font-semibold text-sky-700">
                {selectedRisk?.customRiskId}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedRisk && (
            <div className="space-y-5">
              {/* Header Section with ID, Status and Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Left: ID and Status Box */}
                <div className={isRiskManager && selectedRisk.status === RiskStatus.MENUNGGU_PERSETUJUAN_RM ? "md:col-span-2" : "md:col-span-3"}>
                  <div className="border border-sky-700 rounded-lg p-4 bg-gradient-to-r from-sky-200 to-sky-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                          Risk ID
                        </p>
                        <p className="text-lg font-mono font-bold text-sky-900 mt-2">
                          {selectedRisk.customRiskId}
                        </p>
                      </div>
                      <div className="flex flex-col justify-start items-end">
                        <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                          Status
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              selectedRisk.status
                            )}`}
                          >
                            {getStatusLabel(selectedRisk.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons (only for Risk Manager when status is MENUNGGU_PERSETUJUAN_RM) */}
                {isRiskManager && selectedRisk.status === RiskStatus.MENUNGGU_PERSETUJUAN_RM && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleApproveRisk(selectedRisk)}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      Setujui
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleRequestRevision(selectedRisk)}
                        disabled={isSubmitting}
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                        variant="outline"
                      >
                        Revisi
                      </Button>
                      <Button
                        onClick={() => handleRejectRisk(selectedRisk)}
                        disabled={isSubmitting}
                        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 font-medium"
                        variant="outline"
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Single Column Layout */}
              <div className="space-y-5">
                {/* Risk Classification Section */}
                <div className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                  <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    Klasifikasi Risiko
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Kategori
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedRisk.category?.title || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Sumber Risiko
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedRisk.source?.title || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Elements Section */}
                <div className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                  <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    Elemen Risiko
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Identified Risk
                      </p>
                      <p className="text-sm text-slate-900 border-l-2 border-sky-600 pl-2 py-1">
                        {selectedRisk.identifiedRisk || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Vulnerability
                      </p>
                      <p className="text-sm text-slate-900 font-medium border-l-2 border-sky-200 pl-2 py-1">
                        {selectedRisk.vulnerability}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Threat
                      </p>
                      <p className="text-sm text-slate-900 font-medium border-l-2 border-sky-200 pl-2 py-1">
                        {selectedRisk.threat || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assets & Context Section */}
                <div className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                  <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    Aset & Konteks
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Asset
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedRisk.asset?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Context
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedRisk.context?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Risk Owner
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedRisk.owner?.name ||
                          selectedRisk.owner?.id ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CIA Impact & Scoring Section */}
                <div className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                  <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    Penilaian & Dampak
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">
                        CIA Impact
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRisk.isConfidentiality && (
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-sky-100 text-sky-700">
                            C - Confidentiality
                          </span>
                        )}
                        {selectedRisk.isIntegrity && (
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-sky-100 text-sky-700">
                            I - Integrity
                          </span>
                        )}
                        {selectedRisk.isAvailability && (
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-sky-100 text-sky-700">
                            A - Availability
                          </span>
                        )}
                        {!selectedRisk.isConfidentiality &&
                          !selectedRisk.isIntegrity &&
                          !selectedRisk.isAvailability && (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                      </div>
                    </div>

                    <div
                      className={`grid ${
                        riskCriteria?.isFMEA ? "grid-cols-3" : "grid-cols-2"
                      } gap-2`}
                    >
                      <div className="bg-white p-3 rounded border border-sky-200 text-center">
                        <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                          {riskCriteria?.isFMEA ? "Severity" : "Impact"}
                        </p>
                        <p className="text-2xl font-bold text-sky-900 mt-1">
                          {selectedRisk.impactSeverity || "-"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-sky-200 text-center">
                        <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                          {riskCriteria?.isFMEA ? "Occurence" : "Likelihood"}
                        </p>
                        <p className="text-2xl font-bold text-sky-900 mt-1">
                          {selectedRisk.likelihoodOccurence || "-"}
                        </p>
                      </div>
                      {riskCriteria?.isFMEA && (
                        <div className="bg-white p-3 rounded border border-sky-200 text-center">
                          <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                            Detection
                          </p>
                          <p className="text-2xl font-bold text-sky-900 mt-1">
                            {selectedRisk.detection || "-"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Risk Score or RPN */}
                    <div
                      className={`p-4 rounded border text-center ${getRiskScoreColor(
                        riskCriteria?.isFMEA
                          ? (selectedRisk.impactSeverity ?? 1) *
                              (selectedRisk.likelihoodOccurence ?? 1) *
                              (selectedRisk.detection ?? 1)
                          : (selectedRisk.impactSeverity ?? 1) *
                              (selectedRisk.likelihoodOccurence ?? 1)
                      )} border-slate-200`}
                    >
                      <p className="text-xs font-medium uppercase mb-2 opacity-75">
                        {riskCriteria?.isFMEA ? "Skor RPN" : "Skor Risiko"}
                      </p>
                      <p className="text-3xl font-bold">
                        {riskCriteria?.isFMEA
                          ? (selectedRisk.impactSeverity ?? 1) *
                            (selectedRisk.likelihoodOccurence ?? 1) *
                            (selectedRisk.detection ?? 1)
                          : (selectedRisk.impactSeverity ?? 1) *
                            (selectedRisk.likelihoodOccurence ?? 1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail & Metadata Section - Full Width */}
              <div className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  Detail Tambahan
                </h3>
                <div className="space-y-3">
                  {selectedRisk.detail && (
                    <div>
                      <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                        Keterangan Detail
                      </p>
                      <p className="text-sm text-slate-900 whitespace-pre-wrap font-medium bg-white border border-sky-200 p-2 rounded">
                        {selectedRisk.detail}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-1">
                      Dibuat Pada
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatDate(selectedRisk.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-sky-100 pt-4 mt-6">
            <Button onClick={() => setDetailOpen(false)} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmDialogConfig && (
        <ConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title={confirmDialogConfig.title}
          description={confirmDialogConfig.description}
          message={confirmDialogConfig.message}
          confirmText={confirmDialogConfig.confirmText}
          isLoading={isSubmitting}
          onConfirm={confirmDialogConfig.onConfirm}
        />
      )}

      {deleteDialogConfig && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={deleteDialogConfig.onConfirm}
          itemName={deleteDialogConfig.itemName}
          isLoading={isSubmitting}
        />
      )}
        </>
      )}
    </div>
  );
}
