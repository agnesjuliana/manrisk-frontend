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
import { Trash, Edit, Plus } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type SubRole = {
  id: string;
  description?: string;
  division?: string;
  active: boolean;
};

const initialData: SubRole[] = [
  {
    id: "sr-1",
    description: "Handles system accounts",
    division: "IT",
    active: true,
  },
  {
    id: "sr-2",
    description: "Risk manager for finance",
    division: "Finance",
    active: true,
  },
  {
    id: "sr-3",
    description: "Owner for operations risks",
    division: "Operations",
    active: false,
  },
];

export default function UserAccessPage() {
  const [rows, setRows] = React.useState<SubRole[]>(initialData);
  const [query, setQuery] = React.useState("");

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.description?.toLowerCase().includes(q) ||
      r.division?.toLowerCase().includes(q)
    );
  });

  function toggleActive(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  // Add subrole sheet state
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    mainRole: "ADMIN",
    name: "",
    description: "",
    divisionFlag: "",
    active: true,
  });

  function handleAdd() {
    const newRow: SubRole = {
      id: "sr-" + Date.now(),
      description: form.description,
      division: form.divisionFlag,
      active: form.active,
    };
    setRows((prev) => [newRow, ...prev]);
    setForm({
      mainRole: "ADMIN",
      name: "",
      description: "",
      divisionFlag: "",
      active: true,
    });
    setOpen(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Divisi & Hak Akses</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari Divisi..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Plus size={16} /> Tambah Divisi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Divisi</DialogTitle>
                <DialogDescription>
                  Buat divisi baru untuk penglolaan user.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel>Nama Divisi</FieldLabel>
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
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.currentTarget.value,
                      }))
                    }
                  />
                </Field>
                <div className="flex items-center gap-3">
                  <FieldLabel>Active</FieldLabel>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        active: e.currentTarget.checked,
                      }))
                    }
                  />
                </div>
              </FieldGroup>
              <DialogFooter>
                <div className="flex justify-end w-full gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Batalkan
                  </Button>
                  <Button onClick={handleAdd}>Tambah Divisi</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Divisi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.division}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={() => toggleActive(row.id)}
                  className="h-4 w-4 rounded"
                  aria-label={`Active ${row.division}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="p-1">
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="p-1 text-destructive"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>{filtered.length} divisi</TableCaption>
      </Table>
    </div>
  );
}
