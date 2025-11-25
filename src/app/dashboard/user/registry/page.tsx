"use client";

import * as React from "react";
import { loadUsers, saveUsers, type User as StoreUser, type MainRole as StoreMainRole } from "@/lib/usersStore"
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
import { Trash, Edit, Plus } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PaginatedTable } from "@/components/paginated-table";

// Reuse store types
type User = StoreUser
type MainRole = StoreMainRole

const sampleDivisions = ["IT", "Finance", "Operations"];

export default function UserRegistryPage() {
  const [rows, setRows] = React.useState<User[]>(() => {
    if (typeof window === "undefined") return []
    return loadUsers()
  });
  const [query, setQuery] = React.useState("");

  const filtered = rows.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.division || "").toLowerCase().includes(q)
    );
  });

  function removeUser(id: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id)
      saveUsers(next)
      return next
    })
  }

  // dialog form state
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    division: "NONE",
  });

  function handleAdd() {
    const newUser: User = {
      id: "u-" + Date.now(),
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role as MainRole,
      division: form.division === "NONE" ? undefined : form.division,
    };
    setRows((prev) => {
      const next = [newUser, ...prev]
      saveUsers(next)
      return next
    })
    setForm({ name: "", email: "", password: "", role: "ADMIN", division: "NONE" });
    setOpen(false);
  }

  const tableData = filtered.map((row, index) => ({
    ...row,
    no: index + 1,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Daftar Pengguna</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <Plus size={16} /> Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna</DialogTitle>
              <DialogDescription>
                Isi data pengguna baru di formulir berikut.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Nama</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.currentTarget.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.currentTarget.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.currentTarget.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={form.role}
                  onValueChange={(v: string) =>
                    setForm((prev) => ({ ...prev, role: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="RISK_MANAGER">RISK_MANAGER</SelectItem>
                    <SelectItem value="RISK_OWNER">RISK_OWNER</SelectItem>
                    <SelectItem value="CONTROL_OWNER">
                      CONTROL_OWNER
                    </SelectItem>
                    <SelectItem value="TOP_MANAGEMENT">
                      TOP_MANAGEMENT
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Divisi</FieldLabel>
                <Select
                  value={form.division}
                  onValueChange={(v: string) =>
                    setForm((prev) => ({ ...prev, division: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih divisi (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Tidak ada --</SelectItem>
                    {sampleDivisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <div className="flex justify-end w-full gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAdd}>Tambah Pengguna</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <PaginatedTable
        data={tableData}
        columns={[
          {
            header: "No",
            key: "no",
            render: (value) => <span className="text-gray-600">{String(value)}</span>,
            searchable: false,
          },
          {
            header: "Nama",
            key: "name",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Email",
            key: "email",
          },
          {
            header: "Role",
            key: "role",
          },
          {
            header: "Divisi",
            key: "division",
            render: (value) => <span>{String(value || "-")}</span>,
          },
          {
            header: "Aksi",
            key: "id",
            render: (value) => (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit size={18} className="text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => removeUser(String(value))}
                >
                  <Trash size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada pengguna yang ditemukan"
      />
    </div>
  );
}
