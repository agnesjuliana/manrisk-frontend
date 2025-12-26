"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { departmentsApi, type Department } from "@/lib/api";

export default function UserAccessPage() {
  const [rows, setRows] = React.useState<Department[]>([]);
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const pageSize = 20;

  // Add subrole sheet state
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Fetch departments
  const fetchDepartments = React.useCallback(
    async (page: number = 1, search?: string) => {
      setIsLoading(true);
      try {
        const response = await departmentsApi.getAll(page, pageSize, search);
        if (response.status) {
          setRows(response.data.data);
          setCurrentPage(response.data.metadata.page);
          setTotalPages(response.data.metadata.total_page);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch departments");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial fetch
  React.useEffect(() => {
    fetchDepartments(1);
  }, [fetchDepartments]);

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartments(1, query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchDepartments]);

  async function handleAdd() {
    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing
        const response = await departmentsApi.update(editingId, {
          name: form.name,
          description: form.description,
          isActive: form.isActive,
        });
        if (response.status) {
          toast.success("Divisi berhasil diperbarui");
          fetchDepartments(currentPage, query);
          setEditingId(null);
        }
      } else {
        // Create new
        const response = await departmentsApi.create({
          name: form.name,
          description: form.description,
          isActive: form.isActive,
        });
        if (response.status) {
          toast.success("Divisi berhasil ditambahkan");
          fetchDepartments(1, query);
        }
      }
      setForm({
        name: "",
        description: "",
        isActive: true,
      });
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save department");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus divisi ini?")) return;

    setIsLoading(true);
    try {
      const response = await departmentsApi.delete(id);
      if (response.status) {
        toast.success("Divisi berhasil dihapus");
        fetchDepartments(currentPage, query);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete department");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(department: Department) {
    setEditingId(department.id);
    setForm({
      name: department.name,
      description: department.description,
      isActive: department.isActive,
    });
    setOpen(true);
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingId(null);
      setForm({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Divisi & Hak Akses</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <Plus size={16} /> Tambah Divisi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Divisi" : "Tambah Divisi"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui informasi divisi."
                  : "Buat divisi baru untuk pengelolaan user."}
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
                      name: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </Field>
              <div className="flex items-center gap-3">
                <FieldLabel>Aktif</FieldLabel>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
            </FieldGroup>
            <DialogFooter>
              <div className="flex justify-end w-full gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Batalkan
                </Button>
                <Button onClick={handleAdd} disabled={isLoading}>
                  {isLoading
                    ? "Sedang Menyimpan..."
                    : editingId
                    ? "Perbarui Divisi"
                    : "Tambah Divisi"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <PaginatedTable
        data={rows.map((row, index) => ({
          ...row,
          no: (currentPage - 1) * pageSize + index + 1,
          division: row.name,
          active: row.isActive,
        }))}
        columns={[
          {
            header: "No",
            key: "no",
            render: (value) => (
              <span className="text-gray-600">{String(value)}</span>
            ),
            searchable: false,
          },
          {
            header: "Divisi",
            key: "division",
            render: (value) => (
              <span className="font-medium">{String(value)}</span>
            ),
            searchable: true,
          },
          {
            header: "Deskripsi",
            key: "description",
            searchable: true,
          },
          {
            header: "Active",
            key: "active",
            render: (value) => (
              <input
                type="checkbox"
                checked={value as boolean}
                disabled
                className="h-4 w-4 rounded"
              />
            ),
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (value, row: any) => (
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  onClick={() => handleEdit(row)}
                  disabled={isLoading}
                >
                  <Edit size={18} className="text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  onClick={() => handleDelete(String(value))}
                  disabled={isLoading}
                >
                  <Trash size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={pageSize}
        emptyMessage="Tidak ada divisi yang ditemukan"
      />
    </div>
  );
}
