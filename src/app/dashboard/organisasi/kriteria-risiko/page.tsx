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

  // risk acceptance threshold (numeric). If risk <= threshold -> accepted
  const [threshold, setThreshold] = useState<number>(6);
  const [editingThreshold, setEditingThreshold] = useState(false);

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
                  <CardTitle>Skala Likelihood & Impact</CardTitle>
                  <CardDescription>
                    Atur ukuran skala dan label untuk masing-masing (misal 1–5).
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
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle>Threshold Risiko</CardTitle>
                    <CardDescription>
                      Atur nilai batas risiko yang dianggap diterima (≤ threshold =
                      diterima).
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      variant={editingThreshold ? "default" : "outline"}
                      onClick={() => setEditingThreshold((s) => !s)}
                    >
                      {editingThreshold ? "Simpan" : "Edit"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Threshold</FieldLabel>
                  <Input
                    readOnly={!editingThreshold}
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-24"
                  />
                </Field>
              </FieldGroup>
              <p className="text-sm text-muted-foreground mt-2">
                Contoh: jika threshold = 6, maka semua kombinasi
                likelihood*impact ≤ 6 dianggap diterima.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Matriks Risiko ({scaleSize}x{scaleSize})
          </CardTitle>
          <CardDescription>
            Hasil perhitungan likelihood × impact berdasarkan skala yang
            dipilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  {scale.map((s) => (
                    <TableHead key={s}>Impact {s}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.map((row, li) => (
                  <TableRow key={li}>
                    <TableCell className="font-medium">
                      Likelihood {li + 1}
                    </TableCell>
                    {row.map((val, ii) => (
                      <TableCell
                        key={ii}
                        className={`text-center ${riskColor(val)} rounded`}
                      >
                        {val}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
