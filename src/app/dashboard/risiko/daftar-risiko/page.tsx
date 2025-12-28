"use client";

import * as React from "react";
import { toast } from "sonner";
import { PaginatedTable } from "@/components/paginated-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash, Edit, Eye, CheckCircle, X, ArchiveX, ArchiveRestore, SendHorizontal } from "lucide-react";
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
  likelihoodOccurrence?: number;
  detection?: number;
  status: string;
  riskcategory?: { id: string; name: string };
  source?: { id: string; name: string };
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

export default function DaftarRisikoPage() {
  const { user } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedRisk, setSelectedRisk] = React.useState<Risk | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const isRiskOwner = user?.role === "RISK_OWNER";
  const isRiskManager = user?.role === "RISK_MANAGER";

  const [form, setForm] = React.useState<Partial<Risk>>({
    vulnerability: "",
    threat: "",
    identifiedRisk: "",
    detail: "",
    isConfidentiality: false,
    isIntegrity: false,
    isAvailability: false,
    impactSeverity: 3,
    likelihoodOccurrence: 3,
    detection: undefined,
  });

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
        const [catRes, srcRes, assetRes, ctxRes] = await Promise.all([
          apiClient.get("/risk-registers/category"),
          apiClient.get("/risk-registers/source"),
          apiClient.get("/assets"),
          apiClient.get("/contexts"),
        ]);

        if (catRes.data?.data) setCategories(catRes.data.data);
        if (srcRes.data?.data) setSources(srcRes.data.data);
        if (assetRes.data?.data?.data) setAssets(assetRes.data.data.data);
        if (ctxRes.data?.data?.data) setContexts(ctxRes.data.data.data);
      } catch (err) {
        console.error("Error loading dropdown data:", err);
      }
    };

    loadDropdownData();
  }, []);

  const handleAdd = async () => {
    if (!form.vulnerability?.trim() || !form.riskcategory?.id || !form.source?.id) {
      toast.error("Isi field yang diperlukan");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customRiskId: `RISK-${Date.now()}`,
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
        likelihoodOccurrence: form.likelihoodOccurrence || 3,
        detection: form.detection,
        riskcategory: form.riskcategory,
        source: form.source,
        ownerId: form.owner?.id,
      };

      const response = await apiClient.post("/risk-registers", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Risiko berhasil ditambahkan");
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
          likelihoodOccurrence: 3,
        });
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error adding risk:", err);
      toast.error("Gagal menambahkan risiko");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetail = (risk: Risk) => {
    setSelectedRisk(risk);
    setDetailOpen(true);
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold">Daftar Risiko & Assessment</h1>
        {(isRiskOwner || isRiskManager) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} /> Tambah Risiko
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Risiko</DialogTitle>
                <DialogDescription>Isi detail risiko dan metrik penilaian.</DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Field>
                      <FieldLabel>Risk Category *</FieldLabel>
                      <Select
                        value={form.riskcategory?.id || ""}
                        onValueChange={(id) => {
                          const cat = categories.find((c) => c.id === id);
                          if (cat) {
                            setForm((p) => ({
                              ...p,
                              riskcategory: { id: cat.id, name: cat.title },
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Vulnerability *</FieldLabel>
                      <Input
                        value={String(form.vulnerability || "")}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, vulnerability: e.currentTarget.value }))
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Threat</FieldLabel>
                      <Input
                        value={String(form.threat || "")}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, threat: e.currentTarget.value }))
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Risk Source *</FieldLabel>
                      <Select
                        value={form.source?.id || ""}
                        onValueChange={(id) => {
                          const src = sources.find((s) => s.id === id);
                          if (src) {
                            setForm((p) => ({
                              ...p,
                              source: { id: src.id, name: src.title },
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih sumber" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Asset</FieldLabel>
                      <Select
                        value={form.assetId || ""}
                        onValueChange={(id) =>
                          setForm((p) => ({ ...p, assetId: id }))
                        }
                      >
                        <SelectTrigger className="w-full">
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

                    <Field>
                      <FieldLabel>Context</FieldLabel>
                      <Select
                        value={form.contextId || ""}
                        onValueChange={(id) =>
                          setForm((p) => ({ ...p, contextId: id }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih konteks" />
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

                  <div className="col-span-1">
                    <Field>
                      <FieldLabel>Identified Risk</FieldLabel>
                      <Input
                        value={String(form.identifiedRisk || "")}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, identifiedRisk: e.currentTarget.value }))
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>CIA Impact</FieldLabel>
                      <div className="flex gap-4 flex-wrap">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.isConfidentiality || false}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                isConfidentiality: e.target.checked,
                              }))
                            }
                          />
                          <span>Confidentiality</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.isIntegrity || false}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                isIntegrity: e.target.checked,
                              }))
                            }
                          />
                          <span>Integrity</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.isAvailability || false}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                isAvailability: e.target.checked,
                              }))
                            }
                          />
                          <span>Availability</span>
                        </label>
                      </div>
                    </Field>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Field>
                          <FieldLabel>Impact Severity</FieldLabel>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={String(form.impactSeverity ?? 3)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                impactSeverity: Number(e.target.value),
                              }))
                            }
                            className="w-full"
                          />
                        </Field>
                      </div>
                      <div className="col-span-1">
                        <Field>
                          <FieldLabel>Likelihood</FieldLabel>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={String(form.likelihoodOccurrence ?? 3)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                likelihoodOccurrence: Number(e.target.value),
                              }))
                            }
                            className="w-full"
                          />
                        </Field>
                      </div>
                      <div className="col-span-1">
                        <Field>
                          <FieldLabel>Detection</FieldLabel>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={String(form.detection ?? "")}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                detection: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }))
                            }
                            className="w-full"
                            placeholder="Optional"
                          />
                        </Field>
                      </div>
                    </div>

                    {isRiskManager && (
                      <Field>
                        <FieldLabel>Risk Owner</FieldLabel>
                        <Input
                          type="text"
                          placeholder="Owner ID atau name"
                          value={form.owner?.id || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              owner: { id: e.target.value, name: "" },
                            }))
                          }
                        />
                      </Field>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Field>
                      <FieldLabel>Detail</FieldLabel>
                      <Textarea
                        value={String(form.detail ?? "")}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, detail: e.target.value }))
                        }
                        rows={3}
                      />
                    </Field>
                  </div>
                </div>
              </FieldGroup>

              <DialogFooter>
                <div className="flex justify-end w-full gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                    Batal
                  </Button>
                  <Button onClick={handleAdd} disabled={isSubmitting}>
                    {isSubmitting ? "Menambahkan..." : "Tambah Risiko"}
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
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Kategori",
            key: "riskcategory",
            render: (value: any) => value?.name || "-",
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
            header: "Severity",
            key: "impactSeverity",
            render: (value) => <span className="text-center">{String(value ?? "-")}</span>,
            searchable: false,
          },
          {
            header: "Likelihood",
            key: "likelihoodOccurrence",
            render: (value) => <span className="text-center">{String(value ?? "-")}</span>,
            searchable: false,
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
          {
            header: "Aksi",
            key: "id",
            render: (value: any, row: Risk) => {
              const isOwner = row.owner?.id === user?.id || isRiskOwner;
              const isPending = row.status === RiskStatus.MENUNGGU_PERSETUJUAN_RM;
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

                    {isOwner &&
                      row.status === RiskStatus.DRAFT && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                              >
                                <SendHorizontal size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ajukan untuk persetujuan</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
                            >
                              <ArchiveRestore size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Kembalikan ke draft</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {isRiskManager &&
                      (isPending || isRevisi) && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <SendHorizontal size={16} />
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
            Menampilkan halaman {currentPage} dari {totalPages} ({totalRisks} total
            risiko)
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Risiko</DialogTitle>
            <DialogDescription>
              Informasi lengkap risiko: {selectedRisk?.customRiskId}
            </DialogDescription>
          </DialogHeader>

          {selectedRisk && (
            <FieldGroup className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Risk ID</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedRisk.customRiskId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        selectedRisk.status
                      )}`}
                    >
                      {getStatusLabel(selectedRisk.status)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.riskcategory?.name || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Sumber Risiko</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.source?.name || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Vulnerability</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedRisk.vulnerability}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Threat</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.threat || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Identified Risk</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.identifiedRisk || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Asset</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.assetId || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Context</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.contextId || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Risk Owner</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.owner?.name || selectedRisk.owner?.id || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">CIA Impact</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {[
                      selectedRisk.isConfidentiality && "Confidentiality",
                      selectedRisk.isIntegrity && "Integrity",
                      selectedRisk.isAvailability && "Availability",
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Impact Severity</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.impactSeverity || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Likelihood</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.likelihoodOccurrence || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Detection</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.detection || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRisk.createdAt
                      ? new Date(selectedRisk.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Detail</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedRisk.detail || "-"}
                  </p>
                </div>
              </div>
            </FieldGroup>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
