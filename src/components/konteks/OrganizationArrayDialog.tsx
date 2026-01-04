"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  open: boolean
  path: string | null
  mode: "add" | "edit"
  draft: any
  onChangeDraft: (v: any) => void
  onClose: () => void
  onSave: (validatedDraft: any) => void
  contexts?: Array<{ id: string; name: string }>
}

export default function ArrayItemDialog({ open, path, mode, draft, onChangeDraft, onClose, onSave, contexts = [] }: Props) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (open) {
      setErrors({})
    }
  }, [open, path, mode])

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!path) return errs

    if (path === "stakeholders.internal" || path === "stakeholders.external") {
      if (!draft?.name || String(draft.name).trim() === "") errs.name = "Nama wajib diisi"
      if (!draft?.interest || String(draft.interest).trim() === "") errs.interest = "Interest wajib diisi"
    }

    if (path === "cia.service_priorities") {
      if (!draft?.context_id || String(draft.context_id).trim() === "") errs.context_id = "Context wajib dipilih"
      if (!draft?.service || String(draft.service).trim() === "") errs.service = "Service wajib diisi"
      const clamp = (v: any) => Number(v) >= 0 && Number(v) <= 100
      if (!clamp(draft?.C)) errs.C = "C harus 0-100"
      if (!clamp(draft?.I)) errs.I = "I harus 0-100"
      if (!clamp(draft?.A)) errs.A = "A harus 0-100"
    }

    // technical_bounds is an object {name, description}
    if (path === "scope.technical_bounds") {
      if (!draft || !draft.name || String(draft.name).trim() === "") errs.name = "Nama batasan wajib diisi"
    }

    // simple string arrays (require non-empty)
    if (path === "scope.units" || path === "regulations.selected") {
      if (!draft || String(draft).trim() === "") {
        errs.value = "Nilai wajib diisi"
        console.log("Validation failed for regulations.selected - draft:", draft, "type:", typeof draft);
      }
    }

    console.log("Validation result for path:", path, "errors:", errs, "draft:", draft);
    setErrors(errs)
    return errs
  }

  function handleSave() {
    console.log("handleSave called with draft:", draft, "path:", path);
    if (!draft || (typeof draft === "string" && String(draft).trim() === "")) {
      console.warn("Draft is empty, cannot save");
      return;
    }
    console.log("Calling onSave with draft:", draft);
    onSave(draft);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent>
        <DialogHeader className="border-b border-sky-100 pb-4">
          <DialogTitle className="text-2xl text-gray-900">
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
          <DialogDescription className="text-gray-600 mt-1">Isi data lalu simpan.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {path === "stakeholders.internal" || path === "stakeholders.external" ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Nama</Label>
                <Input className="border-gray-300" value={draft?.name ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, name: e.target.value })} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Interest</Label>
                <Input className="border-gray-300" value={draft?.interest ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, interest: e.target.value })} />
                {errors.interest && <p className="text-sm text-destructive mt-1">{errors.interest}</p>}
              </div>
            </>
            ) : path === "cia.service_priorities" ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Context</Label>
                <Select value={draft?.context_id ?? ""} onValueChange={(value) => onChangeDraft({ ...draft, context_id: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Pilih context" />
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((ctx) => (
                      <SelectItem key={ctx.id} value={ctx.id}>
                        {ctx.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.context_id && <p className="text-sm text-destructive mt-1">{errors.context_id}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Service</Label>
                <Input className="border-gray-300" value={draft?.service ?? ""} onChange={(e: any) => onChangeDraft({ ...draft, service: e.target.value })} />
                {errors.service && <p className="text-sm text-destructive mt-1">{errors.service}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">C</Label>
                  <Input className="border-gray-300" type="number" value={draft?.C ?? 50} onChange={(e: any) => onChangeDraft({ ...draft, C: Number(e.target.value) })} />
                  {errors.C && <p className="text-sm text-destructive mt-1">{errors.C}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">I</Label>
                  <Input className="border-gray-300" type="number" value={draft?.I ?? 50} onChange={(e: any) => onChangeDraft({ ...draft, I: Number(e.target.value) })} />
                  {errors.I && <p className="text-sm text-destructive mt-1">{errors.I}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">A</Label>
                  <Input className="border-gray-300" type="number" value={draft?.A ?? 50} onChange={(e: any) => onChangeDraft({ ...draft, A: Number(e.target.value) })} />
                  {errors.A && <p className="text-sm text-destructive mt-1">{errors.A}</p>}
                </div>
              </div>
            </>
            ) : path === "scope.technical_bounds" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Nama Batasan</Label>
                  <Input className="border-gray-300" value={draft?.name ?? ""} onChange={(e: any) => onChangeDraft({ ...(draft ?? {}), name: e.target.value })} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Deskripsi</Label>
                  <Textarea
                    className="border-gray-300 min-h-24"
                    value={draft?.description ?? ""}
                    onChange={(e: any) => onChangeDraft({ ...(draft ?? {}), description: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Value</Label>
                  <Input 
                    className="border-gray-300"
                    value={draft ?? ""} 
                    onChange={(e: any) => {
                      onChangeDraft(e.target.value);
                    }} 
                  />
                  {errors.value && <p className="text-sm text-destructive mt-1">{errors.value}</p>}
                </div>
              </>
            )}
        </div>

        <DialogFooter className="gap-2 border-t border-sky-100 pt-4 mt-6">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
