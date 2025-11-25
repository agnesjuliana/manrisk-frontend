"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ShieldCheck, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function KriteriaRisikoPage() {
  const [useFmea, setUseFmea] = useState(false);
  const [editingScale, setEditingScale] = useState(false);
  const [scaleSize, setScaleSize] = useState<number>(5);
  const [likelihoodOpen, setLikelihoodOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [detectionOpen, setDetectionOpen] = useState(false);
  const [occurrenceOpen, setOccurrenceOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  
  // editable labels for likelihood/impact, default 1..5 Indonesian labels
  const defaultLabels = [
    "Sangat Rendah",
    "Rendah",
    "Sedang",
    "Tinggi",
    "Sangat Tinggi",
  ];
  const [likelihoodLabels, setLikelihoodLabels] = useState<string[]>(
    defaultLabels.slice(0, scaleSize)
  );
  const [impactLabels, setImpactLabels] = useState<string[]>(
    defaultLabels.slice(0, scaleSize)
  );
  
  // FMEA-specific labels
  const [severityLabels, setSeverityLabels] = useState<string[]>(
    defaultLabels.slice(0, scaleSize)
  );
  const [occurrenceLabels, setOccurrenceLabels] = useState<string[]>(
    defaultLabels.slice(0, scaleSize)
  );
  const [detectionLabels, setDetectionLabels] = useState<string[]>(
    defaultLabels.slice(0, scaleSize)
  );

  // risk acceptance threshold (numeric). If risk <= threshold -> accepted
  const [threshold, setThreshold] = useState<number>(6);
  const [editingThreshold, setEditingThreshold] = useState(false);
  
  // RPN threshold for FMEA
  const [rpnThreshold, setRpnThreshold] = useState<number>(100);
  const [editingRpnThreshold, setEditingRpnThreshold] = useState(false);

  // regenerate arrays when scaleSize changes
  const scale = useMemo(
    () => Array.from({ length: scaleSize }, (_, i) => i + 1),
    [scaleSize]
  );

  // ensure labels arrays match the scale size
  function ensureLabels(labels: string[], setter: (v: string[]) => void) {
    if (labels.length === scaleSize) return;
    const next = Array.from(
      { length: scaleSize },
      (_, i) => labels[i] ?? `Level ${i + 1}`
    );
    setter(next);
  }

  const matrix = useMemo(() => {
    const m: number[][] = [];
    for (let li = 0; li < scaleSize; li++) {
      const row: number[] = [];
      for (let ii = 0; ii < scaleSize; ii++) {
        // simple multiplication scoring: likelihood * impact
        row.push((li + 1) * (ii + 1));
      }
      m.push(row);
    }
    return m;
  }, [scaleSize]);

  // color for a risk value (simple thresholds)
  function riskColor(value: number) {
    if (value <= threshold) return "bg-green-200 text-green-800";
    // high: top 25% of possible value
    const max = scaleSize * scaleSize;
    if (value >= Math.ceil(max * 0.75)) return "bg-red-200 text-red-800";
    if (value >= Math.ceil(max * 0.5)) return "bg-yellow-200 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  }

  // update behaviour when scale changes
  function onChangeScaleSize(n: number) {
    const capped = Math.min(10, Math.max(2, n));
    setScaleSize(capped);
    ensureLabels(likelihoodLabels, setLikelihoodLabels);
    ensureLabels(impactLabels, setImpactLabels);
  }

  // when entering edit mode, expand both collapsibles
  if (editingScale) {
    if (!likelihoodOpen) setLikelihoodOpen(true);
    if (!impactOpen) setImpactOpen(true);
    if (useFmea && !detectionOpen) setDetectionOpen(true);
    if (useFmea && !occurrenceOpen) setOccurrenceOpen(true);
    if (useFmea && !severityOpen) setSeverityOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-lg font-semibold">Kriteria Risiko</h2>

      <div className="grid grid-cols-1 gap-4">
        <Card className={useFmea ? "bg-blue-50 border-blue-200" : ""}>
          <CardHeader>
            <CardTitle>Metode Penilaian</CardTitle>
            <CardDescription>
              Pilih apakah organisasi akan menggunakan FMEA atau metode
              sederhana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between p-2 rounded-md ${
                  useFmea ? "" : "border border-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className={
                      useFmea ? "text-blue-600" : "text-muted-foreground"
                    }
                  />
                  <div>
                    <div className="font-medium">
                      FMEA (Failure Mode and Effects Analysis)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tambahkan faktor deteksi dan perhitungan RPN jika
                      diaktifkan.
                    </div>
                  </div>
                </div>
                <div>
                  {!useFmea ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Aktifkan</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aktifkan FMEA?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Mengaktifkan FMEA akan menambahkan langkah deteksi
                            dan perhitungan RPN. Lanjutkan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batalkan</AlertDialogCancel>
                          <AlertDialogAction onClick={() => setUseFmea(true)}>
                            Ya, aktifkan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Nonaktifkan</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Nonaktifkan FMEA?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Menonaktifkan FMEA akan menghapus konfigurasi
                            deteksi dan RPN. Yakin ingin melanjutkan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batalkan</AlertDialogCancel>
                          <AlertDialogAction onClick={() => setUseFmea(false)}>
                            Ya, nonaktifkan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>
                    {useFmea ? "Skala FMEA (S-O-D)" : "Skala Likelihood & Impact"}
                  </CardTitle>
                  <CardDescription>
                    {useFmea
                      ? "Atur skala untuk Severity, Occurrence, dan Detection."
                      : "Atur ukuran skala dan label untuk masing-masing (misal 1–5)."}
                  </CardDescription>
                </div>
                <div>
                  <Button
                    variant={editingScale ? "default" : "outline"}
                    onClick={() => setEditingScale((s) => !s)}
                  >
                    {editingScale ? "Simpan" : "Edit"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel>Ukuran skala</FieldLabel>
                    <div className="text-sm text-muted-foreground">(2–10)</div>
                  </div>
                  <Input
                    readOnly={!editingScale}
                    type="number"
                    value={scaleSize}
                    onChange={(e) => onChangeScaleSize(Number(e.target.value))}
                    className="w-28"
                  />
                </Field>

                {!useFmea ? (
                  <>
                    <Field>
                      <FieldLabel>Likelihood (Skala 1..{scaleSize})</FieldLabel>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingScale || likelihoodOpen ? (
                            <Collapsible
                              open={editingScale || likelihoodOpen}
                              onOpenChange={(v: boolean) => setLikelihoodOpen(v)}
                            >
                              <CollapsibleContent>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {Array.from({ length: scaleSize }).map((_, i) => (
                                    <Input
                                      readOnly={!editingScale}
                                      className="w-full"
                                      key={i}
                                      value={
                                        likelihoodLabels[i] ?? `Level ${i + 1}`
                                      }
                                      onChange={(e) =>
                                        setLikelihoodLabels((s) => {
                                          const copy = [...s];
                                          copy[i] = e.target.value;
                                          return copy;
                                        })
                                      }
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={likelihoodLabels[0] ?? `Level 1`}
                              />
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                …
                              </div>
                              <Input
                                readOnly
                                value={
                                  likelihoodLabels[scaleSize - 1] ??
                                  `Level ${scaleSize}`
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <button
                            aria-label="Toggle likelihood"
                            className={`p-1 rounded hover:bg-muted/50`}
                            onClick={() => setLikelihoodOpen((s) => !s)}
                          >
                            <ChevronRight
                              className={`${
                                editingScale || likelihoodOpen ? "rotate-90" : ""
                              } transition-transform`}
                            />
                          </button>
                        </div>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel>Impact (Skala 1..{scaleSize})</FieldLabel>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingScale || impactOpen ? (
                            <Collapsible
                              open={editingScale || impactOpen}
                              onOpenChange={(v: boolean) => setImpactOpen(v)}
                            >
                              <CollapsibleContent>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {Array.from({ length: scaleSize }).map((_, i) => (
                                    <Input
                                      readOnly={!editingScale}
                                      className="w-full"
                                      key={i}
                                      value={impactLabels[i] ?? `Level ${i + 1}`}
                                      onChange={(e) =>
                                        setImpactLabels((s) => {
                                          const copy = [...s];
                                          copy[i] = e.target.value;
                                          return copy;
                                        })
                                      }
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={impactLabels[0] ?? `Level 1`}
                              />
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                …
                              </div>
                              <Input
                                readOnly
                                value={
                                  impactLabels[scaleSize - 1] ??
                                  `Level ${scaleSize}`
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <button
                            aria-label="Toggle impact"
                            className={`p-1 rounded hover:bg-muted/50`}
                            onClick={() => setImpactOpen((s) => !s)}
                          >
                            <ChevronRight
                              className={`${
                                editingScale || impactOpen ? "rotate-90" : ""
                              } transition-transform`}
                            />
                          </button>
                        </div>
                      </div>
                    </Field>
                  </>
                ) : (
                  <>
                    <Field>
                      <FieldLabel>Severity (Skala 1..{scaleSize})</FieldLabel>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingScale || severityOpen ? (
                            <Collapsible
                              open={editingScale || severityOpen}
                              onOpenChange={(v: boolean) => setSeverityOpen(v)}
                            >
                              <CollapsibleContent>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {Array.from({ length: scaleSize }).map((_, i) => (
                                    <Input
                                      readOnly={!editingScale}
                                      className="w-full"
                                      key={i}
                                      value={
                                        severityLabels[i] ?? `Level ${i + 1}`
                                      }
                                      onChange={(e) =>
                                        setSeverityLabels((s) => {
                                          const copy = [...s];
                                          copy[i] = e.target.value;
                                          return copy;
                                        })
                                      }
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={severityLabels[0] ?? `Level 1`}
                              />
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                …
                              </div>
                              <Input
                                readOnly
                                value={
                                  severityLabels[scaleSize - 1] ??
                                  `Level ${scaleSize}`
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <button
                            aria-label="Toggle severity"
                            className={`p-1 rounded hover:bg-muted/50`}
                            onClick={() => setSeverityOpen((s) => !s)}
                          >
                            <ChevronRight
                              className={`${
                                editingScale || severityOpen ? "rotate-90" : ""
                              } transition-transform`}
                            />
                          </button>
                        </div>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel>Occurrence (Skala 1..{scaleSize})</FieldLabel>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingScale || occurrenceOpen ? (
                            <Collapsible
                              open={editingScale || occurrenceOpen}
                              onOpenChange={(v: boolean) => setOccurrenceOpen(v)}
                            >
                              <CollapsibleContent>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {Array.from({ length: scaleSize }).map((_, i) => (
                                    <Input
                                      readOnly={!editingScale}
                                      className="w-full"
                                      key={i}
                                      value={
                                        occurrenceLabels[i] ?? `Level ${i + 1}`
                                      }
                                      onChange={(e) =>
                                        setOccurrenceLabels((s) => {
                                          const copy = [...s];
                                          copy[i] = e.target.value;
                                          return copy;
                                        })
                                      }
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={occurrenceLabels[0] ?? `Level 1`}
                              />
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                …
                              </div>
                              <Input
                                readOnly
                                value={
                                  occurrenceLabels[scaleSize - 1] ??
                                  `Level ${scaleSize}`
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <button
                            aria-label="Toggle occurrence"
                            className={`p-1 rounded hover:bg-muted/50`}
                            onClick={() => setOccurrenceOpen((s) => !s)}
                          >
                            <ChevronRight
                              className={`${
                                editingScale || occurrenceOpen ? "rotate-90" : ""
                              } transition-transform`}
                            />
                          </button>
                        </div>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel>Detection (Skala 1..{scaleSize})</FieldLabel>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingScale || detectionOpen ? (
                            <Collapsible
                              open={editingScale || detectionOpen}
                              onOpenChange={(v: boolean) => setDetectionOpen(v)}
                            >
                              <CollapsibleContent>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {Array.from({ length: scaleSize }).map((_, i) => (
                                    <Input
                                      readOnly={!editingScale}
                                      className="w-full"
                                      key={i}
                                      value={
                                        detectionLabels[i] ?? `Level ${i + 1}`
                                      }
                                      onChange={(e) =>
                                        setDetectionLabels((s) => {
                                          const copy = [...s];
                                          copy[i] = e.target.value;
                                          return copy;
                                        })
                                      }
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={detectionLabels[0] ?? `Level 1`}
                              />
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                …
                              </div>
                              <Input
                                readOnly
                                value={
                                  detectionLabels[scaleSize - 1] ??
                                  `Level ${scaleSize}`
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <button
                            aria-label="Toggle detection"
                            className={`p-1 rounded hover:bg-muted/50`}
                            onClick={() => setDetectionOpen((s) => !s)}
                          >
                            <ChevronRight
                              className={`${
                                editingScale || detectionOpen ? "rotate-90" : ""
                              } transition-transform`}
                            />
                          </button>
                        </div>
                      </div>
                    </Field>
                  </>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>
                    {useFmea ? "Threshold RPN" : "Threshold Risiko"}
                  </CardTitle>
                  <CardDescription>
                    {useFmea
                      ? "Atur nilai batas RPN (Risk Priority Number) yang dianggap kritis."
                      : "Atur nilai batas risiko yang dianggap diterima (≤ threshold = diterima)."}
                  </CardDescription>
                </div>
                <div>
                  <Button
                    variant={useFmea ? (editingRpnThreshold ? "default" : "outline") : (editingThreshold ? "default" : "outline")}
                    onClick={() => useFmea ? setEditingRpnThreshold((s) => !s) : setEditingThreshold((s) => !s)}
                  >
                    {useFmea ? (editingRpnThreshold ? "Simpan" : "Edit") : (editingThreshold ? "Simpan" : "Edit")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    {useFmea ? "Threshold RPN" : "Threshold"}
                  </FieldLabel>
                  <Input
                    readOnly={useFmea ? !editingRpnThreshold : !editingThreshold}
                    type="number"
                    value={useFmea ? rpnThreshold : threshold}
                    onChange={(e) =>
                      useFmea
                        ? setRpnThreshold(Number(e.target.value))
                        : setThreshold(Number(e.target.value))
                    }
                    className="w-24"
                  />
                </Field>
              </FieldGroup>
              <p className="text-sm text-muted-foreground mt-2">
                {useFmea
                  ? "Contoh: jika threshold RPN = 100, maka semua perhitungan S×O×D ≥ 100 dianggap kritis."
                  : "Contoh: jika threshold = 6, maka semua kombinasi likelihood*impact ≤ 6 dianggap diterima."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {useFmea 
              ? `Tabel FMEA (S × O × D Hitung = RPN)` 
              : `Matriks Risiko (${scaleSize}x${scaleSize})`}
          </CardTitle>
          <CardDescription>
            {useFmea
              ? "Risk Priority Number (RPN) = Severity × Occurrence × Detection. Semakin tinggi RPN, semakin kritis."
              : "Hasil perhitungan likelihood × impact berdasarkan skala yang dipilih."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            {useFmea ? (
              // FMEA Table View
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>No</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Occurrence</TableHead>
                    <TableHead>Detection</TableHead>
                    <TableHead className="text-center">RPN</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: Math.min(5, scaleSize) }).map((_, idx) => {
                    const s = idx + 2;
                    const o = idx + 2;
                    const d = idx + 2;
                    const rpn = s * o * d;
                    const isCritical = rpn >= rpnThreshold;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{severityLabels[s - 1] || `Level ${s}`}</TableCell>
                        <TableCell>{occurrenceLabels[o - 1] || `Level ${o}`}</TableCell>
                        <TableCell>{detectionLabels[d - 1] || `Level ${d}`}</TableCell>
                        <TableCell className={`text-center font-semibold ${isCritical ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} rounded`}>
                          {rpn}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-xs px-2 py-1 rounded ${isCritical ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"}`}>
                            {isCritical ? "🔴 Kritis" : "🟢 Normal"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              // Traditional Risk Matrix
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-24 border border-gray-200 p-2"></th>
                    {scale.map((s) => (
                      <th key={s} className="text-center text-sm font-semibold text-gray-700 border border-gray-200 p-2">
                        I{s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, li) => (
                    <tr key={li}>
                      <td className="font-medium text-sm text-gray-700 border border-gray-200 p-2 text-center">
                        L{li + 1}
                      </td>
                      {row.map((val, ii) => (
                        <td
                          key={ii}
                          className={`text-center p-3 border border-gray-200 ${riskColor(val)} text-sm font-semibold h-16 align-middle`}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
