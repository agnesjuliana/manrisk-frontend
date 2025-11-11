"use client"

import { useMemo, useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { loadRisks } from "@/lib/risksStore"
import type { Treatment, TreatmentOption } from "@/lib/treatmentsStore"
import { loadTreatments, nextTreatmentId, saveTreatments } from "@/lib/treatmentsStore"

export default function DaftarTreatmentPage() {
  const risks = useMemo(() => loadRisks(), [])
  const [treatments, setTreatments] = useState<Treatment[]>(() => loadTreatments())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<null | string>(null)

  const [form, setForm] = useState({
    riskId: "",
    option: "Mitigate",
    targetLikelihood: "",
    targetImpact: "",
    reason: "",
    controls: "",
    controlJustification: "",
  })

  function openForRisk(riskId: string) {
    const existing = treatments.find((t) => t.riskId === riskId)
    if (existing) {
      setEditing(existing.id)
      setForm({
        riskId: existing.riskId,
        option: existing.option,
        targetLikelihood: existing.target?.likelihood?.toString() ?? "",
        targetImpact: existing.target?.impact?.toString() ?? "",
        reason: existing.reason ?? "",
        controls: (existing.controls || []).join(", "),
        controlJustification: existing.controlJustification ?? "",
      })
    } else {
      setEditing(null)
      setForm((s) => ({ ...s, riskId }))
    }
    setOpen(true)
  }

  function save() {
    const now = new Date().toISOString()
    const existing = treatments.find((t) => t.riskId === form.riskId)
    if (existing) {
      const updated: Treatment[] = treatments.map((t) =>
        t.riskId === form.riskId
          ? ({
              ...t,
              option: form.option as TreatmentOption,
              target: {
                likelihood: form.targetLikelihood ? parseInt(form.targetLikelihood, 10) : undefined,
                impact: form.targetImpact ? parseInt(form.targetImpact, 10) : undefined,
              },
              reason: form.reason || undefined,
              controls: form.controls ? form.controls.split(",").map((s) => s.trim()) : [],
              controlJustification: form.controlJustification || undefined,
              updatedAt: now,
              status: "SET",
              approvalStatus: "DRAFT",
            } as Treatment)
          : t
      )
      setTreatments(updated)
      saveTreatments(updated)
    } else {
      const id = nextTreatmentId(treatments)
      const newItem: Treatment = {
        id,
        riskId: form.riskId,
        option: form.option as TreatmentOption,
        target: {
          likelihood: form.targetLikelihood ? parseInt(form.targetLikelihood, 10) : undefined,
          impact: form.targetImpact ? parseInt(form.targetImpact, 10) : undefined,
        },
        reason: form.reason || undefined,
        controls: form.controls ? form.controls.split(",").map((s) => s.trim()) : [],
        controlJustification: form.controlJustification || undefined,
        createdAt: now,
        status: "SET",
        approvalStatus: "DRAFT",
      }
      const next = [...treatments, newItem]
      setTreatments(next)
      saveTreatments(next)
    }

    setOpen(false)
  }

  function getTreatmentForRisk(riskId: string) {
    return treatments.find((t) => t.riskId === riskId)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-lg font-semibold">Daftar Treatment</h2>

      <div className="rounded-xl bg-muted/50 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Target Residual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((r) => {
              const t = getTreatmentForRisk(r.id)
              return (
                <TableRow key={r.id}>
                  <TableCell className="w-24">{r.id}</TableCell>
                  <TableCell>{r.identifiedRisk}</TableCell>
                  <TableCell>{t ? t.option : "-"}</TableCell>
                  <TableCell>
                    {t?.target ? (
                      <span>
                        L:{t.target.likelihood ?? "-"} / I:{t.target.impact ?? "-"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{t ? t.status : "NOT_SET"}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openForRisk(r.id)}>
                          Pilih Treatment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>TRT - Penetapan Treatment Risiko</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-2">
                          <div>
                            <label className="text-sm">Opsi Perlakuan</label>
                            <Select value={form.option} onValueChange={(v) => setForm((s) => ({ ...s, option: v }))}>
                              <SelectTrigger className="w-full" size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mitigate">Mitigate</SelectItem>
                                <SelectItem value="Accept">Accept</SelectItem>
                                <SelectItem value="Avoid">Avoid</SelectItem>
                                <SelectItem value="Transfer">Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-sm">Target Residual Likelihood (1-5)</label>
                              <Input value={form.targetLikelihood} onChange={(e) => setForm((s) => ({ ...s, targetLikelihood: e.target.value }))} />
                            </div>
                            <div>
                              <label className="text-sm">Target Residual Impact (1-5)</label>
                              <Input value={form.targetImpact} onChange={(e) => setForm((s) => ({ ...s, targetImpact: e.target.value }))} />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm">Alasan Pemilihan Opsi</label>
                            <Textarea value={form.reason} onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))} />
                          </div>

                          <div>
                            <label className="text-sm">Risiko terkait</label>
                            <Select value={form.riskId} onValueChange={(v) => setForm((s) => ({ ...s, riskId: v }))}>
                              <SelectTrigger className="w-full" size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {risks.map((rr) => (
                                  <SelectItem key={rr.id} value={rr.id}>
                                    {rr.id} - {rr.identifiedRisk}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm">Kontrol terkait (Annex A)</label>
                            <Input value={form.controls} onChange={(e) => setForm((s) => ({ ...s, controls: e.target.value }))} placeholder="Comma separated codes" />
                          </div>

                          <div>
                            <label className="text-sm">Justifikasi Pemilihan Kontrol</label>
                            <Textarea value={form.controlJustification} onChange={(e) => setForm((s) => ({ ...s, controlJustification: e.target.value }))} />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={save}>Simpan</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
