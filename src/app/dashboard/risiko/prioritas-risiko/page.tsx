"use client";

import * as React from "react";
import { toast } from "sonner";
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
  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [riskCriteria, setRiskCriteria] = React.useState<RiskCriteria | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load risk criteria and risks from API
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch risk criteria
        const criteriaResponse = await apiClient.get("/risk-criteria");
        if (criteriaResponse.data?.data) {
          setRiskCriteria(criteriaResponse.data.data);
        }

        // Fetch all risks
        const risksResponse = await apiClient.get("/risk-registers", {
          params: {
            per_page: 1000,
            status: "MENUNGGU_PERSETUJUAN_FINAL,DISETUJUI",
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
  }, []);

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
      <h2 className="text-lg font-semibold">Prioritas Risiko</h2>

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
              <h3 className="text-lg font-semibold mb-4">Matriks Risiko (Impact × Likelihood)</h3>
              <Card>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full table-fixed border-collapse">
                      <thead>
                        <tr>
                          <th className="w-24"></th>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <th key={i} className="text-center">
                              L{i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matrix.map((row, si) => (
                          <tr key={si}>
                            <td className="font-medium">I{si + 1}</td>
                            {row.map((count, li) => {
                              const score = (si + 1) * (li + 1);
                              const lvl = riskLevelForScore(score);
                              const risksHere = cellMap[si][li] || [];
                              return (
                                <td
                                  key={li}
                                  className={`text-center p-2 border ${lvl.className} h-16 align-middle`}
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
              <h3 className="text-lg font-semibold mb-4">FMEA Scoring Matrix (Impact × Likelihood × Detection)</h3>
              <Card>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2 text-sm font-semibold">Impact</th>
                          <th className="text-left px-4 py-2 text-sm font-semibold">Likelihood</th>
                          <th className="text-left px-4 py-2 text-sm font-semibold">Detection</th>
                          <th className="text-center px-4 py-2 text-sm font-semibold">RPN</th>
                          <th className="text-left px-4 py-2 text-sm font-semibold">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 5 }).map((_, impact) =>
                          Array.from({ length: 5 }).map((_, likelihood) =>
                            Array.from({ length: 5 }).map((_, detection) => {
                              const count = computed.filter(
                                (item) =>
                                  item.r.impactSeverity === impact + 1 &&
                                  item.r.likelihoodOccurence === likelihood + 1 &&
                                  item.r.detection === detection + 1
                              ).length;

                              if (count === 0) return null;

                              const rpn = (impact + 1) * (likelihood + 1) * (detection + 1);
                              const lvl = riskLevelForScore(rpn);

                              return (
                                <tr key={`${impact}-${likelihood}-${detection}`} className="border-b hover:bg-gray-50">
                                  <TableCell className="text-center text-sm">{impact + 1}</TableCell>
                                  <TableCell className="text-center text-sm">{likelihood + 1}</TableCell>
                                  <TableCell className="text-center text-sm">{detection + 1}</TableCell>
                                  <TableCell className="text-center">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${lvl.className}`}>
                                      {rpn}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center text-sm font-medium">{count}</TableCell>
                                </tr>
                              );
                            })
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mt-4 mb-4">
              Tabel Prioritas Risiko (≥ Threshold: {riskCriteria.threshold})
            </h3>
            {computed.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada risiko yang memenuhi threshold
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          Risk ID
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          Identified Risk
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          Impact
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          Likelihood
                        </TableHead>
                        {riskCriteria.isFMEA && (
                          <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                            Detection
                          </TableHead>
                        )}
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          {riskCriteria.isFMEA ? "RPN" : "Score"}
                        </TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                          Risk Level
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {computed.map(({ r, score, rpn }) => (
                        <TableRow
                          key={r.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
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
