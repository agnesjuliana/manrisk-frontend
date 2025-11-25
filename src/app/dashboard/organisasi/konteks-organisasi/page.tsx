"use client";

import { useState } from "react";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import ArrayItemDialog from "@/components/konteks/OrganizationArrayDialog";
import ScopeSection from "@/components/konteks/ScopeSection";
import StakeholdersSection from "@/components/konteks/StakeholdersSection";
import CiaSection from "@/components/konteks/CiaSection";
import RegulationsSection from "@/components/konteks/RegulationsSection";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadUsers,
  saveUsers,
  type User as StoreUser,
  type MainRole as StoreMainRole,
} from "@/lib/usersStore";

type ContextData = {
  scope: {
    technical_bounds: { name: string; description: string }[];
    notes: string;
  };
  stakeholders: {
    internal: { name: string; unit?: string; interest?: string }[];
    external: { name: string; interest?: string }[];
  };
  cia_objectives: {
    confidentiality: string;
    integrity: string;
    availability: string;
    service_priorities: { service: string; C: number; I: number; A: number }[];
  };
  regulations: {
    selected: string[];
    notes: string;
  };
};

const initialData: ContextData = {
  scope: {
    technical_bounds: [
      {
        name: "Aplikasi",
        description:
          "Sistem aplikasi yang digunakan dalam proses belajar mengajar.",
      },
      { name: "Infrastruktur", description: "Perangkat keras dan jaringan." },
      { name: "Data", description: "Data akademik dan data pribadi." },
    ],
    notes: "",
  },
  stakeholders: {
    internal: [
      {
        name: "Kepala Sekolah",
        unit: "Manajemen",
        interest: "Kepatuhan & tata kelola",
      },
      {
        name: "Tim IT",
        unit: "TI",
        interest: "Operasional & ketersediaan layanan",
      },
    ],
    external: [
      { name: "Kominfo", interest: "Kepatuhan regulasi" },
      { name: "Orang Tua Siswa", interest: "Perlindungan data pribadi" },
    ],
  },
  cia_objectives: {
    confidentiality: "Melindungi data pribadi siswa dari akses tidak sah.",
    integrity: "Menjamin nilai akademik tidak berubah tanpa otorisasi.",
    availability: "Portal e-learning tersedia ≥ 99% selama jam belajar.",
    service_priorities: [
      { service: "Portal E-Learning", C: 2, I: 3, A: 3 },
      { service: "Sistem Nilai", C: 3, I: 3, A: 2 },
    ],
  },
  regulations: {
    selected: [
      "SNI ISO/IEC 27001:2022",
      "ISO/IEC 27005:2022",
      "UU PDP 27/2022",
      "Permenkominfo 4/2016",
    ],
    notes: "Fokus awal pada perlindungan data pribadi dan kontrol akses.",
  },
};

