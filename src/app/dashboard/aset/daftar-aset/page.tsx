"use client";

import * as React from "react";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { loadAssets, saveAssets, type Asset } from "@/lib/assetsStore";
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
import { Plus, Trash, Edit } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/use-auth";
import { assetsApi, type AssetType, type AssetClassification } from "@/lib/api";

type User = StoreUser;

export default function DaftarAsetPage() {
  const { user } = useAuth();
  const isRiskOwner = user?.role === "RISK_OWNER";

  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
        const response = await assetsApi.getAssets(currentPage, 20);

        if (response.status && response.data) {
          // Map API response to local Asset type
          const mappedAssets: Asset[] = response.data.data.map((asset) => {
            // Map API status to local status enum
            let mappedStatus: Asset["status"] = "PENDING";
            const apiStatus = (asset.status || "").toUpperCase();
            if (
              apiStatus === "APPROVED_BY_RM" ||
              apiStatus === "SUBMITTED_TO_TOP" ||
              apiStatus === "APPROVED_BY_TOP"
            ) {
              mappedStatus = apiStatus as Asset["status"];
            }

            return {
              id: asset.id,
              name: asset.name,
              type: asset.type?.name || "",
              classification: asset.classification?.name || "",
              location: asset.location || "",
              status: mappedStatus,
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
        setError("Gagal memuat daftar aset");
      } finally {
        setIsLoadingAssets(false);
      }
    };

    loadAssetsFromAPI();
  }, [currentPage]);

  // Load asset types and classifications on mount
  React.useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoading(true);
      setError(null);
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
        setError("Gagal memuat data tipe dan klasifikasi aset");
      } finally {
        setIsLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  function handleAdd() {
    if (!form.name.trim() || !form.type || !form.classification) {
      setError("Nama, tipe, dan klasifikasi aset harus diisi");
      return;
    }

    setIsSaving(true);
    setError(null);

    (async () => {
      try {
        // Find selected type and classification from dropdown, or create new ones
        const selectedType = assetTypes.find((t) => t.id === form.typeId);
        const selectedClassification = classifications.find(
          (c) => c.id === form.classificationId
        );

        const response = await assetsApi.create({
          name: form.name,
          location: form.location || undefined,
          type: {
            id: selectedType?.id || null,
            name: form.type,
          },
          classification: {
            id: selectedClassification?.id || null,
            name: form.classification,
          },
        });

        if (response.status) {
          // Add to local state (optional - can also refetch)
          const newAsset: Asset = {
            id: response.data.id,
            name: response.data.name,
            type: response.data.type.name,
            classification: response.data.classification.name,
            location: response.data.location,
            status: "PENDING",
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
        } else {
          setError(response.message || "Gagal menambah aset");
        }
      } catch (err) {
        console.error("Error adding asset:", err);
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan saat menambah aset"
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Daftar Aset</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Tambah Aset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Aset</DialogTitle>
                <DialogDescription>
                  Isi data aset baru di formulir berikut.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
                  {error}
                </div>
              )}

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
                    onClick={() => setOpen(false)}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAdd} disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Tambah Aset"}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PaginatedTable<Asset>
        data={assets}
        columns={[
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
            header: "Status",
            key: "status",
            render: (value: any) => {
              const status = String(value || "PENDING");
              let statusClass = "bg-gray-100 text-gray-700";
              let statusLabel = status;

              switch (status) {
                case "PENDING":
                  statusClass = "bg-yellow-100 text-yellow-700";
                  statusLabel = "Pending";
                  break;
                case "APPROVED_BY_RM":
                  statusClass = "bg-green-100 text-green-700";
                  statusLabel = "Diterima RM";
                  break;
                case "SUBMITTED_TO_TOP":
                  statusClass = "bg-blue-100 text-blue-700";
                  statusLabel = "Diajukan ke Top";
                  break;
                case "APPROVED_BY_TOP":
                  statusClass = "bg-green-100 text-green-700";
                  statusLabel = "Disetujui Top";
                  break;
                case "REJECTED":
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
          },
          {
            header: "Aksi",
            key: "id",
            render: (_: any, row: Asset) =>
              !isRiskOwner ? (
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Trash size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Edit size={18} className="text-gray-600" />
                  </button>
                </div>
              ) : null,
            searchable: false,
          },
        ]}
        pageSize={20}
        emptyMessage="Belum ada aset yang terdaftar"
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalAssets} total aset)
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
