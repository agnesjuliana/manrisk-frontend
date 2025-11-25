"use client";

import * as React from "react";
import { loadRisks, type Risk } from "@/lib/risksStore";
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
  const [risks] = React.useState<Risk[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRisks();
  });

  const computed = React.useMemo(() => {
    return risks
      .map((r) => {
        const score = (r.severity || 0) * (r.likelihood || 0);
        const rpn = r.detection
          ? (r.severity || 0) * (r.likelihood || 0) * (r.detection || 0)
          : undefined;
        return { r, score, rpn };
      })
      .sort((a, b) => {
        const ar = a.rpn ?? a.score;
        const br = b.rpn ?? b.score;
        return br - ar;
      });
  }, [risks]);

  // build 5x5 matrix counts based on severity (rows) x likelihood (cols)
  const matrix = React.useMemo(() => {
    const size = 5;
    const m: number[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 0)
    );
    for (const { r } of computed) {
      const sev = Math.min(5, Math.max(1, r.severity || 1));
      const lik = Math.min(5, Math.max(1, r.likelihood || 1));
      m[sev - 1][lik - 1]++;
    }
    return m;
  }, [computed]);

  // map risks to matrix cells for marker rendering
  const cellMap = React.useMemo(() => {
    const size = 5;
    const m: Risk[][][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => [])
    );
    for (const { r } of computed) {
      const sev = Math.min(5, Math.max(1, r.severity || 1));
      const lik = Math.min(5, Math.max(1, r.likelihood || 1));
      m[sev - 1][lik - 1].push(r);
    }
    return m;
  }, [computed]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <h2 className="text-lg font-semibold">Prioritas Risiko</h2>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Matriks Risiko (Severity × Likelihood)</h3>
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
                        <td className="font-medium">S{si + 1}</td>
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
                                            {rk.id}
                                          </div>
                                          <div className="text-sm">
                                            {rk.identifiedRisk}
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            Severity {rk.severity} • Likelihood{" "}
                                            {rk.likelihood}
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

        <div>
          <h3 className="text-lg font-semibold mt-4 mb-4">Tabel Prioritas Risiko</h3>
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
                      Severity
                    </TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                      Likelihood
                    </TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                      Score
                    </TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                      RPN
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
                        {r.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {r.identifiedRisk}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                        {r.severity}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                        {r.likelihood}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center font-medium">
                        {score}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                        {rpn ?? "-"}
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
        </div>
      </div>
    </div>
  );
}
