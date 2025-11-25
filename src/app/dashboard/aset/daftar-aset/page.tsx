"use client";

import * as React from "react";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { loadAssets, saveAssets, type Asset } from "@/lib/assetsStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash, Edit } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type User = StoreUser;

const ASSET_TYPES = [
  "hardware",
  "software",
  "data",
  "proses",
  "orang",
  "fasilitas",
  "lainnya",
];

const CLASSIFICATIONS = ["publik", "internal", "rahasia"];

export default function DaftarAsetPage() {
  const [assets, setAssets] = React.useState<Asset[]>(() => {
    if (typeof window === "undefined") return [];
    return loadAssets();
  });

  const [users, setUsers] = React.useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    type: ASSET_TYPES[0],
    classification: CLASSIFICATIONS[0],
    ownerId: "NONE",
    location: "",
  });

  function handleAdd() {
    if (!form.name.trim()) return;
    const a: Asset = {
      id: "asset-" + Date.now(),
      name: form.name,
      type: form.type,
      classification: form.classification,
      ownerId: form.ownerId === "NONE" ? undefined : form.ownerId,
      location: form.location || undefined,
      status: "PENDING",
    };
    setAssets((prev) => {
      const next = [a, ...prev];
      saveAssets(next);
      return next;
    });
    setForm({
      name: "",
      type: ASSET_TYPES[0],
      classification: CLASSIFICATIONS[0],
      ownerId: "",
      location: "",
    });
    setOpen(false);
  }

  function removeAsset(id: string) {
    setAssets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveAssets(next);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Daftar Aset</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Tambah Aset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Aset</DialogTitle>
                <DialogDescription>Isi data aset baru di formulir berikut.</DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <FieldLabel>Nama Aset</FieldLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.currentTarget.value }))}
                  />
                </Field>

                <Field>
                  <FieldLabel>Tipe Aset</FieldLabel>
                  <Select
                    value={form.type}
                    onValueChange={(v: string) => setForm((p) => ({ ...p, type: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe aset" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Klasifikasi Aset</FieldLabel>
                  <Select
                    value={form.classification}
                    onValueChange={(v: string) => setForm((p) => ({ ...p, classification: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih klasifikasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Pemilik Aset (Owner)</FieldLabel>
                  <Select
                    value={form.ownerId}
                    onValueChange={(v: string) => setForm((p) => ({ ...p, ownerId: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih pemilik (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">-- Tidak ada --</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Lokasi Aset</FieldLabel>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.currentTarget.value }))}
                  />
                </Field>

              </FieldGroup>

              <DialogFooter>
                <div className="flex justify-end w-full gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                  <Button onClick={handleAdd}>Tambah Aset</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PaginatedTable<Asset>
        data={assets}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row: Asset) => {
              const index = assets.findIndex((a) => a.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Nama Aset",
            key: "name",
            render: (value) => <span className="font-medium text-gray-900">{String(value)}</span>,
          },
          {
            header: "Tipe",
            key: "type",
          },
          {
            header: "Klasifikasi",
            key: "classification",
          },
          {
            header: "Lokasi",
            key: "location",
          },
          {
            header: "Pemilik",
            key: (row: Asset) => {
              const owner = users.find((u) => u.id === row.ownerId);
              return owner?.name ?? "-";
            },
          },
          {
            header: "Status",
            key: "status",
            render: (value) => {
              const status = String(value || "PENDING");
              let statusClass = "bg-gray-100 text-gray-700";
              let statusLabel = status;

              switch (status) {
                case "PENDING":
                  statusClass = "bg-yellow-100 text-yellow-700";
                  statusLabel = "Pending";
                  break;
                case "APPROVED_BY_RM":
                  statusClass = "bg-green-100 text-green-700";
                  statusLabel = "Diterima RM";
                  break;
                case "SUBMITTED_TO_TOP":
                  statusClass = "bg-blue-100 text-blue-700";
                  statusLabel = "Diajukan ke Top";
                  break;
                case "APPROVED_BY_TOP":
                  statusClass = "bg-green-100 text-green-700";
                  statusLabel = "Disetujui Top";
                  break;
                case "REJECTED":
                  statusClass = "bg-red-100 text-red-700";
                  statusLabel = "Ditolak";
                  break;
              }

              return (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                  {statusLabel}
                </span>
              );
            },
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (_, row: Asset) => (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Trash size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Belum ada aset yang terdaftar"
      />
    </div>
  );
}
