"use client";

import * as React from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api/config";

interface Risk {
  id: string;
  customRiskId: string;
  identifiedRisk: string;
  impactSeverity?: number;
  likelihoodOccurence?: number;
  detection?: number;
  severity?: number;
  likelihood?: number;
}

interface RiskCriteria {
  isFMEA: boolean;
  threshold: number;
}

function riskLevelForScore(score: number) {
  if (score >= 16)
    return { label: "Critical", className: "bg-red-200 text-red-800" };
  if (score >= 9)
    return { label: "High", className: "bg-yellow-200 text-yellow-800" };
  if (score >= 4)
    return { label: "Medium", className: "bg-orange-100 text-orange-800" };
  return { label: "Low", className: "bg-green-200 text-green-800" };
}

export default function PrioritasRisikoPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [riskCriteria, setRiskCriteria] = React.useState<RiskCriteria | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Mark component as mounted to prevent hydration mismatches
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isRiskManager = user?.role === "RISK_MANAGER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  // Load risk criteria and risks from API
  React.useEffect(() => {
    // Only load if user is loaded and component is mounted
    if (!mounted || !user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch risk criteria
        const criteriaResponse = await apiClient.get("/risk-criteria");
        if (criteriaResponse.data?.data) {
          setRiskCriteria(criteriaResponse.data.data);
        }

        // Determine status filter based on role
        let statusFilter: string;
        if (isRiskManager) {
          statusFilter = "DISETUJUI_RM,MENUNGGU_PERSETUJUAN_FINAL,MENUNGGU_PERSETUJUAN_RM,DISETUJUI";
        } else {
          // Default for TOP_MANAGEMENT and other roles
          statusFilter = "MENUNGGU_PERSETUJUAN_FINAL,DISETUJUI";
        }

        // Fetch all risks
        const risksResponse = await apiClient.get("/risk-registers", {
          params: {
            per_page: 1000,
            status: statusFilter,
          },
        });

        if (risksResponse.data?.data?.data) {
          setRisks(risksResponse.data.data.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Gagal memuat data risiko");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mounted, user]);

  const computed = React.useMemo(() => {
    return risks
      .map((r) => {
        let score: number;
        let rpn: number | undefined;

        if (riskCriteria?.isFMEA) {
          // FMEA: RPN = Severity × Likelihood × Detection
          rpn = (r.impactSeverity ?? 1) * (r.likelihoodOccurence ?? 1) * (r.detection ?? 1);
          score = rpn;
        } else {
          // Non-FMEA: Score = Severity × Likelihood
          score = (r.impactSeverity ?? 1) * (r.likelihoodOccurence ?? 1);
          rpn = undefined;
        }

        return { r, score, rpn };
      })
      .filter((item) => {
        // Filter berdasarkan threshold
        const threshold = riskCriteria?.threshold ?? 9;
        return item.score >= threshold;
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
  }, [risks, riskCriteria]);

  // build 5x5 matrix counts based on severity (rows) x likelihood (cols) - non-FMEA only
  const matrix = React.useMemo(() => {
    if (riskCriteria?.isFMEA) return null;

    const size = 5;
    const m: number[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 0)
    );
    for (const { r } of computed) {
      const sev = Math.min(5, Math.max(1, r.impactSeverity || 1));
      const lik = Math.min(5, Math.max(1, r.likelihoodOccurence || 1));
      m[sev - 1][lik - 1]++;
    }
    return m;
  }, [computed, riskCriteria]);

  // map risks to matrix cells for marker rendering - non-FMEA only
  const cellMap = React.useMemo(() => {
    if (riskCriteria?.isFMEA) return null;

    const size = 5;
    const m: Risk[][][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => [])
    );
    for (const { r } of computed) {
      const sev = Math.min(5, Math.max(1, r.impactSeverity || 1));
      const lik = Math.min(5, Math.max(1, r.likelihoodOccurence || 1));
      m[sev - 1][lik - 1].push(r);
    }
    return m;
  }, [computed, riskCriteria]);

  // FMEA table data - 3D matrix
  const fmeaTable = React.useMemo(() => {
    if (!riskCriteria?.isFMEA) return [];

    return computed.map(({ r, score, rpn }) => ({
      r,
      severity: r.impactSeverity || 1,
      likelihood: r.likelihoodOccurence || 1,
      detection: r.detection || 1,
      rpn: rpn || score,
    }));
  }, [computed, riskCriteria]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Prioritas Risiko</h1>
        <p className="text-sm text-gray-600 mt-1">Analisis dan prioritas risiko berdasarkan kriteria yang telah ditentukan</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          Loading data risiko...
        </div>
      ) : !riskCriteria ? (
        <div className="text-center py-8 text-red-500">
          Failed to load risk criteria
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!riskCriteria.isFMEA && matrix && cellMap && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Matriks Risiko (Impact × Likelihood)</h3>
              </div>
              <Card className="border-sky-100 shadow-md bg-white">
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full table-fixed border-collapse">
                      <thead>
                        <tr className="bg-sky-100">
                          <th className="w-24 px-4 py-3 text-sm font-semibold text-sky-900 border border-sky-200"></th>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <th key={i} className="text-center px-4 py-3 text-sm font-semibold text-sky-900 border border-sky-200">
                              L{i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matrix.map((row, si) => (
                          <tr key={si}>
                            <td className="font-semibold px-4 py-3 border border-sky-200 bg-sky-50 text-sky-900">I{si + 1}</td>
                            {row.map((count, li) => {
                              const score = (si + 1) * (li + 1);
                              const lvl = riskLevelForScore(score);
                              const risksHere = cellMap[si][li] || [];
                              return (
                                <td
                                  key={li}
                                  className={`text-center p-2 border border-sky-200 ${lvl.className} h-16 align-middle`}
                                >
                                  <div className="flex flex-col items-center gap-1 h-full justify-center">
                                    <div className="text-sm font-semibold">
                                      {count}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1 max-h-6 overflow-hidden">
                                      {risksHere.map((rk) => (
                                        <Tooltip key={rk.id}>
                                          <TooltipTrigger asChild>
                                            <button className="p-0 m-0">
                                              <Star className="w-4 h-4 text-amber-600" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <div className="max-w-xs">
                                              <div className="font-medium">
                                                {rk.customRiskId}
                                              </div>
                                              <div className="text-sm">
                                                {rk.identifiedRisk}
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-1">
                                                Impact {rk.impactSeverity} • Likelihood{" "}
                                                {rk.likelihoodOccurence}
                                              </div>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {riskCriteria.isFMEA && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">FMEA Scoring Matrix (Impact × Likelihood × Detection)</h3>
              </div>
              <Card className="border-sky-100 shadow-md bg-white">
                <CardContent className="pt-6">
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-sky-100 border-b border-sky-200">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-sky-900">Impact</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-sky-900">Likelihood</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-sky-900">Detection</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-sky-900">RPN</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-sky-900">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {computed.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                              Tidak ada data FMEA untuk ditampilkan
                            </td>
                          </tr>
                        ) : (
                          computed.map(({ r, score }) => {
                            const rpn = score;
                            const lvl = riskLevelForScore(rpn);
                            const countByGroup = computed.filter(
                              (item) =>
                                item.r.impactSeverity === r.impactSeverity &&
                                item.r.likelihoodOccurence === r.likelihoodOccurence &&
                                item.r.detection === r.detection
                            ).length;

                            // Only show unique combinations (using stringified key)
                            const key = `${r.impactSeverity}-${r.likelihoodOccurence}-${r.detection}`;
                            const isFirst = computed.findIndex(
                              (item) =>
                                item.r.impactSeverity === r.impactSeverity &&
                                item.r.likelihoodOccurence === r.likelihoodOccurence &&
                                item.r.detection === r.detection
                            ) === computed.findIndex((item) => item.r.id === r.id);

                            if (!isFirst) return null;

                            return (
                              <tr key={key} className="border-b hover:bg-gray-50">
                                <TableCell className="text-center text-sm">{r.impactSeverity}</TableCell>
                                <TableCell className="text-center text-sm">{r.likelihoodOccurence}</TableCell>
                                <TableCell className="text-center text-sm">{r.detection}</TableCell>
                                <TableCell className="text-center">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${lvl.className}`}>
                                    {rpn}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-sm font-medium">{countByGroup}</TableCell>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tabel Prioritas Risiko (≥ Threshold: {riskCriteria.threshold})
              </h3>
            </div>
            {computed.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada risiko yang memenuhi threshold
              </div>
            ) : (
              <div className="border border-sky-100 rounded-lg overflow-hidden bg-white shadow-md">
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-sky-100 border-b border-sky-200 hover:bg-sky-100">
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          Risk ID
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          Identified Risk
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          Impact
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          Likelihood
                        </TableHead>
                        {riskCriteria.isFMEA && (
                          <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                            Detection
                          </TableHead>
                        )}
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          {riskCriteria.isFMEA ? "RPN" : "Score"}
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-sky-900 whitespace-nowrap">
                          Risk Level
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {computed.map(({ r, score, rpn }) => (
                        <TableRow
                          key={r.id}
                          className="border-b border-sky-100 hover:bg-sky-50 transition-colors"
                        >
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap font-medium">
                            {r.customRiskId}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {r.identifiedRisk}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                            {r.impactSeverity}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                            {r.likelihoodOccurence}
                          </TableCell>
                          {riskCriteria.isFMEA && (
                            <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                              {r.detection}
                            </TableCell>
                          )}
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center font-medium">
                            {score}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                riskLevelForScore(score).className
                              }`}
                            >
                              {riskLevelForScore(score).label}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
