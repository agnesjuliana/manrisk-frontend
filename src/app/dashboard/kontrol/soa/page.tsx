"use client";

import React, { useState, useEffect } from "react";
import {
  Control,
  loadControls,
  getImplementationStats,
} from "@/lib/controlsStore";
import { loadTreatments, Treatment } from "@/lib/treatmentsStore";
import { loadRisks, Risk } from "@/lib/risksStore";
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

export default function SoaPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getImplementationStats> | null>(null);
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "analytics">("table");
  const [soaDetails, setSoaDetails] = useState<{
    controlId: string;
    controlName: string;
    treatmentId: string | undefined;
    riskId: string;
    riskTitle: string;
    treatmentOption: string;
    implementationStatus: string;
    effectivenessRating: number;
    targetDate: string | undefined;
    owner: string | undefined;
    isImplemented: boolean;
    isVerified: boolean;
  } | null>(null);

  useEffect(() => {
    setControls(loadControls());
    setTreatments(loadTreatments());
    setRisks(loadRisks());
    setStats(getImplementationStats());
  }, []);

  const getSoaData = () => {
    // Filter hanya kontrol yang relevan
    const relevantControls = controls.filter(c => c.relevanceStatus === "RELEVAN");
    
    const soaItems = relevantControls.map((control) => {
      const treatment = treatments.find((t) => t.id === control.treatmentId);
      const risk = risks.find((r) => r.id === treatment?.riskId);

      return {
        controlId: control.id,
        controlName: control.name,
        treatmentId: treatment?.id,
        riskId: treatment?.riskId || "-",
        riskTitle: risk?.identifiedRisk || "-",
        treatmentOption: control.treatmentOption || "-",
        implementationStatus: control.implementationStatus || "DIRENCANAKAN",
        effectivenessRating: control.effectivenessRating || 0,
        targetDate: control.targetDate,
        owner: control.owner,
        isImplemented: control.implementationStatus === "DIIMPLEMENTASIKAN",
        isVerified: control.implementationStatus === "DIIMPLEMENTASIKAN",
        relevanceStatus: control.relevanceStatus,
      };
    });

    return soaItems;
  };

  const soaData = getSoaData();

  const implementationStats = {
    total: soaData.length,
    planned: soaData.filter((s) => s.implementationStatus === "DIRENCANAKAN").length,
    inProgress: soaData.filter((s) => s.implementationStatus === "DALAM_IMPLEMENTASI").length,
    implemented: soaData.filter((s) => s.implementationStatus === "DIIMPLEMENTASIKAN").length,
  };

  const implementationRate =
    implementationStats.total > 0
      ? Math.round(
          (implementationStats.implemented / implementationStats.total) * 100
        )
      : 0;

  const avgEffectiveness =
    soaData.filter((s) => s.effectivenessRating > 0).length > 0
      ? (
          soaData
            .filter((s) => s.effectivenessRating > 0)
            .reduce((sum, s) => sum + s.effectivenessRating, 0) /
          soaData.filter((s) => s.effectivenessRating > 0).length
        ).toFixed(1)
      : 0;

  const chartData = [
    {
      name: "Direncanakan",
      value: soaData.filter((s) => s.implementationStatus === "DIRENCANAKAN").length,
    },
    {
      name: "Dalam Implementasi",
      value: soaData.filter((s) => s.implementationStatus === "DALAM_IMPLEMENTASI").length,
    },
    {
      name: "Sudah Diimplementasikan",
      value: soaData.filter((s) => s.implementationStatus === "DIIMPLEMENTASIKAN").length,
    },
    {
      name: "Dihentikan",
      value: soaData.filter((s) => s.implementationStatus === "DIHENTIKAN").length,
    },
  ];

  const effectivenessData = [
    {
      rating: "Lemah (1-2)",
      count: soaData.filter(
        (s) => s.effectivenessRating > 0 && s.effectivenessRating <= 2
      ).length,
    },
    {
      rating: "Cukup (3)",
      count: soaData.filter((s) => s.effectivenessRating === 3).length,
    },
    {
      rating: "Baik (4)",
      count: soaData.filter((s) => s.effectivenessRating === 4).length,
    },
    {
      rating: "Sangat Baik (5)",
      count: soaData.filter((s) => s.effectivenessRating === 5).length,
    },
  ];

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  const handleExportPDF = () => {
    const content = `
IMPLEMENTASI KONTROL KEAMANAN
Generated: ${new Date().toLocaleDateString("id-ID")}

OVERVIEW
========
Total Kontrol Relevan: ${soaData.filter(s => s.relevanceStatus === "RELEVAN").length}
Belum Diimplementasikan: ${soaData.filter(s => s.implementationStatus === "DIRENCANAKAN").length}
Dalam Implementasi: ${soaData.filter(s => s.implementationStatus === "DALAM_IMPLEMENTASI").length}
Sudah Diimplementasikan: ${soaData.filter(s => s.implementationStatus === "DIIMPLEMENTASIKAN").length}
Avg Effectiveness: ${avgEffectiveness}/5

CONTROL LIST
============
${soaData
  .map(
    (item, idx) => `
${idx + 1}. ${item.controlId} - ${item.controlName}
   Treatment: ${item.treatmentId}
   Risk: ${item.riskId}
   Status: ${item.implementationStatus}
   Effectiveness: ${item.effectivenessRating}/5
   Target Date: ${item.targetDate || "N/A"}
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
      "Control ID",
      "Control Name",
      "Treatment ID",
      "Risk Code",
      "Risk Title",
      "Treatment Option",
      "Implementation Status",
      "Effectiveness",
      "Target Date",
      "Owner",
    ];

    const rows = soaData.map((item) => [
      item.controlId,
      item.controlName,
      item.treatmentId || "-",
      item.riskId,
      item.riskTitle,
      item.treatmentOption,
      item.implementationStatus,
      item.effectivenessRating,
      item.targetDate || "-",
      item.owner || "-",
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Kontrol Relevan</CardTitle>
            <CardDescription className="text-xs">Harus diimplementasikan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soaData.filter(s => s.relevanceStatus === "RELEVAN").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Belum Diimplementasikan</CardTitle>
            <CardDescription className="text-xs">Status: Direncanakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{soaData.filter(s => s.implementationStatus === "DIRENCANAKAN").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dalam Implementasi</CardTitle>
            <CardDescription className="text-xs">Status: Proses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soaData.filter(s => s.implementationStatus === "DALAM_IMPLEMENTASI").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sudah Diimplementasikan</CardTitle>
            <CardDescription className="text-xs">Status: Selesai</CardDescription>
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
            <CardTitle>SoA Control List ({soaData.length})</CardTitle>
            <CardDescription>
              Daftar lengkap controls, status implementasi, dan keterkaitan dengan
              risiko dan treatment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Kontrol</TableHead>
                    <TableHead>Risk Code</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Verifikasi</TableHead>
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
                      <TableRow key={item.controlId}>
                        <TableCell className="font-semibold">
                          {item.controlId}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.controlName}</div>
                        </TableCell>
                        <TableCell className="text-xs">{item.riskId}</TableCell>
                        <TableCell className="text-xs">
                          {item.treatmentId || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.implementationStatus === "DIIMPLEMENTASIKAN"
                                ? "bg-green-100 text-green-800"
                                : item.implementationStatus === "DALAM_IMPLEMENTASI"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.implementationStatus === "DIHENTIKAN"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.implementationStatus === "DIIMPLEMENTASIKAN"
                              ? "Sudah Diimplementasikan"
                              : item.implementationStatus === "DALAM_IMPLEMENTASI"
                                ? "Dalam Implementasi"
                                : item.implementationStatus === "DIHENTIKAN"
                                  ? "Dihentikan"
                                  : "Belum Diimplementasikan"}
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
                          {item.implementationStatus === "DIIMPLEMENTASIKAN" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Analytics View - Simplified without charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Implementation & Verification Progress</CardTitle>
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
                      className="bg-blue-500 h-3 rounded-full"
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
                  <p className="text-sm text-gray-600">Belum Diimplementasikan</p>
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
