"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Type definitions based on API response
interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Category {
  id: string;
  title: string;
}

interface AssetTask {
  id: string;
  name: string;
  location: string;
  status: string;
  taskType: string;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

interface RiskTask {
  id: string;
  customRiskId: string;
  identifiedRisk: string;
  status: string;
  taskType: string;
  owner: Owner;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentTask {
  id: string;
  riskId: string;
  customRiskId: string;
  identifiedRisk: string;
  treatmentOpt: string;
  taskType: string;
  manager: Owner;
  pic?: Owner;
  createdAt: string;
  updatedAt?: string;
}

interface SOATask {
  id: string;
  controlId: string;
  controlCode: string;
  controlTitle: string;
  status: string;
  implementationStatus: string;
  statusTarget: string;
  targetDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ControlTask {
  id: string;
  code: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TasksData {
  assets: {
    assetTasks: AssetTask[];
    totalAssetTasks: number;
  };
  risks: {
    riskTasks: RiskTask[];
    totalRiskTasks: number;
  };
  treatments: {
    treatmentTasks: TreatmentTask[];
    totalTreatmentTasks: number;
  };
  controls: {
    controlTasks: ControlTask[];
    totalControlTasks: number;
  };
  soas: {
    soaTasks: SOATask[];
    totalSOATasks: number;
  };
}

export default function DaftarTugasPage() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<"assets" | "risks" | "treatments" | "controls" | "soas">("assets");

  // Fetch data from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/tasks");
        setTasksData(response.data.data || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Gagal memuat data tugas");
        setTasksData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case "REVISI":
        return "bg-yellow-100 text-yellow-800";
      case "MENUNGGU_PERSETUJUAN_RM":
        return "bg-blue-100 text-blue-800";
      case "DALAM_IMPLEMENTASI":
        return "bg-purple-100 text-purple-800";
      case "DIRENCANAKAN":
        return "bg-gray-100 text-gray-800";
      case "ON_TRACK":
        return "bg-green-100 text-green-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "RELEVAN":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toUpperCase()) {
      case "REVISI":
        return "Revisi";
      case "MENUNGGU_PERSETUJUAN_RM":
        return "Menunggu Persetujuan RM";
      case "DALAM_IMPLEMENTASI":
        return "Dalam Implementasi";
      case "DIRENCANAKAN":
        return "Direncanakan";
      case "ON_TRACK":
        return "Sesuai Rencana";
      case "OVERDUE":
        return "Terlambat";
      case "RELEVAN":
        return "Relevan";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === "ON_TRACK" || upperStatus === "RELEVAN") {
      return <CheckCircle2 className="w-4 h-4" />;
    } else if (upperStatus === "DALAM_IMPLEMENTASI") {
      return <Clock className="w-4 h-4" />;
    } else if (upperStatus === "OVERDUE") {
      return <AlertTriangle className="w-4 h-4" />;
    } else if (upperStatus === "REVISI" || upperStatus === "MENUNGGU_PERSETUJUAN_RM") {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Daftar Tugas</h1>
        <p className="text-gray-600 mt-1">Monitor tugas dan progres di berbagai modul sistem</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Memuat data tugas...</p>
        </div>
      ) : tasksData ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Asset Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksData.assets.totalAssetTasks}</div>
                <p className="text-xs text-gray-500 mt-1">{tasksData.assets.assetTasks.length} aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Risk Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksData.risks.totalRiskTasks}</div>
                <p className="text-xs text-gray-500 mt-1">{tasksData.risks.riskTasks.length} aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Treatment Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksData.treatments.totalTreatmentTasks}</div>
                <p className="text-xs text-gray-500 mt-1">{tasksData.treatments.treatmentTasks.length} aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Control Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksData.controls.totalControlTasks}</div>
                <p className="text-xs text-gray-500 mt-1">{tasksData.controls.controlTasks.length} aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">SOA Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksData.soas.totalSOATasks}</div>
                <p className="text-xs text-gray-500 mt-1">{tasksData.soas.soaTasks.length} aktif</p>
              </CardContent>
            </Card>
          </div>

          {/* Module Selector */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedModule === "assets" ? "default" : "outline"}
              onClick={() => setSelectedModule("assets")}
              className="text-sm"
            >
              Assets
            </Button>
            <Button
              variant={selectedModule === "risks" ? "default" : "outline"}
              onClick={() => setSelectedModule("risks")}
              className="text-sm"
            >
              Risks
            </Button>
            <Button
              variant={selectedModule === "treatments" ? "default" : "outline"}
              onClick={() => setSelectedModule("treatments")}
              className="text-sm"
            >
              Treatments
            </Button>
            <Button
              variant={selectedModule === "controls" ? "default" : "outline"}
              onClick={() => setSelectedModule("controls")}
              className="text-sm"
            >
              Controls
            </Button>
            <Button
              variant={selectedModule === "soas" ? "default" : "outline"}
              onClick={() => setSelectedModule("soas")}
              className="text-sm"
            >
              SOAs
            </Button>
          </div>

          {/* Asset Tasks Table */}
          {selectedModule === "assets" && (
            <Card>
              <CardHeader>
                <CardTitle>Asset Tasks ({tasksData.assets.assetTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksData.assets.assetTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada asset tasks</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Asset Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Task Type</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData.assets.assetTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.name}</TableCell>
                            <TableCell className="text-sm">{task.location}</TableCell>
                            <TableCell className="text-sm">{task.owner.name}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                                {getStatusLabel(task.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{task.taskType}</TableCell>
                            <TableCell className="text-sm">{new Date(task.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Risk Tasks Table */}
          {selectedModule === "risks" && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Tasks ({tasksData.risks.riskTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksData.risks.riskTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada risk tasks</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Risk ID</TableHead>
                          <TableHead>Identified Risk</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Task Type</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData.risks.riskTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.customRiskId}</TableCell>
                            <TableCell className="text-sm">{task.identifiedRisk}</TableCell>
                            <TableCell className="text-sm">{task.category.title}</TableCell>
                            <TableCell className="text-sm">{task.owner.name}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                                {getStatusLabel(task.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{task.taskType}</TableCell>
                            <TableCell className="text-sm">{new Date(task.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Treatment Tasks Table */}
          {selectedModule === "treatments" && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Tasks ({tasksData.treatments.treatmentTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksData.treatments.treatmentTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada treatment tasks</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Risk ID</TableHead>
                          <TableHead>Identified Risk</TableHead>
                          <TableHead>Treatment Opt</TableHead>
                          <TableHead>Manager</TableHead>
                          <TableHead>PIC</TableHead>
                          <TableHead>Task Type</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData.treatments.treatmentTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.customRiskId}</TableCell>
                            <TableCell className="text-sm">{task.identifiedRisk}</TableCell>
                            <TableCell className="text-sm">{task.treatmentOpt}</TableCell>
                            <TableCell className="text-sm">{task.manager.name}</TableCell>
                            <TableCell className="text-sm">{task.pic?.name || "-"}</TableCell>
                            <TableCell className="text-sm">{task.taskType}</TableCell>
                            <TableCell className="text-sm">{new Date(task.createdAt).toLocaleDateString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Control Tasks Table */}
          {selectedModule === "controls" && (
            <Card>
              <CardHeader>
                <CardTitle>Control Tasks ({tasksData.controls.controlTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksData.controls.controlTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada control tasks</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Code</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData.controls.controlTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.code}</TableCell>
                            <TableCell className="text-sm">{task.title}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                                {getStatusLabel(task.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(task.createdAt).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell className="text-sm">{new Date(task.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SOA Tasks Table */}
          {selectedModule === "soas" && (
            <Card>
              <CardHeader>
                <CardTitle>SOA Tasks ({tasksData.soas.soaTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksData.soas.soaTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada SOA tasks</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Control Code</TableHead>
                          <TableHead>Control Title</TableHead>
                          <TableHead>Implementation Status</TableHead>
                          <TableHead>Status Target</TableHead>
                          <TableHead>Target Date</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData.soas.soaTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.controlCode}</TableCell>
                            <TableCell className="text-sm">{task.controlTitle}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.implementationStatus)}`}>
                                {getStatusIcon(task.implementationStatus)}
                                {getStatusLabel(task.implementationStatus)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.statusTarget)}`}>
                                {getStatusIcon(task.statusTarget)}
                                {getStatusLabel(task.statusTarget)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(task.targetDate).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell className="text-sm">{new Date(task.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Tidak ada data</div>
      )}
    </div>
  );
}
