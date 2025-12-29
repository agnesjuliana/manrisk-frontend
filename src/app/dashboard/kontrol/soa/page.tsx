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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Charts akan ditambahkan nanti dengan recharts
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
} from "lucide-react";

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
  implementationStatus: "DIRENCANAKAN" | "DALAM_IMPLEMENTASI" | "DIIMPLEMENTASIKAN" | "DIHENTIKAN" | null;
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

  useEffect(() => {
    fetchSoaData();
  }, []);

  const fetchSoaData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/soa", {
        params: {
          status: "RELEVAN"
        }
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

  const implementationStats = {
    total: soaData.length,
    planned: soaData.filter((s) => !s.implementationStatus || s.implementationStatus === "DIRENCANAKAN").length,
    inProgress: soaData.filter((s) => s.implementationStatus === "DALAM_IMPLEMENTASI").length,
    implemented: soaData.filter((s) => s.implementationStatus === "DIIMPLEMENTASIKAN").length,
  };

  const implementationRate =
    implementationStats.total > 0
      ? Math.round(
          (implementationStats.implemented / implementationStats.total) * 100
        )
      : 0;

  const handleExportPDF = () => {
    const content = `
IMPLEMENTASI KONTROL KEAMANAN
Generated: ${new Date().toLocaleDateString("id-ID")}

OVERVIEW
========
Total Kontrol Relevan: ${soaData.length}
Belum Diimplementasikan: ${soaData.filter(s => !s.implementationStatus || s.implementationStatus === "DIRENCANAKAN").length}
Dalam Implementasi: ${soaData.filter(s => s.implementationStatus === "DALAM_IMPLEMENTASI").length}
Sudah Diimplementasikan: ${soaData.filter(s => s.implementationStatus === "DIIMPLEMENTASIKAN").length}

CONTROL LIST
============
${soaData
  .map(
    (item, idx) => `
${idx + 1}. ${item.control.code} - ${item.control.title}
   Category: ${item.control.category}
   Manager: ${item.manager.name} (${item.manager.email})
   Status: ${getImplementationStatusLabel(item.implementationStatus)}
   Target Date: ${item.targetDate ? new Date(item.targetDate).toLocaleDateString("id-ID") : "N/A"}
   Notes: ${item.notes || "N/A"}
`
  )
  .join("\n")}

END OF DOCUMENT
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SoA_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  const handleExportCSV = () => {
    const headers = [
      "Control Code",
      "Control Title",
      "Category",
      "Manager Name",
      "Manager Email",
      "Implementation Status",
      "Target Date",
      "Notes",
      "Status Target",
    ];

    const rows = soaData.map((item) => [
      item.control.code,
      item.control.title,
      item.control.category,
      item.manager.name,
      item.manager.email,
      getImplementationStatusLabel(item.implementationStatus),
      item.targetDate ? new Date(item.targetDate).toLocaleDateString("id-ID") : "-",
      item.notes || "-",
      item.statusTarget,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SoA_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Implementasi Kontrol Keamanan</h1>
          <p className="text-gray-600 mt-1">
            Kelola pelaksanaan kontrol yang telah dinyatakan relevan untuk organisasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Kontrol Relevan</CardTitle>
            <CardDescription className="text-xs">Harus diimplementasikan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soaData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
            <CardDescription className="text-xs">Belum ada rencana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{soaData.filter(s => !s.implementationStatus).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Direncanakan</CardTitle>
            <CardDescription className="text-xs">Dalam perencanaan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{soaData.filter(s => s.implementationStatus === "DIRENCANAKAN").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dalam Implementasi</CardTitle>
            <CardDescription className="text-xs">Sedang berjalan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soaData.filter(s => s.implementationStatus === "DALAM_IMPLEMENTASI").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Diimplementasikan</CardTitle>
            <CardDescription className="text-xs">Selesai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{soaData.filter(s => s.implementationStatus === "DIIMPLEMENTASIKAN").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => setViewMode("table")}
        >
          Table View
        </Button>
        <Button
          variant={viewMode === "analytics" ? "default" : "outline"}
          onClick={() => setViewMode("analytics")}
        >
          Analytics
        </Button>
      </div>

      {viewMode === "table" ? (
        // Table View
        <Card>
          <CardHeader>
            <CardTitle>Implementasi Kontrol Relevan ({soaData.length})</CardTitle>
            <CardDescription>
              Daftar lengkap controls yang telah dinyatakan relevan beserta status implementasinya
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Control Code</TableHead>
                      <TableHead>Control Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Implementation Status</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Status Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soaData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Tidak ada data kontrol
                        </TableCell>
                      </TableRow>
                    ) : (
                      soaData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold">
                            {item.control.code}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.control.title}</div>
                          </TableCell>
                          <TableCell className="text-xs">{item.control.category}</TableCell>
                          <TableCell className="text-xs">
                            <div>{item.manager.name}</div>
                            <div className="text-gray-500">{item.manager.email}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getImplementationStatusColor(item.implementationStatus)}`}
                            >
                              {getImplementationStatusLabel(item.implementationStatus)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.targetDate
                              ? new Date(item.targetDate).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusTargetColor(item.statusTarget)}`}
                            >
                              {getStatusTargetLabel(item.statusTarget)}
                            </span>
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Implementation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Implementation Rate
                    </span>
                    <span className="text-sm font-bold">
                      {implementationStats.implemented}/
                      {implementationStats.total} ({implementationRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{
                        width: `${implementationRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Draft / Belum Direncanakan</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {implementationStats.planned}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Dalam Implementasi</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {implementationStats.inProgress}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sudah Diimplementasikan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {implementationStats.implemented}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Dihentikan</p>
                  <p className="text-2xl font-bold text-red-600">
                    {soaData.filter(s => s.implementationStatus === "DIHENTIKAN").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Control Status Target Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(
                  new Map(
                    soaData.map(item => [item.statusTarget, item])
                  ).keys()
                ).map((statusTarget) => {
                  const count = soaData.filter(s => s.statusTarget === statusTarget).length;
                  const percentage = ((count / soaData.length) * 100).toFixed(1);
                  return (
                    <div key={statusTarget}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{getStatusTargetLabel(statusTarget)}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={statusTarget === "ON_TRACK" ? "bg-green-500 h-2 rounded-full" : "bg-red-500 h-2 rounded-full"}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
