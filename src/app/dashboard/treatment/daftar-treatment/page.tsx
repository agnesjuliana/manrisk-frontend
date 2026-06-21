"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaginatedTable } from "@/components/paginated-table";
import { Eye, X, Edit, CheckCircle2, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Risk {
  id: string;
  customRiskId: string;
  identifiedRisk: string;
  vulnerability: string;
  threat: string;
  impactSeverity: number;
  likelihoodOccurence: number;
  detection: number;
  impactSeverityTarget?: number;
  likelihoodOccurenceTarget?: number;
  detectionTarget?: number;
}

interface RelatedControl {
  id: string;
  code: string;
  title: string;
}

interface TreatmentData {
  id: string;
  riskId: string;
  managerId: string;
  picId: string;
  organizationId: string;
  treatmentOpt: string;
  impactSeverityTarget: number;
  likelihoodOccurenceTarget: number;
  detectionTarget: number;
  actionReason: string;
  detailedActionPlan: string;
  startAction: string;
  endAction: string;
  notes: string;
  isApprovedByTop: boolean | null;
  createdAt: string;
  updatedAt: string | null;
  manager: { id: string; name: string; email: string };
  pic: { id: string; name: string; email: string };
  relatedControls: RelatedControl[];
}

interface TreatmentItem {
  risk: Risk;
  treatment: TreatmentData | null;
  score: number;
}

interface RiskCriteria {
  id: string;
  organizationId: string;
  isFMEA: boolean;
  scale: number;
  threshold: number;
  scaleStatuses: Array<{ id: string; level: number; title: string }>;
  createdAt: string;
  updatedAt: string;
}

interface ControlOption {
  id: string;
  code: string;
  title: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function DaftarTreatmentPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<TreatmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [riskCriteria, setRiskCriteria] = useState<RiskCriteria | null>(null);
  const [controlOptions, setControlOptions] = useState<ControlOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [searchControl, setSearchControl] = useState("");
  const [selectedControls, setSelectedControls] = useState<RelatedControl[]>(
    []
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<"approve" | "reject" | null>(null);
  const [treatmentIdForConfirm, setTreatmentIdForConfirm] = useState<string | null>(null);

  // Role checks
  const isRiskManager = user?.role === "RISK_MANAGER";
  const isRiskOwner = user?.role === "RISK_OWNER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  const [form, setForm] = useState({
    treatmentOpt: "MITIGATE",
    picId: "",
    impactSeverityTarget: "",
    likelihoodOccurenceTarget: "",
    detectionTarget: "",
    actionReason: "",
    detailedActionPlan: "",
    startAction: "",
    endAction: "",
    notes: "",
  });

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, [isAuthenticated]);

  // Auth validation - check if user has required role
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isRiskManager && !isRiskOwner && !isTopManagement) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.back();
    }
  }, [isAuthLoading, isRiskManager, isRiskOwner, isTopManagement, router]);

  const getHeaders = (): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  };

  // Fetch data from API
  useEffect(() => {
    if (!token || isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/treatments`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data?.data) {
          setData(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch treatments:", error);
        toast.error("Gagal memuat data treatment");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  // Fetch risk criteria
  useEffect(() => {
    if (!token || isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchRiskCriteria = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/risk-criteria`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data) {
          setRiskCriteria(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch risk criteria:", error);
        setRiskCriteria(null);
      }
    };

    fetchRiskCriteria();
  }, [token, isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  // Fetch control options
  useEffect(() => {
    if (!token || isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchControlOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/controls/options`, {
          headers: getHeaders(),
        });
        const result = await response.json();
        if (result.status && result.data) {
          setControlOptions(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch control options:", error);
      }
    };

    fetchControlOptions();
  }, [token, isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  // Fetch users for PIC selection
  useEffect(() => {
    if (!token || isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/user-management?page=1&per_page=1000`,
          {
            headers: getHeaders(),
          }
        );
        const result = await response.json();
        if (result.status && result.data?.data) {
          setUsers(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [token, isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  function computeRiskScore(severity: number, likelihood: number) {
    return severity * likelihood;
  }

  function getRiskLevelFromCriteria(score: number) {
    if (
      !riskCriteria ||
      !riskCriteria.scaleStatuses ||
      riskCriteria.scaleStatuses.length === 0
    ) {
      return { level: "Unknown", color: "bg-slate-500 text-white" };
    }

    // Calculate max score: scale^3 (e.g., 5^3 = 125 for scale 5)
    const maxScore = Math.pow(riskCriteria.scale, 3);
    const numLevels = riskCriteria.scaleStatuses.length;
    const rangePerLevel = maxScore / numLevels;

    // Determine which level this score belongs to (1-indexed)
    const levelIndex =
      Math.min(Math.ceil(score / rangePerLevel), numLevels) - 1;
    const status = riskCriteria.scaleStatuses[levelIndex];

    if (!status) {
      return { level: "Unknown", color: "bg-slate-500 text-white" };
    }

    // Map level to shadcn colors (consistent color palette)
    const colorMap: Record<number, string> = {
      1: "bg-emerald-500 text-white", // Level 1 - Green
      2: "bg-amber-500 text-white", // Level 2 - Amber/Yellow
      3: "bg-orange-500 text-white", // Level 3 - Orange
      4: "bg-red-500 text-white", // Level 4 - Red
      5: "bg-red-700 text-white", // Level 5 - Dark Red
    };

    const color = colorMap[status.level] || "bg-slate-500 text-white";

    return { level: status.title, color };
  }

  function getRiskCriteriaLabel() {
    // Use isFMEA flag directly from risk criteria
    const isFMEA = riskCriteria?.isFMEA ?? false;
    return { isFMEA };
  }

  function formatRoleLabel(role?: string): string {
    if (!role) return "";
    // Remove underscores and capitalize each word
    return role
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function openTreatmentForm(risk: Risk, treatment?: TreatmentData) {
    setSelectedRisk(risk);
    setSelectedControls(treatment?.relatedControls ?? []);
    // Check if user can edit: treatment exists, isApprovedByTop is not true, and user role is RISK_MANAGER or TOP_MANAGEMENT
    const canEdit =
      treatment &&
      treatment.isApprovedByTop !== true &&
      (user?.role === "RISK_MANAGER" || user?.role === "TOP_MANAGEMENT");
    setIsEditMode(!!canEdit);

    if (treatment) {
      setForm({
        treatmentOpt: treatment.treatmentOpt,
        picId: treatment.picId ?? "",
        impactSeverityTarget: treatment.impactSeverityTarget?.toString() ?? "",
        likelihoodOccurenceTarget:
          treatment.likelihoodOccurenceTarget?.toString() ?? "",
        detectionTarget: treatment.detectionTarget?.toString() ?? "",
        actionReason: treatment.actionReason ?? "",
        detailedActionPlan: treatment.detailedActionPlan ?? "",
        startAction: treatment.startAction?.split("T")[0] ?? "",
        endAction: treatment.endAction?.split("T")[0] ?? "",
        notes: treatment.notes ?? "",
      });
    } else {
      setForm({
        treatmentOpt: "MITIGATE",
        picId: "",
        impactSeverityTarget: "",
        likelihoodOccurenceTarget: "",
        detectionTarget: "",
        actionReason: "",
        detailedActionPlan: "",
        startAction: "",
        endAction: "",
        notes: "",
      });
    }
    setOpen(true);
  }

  function saveTreatment() {
    if (!selectedRisk || !token) return;

    const payload = {
      riskId: selectedRisk.id,
      picId: form.picId,
      treatmentOpt: form.treatmentOpt,
      detailedActionPlan: form.detailedActionPlan,
      startAction: form.startAction,
      endAction: form.endAction,
      controlIds: selectedControls.map((c) => c.id),
      impactSeverityTarget: parseInt(form.impactSeverityTarget),
      likelihoodOccurenceTarget: parseInt(form.likelihoodOccurenceTarget),
      detectionTarget: parseInt(form.detectionTarget),
      actionReason: form.actionReason,
      notes: form.notes,
    };

    // Send to API
    const sendTreatment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/treatments`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.status) {
          toast.success("Treatment berhasil disimpan");
          setOpen(false);
          setIsEditMode(false);
          // Refresh data
          const treatmentsResponse = await fetch(`${API_BASE_URL}/treatments`, {
            headers: getHeaders(),
          });
          const treatmentsResult = await treatmentsResponse.json();
          if (treatmentsResult.status && treatmentsResult.data?.data) {
            setData(treatmentsResult.data.data);
          }
        } else {
          toast.error(result.message || "Gagal menyimpan treatment");
        }
      } catch (error) {
        console.error("Failed to save treatment:", error);
        toast.error("Gagal menyimpan treatment");
      }
    };

    sendTreatment();
  }

  function updateTreatment() {
    if (!selectedRisk || !token) return;

    const treatment = data.find(
      (t) => t.risk.id === selectedRisk.id
    )?.treatment;
    if (!treatment) return;

    const payload = {
      riskId: selectedRisk.id,
      picId: form.picId,
      treatmentOpt: form.treatmentOpt,
      detailedActionPlan: form.detailedActionPlan,
      startAction: form.startAction,
      endAction: form.endAction,
      controlIds: selectedControls.map((c) => c.id),
      impactSeverityTarget: parseInt(form.impactSeverityTarget),
      likelihoodOccurenceTarget: parseInt(form.likelihoodOccurenceTarget),
      detectionTarget: parseInt(form.detectionTarget),
      actionReason: form.actionReason,
      notes: form.notes,
    };

    const sendUpdate = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/treatments/${treatment.id}`,
          {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(payload),
          }
        );
        const result = await response.json();
        if (result.status) {
          toast.success("Treatment berhasil diperbarui");
          setOpen(false);
          setIsEditMode(false);
          // Refresh data
          const treatmentsResponse = await fetch(`${API_BASE_URL}/treatments`, {
            headers: getHeaders(),
          });
          const treatmentsResult = await treatmentsResponse.json();
          if (treatmentsResult.status && treatmentsResult.data?.data) {
            setData(treatmentsResult.data.data);
          }
        } else {
          toast.error(result.message || "Gagal memperbarui treatment");
        }
      } catch (error) {
        console.error("Failed to update treatment:", error);
        toast.error("Gagal memperbarui treatment");
      }
    };

    sendUpdate();
  }

  function approveTreatment(treatmentId?: string) {
    const id =
      treatmentId ||
      (selectedRisk
        ? data.find((t) => t.risk.id === selectedRisk.id)?.treatment?.id
        : null);
    if (!id || !token) return;

    const sendApproval = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ isApprovedByTop: true }),
        });
        const result = await response.json();
        if (result.status) {
          toast.success("Treatment berhasil disetujui");
          setOpen(false);
          setIsEditMode(false);
          // Refresh data
          const treatmentsResponse = await fetch(`${API_BASE_URL}/treatments`, {
            headers: getHeaders(),
          });
          const treatmentsResult = await treatmentsResponse.json();
          if (treatmentsResult.status && treatmentsResult.data?.data) {
            setData(treatmentsResult.data.data);
          }
        } else {
          toast.error(result.message || "Gagal menyetujui treatment");
        }
      } catch (error) {
        console.error("Failed to approve treatment:", error);
        toast.error("Gagal menyetujui treatment");
      }
    };

    sendApproval();
  }

  function rejectTreatment(treatmentId?: string) {
    const id =
      treatmentId ||
      (selectedRisk
        ? data.find((t) => t.risk.id === selectedRisk.id)?.treatment?.id
        : null);
    if (!id || !token) return;

    const sendRejection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ isApprovedByTop: false }),
        });
        const result = await response.json();
        if (result.status) {
          toast.success("Treatment berhasil ditolak");
          setOpen(false);
          setIsEditMode(false);
          // Refresh data
          const treatmentsResponse = await fetch(`${API_BASE_URL}/treatments`, {
            headers: getHeaders(),
          });
          const treatmentsResult = await treatmentsResponse.json();
          if (treatmentsResult.status && treatmentsResult.data?.data) {
            setData(treatmentsResult.data.data);
          }
        } else {
          toast.error(result.message || "Gagal menolak treatment");
        }
      } catch (error) {
        console.error("Failed to reject treatment:", error);
        toast.error("Gagal menolak treatment");
      }
    };

    sendRejection();
  }

  const filteredControls = useMemo(() => {
    if (!controlOptions || controlOptions.length === 0) return [];
    return controlOptions.filter(
      (c) =>
        (c.code?.toLowerCase() || "").includes(searchControl.toLowerCase()) ||
        (c.title?.toLowerCase() || "").includes(searchControl.toLowerCase())
    );
  }, [searchControl, controlOptions]);

  const tableData = data.map((item) => ({
    id: item.risk.id,
    riskId: item.risk.customRiskId,
    identifiedRisk: item.risk.identifiedRisk,
    vulnerability: item.risk.vulnerability,
    threat: item.risk.threat,
    severity: item.risk.impactSeverity,
    likelihood: item.risk.likelihoodOccurence,
    riskScore: item.score,
    riskLevel: getRiskLevelFromCriteria(item.score).level,
    treatment: item.treatment,
    picName: item.treatment?.pic?.name ?? "-",
    approvalStatus: item.treatment?.isApprovedByTop,
    risk: item.risk,
    userRole: user?.role,
  }));

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  // Return null if user is not authorized (will trigger redirect in useEffect)
  if (!isRiskManager && !isRiskOwner && !isTopManagement) {
    return null;
  }

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      "No",
      "Risk ID",
      "Risiko",
      "Skor Risiko",
      "Perlakuan",
      "Penanggung Jawab",
      riskCriteria?.isFMEA ? "Target Severity" : "Target Impact",
      riskCriteria?.isFMEA ? "Target Occurrence" : "Target Likelihood",
      ...(riskCriteria?.isFMEA ? ["Target Detection"] : []),
      "Status",
    ];

    // Prepare data rows
    const rows = tableData.map((row, index) => {
      const thresholdDiff = row.riskScore - (riskCriteria?.threshold ?? 9);
      let thresholdStatus = "";
      if (thresholdDiff > 0) {
        thresholdStatus = `+${thresholdDiff} poin`;
      } else if (thresholdDiff < 0) {
        thresholdStatus = `Bawah: ${thresholdDiff} poin`;
      } else {
        thresholdStatus = "Di Threshold";
      }

      let statusLabel = "";
      if (!row.treatment) {
        statusLabel = "Draft";
      } else if (row.approvalStatus === null) {
        statusLabel = "Menunggu Persetujuan";
      } else if (row.approvalStatus === true) {
        statusLabel = "DISETUJUI";
      } else {
        statusLabel = "DITOLAK";
      }

      const baseRow = [
        (index + 1).toString(),
        row.riskId || "-",
        row.identifiedRisk || "-",
        String(row.riskScore),
        row.treatment?.treatmentOpt || "-",
        row.picName || "-",
        row.treatment?.impactSeverityTarget || "-",
        row.treatment?.likelihoodOccurenceTarget || "-",
      ];

      const targetDetection = riskCriteria?.isFMEA ? [String(row.treatment?.detectionTarget || "-")] : [];

      return [
        ...baseRow,
        ...targetDetection,
        statusLabel,
      ];
    });

    // Escape CSV values and create CSV content
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Daftar_Treatment_${timestamp}.csv`;

    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daftar Treatment</h2>
        <Button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Download size={16} /> Download CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <PaginatedTable
          data={tableData}
          columns={[
            {
              header: "No",
              key: "id",
              render: (_, row) => {
                const index = tableData.findIndex((t) => t.id === row.id);
                return <span className="text-gray-600">{index + 1}</span>;
              },
              searchable: false,
            },
            {
              header: "Risk ID",
              key: "riskId",
              render: (value) => (
                <span className="font-medium">{String(value)}</span>
              ),
            },
            {
              header: "Risiko",
              key: "identifiedRisk",
            },
            {
              header: "Skor Risiko",
              key: "riskScore",
              render: (value) => (
                <span className="text-center font-medium">{String(value)}</span>
              ),
              searchable: false,
            },
            // {
            //   header: "Level Risiko",
            //   key: "riskLevel",
            //   render: (value, row) => {
            //     const { level, color } = getRiskLevelFromCriteria(row.riskScore)
            //     return (
            //       <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            //         {level}
            //       </span>
            //     )
            //   },
            //   searchable: false,
            // },
            {
              header: "Threshold Status",
              key: "riskScore",
              render: (value, row) => {
                if (!riskCriteria)
                  return <span className="text-sm text-gray-500">-</span>;

                const diff = row.riskScore - riskCriteria.threshold;
                let status = "";
                let statusColor = "";

                if (diff > 0) {
                  status = `+${diff} poin`;
                  statusColor =
                    "text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium";
                } else if (diff < 0) {
                  status = `Bawah Threshold: ${diff} poin`;
                  statusColor =
                    "text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium";
                } else {
                  status = "Di Threshold";
                  statusColor =
                    "text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium";
                }

                return <span className={statusColor}>{status}</span>;
              },
              searchable: false,
            },
            {
              header: "Perlakuan",
              key: "treatment",
              render: (value, row: any) => {
                if (!row.treatment) return <span className="text-sm">-</span>;
                
                const treatmentOpt = String(row.treatment.treatmentOpt);
                let color = "";
                
                switch (treatmentOpt) {
                  case "MITIGATE":
                    color = "text-blue-600 bg-blue-50";
                    break;
                  case "ACCEPT":
                    color = "text-amber-600 bg-amber-50";
                    break;
                  case "AVOID":
                    color = "text-red-600 bg-red-50";
                    break;
                  case "TRANSFER":
                    color = "text-purple-600 bg-purple-50";
                    break;
                  default:
                    color = "text-gray-600 bg-gray-50";
                }
                
                return (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
                    {treatmentOpt}
                  </span>
                );
              },
            },
            {
              header: "Penanggung Jawab",
              key: "picName",
              render: (value) => (
                <span className="text-sm">{String(value)}</span>
              ),
            },
            {
              header: riskCriteria?.isFMEA
                ? "Target Severity"
                : "Target Impact",
              key: "treatment",
              render: (value, row: any) => {
                if (!row.treatment)
                  return <span className="text-sm text-gray-600">-</span>;
                return (
                  <span className="text-sm font-medium">
                    {row.treatment.impactSeverityTarget}
                  </span>
                );
              },
              searchable: false,
            },
            {
              header: riskCriteria?.isFMEA
                ? "Target Occurrence"
                : "Target Likelihood",
              key: "treatment",
              render: (value, row: any) => {
                if (!row.treatment)
                  return <span className="text-sm text-gray-600">-</span>;
                return (
                  <span className="text-sm font-medium">
                    {row.treatment.likelihoodOccurenceTarget}
                  </span>
                );
              },
              searchable: false,
            },
            ...(riskCriteria?.isFMEA
              ? [
                  {
                    header: "Target Detection",
                    key: "treatment" as const,
                    render: (value: any, row: any) => {
                      if (!row.treatment)
                        return <span className="text-sm text-gray-600">-</span>;
                      return (
                        <span className="text-sm font-medium">
                          {row.treatment.detectionTarget}
                        </span>
                      );
                    },
                    searchable: false,
                  },
                ]
              : []),
            {
              header: "Status",
              key: "approvalStatus",
              render: (value, row) => {
                // If treatment hasn't been assigned yet
                if (!row.treatment) {
                  return (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      Draft
                    </span>
                  );
                }
                // If treatment exists, check approval status
                if (value === null) {
                  return (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Menunggu Persetujuan
                    </span>
                  );
                } else if (value === true) {
                  return (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      DISETUJUI
                    </span>
                  );
                } else {
                  return (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      DITOLAK
                    </span>
                  );
                }
              },
              searchable: false,
            },
            {
              header: "Aksi",
              key: "id",
              render: (value: any, row: any) => {
                // Only RISK_MANAGER can edit
                const canEdit =
                  row.treatment &&
                  row.treatment.isApprovedByTop !== true &&
                  row.userRole === "RISK_MANAGER";

                // RISK_OWNER can only view existing treatments
                const canView =
                  row.treatment &&
                  row.userRole === "RISK_OWNER";

                // TOP_MANAGEMENT approval/rejection pending
                const isPending =
                  row.treatment &&
                  row.treatment.isApprovedByTop === null &&
                  row.userRole === "TOP_MANAGEMENT";

                // RISK_OWNER cannot create, only view
                if (row.userRole === "RISK_OWNER" && !row.treatment) {
                  return null;
                }

                return (
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={open && selectedRisk?.id === row.id}
                      onOpenChange={setOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant={row.treatment ? "ghost" : "outline"}
                          onClick={() =>
                            openTreatmentForm(
                              row.risk,
                              row.treatment ?? undefined
                            )
                          }
                        >
                          {!row.treatment && row.userRole === "RISK_MANAGER" && "Pilih Treatment"}
                          {row.treatment && canEdit && (
                            <Edit className="w-4 h-4" />
                          )}
                          {row.treatment && (canView || !canEdit) && (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-5xl w-full">
                        <DialogHeader className="border-b border-sky-100 pb-4">
                          <DialogTitle className="text-2xl text-gray-900">
                            {isEditMode
                              ? "Edit Treatment"
                              : row.treatment
                              ? "Lihat Treatment"
                              : "Penetapan Treatment Risiko"}
                          </DialogTitle>
                        </DialogHeader>

                        {/* TOP_MANAGEMENT View - Read-only display */}
                        <div className="space-y-6">
                          {/* Risk Information Section */}
                          <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-sky-900 mb-3 uppercase tracking-wide">
                              Informasi Risiko
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-sky-900 font-medium mb-1">
                                  Kode Risiko
                                </p>
                                <p className="font-semibold text-lg text-sky-900">
                                  {row.risk.customRiskId}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-sky-900 font-medium mb-1">
                                  Kerentanan (Vulnerability)
                                </p>
                                <p className="text-sm text-gray-600">
                                  {row.risk.vulnerability}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-sky-900 font-medium mb-1">
                                  Risiko Teridentifikasi
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {row.risk.identifiedRisk}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-sky-900 font-medium mb-1">
                                  Ancaman (Threat)
                                </p>
                                <p className="text-sm text-gray-600">
                                  {row.risk.threat}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Treatment Selection Section */}
                          <div className="grid grid-cols-2 gap-4">
                            <FieldGroup>
                              <Field>
                                <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Opsi Perlakuan</FieldLabel>
                                <Select
                                  value={form.treatmentOpt}
                                  onValueChange={(v) =>
                                    setForm((s) => ({ ...s, treatmentOpt: v }))
                                  }
                                  disabled={!isEditMode && !!row.treatment}
                                >
                                  <SelectTrigger className="border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MITIGATE">
                                      Mitigate
                                    </SelectItem>
                                    <SelectItem value="ACCEPT">Accept</SelectItem>
                                    <SelectItem value="AVOID">Avoid</SelectItem>
                                    <SelectItem value="TRANSFER">
                                      Transfer
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>
                            </FieldGroup>

                            <FieldGroup>
                              <Field>
                                <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Penanggung Jawab (PIC)</FieldLabel>
                                <Select
                                  value={form.picId}
                                  onValueChange={(v) =>
                                    setForm((s) => ({ ...s, picId: v }))
                                  }
                                  disabled={!isEditMode && !!row.treatment}
                                >
                                  <SelectTrigger className="border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                                    <SelectValue placeholder="Pilih Penanggung Jawab" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {users.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        <div className="flex flex-col">
                                          <span>{user.name}</span>
                                          <span className="text-xs text-gray-500">
                                            {formatRoleLabel(user.role)}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                            </FieldGroup>
                          </div>

{/* Target Residual & Current Status Section */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Target Residual Section */}
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-sky-900 uppercase tracking-widest">
                                Target Residual
                              </label>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">
                                    {riskCriteria?.isFMEA
                                      ? "Target Severity"
                                      : "Target Impact"}
                                  </label>
                                  <Select
                                    value={form.impactSeverityTarget}
                                    onValueChange={(v) =>
                                      setForm((s) => ({
                                        ...s,
                                        impactSeverityTarget: v,
                                      }))
                                    }
                                    disabled={!isEditMode && !!row.treatment}
                                  >
                                    <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {riskCriteria?.scaleStatuses?.map((status) => (
                                        <SelectItem
                                          key={status.id}
                                          value={status.level.toString()}
                                        >
                                          {status.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">
                                    {riskCriteria?.isFMEA
                                      ? "Target Occurrence"
                                      : "Target Likelihood"}
                                  </label>
                                  <Select
                                    value={form.likelihoodOccurenceTarget}
                                    onValueChange={(v) =>
                                      setForm((s) => ({
                                        ...s,
                                        likelihoodOccurenceTarget: v,
                                      }))
                                    }
                                    disabled={!isEditMode && !!row.treatment}
                                  >
                                    <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {riskCriteria?.scaleStatuses?.map((status) => (
                                        <SelectItem
                                          key={status.id}
                                          value={status.level.toString()}
                                        >
                                          {status.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {riskCriteria?.isFMEA && (
                                  <div>
                                    <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">
                                      Target Detection
                                    </label>
                                    <Select
                                      value={form.detectionTarget}
                                      onValueChange={(v) =>
                                        setForm((s) => ({
                                          ...s,
                                          detectionTarget: v,
                                        }))
                                      }
                                      disabled={!isEditMode && !!row.treatment}
                                    >
                                      <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                                        <SelectValue placeholder="Select level" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {riskCriteria?.scaleStatuses?.map((status) => (
                                          <SelectItem
                                            key={status.id}
                                            value={status.level.toString()}
                                          >
                                            {status.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Current Risk Status Section */}
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg h-fit">
                              <p className="text-xs font-semibold text-amber-900 mb-4 uppercase tracking-wide">
                                Kondisi Saat Ini
                              </p>
                              <div className={`space-y-3`}>
                                <div>
                                  <p className="text-xs text-amber-900 font-medium mb-2">
                                    {riskCriteria?.isFMEA
                                      ? "Current Severity"
                                      : "Current Impact"}
                                  </p>
                                  <p className="text-sm font-semibold text-amber-900">
                                    {riskCriteria?.scaleStatuses?.find(s => s.level === row.risk.impactSeverity)?.title || row.risk.impactSeverity}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-amber-900 font-medium mb-2">
                                    {riskCriteria?.isFMEA
                                      ? "Current Occurrence"
                                      : "Current Likelihood"}
                                  </p>
                                  <p className="text-sm font-semibold text-amber-900">
                                    {riskCriteria?.scaleStatuses?.find(s => s.level === row.risk.likelihoodOccurence)?.title || row.risk.likelihoodOccurence}
                                  </p>
                                </div>
                                {riskCriteria?.isFMEA && (
                                  <div>
                                    <p className="text-xs text-amber-900 font-medium mb-2">
                                      Current Detection
                                    </p>
                                    <p className="text-sm font-semibold text-amber-900">
                                      {riskCriteria?.scaleStatuses?.find(s => s.level === row.risk.detection)?.title || row.risk.detection}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Reason & Detailed Action Plan Section */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">
                                Alasan Pemilihan Opsi
                              </p>
                              <Textarea
                                value={form.actionReason}
                                onChange={(e) =>
                                  setForm((s) => ({
                                    ...s,
                                    actionReason: e.target.value,
                                  }))
                                }
                                disabled={!isEditMode && !!row.treatment}
                                placeholder="Jelaskan alasan pemilihan opsi perlakuan"
                                className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">
                                Rencana Aksi Detail
                              </p>
                              <Textarea
                                value={form.detailedActionPlan}
                                onChange={(e) =>
                                  setForm((s) => ({
                                    ...s,
                                    detailedActionPlan: e.target.value,
                                  }))
                                }
                                disabled={!isEditMode && !!row.treatment}
                                placeholder="Deskripsi rencana aksi yang detail"
                                className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                              />
                            </div>
                          </div>

                          {/* Timeline Section */}
                          <div className="grid grid-cols-2 gap-4">
                            <FieldGroup>
                              <Field>
                                <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Start Action</FieldLabel>
                                <Input
                                  type="date"
                                  value={form.startAction}
                                  onChange={(e) =>
                                    setForm((s) => ({
                                      ...s,
                                      startAction: e.target.value,
                                    }))
                                  }
                                  disabled={!isEditMode && !!row.treatment}
                                  className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                                />
                              </Field>
                            </FieldGroup>
                            <FieldGroup>
                              <Field>
                                <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">End Action</FieldLabel>
                                <Input
                                  type="date"
                                  value={form.endAction}
                                  onChange={(e) =>
                                    setForm((s) => ({
                                      ...s,
                                      endAction: e.target.value,
                                    }))
                                  }
                                  disabled={!isEditMode && !!row.treatment}
                                  className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                                />
                              </Field>
                            </FieldGroup>
                          </div>

                          {/* Related Controls Section */}
                          <div className="space-y-3">
                            <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">
                              Kontrol Terkait (Annex A)
                            </label>

                            {/* Selected Controls as Chips */}
                            {selectedControls.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                                {selectedControls.map((control) => (
                                  <div
                                    key={control.id}
                                    className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap"
                                  >
                                    <span className="truncate">
                                      {(control.code || "").trim()} -{" "}
                                      {control.title}
                                    </span>
                                        {(!row.treatment || isEditMode) && (
                                          <button
                                            onClick={() =>
                                              setSelectedControls((prev) =>
                                                prev.filter(
                                                  (c) => c.id !== control.id
                                                )
                                              )
                                            }
                                            className="hover:opacity-70 ml-1 flex-shrink-0"
                                            title="Hapus kontrol"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Search Input */}
                                {!row.treatment || isEditMode ? (
                                  <>
                                    <Input
                                      placeholder="Cari kontrol by code atau title..."
                                      value={searchControl}
                                      onChange={(e) =>
                                        setSearchControl(e.target.value)
                                      }
                                      onFocus={() => setSearchFocused(true)}
                                      onBlur={() => setSearchFocused(false)}
                                      disabled={!isEditMode && !!row.treatment}
                                      className="mb-2 border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                                    />

                                    {/* Control Dropdown - Show only when input is focused or has text */}
                                    {(searchFocused || searchControl) &&
                                      filteredControls.length > 0 && (
                                        <div
                                          className="border rounded-lg overflow-hidden shadow-md bg-white max-h-64 overflow-y-auto"
                                          onMouseDown={(e) => e.preventDefault()}
                                        >
                                          {filteredControls.map((control) => {
                                            const isSelected =
                                              selectedControls.some(
                                                (c) => c.id === control.id
                                              );
                                            return (
                                              <button
                                                key={control.id}
                                                onClick={() => {
                                                  if (isSelected) {
                                                    setSelectedControls((prev) =>
                                                      prev.filter(
                                                        (c) => c.id !== control.id
                                                      )
                                                    );
                                                  } else {
                                                    setSelectedControls(
                                                      (prev) => [
                                                        ...prev,
                                                        {
                                                          id: control.id,
                                                          code: control.code,
                                                          title: control.title,
                                                        },
                                                      ]
                                                    );
                                                  }
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm border-b last:border-b-0 transition-colors ${
                                                  isSelected
                                                    ? "bg-sky-50 hover:bg-sky-100"
                                                    : "hover:bg-gray-50"
                                                }`}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="mt-0.5"
                                                  />
                                                  <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                      {control.code}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                      {control.title}
                                                    </p>
                                                  </div>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}

                                    {/* No results message */}
                                    {(searchFocused || searchControl) &&
                                      searchControl &&
                                      filteredControls.length === 0 && (
                                        <div className="text-center py-4 text-gray-500 text-sm border rounded-lg bg-gray-50">
                                          Kontrol tidak ditemukan
                                        </div>
                                      )}
                                  </>
                                ) : null}

                                {/* View-only mode */}
                                {row.treatment &&
                                  selectedControls.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                      Tidak ada kontrol terkait
                                    </p>
                                  )}
                            </div>

                          {/* Notes Section */}
                          <div>
                            <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">
                              Catatan Tambahan
                            </p>
                            <Textarea
                              value={form.notes}
                              onChange={(e) =>
                                setForm((s) => ({
                              ...s,
                              notes: e.target.value,
                            }))
                          }
                          disabled={!isEditMode && !!row.treatment}
                          placeholder="Catatan tambahan"
                          className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                        />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOpen(false);
                              setSelectedRisk(null);
                              setSelectedControls([]);
                              setIsEditMode(false);
                            }}
                          >
                            {row.treatment ? "Tutup" : "Batal"}
                          </Button>
                          {!row.treatment && (
                            <Button onClick={saveTreatment}>Simpan</Button>
                          )}
                          {isEditMode && row.userRole === "RISK_MANAGER" && (
                            <Button onClick={updateTreatment}>Update</Button>
                          )}
                          {row.treatment &&
                            row.userRole === "TOP_MANAGEMENT" &&
                            row.treatment.isApprovedByTop === null && (
                              <>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    setTreatmentIdForConfirm(row.treatment?.id || null);
                                    setConfirmationAction("reject");
                                    setConfirmationDialogOpen(true);
                                  }}
                                  className="gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Tolak
                                </Button>
                                <Button
                                  onClick={() => {
                                    setTreatmentIdForConfirm(row.treatment?.id || null);
                                    setConfirmationAction("approve");
                                    setConfirmationDialogOpen(true);
                                  }}
                                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Terima
                                </Button>
                              </>
                            )}
                        </DialogFooter>

                        {/* Confirmation Dialog */}
                        <AlertDialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {confirmationAction === "approve"
                                  ? "Setujui Treatment?"
                                  : "Tolak Treatment?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {confirmationAction === "approve"
                                  ? "Apakah Anda yakin ingin menyetujui treatment ini?"
                                  : "Apakah Anda yakin ingin menolak treatment ini?"}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (confirmationAction === "approve") {
                                    approveTreatment(treatmentIdForConfirm || undefined);
                                  } else if (confirmationAction === "reject") {
                                    rejectTreatment(treatmentIdForConfirm || undefined);
                                  }
                                  setConfirmationDialogOpen(false);
                                }}
                                className={confirmationAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
                              >
                                {confirmationAction === "approve" ? "Setujui" : "Tolak"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              },
              searchable: false,
            },
          ]}
          pageSize={10}
          emptyMessage="Tidak ada data treatment"
        />
      )}
    </div>
  );
}
