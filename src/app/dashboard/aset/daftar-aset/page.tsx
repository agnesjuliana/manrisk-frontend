"use client";

import * as React from "react";
import { toast } from "sonner";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import {
  loadAssets,
  saveAssets,
  type Asset,
  AssetStatus,
} from "@/lib/assetsStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
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
import { Plus, Trash, Edit, SendHorizontal, ArchiveX, ArchiveRestore, X, CheckCircle } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { assetsApi, type AssetType, type AssetClassification } from "@/lib/api";

type User = StoreUser;

export default function DaftarAsetPage() {
  const { user } = useAuth();
  const isRiskOwner = user?.role === "RISK_OWNER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const [assetTypes, setAssetTypes] = React.useState<AssetType[]>([]);
  const [classifications, setClassifications] = React.useState<
    AssetClassification[]
  >([]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalAssets, setTotalAssets] = React.useState(0);
  const [isLoadingAssets, setIsLoadingAssets] = React.useState(true);

  const [form, setForm] = React.useState({
    name: "",
    type: "",
    typeId: "",
    classification: "",
    classificationId: "",
    location: "",
  });

  const [editingAssetId, setEditingAssetId] = React.useState<string | null>(
    null
  );
  const [showTypeSuggestions, setShowTypeSuggestions] = React.useState(false);
  const [showClassificationSuggestions, setShowClassificationSuggestions] =
    React.useState(false);

  const filteredAssetTypes = React.useMemo(() => {
    if (!form.type.trim()) return assetTypes;
    return assetTypes.filter((t) =>
      t.title.toLowerCase().includes(form.type.toLowerCase())
    );
  }, [form.type, assetTypes]);

  const filteredClassifications = React.useMemo(() => {
    if (!form.classification.trim()) return classifications;
    return classifications.filter((c) =>
      c.title.toLowerCase().includes(form.classification.toLowerCase())
    );
  }, [form.classification, classifications]);

  // Load data on client side only
  React.useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // Load assets from API with pagination
  React.useEffect(() => {
    const loadAssetsFromAPI = async () => {
      setIsLoadingAssets(true);
      try {
        // For TOP_MANAGEMENT, filter by approved and waiting for final approval statuses
        const statusFilter = isTopManagement 
          ? "DISETUJUI,MENUNGGU_PERSETUJUAN_FINAL" 
          : undefined;

        const response = await assetsApi.getAssets(currentPage, 20, statusFilter);

        if (response.status && response.data) {
          // Map API response to local Asset type
          const mappedAssets: Asset[] = response.data.data.map((asset) => {
            // Map API status to local AssetStatus enum
            let mappedStatus: AssetStatus = AssetStatus.DRAFT;
            const apiStatus = (asset.status || "").toUpperCase();

            // Map API status to enum values
            if (apiStatus in AssetStatus) {
              mappedStatus = apiStatus as AssetStatus;
            }

            return {
              id: asset.id,
              name: asset.name,
              type: asset.type?.title || "", // Changed from .name to .title
              classification: asset.classification?.title || "", // Changed from .name to .title
              location: asset.location || "",
              status: mappedStatus,
              ownerId: asset.owner?.id,
              ownerName: asset.owner?.name,
              division: asset.owner?.department?.name,
            };
          });

          setAssets(mappedAssets);

          // Update pagination info
          if (response.data.metadata) {
            setTotalPages(response.data.metadata.total_page);
            setTotalAssets(response.data.metadata.total_data);
          }
        }
      } catch (err) {
        console.error("Error loading assets:", err);
        toast.error("Gagal memuat daftar aset");
      } finally {
        setIsLoadingAssets(false);
      }
    };

    loadAssetsFromAPI();
  }, [currentPage, isTopManagement]);

  // Load asset types and classifications on mount
  React.useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoading(true);
      try {
        const [typesResponse, classificationsResponse] = await Promise.all([
          assetsApi.getTypes(),
          assetsApi.getClassifications(),
        ]);

        if (typesResponse.status && typesResponse.data.data) {
          setAssetTypes(typesResponse.data.data);
        }

        if (
          classificationsResponse.status &&
          classificationsResponse.data.data
        ) {
          setClassifications(classificationsResponse.data.data);
        }
      } catch (err) {
        console.error("Error loading dropdown data:", err);
        toast.error("Gagal memuat data tipe dan klasifikasi aset");
      } finally {
        setIsLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  function handleAdd() {
    if (!form.name.trim() || !form.type || !form.classification) {
      toast.error("Nama, tipe, dan klasifikasi aset harus diisi");
      return;
    }

    setIsSaving(true);

    (async () => {
      try {
        const typeId = form.typeId
          ? form.typeId // User selected from dropdown
          : null; // User typed new value, nullify ID

        const classificationId = form.classificationId
          ? form.classificationId // User selected from dropdown
          : null; // User typed new value, nullify ID

        const response = await assetsApi.create({
          name: form.name,
          location: form.location || undefined,
          type: {
            id: typeId,
            name: form.type,
          },
          classification: {
            id: classificationId,
            name: form.classification,
          },
        });

        if (response.status) {
          // Add to local state (optional - can also refetch)
          const newAsset: Asset = {
            id: response.data.id,
            name: response.data.name,
            type: response.data.type.title,
            classification: response.data.classification.title,
            location: response.data.location || "",
            status: AssetStatus.DRAFT,
          };

          setAssets((prev) => {
            const next = [newAsset, ...prev];
            // Don't save to localStorage, refresh from API instead
            setCurrentPage(1); // Reset to first page to show new asset
            return next;
          });

          setForm({
            name: "",
            type: "",
            typeId: "",
            classification: "",
            classificationId: "",
            location: "",
          });
          setOpen(false);
          toast.success("Aset berhasil ditambahkan!");
        } else {
          toast.error(response.message || "Gagal menambah aset");
        }
      } catch (err) {
        console.error("Error adding asset:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menambah aset"
        );
      } finally {
        setIsSaving(false);
      }
    })();
  }

  function removeAsset(id: string) {
    setAssets((prev) => prev.filter((p) => p.id !== id));
    // Refresh data from API
    setCurrentPage(1);
  }

  async function handleDeleteAsset(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;

    try {
      const response = await assetsApi.delete(id);
      if (response.status) {
        removeAsset(id);
        toast.success("Aset berhasil dihapus!");
      } else {
        toast.error(response.message || "Gagal menghapus aset");
      }
    } catch (err) {
      console.error("Error deleting asset:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus aset"
      );
    }
  }

  async function handleSubmitForApproval(id: string) {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengirim aset ini untuk persetujuan RM?"
      )
    )
      return;

    try {
      const assetToSubmit = assets.find((a) => a.id === id);
      if (!assetToSubmit) return;

      const response = await assetsApi.update(id, {
        name: assetToSubmit.name,
        location: assetToSubmit.location || undefined,
        type: {
          id: null,
          name: assetToSubmit.type,
        },
        classification: {
          id: null,
          name: assetToSubmit.classification,
        },
        status: AssetStatus.MENUNGGU_PERSETUJUAN_RM,
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: AssetStatus.MENUNGGU_PERSETUJUAN_RM,
                }
              : a
          )
        );
        toast.success("Aset berhasil dikirim untuk persetujuan RM!");
      } else {
        toast.error(
          response.message || "Gagal mengirim aset untuk persetujuan"
        );
      }
    } catch (err) {
      console.error("Error submitting asset for approval:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim aset untuk persetujuan"
      );
    }
  }

  async function handleRevertToDraft(id: string) {
    if (!confirm("Apakah Anda yakin ingin mengubah status aset kembali ke Draft?")) return;

    try {
      const assetToRevert = assets.find((a) => a.id === id);
      if (!assetToRevert) return;

      const response = await assetsApi.update(id, {
        name: assetToRevert.name,
        location: assetToRevert.location || undefined,
        type: {
          id: null,
          name: assetToRevert.type,
        },
        classification: {
          id: null,
          name: assetToRevert.classification,
        },
        status: AssetStatus.DRAFT,
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: AssetStatus.DRAFT,
                }
              : a
          )
        );
        toast.success("Status aset berhasil diubah kembali ke Draft!");
      } else {
        toast.error(response.message || "Gagal mengubah status aset");
      }
    } catch (err) {
      console.error("Error reverting asset to draft:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengubah status aset"
      );
    }
  }

  async function handleReviseAsset(id: string) {
    if (!confirm("Apakah Anda yakin ingin mengirim aset ini untuk revisi?")) return;

    try {
      const assetToRevise = assets.find((a) => a.id === id);
      if (!assetToRevise) return;

      const response = await assetsApi.update(id, {
        name: assetToRevise.name,
        location: assetToRevise.location || undefined,
        type: {
          id: null,
          name: assetToRevise.type,
        },
        classification: {
          id: null,
          name: assetToRevise.classification,
        },
        status: AssetStatus.REVISI,
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: AssetStatus.REVISI,
                }
              : a
          )
        );
        toast.success("Aset berhasil dikirim untuk revisi!");
      } else {
        toast.error(response.message || "Gagal mengirim aset untuk revisi");
      }
    } catch (err) {
      console.error("Error revising asset:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim aset untuk revisi"
      );
    }
  }

  async function handleRejectAsset(id: string) {
    if (!confirm("Apakah Anda yakin ingin menolak aset ini?")) return;

    try {
      const assetToReject = assets.find((a) => a.id === id);
      if (!assetToReject) return;

      const response = await assetsApi.update(id, {
        name: assetToReject.name,
        location: assetToReject.location || undefined,
        type: {
          id: null,
          name: assetToReject.type,
        },
        classification: {
          id: null,
          name: assetToReject.classification,
        },
        status: AssetStatus.DITOLAK,
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: AssetStatus.DITOLAK,
                }
              : a
          )
        );
        toast.success("Aset berhasil ditolak!");
      } else {
        toast.error(response.message || "Gagal menolak aset");
      }
    } catch (err) {
      console.error("Error rejecting asset:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menolak aset"
      );
    }
  }

  async function handleApproveAsset(id: string) {
    if (!confirm("Apakah Anda yakin ingin menyetujui aset ini?")) return;

    try {
      const assetToApprove = assets.find((a) => a.id === id);
      if (!assetToApprove) return;

      const response = await assetsApi.update(id, {
        name: assetToApprove.name,
        location: assetToApprove.location || undefined,
        type: {
          id: null,
          name: assetToApprove.type,
        },
        classification: {
          id: null,
          name: assetToApprove.classification,
        },
        status: AssetStatus.DISETUJUI_RM,
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: AssetStatus.DISETUJUI_RM,
                }
              : a
          )
        );
        toast.success("Aset berhasil disetujui!");
      } else {
        toast.error(response.message || "Gagal menyetujui aset");
      }
    } catch (err) {
      console.error("Error approving asset:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyetujui aset"
      );
    }
  }

  async function handleUpdateAsset(id: string) {
    const assetToEdit = assets.find((a) => a.id === id);
    if (!assetToEdit) return;

    // Populate form with asset data
    const selectedType = assetTypes.find((t) => t.title === assetToEdit.type);
    const selectedClassification = classifications.find(
      (c) => c.title === assetToEdit.classification
    );

    setForm({
      name: assetToEdit.name,
      type: assetToEdit.type,
      typeId: selectedType?.id || "",
      classification: assetToEdit.classification,
      classificationId: selectedClassification?.id || "",
      location: assetToEdit.location || "",
    });
    setEditingAssetId(id);
    setOpen(true);
  }

  async function handleSaveEdit() {
    if (!editingAssetId) return;

    if (!form.name.trim() || !form.type || !form.classification) {
      toast.error("Nama, tipe, dan klasifikasi aset harus diisi");
      return;
    }

    setIsSaving(true);

    try {
      const typeId = form.typeId
        ? form.typeId // User selected from dropdown
        : null; // User typed new value, nullify ID

      const classificationId = form.classificationId
        ? form.classificationId // User selected from dropdown
        : null; // User typed new value, nullify ID

      const response = await assetsApi.update(editingAssetId, {
        name: form.name,
        location: form.location || undefined,
        type: {
          id: typeId,
          name: form.type,
        },
        classification: {
          id: classificationId,
          name: form.classification,
        },
      });

      if (response.status) {
        // Update local state
        setAssets((prev) =>
          prev.map((a) =>
            a.id === editingAssetId
              ? {
                  ...a,
                  name: response.data.name,
                  type: response.data.type?.title || "",
                  classification: response.data.classification?.title || "",
                  location: response.data.location || "",
                }
              : a
          )
        );

        setForm({
          name: "",
          type: "",
          typeId: "",
          classification: "",
          classificationId: "",
          location: "",
        });
        setEditingAssetId(null);
        setOpen(false);
        toast.success("Aset berhasil diperbarui!");
      } else {
        toast.error(response.message || "Gagal mengupdate aset");
      }
    } catch (err) {
      console.error("Error updating asset:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengupdate aset"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Daftar Aset</h1>
        {!isTopManagement && (
          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} /> Tambah Aset
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAssetId ? "Edit Aset" : "Tambah Aset"}
                </DialogTitle>
                <DialogDescription>
                  {editingAssetId
                    ? "Ubah data aset di formulir berikut."
                    : "Isi data aset baru di formulir berikut."}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <FieldLabel>Nama Aset</FieldLabel>
                  <Input
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel>Tipe Aset</FieldLabel>
                  <div className="relative" suppressHydrationWarning>
                    <Input
                      placeholder="Cari atau ketik tipe aset baru"
                      value={form.type}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setForm((p) => ({
                          ...p,
                          type: e.target.value,
                          typeId: "", // Clear ID when user types
                        }));
                        setShowTypeSuggestions(true);
                      }}
                      onFocus={() => setShowTypeSuggestions(true)}
                      disabled={isLoading}
                    />
                    {showTypeSuggestions && filteredAssetTypes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredAssetTypes.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
                            onClick={() => {
                              setForm((p) => ({
                                ...p,
                                type: t.title,
                                typeId: t.id,
                              }));
                              setShowTypeSuggestions(false);
                            }}
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Klasifikasi Aset</FieldLabel>
                  <div className="relative" suppressHydrationWarning>
                    <Input
                      placeholder="Cari atau ketik klasifikasi aset baru"
                      value={form.classification}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setForm((p) => ({
                          ...p,
                          classification: e.target.value,
                          classificationId: "", // Clear ID when user types
                        }));
                        setShowClassificationSuggestions(true);
                      }}
                      onFocus={() => setShowClassificationSuggestions(true)}
                      disabled={isLoading}
                    />
                    {showClassificationSuggestions &&
                      filteredClassifications.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredClassifications.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
                              onClick={() => {
                                setForm((p) => ({
                                  ...p,
                                  classification: c.title,
                                  classificationId: c.id,
                                }));
                                setShowClassificationSuggestions(false);
                              }}
                            >
                              {c.title}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Lokasi Aset</FieldLabel>
                  <Input
                    value={form.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({
                        ...p,
                        location: e.target.value,
                      }))
                    }
                  />
                </Field>
              </FieldGroup>

              <DialogFooter>
                <div className="flex justify-end w-full gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingAssetId(null);
                      setForm({
                        name: "",
                        type: "",
                        typeId: "",
                        classification: "",
                        classificationId: "",
                        location: "",
                      });
                    }}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={editingAssetId ? handleSaveEdit : handleAdd}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Menyimpan..."
                      : editingAssetId
                      ? "Simpan Perubahan"
                      : "Tambah Aset"}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>

      {(() => {
        const baseColumns: ColumnDef<Asset>[] = [
          {
            header: "No",
            key: "id",
            render: (_: any, row: Asset) => {
              const index = assets.findIndex((a) => a.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Nama Aset",
            key: "name",
            render: (value: any) => (
              <span className="font-medium text-gray-900">{String(value)}</span>
            ),
          },
          {
            header: "Tipe",
            key: "type",
          },
          {
            header: "Klasifikasi",
            key: "classification",
          },
          {
            header: "Lokasi",
            key: "location",
          },
          {
            header: "Owner",
            key: "ownerName",
          },
        ];

        if (!isRiskOwner) {
          baseColumns.push({
            header: "Divisi",
            key: "division",
          });
        }

        baseColumns.push({
          header: "Status",
          key: "status",
          render: (value: any) => {
            const status = String(value || AssetStatus.DRAFT);
            let statusClass = "bg-gray-100 text-gray-700";
            let statusLabel = status;

            switch (status) {
              case AssetStatus.DRAFT:
                statusClass = "bg-gray-100 text-gray-700";
                statusLabel = "Draft";
                break;
              case AssetStatus.MENUNGGU_PERSETUJUAN_RM:
                statusClass = "bg-yellow-100 text-yellow-700";
                statusLabel = "Menunggu Persetujuan RM";
                break;
              case AssetStatus.DISETUJUI_RM:
                statusClass = "bg-lime-100 text-lime-700";
                statusLabel = "Disetujui RM";
                break;
              case AssetStatus.MENUNGGU_PERSETUJUAN_FINAL:
                statusClass = "bg-blue-100 text-blue-700";
                statusLabel = "Menunggu Persetujuan Final";
                break;
              case AssetStatus.REVISI:
                statusClass = "bg-orange-100 text-orange-700";
                statusLabel = "Revisi";
                break;
              case AssetStatus.DISETUJUI:
                statusClass = "bg-green-100 text-green-700";
                statusLabel = "Disetujui";
                break;
              case AssetStatus.DITOLAK:
                statusClass = "bg-red-100 text-red-700";
                statusLabel = "Ditolak";
                break;
            }

            return (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
              >
                {statusLabel}
              </span>
            );
          },
          searchable: false,
        });

        if (!isTopManagement) {
          baseColumns.push({
            header: "Aksi",
            key: "id",
            render: (_: any, row: Asset) => {
              const isOwner = row.ownerId === user?.id;

              return (
                <div className="flex items-center gap-2">
                  {/* RISK_OWNER specific actions */}
                  {isRiskOwner ? (
                    <TooltipProvider>
                      <>
                        {/* DRAFT status: Show submit button */}
                        {row.status === AssetStatus.DRAFT && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-green-100 rounded transition-colors"
                                  onClick={() => handleSubmitForApproval(row.id)}
                                >
                                  <SendHorizontal size={18} className="text-green-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Kirim untuk persetujuan RM</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-blue-100 rounded transition-colors"
                                  onClick={() => handleUpdateAsset(row.id)}
                                >
                                  <Edit size={18} className="text-blue-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit aset</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                                  onClick={() => handleDeleteAsset(row.id)}
                                >
                                  <Trash size={18} className="text-gray-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Hapus aset</TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {/* MENUNGGU_PERSETUJUAN_RM status: Show archive-x to revert to draft */}
                        {row.status === AssetStatus.MENUNGGU_PERSETUJUAN_RM && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="p-2 hover:bg-yellow-100 rounded transition-colors"
                                onClick={() => handleRevertToDraft(row.id)}
                              >
                                <ArchiveX size={18} className="text-yellow-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Ubah status kembali ke Draft</TooltipContent>
                          </Tooltip>
                        )}

                        {/* REVISI status: Show edit, submit, and archive-x buttons */}
                        {row.status === AssetStatus.REVISI && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-green-100 rounded transition-colors"
                                  onClick={() => handleSubmitForApproval(row.id)}
                                >
                                  <SendHorizontal size={18} className="text-green-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Kirim untuk persetujuan RM</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-blue-100 rounded transition-colors"
                                  onClick={() => handleUpdateAsset(row.id)}
                                >
                                  <Edit size={18} className="text-blue-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit aset</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-yellow-100 rounded transition-colors"
                                  onClick={() => handleRevertToDraft(row.id)}
                                >
                                  <ArchiveX size={18} className="text-yellow-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Ubah status kembali ke Draft</TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {/* MENUNGGU_PERSETUJUAN_FINAL and DISETUJUI: No actions */}
                        {(row.status === AssetStatus.MENUNGGU_PERSETUJUAN_FINAL ||
                          row.status === AssetStatus.DISETUJUI) && null}

                        {/* DITOLAK: Show delete button only */}
                        {row.status === AssetStatus.DITOLAK && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                                onClick={() => handleDeleteAsset(row.id)}
                              >
                                <Trash size={18} className="text-gray-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Hapus aset</TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    </TooltipProvider>
                  ) : (
                    /* RISK_MANAGER actions */
                    <TooltipProvider>
                      <>
                        {/* DRAFT status: Show submit only if owner */}
                        {row.status === AssetStatus.DRAFT && isOwner && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-green-100 rounded transition-colors"
                                  onClick={() => handleSubmitForApproval(row.id)}
                                >
                                  <SendHorizontal size={18} className="text-green-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Kirim untuk persetujuan RM</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-blue-100 rounded transition-colors"
                                  onClick={() => handleUpdateAsset(row.id)}
                                >
                                  <Edit size={18} className="text-blue-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit aset</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                                  onClick={() => handleDeleteAsset(row.id)}
                                >
                                  <Trash size={18} className="text-gray-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Hapus aset</TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {/* MENUNGGU_PERSETUJUAN_RM status: Show revise and reject buttons */}
                        {row.status === AssetStatus.MENUNGGU_PERSETUJUAN_RM && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-green-100 rounded transition-colors"
                                  onClick={() => handleApproveAsset(row.id)}
                                >
                                  <CheckCircle size={18} className="text-green-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Setujui aset</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-orange-100 rounded transition-colors"
                                  onClick={() => handleReviseAsset(row.id)}
                                >
                                  <ArchiveRestore size={18} className="text-orange-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Kirim untuk revisi</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 hover:bg-red-100 rounded transition-colors"
                                  onClick={() => handleRejectAsset(row.id)}
                                >
                                  <X size={18} className="text-red-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Tolak aset</TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {/* REVISI status: Show edit button only */}
                        {row.status === AssetStatus.REVISI && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="p-2 hover:bg-blue-100 rounded transition-colors"
                                onClick={() => handleUpdateAsset(row.id)}
                              >
                                <Edit size={18} className="text-blue-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit aset</TooltipContent>
                          </Tooltip>
                        )}

                        {/* MENUNGGU_PERSETUJUAN_FINAL and DITOLAK: No actions */}
                        {(row.status === AssetStatus.MENUNGGU_PERSETUJUAN_FINAL ||
                          row.status === AssetStatus.DISETUJUI ||
                          row.status === AssetStatus.DITOLAK) && null}
                      </>
                    </TooltipProvider>
                  )}
                </div>
              );
            },
            searchable: false,
          });
        }

        return (
          <PaginatedTable<Asset>
            data={assets}
            columns={baseColumns}
            pageSize={20}
            emptyMessage="Belum ada aset yang terdaftar"
          />
        );
      })()}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalAssets}{" "}
            total aset)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoadingAssets}
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
                  disabled={isLoadingAssets}
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
              disabled={currentPage === totalPages || isLoadingAssets}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
