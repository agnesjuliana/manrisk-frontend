"use client";

import { useMemo, useState, useEffect } from "react";
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
import { ShieldCheck, ChevronRight, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { riskCriteriaApi } from "@/lib/api";

export default function KriteriaRisikoPage() {
  const { user } = useAuth();
  
  // Check if user is RISK_OWNER
  const isRiskOwner = user?.role === "RISK_OWNER";

  const [useFmea, setUseFmea] = useState(false);
  const [editingScale, setEditingScale] = useState(false);
  const [scaleSize, setScaleSize] = useState<number>(0);
  const [likelihoodOpen, setLikelihoodOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [detectionOpen, setDetectionOpen] = useState(false);
  const [occurrenceOpen, setOccurrenceOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [savingFmea, setSavingFmea] = useState(false);
  const [savingScale, setSavingScale] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  
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
  const [threshold, setThreshold] = useState<number>(0);
  const [editingThreshold, setEditingThreshold] = useState(false);
  
  // RPN threshold for FMEA (same as threshold)
  const [editingRpnThreshold, setEditingRpnThreshold] = useState(false);

  // Load risk criteria from API on mount
  useEffect(() => {
    const loadRiskCriteria = async () => {
      setIsLoadingCriteria(true);
      try {
        const response = await riskCriteriaApi.get();
        
        if (response.status && response.data) {
          const data = response.data;
          setUseFmea(data.isFMEA);
          setScaleSize(data.scale);
          setThreshold(data.threshold);
          
          // Map scaleStatuses to labels
          if (data.scaleStatuses && data.scaleStatuses.length > 0) {
            const labels = data.scaleStatuses
              .sort((a, b) => a.level - b.level)
              .map(status => status.title);
            setLikelihoodLabels(labels);
            setImpactLabels(labels);
            setSeverityLabels(labels);
            setOccurrenceLabels(labels);
            setDetectionLabels(labels);
          }
        } else {
          // No data from API - setup needed
          setSetupNeeded(true);
          setScaleSize(0);
          setThreshold(0);
        }
      } catch (err) {
        console.error("Error loading risk criteria:", err);
        // If error, assume setup needed
        setSetupNeeded(true);
        setScaleSize(0);
        setThreshold(0);
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    loadRiskCriteria();
  }, []);

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

  async function handleFmeaToggle(newValue: boolean) {
    setSavingFmea(true);
    setError(null);
    try {
      const response = await riskCriteriaApi.update({
        isFMEA: newValue,
      });

      if (!response.status) {
        throw new Error(response.message || "Gagal menyimpan pengaturan FMEA");
      }

      setUseFmea(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error toggling FMEA:", err);
    } finally {
      setSavingFmea(false);
    }
  }

  async function handleSaveScale() {
    setSavingScale(true);
    setError(null);
    try {
      const response = await riskCriteriaApi.saveScale({
        scale: scaleSize,
        scale_status: likelihoodLabels.slice(0, scaleSize),
      });

      if (!response.status) {
        throw new Error(response.message || "Gagal menyimpan skala");
      }

      setEditingScale(false);
      setLikelihoodOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error saving scale:", err);
    } finally {
      setSavingScale(false);
    }
  }

  async function handleSaveThreshold() {
    setSavingThreshold(true);
    setError(null);
    try {
      const response = await riskCriteriaApi.update({
        threshold: threshold,
      });

      if (!response.status) {
        throw new Error(response.message || "Gagal menyimpan threshold");
      }

      setEditingThreshold(false);
      setEditingRpnThreshold(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error saving threshold:", err);
    } finally {
      setSavingThreshold(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Kriteria Risiko</h1>
        <p className="text-sm text-gray-600 mt-1">Atur metode penilaian, skala, dan threshold risiko organisasi</p>
      </div>

      {setupNeeded && (
        <div className="flex gap-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sky-900">Setup Diperlukan</p>
            <p className="text-sm text-sky-700">
              Kriteria risiko belum dikonfigurasi. Silakan atur Metode Penilaian terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-sky-200 via-sky-150 to-sky-100">
          <CardHeader className="border-b border-sky-200 bg-transparent">
            <CardTitle className="text-gray-900">Metode Penilaian</CardTitle>
            <CardDescription className="text-gray-600">
              Pilih apakah organisasi akan menggunakan FMEA atau metode
              sederhana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-sm border border-red-200">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between p-4 rounded-lg ${
                  useFmea ? "bg-sky-100 border border-sky-200" : "border border-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      useFmea ? "text-sky-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      FMEA (Failure Mode and Effects Analysis)
                    </div>
                    <div className="text-sm text-gray-600">
                      Tambahkan faktor deteksi dan perhitungan RPN jika
                      diaktifkan.
                    </div>
                  </div>
                </div>
                <div>
                  {!isRiskOwner && (
                    <>
                      {!useFmea ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              className="bg-sky-600 hover:bg-sky-700 text-white" 
                              disabled={savingFmea}
                            >
                              {savingFmea ? "Menyimpan..." : "Aktifkan"}
                            </Button>
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
                              <AlertDialogAction onClick={() => handleFmeaToggle(true)}>
                                Ya, aktifkan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              className="bg-sky-600 hover:bg-sky-700 text-white" 
                              disabled={savingFmea}
                            >
                              {savingFmea ? "Menyimpan..." : "Nonaktifkan"}
                            </Button>
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
                              <AlertDialogAction onClick={() => handleFmeaToggle(false)}>
                                Ya, nonaktifkan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-sky-100 shadow-md bg-white">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-gray-900">Label Skala</CardTitle>
                  <CardDescription className="text-gray-600">
                    Atur ukuran skala dan label untuk semua dimensi penilaian risiko (misal 1–5).
                  </CardDescription>
                </div>
                {!isRiskOwner && (
                  <div>
                  <Button
                    className={editingScale ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-white hover:bg-sky-50 border border-sky-200 text-sky-700"}
                    onClick={() => editingScale ? handleSaveScale() : setEditingScale(true)}
                    disabled={scaleSize === 0 || savingScale}
                  >
                    {savingScale ? "Menyimpan..." : editingScale ? "Simpan" : "Edit"}
                  </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {scaleSize === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-2">
                    Belum ada konfigurasi skala
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aktifkan metode penilaian terlebih dahulu untuk mengatur skala
                  </p>
                </div>
              ) : (
                <FieldGroup>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel>Ukuran skala</FieldLabel>
                      <div className="text-sm text-muted-foreground">(2–10)</div>
                    </div>
                    <Input
                      readOnly={!editingScale || isRiskOwner}
                      type="number"
                      value={scaleSize}
                      onChange={(e) => onChangeScaleSize(Number(e.target.value))}
                      className="w-28"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Level Labels (Skala 1..{scaleSize})</FieldLabel>
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
                                    readOnly={!editingScale || isRiskOwner}
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
                          aria-label="Toggle labels"
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
                </FieldGroup>
              )}
            </CardContent>
          </Card>

          <Card className="border border-sky-100 shadow-md bg-white">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-gray-900">
                    {useFmea ? "Threshold RPN" : "Threshold Risiko"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {useFmea
                      ? "Atur nilai batas RPN (Risk Priority Number) yang dianggap kritis."
                      : "Atur nilai batas risiko yang dianggap diterima (≤ threshold = diterima)."}
                  </CardDescription>
                </div>
                {!isRiskOwner && (
                  <div>
                    <Button
                      className={
                        (useFmea ? editingRpnThreshold : editingThreshold)
                          ? "bg-sky-600 hover:bg-sky-700 text-white"
                          : "bg-white hover:bg-sky-50 border border-sky-200 text-sky-700"
                      }
                      onClick={() => {
                        if (useFmea) {
                          editingRpnThreshold ? handleSaveThreshold() : setEditingRpnThreshold(true);
                        } else {
                          editingThreshold ? handleSaveThreshold() : setEditingThreshold(true);
                        }
                      }}
                      disabled={scaleSize === 0 || savingThreshold}
                    >
                      {savingThreshold 
                        ? "Menyimpan..." 
                        : useFmea 
                          ? (editingRpnThreshold ? "Simpan" : "Edit") 
                          : (editingThreshold ? "Simpan" : "Edit")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {scaleSize === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">
                    Belum ada konfigurasi threshold
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aktifkan metode penilaian terlebih dahulu untuk mengatur threshold
                  </p>
                </div>
              ) : (
                <>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>
                        {useFmea ? "Threshold RPN" : "Threshold"}
                      </FieldLabel>
                      <Input
                        readOnly={useFmea ? (!editingRpnThreshold || isRiskOwner) : (!editingThreshold || isRiskOwner)}
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-24"
                      />
                    </Field>
                  </FieldGroup>
                  <p className="text-sm text-muted-foreground mt-2">
                    {useFmea
                      ? "Contoh: jika threshold RPN = 100, maka semua perhitungan S×O×D ≥ 100 dianggap kritis."
                      : "Contoh: jika threshold = 6, maka semua kombinasi likelihood*impact ≤ 6 dianggap diterima."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border border-sky-100 shadow-md bg-white">
        <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
          <CardTitle className="text-gray-900">
            {useFmea 
              ? `Tabel FMEA (S × O × D Hitung = RPN)` 
              : `Matriks Risiko (${scaleSize}x${scaleSize})`}
          </CardTitle>
          <CardDescription className="text-gray-600">
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
                  <TableRow className="bg-sky-100 border-sky-200">
                    <TableHead className="text-sky-900">No</TableHead>
                    <TableHead className="text-sky-900">Severity</TableHead>
                    <TableHead className="text-sky-900">Occurrence</TableHead>
                    <TableHead className="text-sky-900">Detection</TableHead>
                    <TableHead className="text-center text-sky-900">RPN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: scaleSize * scaleSize * scaleSize }).map((_, idx) => {
                    // Generate all combinations of severity, occurrence, detection
                    const severity = Math.floor(idx / (scaleSize * scaleSize)) + 1;
                    const occurrence = Math.floor((idx % (scaleSize * scaleSize)) / scaleSize) + 1;
                    const detection = (idx % scaleSize) + 1;
                    const rpn = severity * occurrence * detection;
                    const isCritical = rpn >= threshold;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{severityLabels[severity - 1] || `Level ${severity}`}</TableCell>
                        <TableCell>{occurrenceLabels[occurrence - 1] || `Level ${occurrence}`}</TableCell>
                        <TableCell>{detectionLabels[detection - 1] || `Level ${detection}`}</TableCell>
                        <TableCell className={`text-center font-semibold ${isCritical ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} rounded`}>
                          {rpn}
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
                    <th className="w-24 border border-sky-200 p-2 bg-sky-100 text-sky-900 font-semibold"></th>
                    {scale.map((s) => (
                      <th key={s} className="text-center text-sm font-semibold text-sky-900 border border-sky-200 p-2 bg-sky-100">
                        I{s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, li) => (
                    <tr key={li}>
                      <td className="font-medium text-sm text-sky-900 border border-sky-200 p-2 text-center bg-sky-50">
                        L{li + 1}
                      </td>
                      {row.map((val, ii) => (
                        <td
                          key={ii}
                          className={`text-center p-3 border border-sky-200 ${riskColor(val)} text-sm font-semibold h-16 align-middle`}
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
