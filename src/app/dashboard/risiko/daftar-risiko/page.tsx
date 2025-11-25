"use client";

import * as React from "react";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { loadRisks, saveRisks, type Risk } from "@/lib/risksStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Edit } from "lucide-react";

type User = StoreUser;

const RISK_CATEGORIES = ["Data Privacy", "Operational", "Compliance", "Strategic", "Financial"];
const RISK_SOURCES = ["Internal", "External", "Human Error", "Natural", "Third Party"];
const CIA_OPTIONS = ["Confidentiality", "Integrity", "Availability"] as const;

function computeRiskScore(severity: number, likelihood: number) {
  return severity * likelihood;
}

function computeRiskLevel(score: number) {
  if (score >= 16) return "Critical";
  if (score >= 9) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function computeRpn(severity: number, likelihood: number, detection?: number) {
  if (typeof detection !== "number") return undefined;
  return severity * likelihood * detection;
}

export default function DaftarRisikoPage() {
  const [risks, setRisks] = React.useState<Risk[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRisks();
  });

  const [users] = React.useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<Partial<Risk>>({
    category: RISK_CATEGORIES[0],
    vulnerability: "",
    threat: "",
    identifiedRisk: "",
    source: RISK_SOURCES[0],
    cia: [],
    ownerId: users[0]?.id ?? undefined,
    identifiedAt: new Date().toISOString(),
    status: "DRAFT",
    severity: 3,
    likelihood: 3,
    detection: 3,
    notes: "",
  });

  function nextRiskId(existing: Risk[]) {
    const highest = existing.reduce((acc, r) => {
      const n = Number(r.id.replace(/^R0*/i, "")) || 0;
      return Math.max(acc, n);
    }, 0);
    const next = highest + 1;
    return `R${String(next).padStart(3, "0")}`;
  }

  function handleAdd() {
    const id = nextRiskId(risks);
    const ownerId = form.ownerId;
    const identifiedAt = new Date().toISOString();
    const newRisk: Risk = {
      id,
      category: String(form.category || RISK_CATEGORIES[0]),
      vulnerability: String(form.vulnerability || ""),
      threat: String(form.threat || ""),
      identifiedRisk: String(form.identifiedRisk || ""),
      source: String(form.source || RISK_SOURCES[0]),
      cia: (form.cia as any) || [],
      unit: users.find((u) => u.id === ownerId)?.division || undefined,
      ownerId: ownerId,
      identifiedAt,
      status: (form.status as any) || "DRAFT",
      notes: form.notes,
      severity: form.severity ?? 3,
      likelihood: form.likelihood ?? 3,
      detection: form.detection,
      priority: form.priority,
    };
    setRisks((prev) => {
      const next = [newRisk, ...prev];
      saveRisks(next);
      return next;
    });
    setOpen(false);
  }

  function removeRisk(id: string) {
    setRisks((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRisks(next);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold">Daftar Risiko & Assessment</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2"><Plus size={16} /> Tambah Risiko</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Risiko</DialogTitle>
              <DialogDescription>Isi detail risiko dan metrik penilaian.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Field>
                    <FieldLabel>Risk Category</FieldLabel>
                    <Select value={String(form.category)} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        {RISK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Vulnerability</FieldLabel>
                    <Input value={String(form.vulnerability || "")} onChange={(e) => setForm((p) => ({ ...p, vulnerability: e.currentTarget.value }))} />
                  </Field>

                  <Field>
                    <FieldLabel>Threat</FieldLabel>
                    <Input value={String(form.threat || "")} onChange={(e) => setForm((p) => ({ ...p, threat: e.currentTarget.value }))} />
                  </Field>

                  <Field>
                    <FieldLabel>Risk Source</FieldLabel>
                    <Select value={String(form.source)} onValueChange={(v) => setForm((p) => ({ ...p, source: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Pilih sumber" /></SelectTrigger>
                      <SelectContent>
                        {RISK_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Risk Owner</FieldLabel>
                    <Select value={String(form.ownerId ?? "")} onValueChange={(v) => setForm((p) => ({ ...p, ownerId: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Pilih pemilik" /></SelectTrigger>
                      <SelectContent>
                        {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="col-span-1">
                  <Field>
                    <FieldLabel>Identified Risk</FieldLabel>
                    <Input value={String(form.identifiedRisk || "")} onChange={(e) => setForm((p) => ({ ...p, identifiedRisk: e.currentTarget.value }))} />
                  </Field>

                  <Field>
                    <FieldLabel>CIA Impact</FieldLabel>
                    <div className="flex gap-4">
                      {CIA_OPTIONS.map((c) => (
                        <label key={c} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(form.cia || []).includes(c as any)}
                            onChange={(e) => {
                              const next = new Set((form.cia || []) as string[]);
                              if (e.target.checked) next.add(c as string);
                              else next.delete(c as string);
                              setForm((p) => ({ ...p, cia: Array.from(next) as unknown as (typeof CIA_OPTIONS)[number][] }));
                            }}
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Field>
                        <FieldLabel>Severity</FieldLabel>
                        <Input type="number" value={String(form.severity ?? 3)} onChange={(e) => setForm((p) => ({ ...p, severity: Number(e.target.value) }))} className="w-full" />
                      </Field>
                    </div>
                    <div className="col-span-1">
                      <Field>
                        <FieldLabel>Likelihood</FieldLabel>
                        <Input type="number" value={String(form.likelihood ?? 3)} onChange={(e) => setForm((p) => ({ ...p, likelihood: Number(e.target.value) }))} className="w-full" />
                      </Field>
                    </div>
                    <div className="col-span-1">
                      <Field>
                        <FieldLabel>Detection</FieldLabel>
                        <Input type="number" value={String(form.detection ?? 3)} onChange={(e) => setForm((p) => ({ ...p, detection: Number(e.target.value) }))} className="w-full" />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Field>
                    <FieldLabel>Vulnerability (Detail) / Notes</FieldLabel>
                    <Textarea value={String(form.notes ?? "")} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                  </Field>
                </div>

              </div>
            </FieldGroup>

            <DialogFooter>
              <div className="flex justify-end w-full gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={handleAdd}>Tambah Risiko</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <PaginatedTable<Risk>
        data={risks}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row) => {
              const index = risks.findIndex((r) => r.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Risk ID",
            key: "id",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Kategori",
            key: "category",
          },
          {
            header: "Risiko Teridentifikasi",
            key: "identifiedRisk",
          },
          {
            header: "CIA Impact",
            key: "cia",
            render: (value) => <span>{Array.isArray(value) ? (value as string[]).join(", ") : "-"}</span>,
          },
          {
            header: "Owner",
            key: (row) => users.find((u) => u.id === row.ownerId)?.name ?? row.unit ?? "-",
          },
          {
            header: "Tanggal Identifikasi",
            key: "identifiedAt",
            render: (value) => new Date(String(value)).toLocaleDateString("id-ID"),
          },
          {
            header: "Status",
            key: "status",
            render: (value) => {
              const status = String(value || "DRAFT");
              const statusClass = status === "DRAFT" 
                ? "bg-gray-100 text-gray-700" 
                : status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700";
              return (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                  {status}
                </span>
              );
            },
            searchable: false,
          },
          {
            header: "Severity",
            key: "severity",
            render: (value) => <span className="text-center">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Likelihood",
            key: "likelihood",
            render: (value) => <span className="text-center">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Risk Score",
            key: (row) => computeRiskScore(row.severity, row.likelihood),
            render: (value) => <span className="text-center font-medium">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Risk Level",
            key: (row) => computeRiskLevel(computeRiskScore(row.severity, row.likelihood)),
            render: (value) => {
              const level = String(value);
              const levelClass = level === "Critical"
                ? "bg-red-100 text-red-700"
                : level === "High"
                ? "bg-orange-100 text-orange-700"
                : level === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";
              return (
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${levelClass}`}>
                  {level}
                </span>
              );
            },
            searchable: false,
          },
          {
            header: "RPN",
            key: (row) => computeRpn(row.severity, row.likelihood, row.detection) ?? "-",
            render: (value) => <span className="text-center">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Priority",
            key: "priority",
            render: (value) => <span className="text-center">{String(value ?? "-")}</span>,
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (_, row) => (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit size={18} className="text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => removeRisk(row.id)}
                >
                  <Trash size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Belum ada risiko yang terdaftar"
      />
    </div>
  );
}
