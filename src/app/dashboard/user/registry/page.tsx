"use client";

import * as React from "react";
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
import { Trash, Edit, Plus } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type MainRole =
  | "ADMIN"
  | "RISK_MANAGER"
  | "RISK_OWNER"
  | "CONTROL_OWNER"
  | "TOP_MANAGEMENT";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: MainRole;
  division?: string;
};

const initialUsers: User[] = [
  {
    id: "u-1",
    name: "Agnes Juliana",
    email: "agnes@example.com",
    password: "password",
    role: "ADMIN",
    division: "IT",
  },
  {
    id: "u-2",
    name: "Budi Santoso",
    email: "budi@example.com",
    password: "password",
    role: "RISK_MANAGER",
    division: "Finance",
  },
];

const sampleDivisions = ["IT", "Finance", "Operations"];

export default function UserRegistryPage() {
  const [rows, setRows] = React.useState<User[]>(initialUsers);
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
    setRows((prev) => prev.filter((r) => r.id !== id));
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
    setRows((prev) => [newUser, ...prev]);
    setForm({ name: "", email: "", password: "", role: "ADMIN", division: "NONE" });
    setOpen(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Daftar Pengguna</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari pengguna..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Plus size={16} /> Tambah
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
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Divisi</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.division}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="p-1">
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="p-1 text-destructive"
                    onClick={() => removeUser(u.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>{filtered.length} pengguna</TableCaption>
      </Table>
    </div>
  );
}
