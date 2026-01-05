"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
// Charts akan ditambahkan nanti dengan recharts
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface Control {
  id: string;
  code: string;
  title: string;
  category: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface SoaItem {
  id: string;
  organizationId: string;
  controlId: string;
  managerId: string;
  status: string;
  implementationStatus:
    | "DIRENCANAKAN"
    | "DALAM_IMPLEMENTASI"
    | "DIIMPLEMENTASIKAN"
    | "DIHENTIKAN"
    | null;
  notes: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  control: Control;
  manager: Manager;
  statusTarget: string;
}

export default function SoaPage() {
  const [soaData, setSoaData] = useState<SoaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "analytics">("table");
  const [selectedSoa, setSelectedSoa] = useState<SoaItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tempImplementationStatus, setTempImplementationStatus] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchSoaData();
  }, []);

  const fetchSoaData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/soa", {
        params: {
          status: "RELEVAN",
        },
      });
      setSoaData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching SOA data:", err);
      setError("Gagal memuat data SOA");
      setSoaData([]);
    } finally {
      setLoading(false);
    }
  };

  const getImplementationStatusLabel = (status: string | null): string => {
    if (!status) return "Draft";
    switch (status) {
      case "DIRENCANAKAN":
        return "Belum Diimplementasikan";
      case "DALAM_IMPLEMENTASI":
        return "Dalam Implementasi";
      case "DIIMPLEMENTASIKAN":
        return "Sudah Diimplementasikan";
      case "DIHENTIKAN":
        return "Dihentikan";
      default:
        return "Draft";
    }
  };

  const getImplementationStatusColor = (status: string | null): string => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status) {
      case "DIRENCANAKAN":
        return "bg-gray-100 text-gray-800";
      case "DALAM_IMPLEMENTASI":
        return "bg-blue-100 text-blue-800";
      case "DIIMPLEMENTASIKAN":
        return "bg-green-100 text-green-800";
      case "DIHENTIKAN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusTargetLabel = (status: string): string => {
    switch (status) {
      case "ON_TRACK":
        return "Sesuai Rencana";
      case "OVERDUE":
        return "Terlambat";
      default:
        return status;
    }
  };

  const getStatusTargetColor = (status: string): string => {
    switch (status) {
      case "ON_TRACK":
        return "bg-green-100 text-green-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenDetail = (item: SoaItem) => {
    setSelectedSoa(item);
    setTempImplementationStatus(null); // Reset temp status when opening modal
    setShowDetailModal(true);
  };
  const handleStatusChange = (newStatus: string) => {
    // Just update the temporary state, don't call API yet
    setTempImplementationStatus(newStatus || null);
  };

  const handleSaveStatus = async () => {
    if (!selectedSoa) return;

    try {
      setUpdatingStatus(true);
      await apiClient.patch(`/soa/${selectedSoa.id}`, {
        implementationStatus: tempImplementationStatus || null,
      });

      // Update local state
      setSoaData(
        soaData.map((item) =>
          item.id === selectedSoa.id
            ? {
                ...item,
                implementationStatus: (tempImplementationStatus || null) as any,
              }
            : item
        )
      );

      // Update selected item
      setSelectedSoa({
        ...selectedSoa,
        implementationStatus: (tempImplementationStatus || null) as any,
      });

      alert("Status berhasil diperbarui");
      setShowDetailModal(false); // Close modal after successful save
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Gagal memperbarui status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const implementationStats = {
    total: soaData.length,
    planned: soaData.filter(
      (s) =>
        !s.implementationStatus || s.implementationStatus === "DIRENCANAKAN"
    ).length,
    inProgress: soaData.filter(
      (s) => s.implementationStatus === "DALAM_IMPLEMENTASI"
    ).length,
    implemented: soaData.filter(
      (s) => s.implementationStatus === "DIIMPLEMENTASIKAN"
    ).length,
  };

  const implementationRate =
    implementationStats.total > 0
      ? Math.round(
          (implementationStats.implemented / implementationStats.total) * 100
        )
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Implementasi Kontrol Keamanan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola pelaksanaan kontrol yang telah dinyatakan relevan untuk
            organisasi
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Total Kontrol Relevan
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Harus diimplementasikan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {soaData.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Draft
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Belum ada rencana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {soaData.filter((s) => !s.implementationStatus).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Direncanakan
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Dalam perencanaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                soaData.filter((s) => s.implementationStatus === "DIRENCANAKAN")
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Dalam Implementasi
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Sedang berjalan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                soaData.filter(
                  (s) => s.implementationStatus === "DALAM_IMPLEMENTASI"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Diimplementasikan
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Selesai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                soaData.filter(
                  (s) => s.implementationStatus === "DIIMPLEMENTASIKAN"
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => setViewMode("table")}
          className={`text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
              : "border border-gray-300 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
          }`}
        >
          Table View
        </Button>
        <Button
          variant={viewMode === "analytics" ? "default" : "outline"}
          onClick={() => setViewMode("analytics")}
          className={`text-sm font-medium transition-colors ${
            viewMode === "analytics"
              ? "bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
              : "border border-gray-300 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
          }`}
        >
          Analytics
        </Button>
      </div>

      {viewMode === "table" ? (
        // Table View
        <Card className="border border-gray-200 shadow-sm">
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Memuat data...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-sky-50 to-sky-100 border-b border-sky-200">
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Control Code
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Control Title
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Category
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Manager
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Implementation Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Target Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Status Target
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soaData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada data kontrol
                        </TableCell>
                      </TableRow>
                    ) : (
                      soaData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell className="font-semibold text-sm text-gray-900">
                            {item.control.code}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm text-gray-900">
                              {item.control.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {item.control.category}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            <div>{item.manager.name}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getImplementationStatusColor(
                                item.implementationStatus
                              )}`}
                            >
                              {getImplementationStatusLabel(
                                item.implementationStatus
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {item.targetDate
                              ? new Date(item.targetDate).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusTargetColor(
                                item.statusTarget
                              )}`}
                            >
                              {getStatusTargetLabel(item.statusTarget)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetail(item)}
                              className="text-xs border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-800 font-medium"
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Analytics View - Simplified without charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardContent>
              <CardTitle className="text-base font-semibold text-sky-900">
                Implementation Progress
              </CardTitle>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Implementation Rate
                    </span>
                    <span className="text-sm font-bold text-sky-600">
                      {implementationStats.implemented}/
                      {implementationStats.total} ({implementationRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-sky-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${implementationRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <CardTitle className="text-base font-semibold text-sky-900 mt-6">
                Control Status Target Distribution
              </CardTitle>
              <div className="space-y-4">
                {Array.from(
                  new Map(
                    soaData.map((item) => [item.statusTarget, item])
                  ).keys()
                ).map((statusTarget) => {
                  const count = soaData.filter(
                    (s) => s.statusTarget === statusTarget
                  ).length;
                  const percentage = ((count / soaData.length) * 100).toFixed(
                    1
                  );
                  return (
                    <div key={statusTarget}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {getStatusTargetLabel(statusTarget)}
                        </span>
                        <span className="text-sm font-semibold text-sky-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={
                            statusTarget === "ON_TRACK"
                              ? "bg-green-600 h-2.5 rounded-full transition-all duration-300"
                              : "bg-red-600 h-2.5 rounded-full transition-all duration-300"
                          }
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Draft / Belum Direncanakan
                  </p>
                  <p className="text-2xl font-bold text-gray-600 mt-2">
                    {implementationStats.planned}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Dalam Implementasi
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {implementationStats.inProgress}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Sudah Diimplementasikan
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {implementationStats.implemented}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Dihentikan
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {
                      soaData.filter(
                        (s) => s.implementationStatus === "DIHENTIKAN"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={showDetailModal}
        onOpenChange={(open) => {
          setShowDetailModal(open);
          if (!open) {
            setTempImplementationStatus(null); // Reset temp status when closing modal
          }
        }}
      >
        <DialogContent className="!w-[98vw] !max-w-[1400px] !max-h-[85vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="border-b border-sky-200 pb-4">
            <DialogTitle className="text-lg font-bold text-sky-900">
              Detail Statement of Applicability (SoA)
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Informasi lengkap tentang relevansi kontrol terhadap organisasi
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            {selectedSoa && (
              <div className="space-y-6 py-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Control Details */}
                  <div className="space-y-4 bg-gradient-to-b from-sky-50 to-blue-50 p-6 rounded-lg border border-sky-200">
                    <h3 className="font-semibold text-base text-sky-900">
                      Detail Kontrol
                    </h3>
                    <div>
                      <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Kode
                      </p>
                      <p className="text-2xl font-bold text-sky-600 mt-2">
                        {selectedSoa.control.code}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Nama Kontrol
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {selectedSoa.control.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Kategori
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {selectedSoa.control.category}
                      </p>
                    </div>
                  </div>
                  {/* Right Column - SoA Details */}
                  <div className="space-y-4 bg-gradient-to-b from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-base text-green-900">
                      Detail SoA
                    </h3>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Status
                      </p>
                      <div className="mt-2">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✓ Relevan
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Manager / Penanggung Jawab
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {selectedSoa.manager.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedSoa.manager.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Target Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {selectedSoa.targetDate
                          ? new Date(selectedSoa.targetDate).toLocaleDateString(
                              "id-ID",
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Catatan
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {selectedSoa.notes || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Dibuat
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {new Date(selectedSoa.createdAt).toLocaleDateString(
                          "id-ID",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}{" "}
                        {new Date(selectedSoa.createdAt).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Status Target Section */}
                <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-6 rounded-lg border border-sky-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-sky-900">
                        Status Target Implementasi
                      </p>
                    </div>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusTargetColor(
                        selectedSoa.statusTarget
                      )}`}
                    >
                      {getStatusTargetLabel(selectedSoa.statusTarget)}
                    </span>
                  </div>
                </div>
                {/* Implementation Status Update */}
                <div className="bg-white border border-gray-200 p-6 rounded-lg space-y-4 shadow-sm">
                  <h3 className="font-semibold text-base text-gray-900">
                    Update Status Implementasi
                  </h3>
                  <div>
                    <Label
                      htmlFor="impl-status"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Pilih Status Implementasi
                    </Label>
                    <select
                      id="impl-status"
                      value={
                        tempImplementationStatus !== null
                          ? tempImplementationStatus
                          : selectedSoa.implementationStatus || ""
                      }
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Draft</option>
                      <option value="DIRENCANAKAN">Direncanakan</option>
                      <option value="DALAM_IMPLEMENTASI">
                        Dalam Implementasi
                      </option>
                      <option value="DIIMPLEMENTASIKAN">
                        Diimplementasikan
                      </option>
                      <option value="DIHENTIKAN">Dihentikan</option>
                    </select>
                    <div className="mt-3 inline-block px-3 py-1 rounded text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
                      Status saat ini:{" "}
                      {getImplementationStatusLabel(
                        selectedSoa.implementationStatus
                      )}
                    </div>
                    {updatingStatus && (
                      <p className="text-sm text-sky-600 mt-2 animate-pulse">
                        Menyimpan status...
                      </p>
                    )}
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={handleSaveStatus}
                    disabled={updatingStatus}
                    className="px-6 bg-sky-600 hover:bg-sky-700 text-white font-medium"
                  >
                    {updatingStatus ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
