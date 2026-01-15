"use client";

import * as React from "react";
import { toast } from "sonner";
import { usersApi, departmentsApi, type UserManagement, type Department } from "@/lib/api";
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
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

export default function UserRegistryPage() {
  const [rows, setRows] = React.useState<UserManagement[]>([]);
  const [divisions, setDivisions] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const pageSize = 20;

  // dialog form state
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deletingName, setDeletingName] = React.useState<string>("");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "RISK_MANAGER",
    division_id: "",
  });

  // Find the last (oldest) ADMIN user - cannot be deleted
  const lastAdmin = React.useMemo(() => {
    const admins = rows.filter(user => user.role === "ADMIN");
    if (admins.length === 0) return null;
    
    // Sort by createdAt ascending (oldest first)
    return admins.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.createdAt).getTime();
      const currentDate = new Date(current.createdAt).getTime();
      return currentDate < oldestDate ? current : oldest;
    });
  }, [rows]);
  const fetchDivisions = React.useCallback(async () => {
    try {
      const response = await departmentsApi.getAll(1, 1000);
      if (response.status) {
        setDivisions(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
    }
  }, []);

  // Fetch users
  const fetchUsers = React.useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const response = await usersApi.getAll(page, pageSize);
        if (response.status) {
          setRows(response.data.data);
          setCurrentPage(response.data.metadata.page);
          setTotalPages(response.data.metadata.total_page);
        }
      } catch (error: any) {
        toast.error(error.message || "Gagal mengambil data pengguna");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial fetch
  React.useEffect(() => {
    fetchDivisions();
    fetchUsers(1);
  }, [fetchDivisions, fetchUsers]);

  async function handleAdd() {
    if (!form.name || !form.email || (!editingId && !form.password)) {
      toast.error("Nama, email, dan password harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing
        const response = await usersApi.update(editingId, {
          name: form.name,
          email: form.email,
          role: form.role as any,
          division_id: form.division_id || undefined,
        });
        if (response.status) {
          toast.success("Pengguna berhasil diperbarui");
          fetchUsers(currentPage);
          setEditingId(null);
        }
      } else {
        // Create new
        const response = await usersApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as any,
          division_id: form.division_id || undefined,
        });
        if (response.status) {
          toast.success("Pengguna berhasil ditambahkan");
          fetchUsers(1);
        }
      }
      setForm({
        name: "",
        email: "",
        password: "",
        role: "RISK_MANAGER",
        division_id: "",
      });
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pengguna");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      const response = await usersApi.delete(id);
      if (response.status) {
        toast.success("Pengguna berhasil dihapus");
        fetchUsers(currentPage);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pengguna");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setDeletingName("");
    }
  }

  function handleDeleteClick(id: string, name: string) {
    setDeletingId(id);
    setDeletingName(name);
    setDeleteDialogOpen(true);
  }

  function handleEdit(user: UserManagement) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as any,
      division_id: user.departmentId || "",
    });
    setOpen(true);
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingId(null);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "RISK_MANAGER",
        division_id: "",
      });
    }
  }

  const tableData = rows.map((row, index) => ({
    ...row,
    no: (currentPage - 1) * pageSize + index + 1,
    divisionName: divisions.find((d) => d.id === row.departmentId)?.name || "-",
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Daftar Pengguna</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <Plus size={16} /> Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Pengguna" : "Tambah Pengguna"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui informasi pengguna."
                  : "Isi data pengguna baru di formulir berikut."}
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
                      name: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </Field>
              {!editingId && (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                  />
                </Field>
              )}
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={form.role}
                  onValueChange={(v: string) =>
                    setForm((prev) => ({ ...prev, role: v }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="RISK_MANAGER">RISK_MANAGER</SelectItem>
                    <SelectItem value="RISK_OWNER">RISK_OWNER</SelectItem>
                    <SelectItem value="TOP_MANAGEMENT">
                      TOP_MANAGEMENT
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Divisi (Opsional)</FieldLabel>
                <Select
                  value={form.division_id || "none"}
                  onValueChange={(v: string) =>
                    setForm((prev) => ({ ...prev, division_id: v === "none" ? "" : v }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Tidak ada --</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <div className="flex justify-end w-full gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button onClick={handleAdd} disabled={isLoading}>
                  {isLoading
                    ? "Sedang Menyimpan..."
                    : editingId
                    ? "Perbarui Pengguna"
                    : "Tambah Pengguna"}
                </Button>
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
            searchable: true,
          },
          {
            header: "Email",
            key: "email",
            searchable: true,
          },
          {
            header: "Role",
            key: "role",
            searchable: true,
          },
          {
            header: "Divisi",
            key: "divisionName",
            render: (value) => <span>{String(value)}</span>,
          },
          {
            header: "Aksi",
            key: "id",
            render: (value, row: any) => {
              const isLastAdmin = lastAdmin && lastAdmin.id === row.id;
              return (
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    onClick={() => handleEdit(row)}
                    disabled={isLoading || !!isLastAdmin}
                    title={isLastAdmin ? "Tidak dapat menghapus ADMIN terakhir dalam organisasi" : ""}
                  >
                    <Edit size={18} className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleDeleteClick(String(value), row.name)}
                    disabled={isLoading || !!isLastAdmin}
                    title={isLastAdmin ? "Tidak dapat menghapus ADMIN terakhir dalam organisasi" : ""}
                  >
                    <Trash size={18} className={isLastAdmin ? "text-gray-300" : "text-gray-600"} />
                  </button>
                </div>
              );
            },
            searchable: false,
          },
        ]}
        pageSize={pageSize}
        emptyMessage="Tidak ada pengguna yang ditemukan"
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        itemName={deletingName}
        title="Hapus Pengguna"
        description="Pengguna yang dihapus tidak dapat dipulihkan"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isLoading={isLoading}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
          setDeletingName("");
        }}
      />
    </div>
  );
}
