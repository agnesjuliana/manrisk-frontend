"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PaginatedTable } from "@/components/paginated-table"

import { loadRisks } from "@/lib/risksStore"
import type { Treatment, TreatmentOption } from "@/lib/treatmentsStore"
import { loadTreatments, nextTreatmentId, saveTreatments } from "@/lib/treatmentsStore"

// Threshold untuk risk yang perlu treatment (Risk Score >= threshold akan masuk ke treatment)
const RISK_TREATMENT_THRESHOLD = 6

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

  function computeRiskScore(severity: number, likelihood: number) {
    return severity * likelihood
  }

  function computeRiskLevel(score: number) {
    if (score >= 16) return "Critical"
    if (score >= 9) return "High"
    if (score >= 4) return "Medium"
    return "Low"
  }

  function getRiskLevelBadgeColor(level: string) {
    switch (level) {
      case "Critical":
        return "bg-red-100 text-red-700"
      case "High":
        return "bg-orange-100 text-orange-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Filter risiko yang memerlukan treatment (score >= threshold)
  const risksNeedingTreatment = useMemo(() => {
    return risks.filter((r) => {
      const score = computeRiskScore(r.severity || 0, r.likelihood || 0)
      return score >= RISK_TREATMENT_THRESHOLD
    })
  }, [risks])

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

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case "SET":
        return "bg-green-100 text-green-700"
      case "NOT_SET":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const treatmentData = risksNeedingTreatment.map((r) => {
    const t = getTreatmentForRisk(r.id)
    const score = computeRiskScore(r.severity || 0, r.likelihood || 0)
    const riskLevel = computeRiskLevel(score)
    return {
      id: r.id,
      riskId: r.id,
      identifiedRisk: r.identifiedRisk,
      riskScore: score,
      riskLevel: riskLevel,
      treatment: t?.option ?? "-",
      targetResidual: t?.target ? `L:${t.target.likelihood ?? "-"} / I:${t.target.impact ?? "-"}` : "-",
      status: t?.status ?? "NOT_SET",
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daftar Treatment</h2>
        <span className="text-sm text-gray-600">Threshold: Risk Score ≥ {RISK_TREATMENT_THRESHOLD}</span>
      </div>

      <PaginatedTable
        data={treatmentData}
        columns={[
          {
            header: "No",
            key: "riskId",
            render: (_, row) => {
              const index = treatmentData.findIndex((t) => t.riskId === row.riskId)
              return <span className="text-gray-600">{index + 1}</span>
            },
            searchable: false,
          },
          {
            header: "Risk ID",
            key: "riskId",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Identified Risk",
            key: "identifiedRisk",
          },
          {
            header: "Risk Score",
            key: "riskScore",
            render: (value) => <span className="text-center font-medium">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Risk Level",
            key: "riskLevel",
            render: (value) => (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelBadgeColor(String(value))}`}>
                {String(value)}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Treatment",
            key: "treatment",
          },
          {
            header: "Target Residual",
            key: "targetResidual",
            render: (value) => <span className="text-sm text-gray-600">{String(value)}</span>,
          },
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(String(value))}`}>
                {String(value)}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Aksi",
            key: "riskId",
            render: (value) => (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openForRisk(String(value))}
                  >
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
                          {risksNeedingTreatment.map((rr) => (
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
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada risiko yang memerlukan treatment (semua risiko di bawah threshold)"
      />
    </div>
  )
}
