"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingDown,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import { getTaskStats, getOverdueTasks, getDueSoonTasks } from "@/lib/tasksStore";
import { loadRisks } from "@/lib/risksStore";
import { loadTreatments } from "@/lib/treatmentsStore";
import { loadControls } from "@/lib/controlsStore";

export default function MonitoringPage() {
  const [stats, setStats] = useState<ReturnType<typeof getTaskStats> | null>(null);
  const [overdue, setOverdue] = useState<number>(0);
  const [dueSoon, setDueSoon] = useState<number>(0);
  const [riskCount, setRiskCount] = useState(0);
  const [treatmentCount, setTreatmentCount] = useState(0);
  const [controlCount, setControlCount] = useState(0);

  useEffect(() => {
    const tasks = getTaskStats();
    setStats(tasks);
    setOverdue(getOverdueTasks().length);
    setDueSoon(getDueSoonTasks().length);
    setRiskCount(loadRisks().length);
    setTreatmentCount(loadTreatments().length);
    setControlCount(loadControls().length);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Phase 10: Monitoring & Review</h1>
        <p className="text-gray-600 mt-2">
          ISO 27005:2022 - Continuing Monitoring & Review Stage
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Pantau implementasi risiko, treatment, dan kontrol. Kelola tugas-tugas monitoring dan review.
        </p>
      </div>

      {/* ISO 27005 Phase 10 Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Phase 10: Continuing Monitoring & Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Fase ini mencakup aktivitas berkelanjutan untuk memantau efektivitas dari proses risk management:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Monitoring</h4>
              <p className="text-xs text-gray-600">
                Pantau status risiko, treatment, dan kontrol secara berkala untuk memastikan efektivitas berkelanjutan.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Review & Verification</h4>
              <p className="text-xs text-gray-600">
                Review implementasi kontrol dan treatment untuk memverifikasi pencapaian tujuan.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Continuous Improvement</h4>
              <p className="text-xs text-gray-600">
                Identifikasi peluang improvement berdasarkan hasil monitoring dan review berkala.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Aktif Tugas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.activeTasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dueSoon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Kritis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats?.criticalCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.completionRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Core Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Tugas - Task Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-600" />
              Daftar Tugas
            </CardTitle>
            <CardDescription>
              Kelola tugas monitoring, review, dan remediation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm">Total Tugas</span>
                <span className="text-lg font-bold text-blue-600">{stats?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-sm">Terbuka</span>
                <span className="text-lg font-bold text-yellow-600">{stats?.open || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm">Selesai</span>
                <span className="text-lg font-bold text-green-600">{stats?.completed || 0}</span>
              </div>
            </div>
            <Link href="/dashboard/monitoring/daftar-tugas">
              <Button className="w-full justify-between">
                <span>Buka Daftar Tugas</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Rangkuman Risiko - Risk Summary */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Rangkuman Risiko
            </CardTitle>
            <CardDescription>
              Analisis komprehensif status risiko dan treatment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm">Total Risiko</span>
                <span className="text-lg font-bold text-red-600">{riskCount}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm">Treatment Plans</span>
                <span className="text-lg font-bold text-orange-600">{treatmentCount}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-sm">Kontrol</span>
                <span className="text-lg font-bold text-purple-600">{controlCount}</span>
              </div>
            </div>
            <Link href="/dashboard/monitoring/rangkuman-risiko">
              <Button className="w-full justify-between">
                <span>Lihat Rangkuman</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 10 Process Flow</CardTitle>
          <CardDescription>Alur proses Monitoring & Review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">1. Monitoring & Data Collection</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Mengumpulkan data tentang efektivitas risiko management processes secara berkala
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">2. Regular Review</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Melakukan review berkala terhadap status risiko, treatment, dan kontrol
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">3. Analysis & Verification</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Menganalisis efektivitas dan memverifikasi pencapaian objectives
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">4. Continuous Improvement</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Identifikasi dan implementasi peluang improvement berkelanjutan
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Modul Terkait</CardTitle>
          <CardDescription>Link ke fase-fase sebelumnya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link href="/dashboard/aset/daftar-aset">
              <Button variant="outline" className="w-full h-auto flex-col py-3" size="sm">
                <span className="text-xs font-medium">Assets</span>
                <span className="text-xs text-gray-500">Phase 1</span>
              </Button>
            </Link>
            <Link href="/dashboard/risiko/daftar-risiko">
              <Button variant="outline" className="w-full h-auto flex-col py-3" size="sm">
                <span className="text-xs font-medium">Risiko</span>
                <span className="text-xs text-gray-500">Phase 2</span>
              </Button>
            </Link>
            <Link href="/dashboard/treatment/daftar-treatment">
              <Button variant="outline" className="w-full h-auto flex-col py-3" size="sm">
                <span className="text-xs font-medium">Treatment</span>
                <span className="text-xs text-gray-500">Phase 7</span>
              </Button>
            </Link>
            <Link href="/dashboard/kontrol/daftar-kontrol">
              <Button variant="outline" className="w-full h-auto flex-col py-3" size="sm">
                <span className="text-xs font-medium">Kontrol</span>
                <span className="text-xs text-gray-500">Phase 8</span>
              </Button>
            </Link>
            <Link href="/dashboard/monitoring/daftar-tugas">
              <Button variant="outline" className="w-full h-auto flex-col py-3" size="sm">
                <span className="text-xs font-medium">Tugas</span>
                <span className="text-xs text-gray-500">Phase 10</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      {overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Perhatian: Tugas Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-3">
              Anda memiliki {overdue} tugas yang sudah melewati deadline. Segera tindaklanjuti!
            </p>
            <Link href="/dashboard/monitoring/daftar-tugas">
              <Button size="sm" variant="outline">
                Lihat Tugas Overdue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
