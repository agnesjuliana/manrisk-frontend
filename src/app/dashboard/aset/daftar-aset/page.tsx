"use client";

import * as React from "react";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { loadAssets, saveAssets, type Asset } from "@/lib/assetsStore";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
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
    processes: "",
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
      processes: form.processes
        ? form.processes.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
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
      processes: "",
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
              <Button variant="ghost" className="flex items-center gap-2">
                <Plus size={16} /> Tambah
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

                <Field>
                  <FieldLabel>Keterkaitan Proses (pisahkan dengan koma)</FieldLabel>
                  <Input
                    value={form.processes}
                    onChange={(e) => setForm((p) => ({ ...p, processes: e.currentTarget.value }))}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Aset</TableHead>
            <TableHead>Tipe Aset</TableHead>
            <TableHead>Klasifikasi</TableHead>
            <TableHead>Pemilik</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Keterkaitan Proses</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>{a.type}</TableCell>
              <TableCell>{a.classification}</TableCell>
              <TableCell>{users.find((u) => u.id === a.ownerId)?.name ?? "-"}</TableCell>
              <TableCell>{a.location ?? "-"}</TableCell>
              <TableCell>{(a.processes || []).join(", ") || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="p-1">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" className="p-1 text-destructive" onClick={() => removeAsset(a.id)}>
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>{assets.length} aset</TableCaption>
      </Table>
    </div>
  );
}
