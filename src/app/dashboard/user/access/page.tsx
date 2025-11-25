"use client";

import * as React from "react";
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
import { PaginatedTable } from "@/components/paginated-table";

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

  const tableData = filtered.map((row, index) => ({
    ...row,
    no: index + 1,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Divisi & Hak Akses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
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
            header: "Divisi",
            key: "division",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Deskripsi",
            key: "description",
          },
          {
            header: "Active",
            key: "active",
            render: (value, row: any) => (
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={() => toggleActive(row.id)}
                className="h-4 w-4 rounded"
                aria-label={`Active ${row.division}`}
              />
            ),
            searchable: false,
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
                  onClick={() => removeRow(String(value))}
                >
                  <Trash size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada divisi yang ditemukan"
      />
    </div>
  );
}
