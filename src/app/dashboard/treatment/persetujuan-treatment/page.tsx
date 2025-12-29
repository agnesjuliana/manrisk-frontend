"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import { loadTreatments, saveTreatments, type Treatment } from "@/lib/treatmentsStore";
import { loadRisks } from "@/lib/risksStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function PersetujuanTreatmentPage() {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const risks = useMemo(() => loadRisks(), []);
  const riskMap = useMemo(() => new Map(risks.map((r) => [r.id, r])), [risks]);

  useEffect(() => {
    setMounted(true);
    setTreatments(loadTreatments());
  }, []);

  if (!mounted || !user) return null;

  const isTopManagement = user.role === "TOP_MANAGEMENT";
  const isRiskManager = user.role === "RISK_MANAGER";

  // Filter treatments berdasarkan role
  const filteredTreatments = isTopManagement
    ? treatments.filter((t) => t.approvalStatus === "SUBMITTED")
    : treatments.filter((t) => t.approvalStatus === "DRAFT");

  const computeRiskScore = (severity: number, likelihood: number) => severity * likelihood;

  const getRiskLevelBadgeColor = (severity: number, likelihood: number) => {
    const score = computeRiskScore(severity, likelihood);
    if (score >= 16) return "bg-red-100 text-red-700";
    if (score >= 9) return "bg-orange-100 text-orange-700";
    if (score >= 4) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getRiskLevelText = (severity: number, likelihood: number) => {
    const score = computeRiskScore(severity, likelihood);
    if (score >= 16) return "Critical";
    if (score >= 9) return "High";
    if (score >= 4) return "Medium";
    return "Low";
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "SUBMITTED":
        return "Menunggu Persetujuan";
      case "APPROVED":
        return "Disetujui";
      default:
        return status || "-";
    }
  };

  const handleApprove = (id: string) => {
    setTreatments((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, approvalStatus: "APPROVED" as const } : t
      );
      saveTreatments(next);
      return next;
    });
    toast.success("Treatment berhasil disetujui");
    setPendingId(null);
    setActionType(null);
  };

  const handleReject = (id: string) => {
    setTreatments((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTreatments(next);
      return next;
    });
    toast.success("Treatment berhasil ditolak");
    setPendingId(null);
    setActionType(null);
  };

  const tableData = filteredTreatments.map((treatment) => {
    const risk = riskMap.get(treatment.riskId);
    const riskLevel = getRiskLevelText(
      risk?.severity || 0,
      risk?.likelihood || 0
    );

    return {
      id: treatment.id,
      riskCode: treatment.riskId,
      riskTitle: risk?.identifiedRisk ?? "-",
      riskLevel: riskLevel,
      riskScore: computeRiskScore(risk?.severity || 0, risk?.likelihood || 0),
      treatmentOption: treatment.option,
      targetResidual: treatment.target
        ? `L:${treatment.target.likelihood ?? "-"} / I:${treatment.target.impact ?? "-"}`
        : "-",
      status: treatment.approvalStatus,
      treatmentId: treatment.id,
      severity: risk?.severity || 0,
      likelihood: risk?.likelihood || 0,
    };
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isTopManagement ? "Persetujuan Treatment (Top Management)" : "Persetujuan Treatment (Risk Manager)"}
        </h2>
      </div>

      <PaginatedTable
        data={tableData}
        columns={[
          {
            header: "No",
            key: "treatmentId",
            render: (_, row) => {
              const index = tableData.findIndex((t) => t.treatmentId === row.treatmentId);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "ID",
            key: "treatmentId",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Risk Code",
            key: "riskCode",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Risk Title",
            key: "riskTitle",
          },
          {
            header: "Risk Level",
            key: "riskLevel",
            render: (value, row) => (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelBadgeColor(
                  row.severity,
                  row.likelihood
                )}`}
              >
                {String(value)}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Treatment Option",
            key: "treatmentOption",
          },
          {
            header: "Target Residual",
            key: "targetResidual",
            render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
          },
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
          ...(isTopManagement
            ? [
                {
                  header: "Aksi",
                  key: "treatmentId",
                  render: (value: any) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setPendingId(String(value));
                          setActionType("approve");
                        }}
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setPendingId(String(value));
                          setActionType("reject");
                        }}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Tolak
                      </Button>
                    </div>
                  ),
                  searchable: false,
                } as any,
              ]
            : []),
        ]}
        pageSize={10}
        emptyMessage={
          isTopManagement
            ? "Tidak ada treatment yang menunggu persetujuan"
            : "Tidak ada treatment yang dibuat"
        }
      />

      {/* Alert Dialog for Confirmation */}
      <AlertDialog open={pendingId !== null} onOpenChange={() => setPendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Setujui Treatment?
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Tolak Treatment?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "Anda akan menyetujui treatment ini. Tindakan ini tidak dapat dibatalkan."
                : "Anda akan menolak treatment ini. Tindakan ini tidak dapat dibatalkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pendingId && actionType === "approve") {
                handleApprove(pendingId);
              } else if (pendingId && actionType === "reject") {
                handleReject(pendingId);
              }
            }}
            className={
              actionType === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {actionType === "approve" ? "Setujui" : "Tolak"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