export default function KonteksOrganisasiPage() {
  // profile state
  const [profile, setProfile] = useState({
    name: "ManRisk Org.",
    address: "Jl. Contoh No. 123",
    email: "m@example.com",
    phone: "+62 888-8888-8888",
  });

  const [data, setData] = useState<ContextData>(initialData);

  // users store
  const [users, setUsers] = useState<StoreUser[]>(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  // generic edit dialog
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  function closeEdit() {
    setEditingSection(null);
    setDraftText("");
  }

  function saveEdit() {
    if (!editingSection) return;
    switch (editingSection) {
      case "scope.description":
        setData((s) => ({
          ...s,
          scope: { ...s.scope, description: draftText },
        }));
        break;
      case "scope.notes":
        setData((s) => ({ ...s, scope: { ...s.scope, notes: draftText } }));
        break;
      case "regulations.notes":
        setData((s) => ({
          ...s,
          regulations: { ...s.regulations, notes: draftText },
        }));
        break;
      default:
        break;
    }
    closeEdit();
  }

  // array modal state
  const [arrayModal, setArrayModal] = useState<{
    open: boolean;
    path: string | null;
    mode: "add" | "edit";
    index?: number;
  }>({ open: false, path: null, mode: "add" });
  const [itemDraft, setItemDraft] = useState<any>(null);

  function openAddModal(path: string) {
    setArrayModal({ open: true, path, mode: "add" });
    if (path === "stakeholders.internal" || path === "stakeholders.external")
      setItemDraft({ name: "", unit: "", type: "", interest: "" });
    else if (path === "cia.service_priorities")
      setItemDraft({ service: "", C: 1, I: 1, A: 1 });
    else setItemDraft("");
  }

  function openEditRow(path: string, idx: number) {
    setArrayModal({ open: true, path, mode: "edit", index: idx });
    if (path === "scope.technical_bounds")
      setItemDraft(data.scope.technical_bounds[idx]);
    else if (path === "regulations.selected")
      setItemDraft(data.regulations.selected[idx]);
    else if (path === "stakeholders.external")
      setItemDraft({ ...data.stakeholders.external[idx] });
    else if (path === "cia.service_priorities")
      setItemDraft({ ...data.cia_objectives.service_priorities[idx] });
    else if (path === "stakeholders.internal") {
      // internal stakeholder -> edit user
      const u = users[idx];
      if (u) openUserEdit(u);
      // close array modal since we use user dialog
      setArrayModal({ open: false, path: null, mode: "add" });
    }
  }

  function closeArrayModal() {
    setArrayModal({ open: false, path: null, mode: "add" });
    setItemDraft(null);
  }

  function saveArrayItemFromDialog(validatedDraft: any) {
    if (!arrayModal.path) return;
    const path = arrayModal.path;
    if (arrayModal.mode === "add") {
      if (path === "scope.technical_bounds")
        setData((s) => ({
          ...s,
          scope: {
            ...s.scope,
            technical_bounds: [...s.scope.technical_bounds, validatedDraft],
          },
        }));
      else if (path === "regulations.selected")
        setData((s) => ({
          ...s,
          regulations: {
            ...s.regulations,
            selected: [...s.regulations.selected, String(validatedDraft)],
          },
        }));
      else if (path === "stakeholders.internal")
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            internal: [...s.stakeholders.internal, validatedDraft],
          },
        }));
      else if (path === "stakeholders.external")
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            external: [...s.stakeholders.external, validatedDraft],
          },
        }));
      else if (path === "cia.service_priorities")
        setData((s) => ({
          ...s,
          cia_objectives: {
            ...s.cia_objectives,
            service_priorities: [
              ...s.cia_objectives.service_priorities,
              validatedDraft,
            ],
          },
        }));
    } else {
      const idx = arrayModal.index ?? -1;
      if (idx < 0) return;
      if (path === "scope.technical_bounds")
        setData((s) => ({
          ...s,
          scope: {
            ...s.scope,
            technical_bounds: s.scope.technical_bounds.map((v, i) =>
              i === idx ? validatedDraft : v
            ),
          },
        }));
      else if (path === "regulations.selected")
        setData((s) => ({
          ...s,
          regulations: {
            ...s.regulations,
            selected: s.regulations.selected.map((v, i) =>
              i === idx ? String(validatedDraft) : v
            ),
          },
        }));
      else if (path === "stakeholders.internal")
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            internal: s.stakeholders.internal.map((v, i) =>
              i === idx ? validatedDraft : v
            ),
          },
        }));
      else if (path === "stakeholders.external")
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            external: s.stakeholders.external.map((v, i) =>
              i === idx ? validatedDraft : v
            ),
          },
        }));
      else if (path === "cia.service_priorities")
        setData((s) => ({
          ...s,
          cia_objectives: {
            ...s.cia_objectives,
            service_priorities: s.cia_objectives.service_priorities.map(
              (v, i) => (i === idx ? validatedDraft : v)
            ),
          },
        }));
    }
    closeArrayModal();
  }

  function removeArrayItem(path: string, idx: number) {
    if (path === "scope.technical_bounds")
      setData((s) => ({
        ...s,
        scope: {
          ...s.scope,
          technical_bounds: s.scope.technical_bounds.filter(
            (_, i) => i !== idx
          ),
        },
      }));
    else if (path === "stakeholders.internal")
      setData((s) => ({
        ...s,
        stakeholders: {
          ...s.stakeholders,
          internal: s.stakeholders.internal.filter((_, i) => i !== idx),
        },
      }));
    else if (path === "stakeholders.external")
      setData((s) => ({
        ...s,
        stakeholders: {
          ...s.stakeholders,
          external: s.stakeholders.external.filter((_, i) => i !== idx),
        },
      }));
    else if (path === "cia.service_priorities")
      setData((s) => ({
        ...s,
        cia_objectives: {
          ...s.cia_objectives,
          service_priorities: s.cia_objectives.service_priorities.filter(
            (_, i) => i !== idx
          ),
        },
      }));
    else if (path === "regulations.selected")
      setData((s) => ({
        ...s,
        regulations: {
          ...s.regulations,
          selected: s.regulations.selected.filter((_, i) => i !== idx),
        },
      }));
  }

  // CIA single modal
  const [ciaEditOpen, setCiaEditOpen] = useState(false);
  const [ciaDraft, setCiaDraft] = useState({
    confidentiality: data.cia_objectives.confidentiality,
    integrity: data.cia_objectives.integrity,
    availability: data.cia_objectives.availability,
  });
  function openCiaEdit() {
    setCiaDraft({
      confidentiality: data.cia_objectives.confidentiality,
      integrity: data.cia_objectives.integrity,
      availability: data.cia_objectives.availability,
    });
    setCiaEditOpen(true);
  }
  function closeCiaEdit() {
    setCiaEditOpen(false);
  }
  function saveCiaEdit() {
    setData((s) => ({
      ...s,
      cia_objectives: { ...s.cia_objectives, ...ciaDraft },
    }));
    closeCiaEdit();
  }

  // user edit (internal stakeholders map to users)
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [userForm, setUserForm] = useState<StoreUser | null>(null);
  function openUserEdit(u: StoreUser) {
    setUserForm(u);
    setUserEditOpen(true);
  }
  function closeUserEdit() {
    setUserEditOpen(false);
    setUserForm(null);
  }
  function saveUserEdit() {
    if (!userForm) return;
    const next = users.map((x) => (x.id === userForm.id ? userForm : x));
    setUsers(next);
    saveUsers(next);
    closeUserEdit();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-lg font-semibold">Konteks Organisasi</h2>

      {/* Profile Card Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>Informasi dasar instansi yang terdaftar</CardDescription>
          </div>
          <CardAction>
            <Dialog>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Perbarui Profil Instansi</DialogTitle>
                  <DialogDescription>Ubah informasi instansi Anda di sini.</DialogDescription>
                </DialogHeader>
                <ProfileForm
                  initialValues={profile}
                  onSubmitProfile={(values) => {
                    setProfile(values)
                  }}
                  submitLabel="Simpan Perubahan"
                />
              </DialogContent>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profil</Button>
              </DialogTrigger>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div>
              <div className="text-sm text-muted-foreground">Alamat</div>
              <div className="font-medium">{profile.address}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telepon</div>
              <div className="font-medium">{profile.phone}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ScopeSection
          technical_bounds={data.scope.technical_bounds}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
        />

        <StakeholdersSection
          users={users}
          external={data.stakeholders.external}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
        />

        <CiaSection
          cia={data.cia_objectives}
          onEdit={openCiaEdit}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
        />

        <RegulationsSection
          selected={data.regulations.selected}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
        />
      </div>

      {/* CIA Edit Dialog */}
      <Dialog
        open={ciaEditOpen}
        onOpenChange={(v) => (v ? null : closeCiaEdit())}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit CIA Objectives</DialogTitle>
            <DialogDescription>
              Ubah Confidentiality, Integrity, dan Availability sekaligus.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div>
              <Label>Confidentiality</Label>
              <Textarea
                value={ciaDraft.confidentiality}
                onChange={(e) =>
                  setCiaDraft((d) => ({
                    ...d,
                    confidentiality: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Integrity</Label>
              <Textarea
                value={ciaDraft.integrity}
                onChange={(e) =>
                  setCiaDraft((d) => ({ ...d, integrity: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Availability</Label>
              <Textarea
                value={ciaDraft.availability}
                onChange={(e) =>
                  setCiaDraft((d) => ({ ...d, availability: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCiaEdit}>
              Batal
            </Button>
            <Button onClick={saveCiaEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic edit dialog */}
      <Dialog
        open={!!editingSection}
        onOpenChange={(v) => (v ? null : closeEdit())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingSection}</DialogTitle>
            <DialogDescription>
              Ubah detail untuk bagian ini lalu simpan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label>Isi</Label>
            <Input
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Batal
            </Button>
            <Button onClick={saveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User edit dialog */}
      <Dialog
        open={userEditOpen}
        onOpenChange={(v) => (v ? null : closeUserEdit())}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Ubah data pengguna internal</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <div>
              <Label>Nama</Label>
              <Input
                value={userForm?.name ?? ""}
                onChange={(e) =>
                  setUserForm((p) => (p ? { ...p, name: e.target.value } : p))
                }
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={userForm?.password ?? ""}
                onChange={(e) =>
                  setUserForm((p) =>
                    p ? { ...p, password: e.target.value } : p
                  )
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={userForm?.role ?? ""}
                onChange={(e) =>
                  setUserForm((p) =>
                    p ? { ...p, role: e.target.value as StoreMainRole } : p
                  )
                }
              />
            </div>
            <div>
              <Label>Divisi</Label>
              <Input
                value={userForm?.division ?? ""}
                onChange={(e) =>
                  setUserForm((p) =>
                    p ? { ...p, division: e.target.value } : p
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeUserEdit}>
              Batal
            </Button>
            <Button onClick={saveUserEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Array item dialog (extracted) */}
      <ArrayItemDialog
        open={arrayModal.open}
        path={arrayModal.path}
        mode={arrayModal.mode}
        draft={itemDraft}
        onChangeDraft={(v) => setItemDraft(v)}
        onClose={closeArrayModal}
        onSave={(validatedDraft) => saveArrayItemFromDialog(validatedDraft)}
      />
    </div>
  );
}
