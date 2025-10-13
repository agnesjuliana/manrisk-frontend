"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"

type Props = {
  open: boolean
  path: string | null
  mode: "add" | "edit"
  draft: any
  onChangeDraft: (v: any) => void
  onClose: () => void
  onSave: (validatedDraft: any) => void
}

export default function ArrayItemDialog({ open, path, mode, draft, onChangeDraft, onClose, onSave }: Props) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    setErrors({})
  }, [open, path, mode, draft])

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!path) return errs

    if (path === "stakeholders.internal" || path === "stakeholders.external") {
      if (!draft?.name || String(draft.name).trim() === "") errs.name = "Nama wajib diisi"
      if (!draft?.interest || String(draft.interest).trim() === "") errs.interest = "Interest wajib diisi"
    }

    if (path === "cia.service_priorities") {
      if (!draft?.service || String(draft.service).trim() === "") errs.service = "Service wajib diisi"
      const clamp = (v: any) => Number(v) >= 1 && Number(v) <= 5
      if (!clamp(draft?.C)) errs.C = "C harus 1-5"
      if (!clamp(draft?.I)) errs.I = "I harus 1-5"
      if (!clamp(draft?.A)) errs.A = "A harus 1-5"
    }

    // technical_bounds is an object {name, description}
    if (path === "scope.technical_bounds") {
      if (!draft || !draft.name || String(draft.name).trim() === "") errs.name = "Nama batasan wajib diisi"
    }

    // simple string arrays (require non-empty)
    if (path === "scope.units" || path === "regulations.selected") {
      if (!draft || String(draft).trim() === "") errs.value = "Nilai wajib diisi"
    }

    setErrors(errs)
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) return
    onSave(draft)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {(() => {
              if (!path) return mode === "add" ? "Tambah item" : "Edit item"
              const labelMap: Record<string, string> = {
                "scope.technical_bounds": "Batasan Teknis",
                "scope.units": "Unit Terkait",
                "regulations.selected": "Regulasi",
                "stakeholders.internal": "Stakeholder (Internal)",
                "stakeholders.external": "Stakeholder (External)",
                "cia.service_priorities": "Prioritas Layanan",
              }
              const label = labelMap[path] ?? "item"
              return mode === "add" ? `Tambah ${label}` : `Edit ${label}`
            })()}
          </DialogTitle>
          <DialogDescription>Isi data lalu simpan.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {path === "stakeholders.internal" || path === "stakeholders.external" ? (
            <>
              <Label>Nama</Label>
              <Input value={draft?.name ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, name: e.target.value })} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}

              <Label>Interest</Label>
              <Input value={draft?.interest ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, interest: e.target.value })} />
              {errors.interest && <p className="text-sm text-destructive mt-1">{errors.interest}</p>}
            </>
            ) : path === "cia.service_priorities" ? (
            <>
              <Label>Service</Label>
              <Input value={draft?.service ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, service: e.target.value })} />
              {errors.service && <p className="text-sm text-destructive mt-1">{errors.service}</p>}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>C</Label>
                  <Input type="number" value={draft?.C ?? 1} onChange={(e: any) => onChangeDraft({ ...draft, C: Number(e.target.value) })} />
                  {errors.C && <p className="text-sm text-destructive mt-1">{errors.C}</p>}
                </div>
                <div>
                  <Label>I</Label>
                  <Input type="number" value={draft?.I ?? 1} onChange={(e: any) => onChangeDraft({ ...draft, I: Number(e.target.value) })} />
                  {errors.I && <p className="text-sm text-destructive mt-1">{errors.I}</p>}
                </div>
                <div>
                  <Label>A</Label>
                  <Input type="number" value={draft?.A ?? 1} onChange={(e: any) => onChangeDraft({ ...draft, A: Number(e.target.value) })} />
                  {errors.A && <p className="text-sm text-destructive mt-1">{errors.A}</p>}
                </div>
              </div>
            </>
            ) : path === "scope.technical_bounds" ? (
              <>
                <Label>Nama Batasan</Label>
                <Input value={draft?.name ?? ""} onChange={(e: any) => onChangeDraft({ ...(draft ?? {}), name: e.target.value })} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}

                <Label>Deskripsi</Label>
                <Textarea
                  value={draft?.description ?? ""}
                  onChange={(e: any) => onChangeDraft({ ...(draft ?? {}), description: e.target.value })}
                  className="border-input w-full min-h-[90px] rounded-md px-3 py-2 text-sm"
                />
              </>
            ) : (
              <>
                <Label>Value</Label>
                <Input value={draft ?? ""} onChange={(e: any) => onChangeDraft(e.target.value)} />
              </>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={Object.keys(errors).length > 0}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
