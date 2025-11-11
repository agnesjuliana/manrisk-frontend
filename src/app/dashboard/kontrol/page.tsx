"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CheckCircle2,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function KontrolPage() {
  const modules = [
    {
      id: "daftar-kontrol",
      title: "Daftar Kontrol",
      description:
        "Kelola implementasi kontrol mitigasi risiko. Lacak progress implementasi, assign ownership, dan dokumentasikan evidence.",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard/kontrol/daftar-kontrol",
    },
    {
      id: "soa",
      title: "Statement of Applicability (SoA)",
      description:
        "Dokumentasi formal kontrol yang applicable dan status implementasinya. Lihat overview dan analitik implementasi.",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      href: "/dashboard/kontrol/soa",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Kontrol (Phase 8)</h1>
        <p className="text-gray-600 mt-2">
          Phase 8: Control Implementation & Statement of Applicability
        </p>
        <p className="text-sm text-gray-500 mt-1">
          ISO 27005 - Implementasi tindakan pengontrolan dan dokumentasi ketersediaan kontrol
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Overview Phase 8</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-gray-700">
            <strong>Tujuan:</strong> Mengimplementasikan kontrol-kontrol yang telah direncanakan dalam treatment dan mendokumentasikan Statement of Applicability (SoA).
          </p>
          <p className="text-gray-700">
            <strong>Aktivitas Utama:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Pendefinisian dan pendokumentasian kontrol spesifik</li>
            <li>Penugasan ownership dan target implementasi</li>
            <li>Tracking progress implementasi (Planned → Testing → Verified)</li>
            <li>Penilaian efektivitas kontrol</li>
            <li>Dokumentasi evidence implementasi</li>
            <li>Penyusunan Statement of Applicability (SoA)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-block bg-gradient-to-r ${module.color} p-2 rounded-lg mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {module.description}
                </CardDescription>

                {module.id === "daftar-kontrol" && (
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-gray-700">Fitur:</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Tambah kontrol manual atau dari treatment</li>
                      <li>Track status implementasi per tahap</li>
                      <li>Assign ownership & deadline</li>
                      <li>Dokumentasi evidence & bukti</li>
                      <li>Penilaian efektivitas (1-5)</li>
                      <li>Alert untuk kontrol yang overdue</li>
                    </ul>
                  </div>
                )}

                {module.id === "soa" && (
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-gray-700">Fitur:</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>View daftar lengkap aplikabilitas kontrol</li>
                      <li>Lihat status implementasi & verifikasi</li>
                      <li>Analytics distribusi status & efektivitas</li>
                      <li>Export ke CSV & Report</li>
                      <li>Progress tracking implementasi</li>
                    </ul>
                  </div>
                )}

                <Link href={module.href} className="block">
                  <Button className="w-full gap-2" variant="default">
                    Buka {module.title}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Alur Kerja Implementasi Kontrol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
              <div>
                <h4 className="font-semibold">Identifikasi Kontrol</h4>
                <p className="text-sm text-gray-600">Definisikan kontrol spesifik berdasarkan treatment yang disetujui</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">2</div>
              <div>
                <h4 className="font-semibold">Rencanakan Implementasi (PLANNED)</h4>
                <p className="text-sm text-gray-600">Tentukan owner, target date, dan deskripsi implementasi</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-600">3</div>
              <div>
                <h4 className="font-semibold">Implementasikan (IN_PROGRESS)</h4>
                <p className="text-sm text-gray-600">Jalankan tindakan kontrol sesuai rencana</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">4</div>
              <div>
                <h4 className="font-semibold">Test & Evaluasi (TESTING)</h4>
                <p className="text-sm text-gray-600">Testing efektivitas kontrol dan kumpulkan evidence</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">5</div>
              <div>
                <h4 className="font-semibold">Verifikasi (VERIFIED)</h4>
                <p className="text-sm text-gray-600">Verifikasi dan dokumentasikan rating efektivitas</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">6</div>
              <div>
                <h4 className="font-semibold">Dokumentasi SoA</h4>
                <p className="text-sm text-gray-600">Buat Statement of Applicability formal dengan status semua kontrol</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Key Metrics untuk Melacak Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">Total Kontrol</p>
              <p className="text-2xl font-bold text-blue-600">N</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">Progress %</p>
              <p className="text-2xl font-bold text-yellow-600">0-100%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">Terverifikasi</p>
              <p className="text-2xl font-bold text-green-600">N</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">Efektivitas Avg</p>
              <p className="text-2xl font-bold text-purple-600">0-5 ⭐</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
