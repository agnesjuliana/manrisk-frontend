"use client";

import React, { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Shield,
  Target,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiStatistics {
  totalRisks: number;
  totalTreatmentPlans: number;
  totalControls: number;
  totalApprovedRisks: number;
  approvedRisksPercentage: number;
  severityDistribution: Array<{
    label: string;
    value: number;
    count: number;
  }>;
  riskStatusDistribution: {
    draft: number;
    submitted: number;
    approved: number;
  };
  controlImplementationStatus: {
    implemented: number;
    inProgress: number;
    planned: number;
  };
  topCriticalRisks: Array<{
    id: string;
    customRiskId: string;
    identifiedRisk: string;
    threat: string;
    vulnerability: string;
    impactSeverity: number;
    likelihoodOccurence: number;
    detection: number;
    status: string;
    priority: string;
  }>;
  priorityAnalysis: {
    aboveThreshold: number;
    belowThreshold: number;
  };
  treatmentCoverage: {
    coveredRisks: number;
    totalRisks: number;
  };
  approvedRisksCoverage: {
    approvedRisks: number;
    totalRisks: number;
  };
}

export default function RangkumanRisikoPage() {
  const [statistics, setStatistics] = useState<ApiStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/statistics`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status && result.data) {
          setStatistics(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [token]);

  // Calculate statistics from API data
  const riskStats = {
    total: statistics?.totalRisks || 0,
    bySeverity: {
      critical: statistics?.severityDistribution.find((s) => s.value === 5)?.count || 0,
      high: statistics?.severityDistribution.find((s) => s.value === 4)?.count || 0,
      medium: statistics?.severityDistribution.find((s) => s.value === 3)?.count || 0,
      low: (statistics?.severityDistribution.find((s) => s.value === 1)?.count || 0) +
           (statistics?.severityDistribution.find((s) => s.value === 2)?.count || 0),
    },
    byStatus: {
      draft: statistics?.riskStatusDistribution.draft || 0,
      submitted: statistics?.riskStatusDistribution.submitted || 0,
      approved: statistics?.riskStatusDistribution.approved || 0,
    },
    byPriority: {
      high: statistics?.priorityAnalysis.aboveThreshold || 0,
      medium: 0,
      low: statistics?.priorityAnalysis.belowThreshold || 0,
    },
  };

  const treatmentStats = {
    total: statistics?.totalTreatmentPlans || 0,
  };

  const controlStats = {
    total: statistics?.totalControls || 0,
    byImplementation: {
      implemented: statistics?.controlImplementationStatus.implemented || 0,
      inProgress: statistics?.controlImplementationStatus.inProgress || 0,
      planned: statistics?.controlImplementationStatus.planned || 0,
      testing: 0,
      verified: 0,
    },
  };

  // Risk processing progress
  const riskProgress = {
    total: statistics?.totalRisks || 0,
    withTreatment: statistics?.treatmentCoverage.coveredRisks || 0,
    treated: statistics?.totalApprovedRisks || 0,
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return "bg-red-100 text-red-800";
    if (severity === 4) return "bg-orange-100 text-orange-800";
    if (severity === 3) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 5) return "Kritis";
    if (severity === 4) return "Tinggi";
    if (severity === 3) return "Sedang";
    return "Rendah";
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === "High") return "bg-red-100 text-red-800";
    if (priority === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusColor = (status: string) => {
    if (status === "APPROVED") return "bg-green-100 text-green-800";
    if (status === "SUBMITTED") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    if (status === "APPROVED") return "Approved";
    if (status === "SUBMITTED") return "Submitted";
    return "Draft";
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12 text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12 text-red-500">Failed to load statistics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Rangkuman Risiko</h1>
        <p className="text-gray-600 mt-1">Analisis komprehensif status risiko dan implementasi treatment</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Total Risiko
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalRisks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {riskStats.bySeverity.critical} kritis, {riskStats.bySeverity.high} tinggi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Treatment Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalTreatmentPlans}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.treatmentCoverage.coveredRisks} covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalControls}</div>
            <p className="text-xs text-gray-500 mt-1">
              {controlStats.byImplementation.implemented} implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Approved Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statistics.totalApprovedRisks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.approvedRisksPercentage}% processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution by Severity */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Risiko Berdasarkan Severity</CardTitle>
          <p className="text-sm text-gray-600">Breakdown risiko by level kritis hingga rendah</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {statistics.severityDistribution.map((dist) => {
              const severityColor = getSeverityColor(dist.value);
              const borderColor = dist.value >= 5 ? "border-red-200" : 
                                 dist.value === 4 ? "border-orange-200" :
                                 dist.value === 3 ? "border-yellow-200" : "border-green-200";
              const bgColor = dist.value >= 5 ? "bg-red-50" : 
                             dist.value === 4 ? "bg-orange-50" :
                             dist.value === 3 ? "bg-yellow-50" : "bg-green-50";
              
              return (
                <div key={dist.value} className={`p-4 rounded-lg ${bgColor} border ${borderColor}`}>
                  <div className={`text-2xl font-bold ${severityColor.split(" ")[1]}`}>
                    {dist.count}
                  </div>
                  <p className={`text-xs ${severityColor.split(" ")[1]} mt-1`}>
                    {dist.label} (S={dist.value})
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {statistics.totalRisks > 0 ? Math.round((dist.count / statistics.totalRisks) * 100) : 0}% dari total
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Risk Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Risiko</CardTitle>
            <CardDescription>Progression across approval workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Draft</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{riskStats.byStatus.draft}</div>
                  <div className="text-xs text-blue-500">
                    {riskStats.total > 0 ? Math.round((riskStats.byStatus.draft / riskStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Submitted</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">{riskStats.byStatus.submitted}</div>
                  <div className="text-xs text-yellow-500">
                    {riskStats.total > 0 ? Math.round((riskStats.byStatus.submitted / riskStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{riskStats.byStatus.approved}</div>
                  <div className="text-xs text-green-500">
                    {riskStats.total > 0 ? Math.round((riskStats.byStatus.approved / riskStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Implementasi Kontrol</CardTitle>
            <CardDescription>Progress control deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Implemented</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{controlStats.byImplementation.implemented}</div>
                  <div className="text-xs text-green-500">
                    {controlStats.total > 0 ? Math.round((controlStats.byImplementation.implemented / controlStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">In Progress</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">{controlStats.byImplementation.inProgress}</div>
                  <div className="text-xs text-yellow-500">
                    {controlStats.total > 0 ? Math.round((controlStats.byImplementation.inProgress / controlStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Planned</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{controlStats.byImplementation.planned}</div>
                  <div className="text-xs text-blue-500">
                    {controlStats.total > 0 ? Math.round((controlStats.byImplementation.planned / controlStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Critical Risks */}
      <Card>
        <CardHeader>
          <CardTitle>Top Critical Risks</CardTitle>
          <CardDescription>Risiko dengan severity tertinggi yang memerlukan urgent attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistics.topCriticalRisks.map((risk, idx) => (
              <div key={risk.id} className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-200 font-bold text-red-700 text-sm">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-red-900">{risk.identifiedRisk}</h3>
                  <p className="text-xs text-red-700 mt-1">Threat: {risk.threat}</p>
                  <p className="text-xs text-red-700">Vulnerability: {risk.vulnerability}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.impactSeverity)}`}>
                      S{risk.impactSeverity} - {getSeverityLabel(risk.impactSeverity)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(risk.priority)}`}>
                      {risk.priority || "Medium Priority"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                      {getStatusLabel(risk.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Priority Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analisis Priority Risiko</CardTitle>
          <CardDescription>Distribution by priority levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{riskStats.byPriority.high}</div>
              <p className="text-sm text-red-600 mt-1">High Priority</p>
              <p className="text-xs text-red-500 mt-2">
                {riskStats.total > 0 ? Math.round((riskStats.byPriority.high / riskStats.total) * 100) : 0}% dari total
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{riskStats.byPriority.medium}</div>
              <p className="text-sm text-yellow-600 mt-1">Medium Priority</p>
              <p className="text-xs text-yellow-500 mt-2">
                {riskStats.total > 0 ? Math.round((riskStats.byPriority.medium / riskStats.total) * 100) : 0}% dari total
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{riskStats.byPriority.low}</div>
              <p className="text-sm text-green-600 mt-1">Low Priority</p>
              <p className="text-xs text-green-500 mt-2">
                {riskStats.total > 0 ? Math.round((riskStats.byPriority.low / riskStats.total) * 100) : 0}% dari total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Coverage Analysis</CardTitle>
          <CardDescription>Persentase risiko yang sudah memiliki treatment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Risiko Tertangani</span>
                <span className="text-sm font-bold">
                  {statistics.treatmentCoverage.coveredRisks}/{statistics.treatmentCoverage.totalRisks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${statistics.treatmentCoverage.totalRisks > 0 ? (statistics.treatmentCoverage.coveredRisks / statistics.treatmentCoverage.totalRisks) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.treatmentCoverage.totalRisks > 0 ? Math.round((statistics.treatmentCoverage.coveredRisks / statistics.treatmentCoverage.totalRisks) * 100) : 0}% coverage
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Approved Risks</span>
                <span className="text-sm font-bold">
                  {statistics.approvedRisksCoverage.approvedRisks}/{statistics.approvedRisksCoverage.totalRisks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${statistics.approvedRisksCoverage.totalRisks > 0 ? (statistics.approvedRisksCoverage.approvedRisks / statistics.approvedRisksCoverage.totalRisks) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.approvedRisksPercentage}% processed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
          <CardDescription>Akses cepat ke modul terkait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/risiko/daftar-risiko">
              <Button variant="outline" className="w-full justify-between">
                <span>Daftar Risiko</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/treatment/daftar-treatment">
              <Button variant="outline" className="w-full justify-between">
                <span>Treatment Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/kontrol/daftar-kontrol">
              <Button variant="outline" className="w-full justify-between">
                <span>Daftar Kontrol</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/monitoring/daftar-tugas">
              <Button variant="outline" className="w-full justify-between">
                <span>Daftar Tugas</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
